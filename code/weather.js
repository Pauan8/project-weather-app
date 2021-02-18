// All the DOM selectors stored as short variables
const body = document.getElementById("body")
const shortDescription = document.getElementById("shortDescription")
const temperature = document.getElementById("temperature")
const sunrise = document.getElementById("sunrise")
const sunset = document.getElementById("sunset")
const description = document.getElementById("description")
const forecast = document.getElementById("forecast")
const weatherIcon = document.getElementById("weatherIcon")
const searchBox = document.getElementById("searchbox")
const currentLocationText = document.getElementById("currentLocationText")
const forecastTemp = document.getElementById("forecastTemp")
const forecastDay = document.getElementById("forecastDay")
const currentLocationIcon = document.getElementById("locationWrapper")
const magnifyingGlassIcon = document.getElementById("searchWrapper")
const searchLocationBtn = document.getElementById("searchLocationBtn")
const userLocationInput = document.getElementById("userLocationInput")

// Global variables
const weekdays = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"]
const API_KEY = "fd4c88b297db1abd3f5aaffe170147b6";
let city = "";



const handleCityInput = (city) => {
  let API_urlCurrent = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&lang=se&APPID=" + API_KEY;
  let API_urlForecast = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=metric&lang=se&APPID=" + API_KEY;
  fetchWeatherData(API_urlCurrent);
  fetchWeatherForecast(API_urlForecast)
  currentLocationText.innerHTML = city
}

// Functions 

/* This function will get the longitude and latitude coordinates from the users browser,
then the function will fetch from the weather API and print the the current weather and 5 day forecast.*/
const getPosition = () => {

  /* This function will try and get the most accurate position of the user */
  const options = () => {
    enableHighAccuracy: true;
    timeout: 5000;
    maximumAge: 0;
  }

  /* If the the app is able to get the users location it will take the coordinates and push them into the fetch function. */
  const success = (position) => {
    let crd = position.coords;
    let API_urlPosCurrent = "https://api.openweathermap.org/data/2.5/weather?lat=" + crd.latitude + "&lon=" + crd.longitude + "&units=metric&lang=se&appid=" + API_KEY;
    let API_urlPosForecast = "https://api.openweathermap.org/data/2.5/forecast?lat=" + crd.latitude + "&lon=" + crd.longitude + "&units=metric&lang=se&appid=" + API_KEY;
    fetchWeatherData(API_urlPosCurrent);
    fetchWeatherForecast(API_urlPosForecast);
  }

  /* If the app is unable to get the users current position is till display an error message in the console. */
  const error = (error) => {
    console.warn(`ERROR(${error.code}): Kunde inte hitta din nuvarande position.`);
  }

  /* This line retrieves the coordinates from the users browser.  */
  navigator.geolocation.getCurrentPosition(success, error, options);
}

/* This function will send a fetch erquest to the API URL and convert the response to json */
const fetchWeatherData = (API_url) => {

  /* We fetch from the API URL */
  fetch(API_url)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      setCurrentWeather(json)
      currentLocationText.innerHTML = json.name
    })
}

/* This function will send a fetch erquest to the API URL and convert the response to json */
const fetchWeatherForecast = (API_urlForecast) => {
  fetch(API_urlForecast)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      setCurrentWeatherForecast(json)
    })

  const setCurrentWeatherForecast = (WeatherForecast) => {
    forecastTemperature(WeatherForecast)
  }
}

/* This function will take the json object and filter out all the days that includes the 12:00 timestamp. We then render a 5 day forecast on the DOM for the user to see */
const forecastTemperature = (forecastData) => {
  let filteredData = forecastData.list.filter((item) => item.dt_txt.includes("12:00"))

  filteredData.forEach(item => forecastTemp.innerHTML += `
    <li>
      <img class="forecast-icon" src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png"/> 
      ${item.main.temp} &deg;C
    </li>
  `);
  filteredData.forEach(item => forecastDay.innerHTML += `
    <li>
      ${weekdays[new Date(Date.parse(item.dt_txt)).getDay()]}
    </li>
  `)
}

/* This function will set teh temperature, sunrise and sunset for the chosen city. */
const setCurrentWeather = (weatherData) => {
  let sunrise = weatherData.sys.sunrise
  let sunset = weatherData.sys.sunset
  let conditionId = weatherData.weather[0].id

  currentSunriseSunset(sunrise, "rise");
  currentSunriseSunset(sunset, "set");
  currentTemperature(weatherData);
  currentWeatherCondition(weatherData);
  weatherBackground(conditionId)
}

const currentTemperature = (weatherData) => {
  temperature.innerHTML = `| ${weatherData.main.temp} &deg;C`
}

const currentSunriseSunset = (sun, condition) => {
  condition === "rise" ?
    sunrise.innerHTML = `Sol upp: ${toLocalTime(sun)} | ` :
    sunset.innerHTML = `Sol ned: ${toLocalTime(sun)}`
}

const toLocalTime = (sun) => {
  let unixToLocalTime = new Date(sun * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return unixToLocalTime;
}

const currentWeatherCondition = (weatherData) => {
  let wIcon = weatherData.weather[0].icon

  shortDescription.innerHTML = weatherData.weather[0].description + " "
  weatherIcon.src = "https://openweathermap.org/img/wn/" + wIcon + "@2x.png"
}

const weatherBackground = (id) => {
  let condition = ""

  if (id === 800) {
    condition = "sunny"
  } else if (id >= 200 && id <= 232) {
    condition = "stormy"
  } else if ((id >= 300 && id <= 321) || (id >= 500 && id <= 531)) {
    condition = "rainy"
  } else if (id >= 600 && id <= 622) {
    condition = "snowy"
  } else if (id >= 801 && id <= 804) {
    condition = "cloudy"
  } else {
    condition = "other";
  }
  body.classList.add(condition)
}

const clearAll = () => {
  forecastDay.innerHTML = ""
  forecastTemp.innerHTML = ""
  body.className = ""
  userLocationInput.value = ""
}

// Functions that runs when the page loads.
getPosition()

// Eventlisteners
currentLocationIcon.addEventListener("click", () => {
  getPosition()
  clearAll()
})

searchLocationBtn.addEventListener("click", (event) => {
  event.preventDefault()
  handleCityInput(userLocationInput.value)
  searchBox.classList.toggle("active")
  clearAll()
})

magnifyingGlassIcon.addEventListener("click", () => {
  searchBox.classList.toggle("active")
})