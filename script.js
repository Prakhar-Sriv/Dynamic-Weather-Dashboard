const API_KEY = "3088ca783c843baf5ea68880f5c5c169"; // Replace with your OpenWeatherMap key
const units = "metric"; 
const unitSymbol = "°C";

// Selectors
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const forecastRow = document.getElementById("forecastRow");

// Current weather elements
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const weatherIcon = document.getElementById("weatherIcon");
const updatedTime = document.getElementById("updatedTime");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

// Fetch by city
async function fetchWeather(city) {
  try {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${API_KEY}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=${API_KEY}`;

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    if (!currentRes.ok) throw new Error("Current weather fetch failed");
    if (!forecastRes.ok) throw new Error("Forecast fetch failed");

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    renderCurrent(currentData);
    renderForecast(forecastData);

  } catch (error) {
    alert("Error: " + error.message);
  }
}

// ✅ New function: Fetch by coordinates
async function fetchWeatherByCoords(lat, lon) {
  try {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    if (!currentRes.ok) throw new Error("Current weather fetch failed");
    if (!forecastRes.ok) throw new Error("Forecast fetch failed");

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    renderCurrent(currentData);
    renderForecast(forecastData);

  } catch (error) {
    alert("Error: " + error.message);
  }
}

// Render current weather
function renderCurrent(data) {
  cityName.textContent = data.name;
  temperature.textContent = `${Math.round(data.main.temp)}${unitSymbol}`;
  condition.textContent = data.weather[0].description;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  updatedTime.textContent = "Updated: " + new Date(data.dt * 1000).toLocaleTimeString();
  feelsLike.textContent = `Feels like: ${Math.round(data.main.feels_like)}${unitSymbol}`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  wind.textContent = `Wind: ${data.wind.speed} ${units === "metric" ? "m/s" : "mph"}`;
  pressure.textContent = `Pressure: ${data.main.pressure} hPa`;
  visibility.textContent = `Visibility: ${Math.round(data.visibility / 1000)} km`;
  sunrise.textContent = "Sunrise: " + new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  sunset.textContent = "Sunset: " + new Date(data.sys.sunset * 1000).toLocaleTimeString();
}

// Render forecast
// Render forecast (calculate real daily min/max)
function renderForecast(data) {
  forecastRow.innerHTML = "";

  // Group data by date (YYYY-MM-DD)
  const dailyData = {};
  data.list.forEach(f => {
    const date = f.dt_txt.split(" ")[0]; // e.g., "2025-09-26"
    if (!dailyData[date]) dailyData[date] = [];
    dailyData[date].push(f);
  });

  // Take next 5 days (skip today if needed)
  const days = Object.keys(dailyData).slice(0, 5);

  days.forEach(date => {
    const dayData = dailyData[date];

    // Calculate min/max temperature of the day
    const temps = dayData.map(d => d.main.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);

    // Use the weather at midday (or first entry if no midday)
    const midday = dayData.find(d => d.dt_txt.includes("12:00:00")) || dayData[0];

    const d = new Date(date);
    const card = document.createElement("div");
    card.className = "f-card";
    card.innerHTML = `
      <div class="day">${d.toLocaleDateString([], { weekday: "short" })}</div>
      <img src="https://openweathermap.org/img/wn/${midday.weather[0].icon}.png" alt="${midday.weather[0].description}">
      <p><strong>${Math.round(maxTemp)}${unitSymbol}</strong> / ${Math.round(minTemp)}${unitSymbol}</p>
      <p>${midday.weather[0].main}</p>
    `;
    forecastRow.appendChild(card);
  });
}

// Search handler
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});

// ✅ On load → get current location instead of fixed Delhi
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        fetchWeatherByCoords(lat, lon);
      },
      (err) => {
        console.warn("Geolocation denied, fallback to Delhi.");
        fetchWeather("Delhi"); // fallback
      }
    );
  } else {
    fetchWeather("Delhi"); // fallback if no geolocation support
  }
};

