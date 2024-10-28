let apiID = "b5f558462160da78810acd0bb997a9fd";


function fetchCurrentTime(lat, lon) {
    const timeApiUrl = `https://timeapi.io/api/time/current/coordinate?latitude=${lat}&longitude=${lon}`;

    fetch(timeApiUrl)
        .then(response => response.json())
        .then(data => {
            // Log the fetched time
            console.log(`Current time in ${data.timeZone}: ${data.time}`);

            // Convert time to 12-hour format
            const [hours, minutes] = data.time.split(':');
            const hours12 = ((parseInt(hours) + 11) % 12 + 1).toString(); // Convert to 12-hour format
            const period = parseInt(hours) >= 12 ? 'PM' : 'AM'; // Determine AM or PM
            const formattedTime = `${hours12}:${minutes} ${period}`;

            // Display the formatted time in the appropriate element on your webpage
            document.getElementById("time").innerText = `${formattedTime}`;
        })
        .catch(error => {
            console.error("Error fetching current time data:", error);
        });
}


// Function to fetch current weather data for a city
function fetchCurrentWeather(city) {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiID}&units=metric`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                // Get current temperature and real feel
                const currentTemperature = data.main.temp;
                const realFeel = data.main.feels_like;

                // Update temperature and real feel divs
                document.getElementById("temperature").innerText = currentTemperature.toFixed(1);
                document.getElementById("real-feel").innerText = realFeel.toFixed(1);
                
                // Display location information
                displayLocationInfo(data);

                // Log the coordinates of the searched city
                console.log(`Searched: ${data.name}`);
                console.log(`Longitude: ${data.coord.lon}`);
                console.log(`Latitude: ${data.coord.lat}`);
                
                fetchCurrentTime(data.coord.lat,data.coord.lon);
                // Initialize map with city coordinates (you can replace this with your map initialization code)
                initializeMap(data.coord.lat, data.coord.lon); 
            } else {
                console.error("Error fetching current weather data:", data.message);
            }
        })
        .catch(error => {
            console.error("Error fetching current weather data:", error);
        });
}

// Function to display location information
function displayLocationInfo(data) {
    const cityName = data.name;
    const countryCode = data.sys.country;
    const locationInfo = `${cityName}, ${countryCode}`;

    document.getElementById("city").innerText = locationInfo; // Update the city div with location info
}

// Function to fetch weather forecast and display it in a table
function displayWeatherTable(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiID}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === "200") {
                const cityName = data.city.name;
                const forecastList = data.list;

                // Create a map to store overall max and min temperatures for each date
                const dailyForecast = {};

                // Mapping weather descriptions to Font Awesome icons
                const weatherIcons = {
                    "clear sky": "<i class='fas fa-sun'></i>",
                    "few clouds": "<i class='fas fa-cloud-sun'></i>",
                    "scattered clouds": "<i class='fas fa-cloud'></i>",
                    "broken clouds": "<i class='fas fa-smog'></i>",
                    "overcast clouds": "<i class='fas fa-cloud'></i>",
                    "shower rain": "<i class='fas fa-cloud-showers-heavy'></i>",
                    "rain": "<i class='fas fa-cloud-rain'></i>",
                    "thunderstorm": "<i class='fas fa-thunderstorm'></i>",
                    "snow": "<i class='fas fa-snowflake'></i>",
                    "mist": "<i class='fas fa-smog'></i>",
                    "light rain": "<i class='fas fa-cloud-rain'></i>"
                };

                // Loop through forecast data and populate the daily forecast map
                forecastList.forEach(item => {
                    const dateString = item.dt_txt.split(" ")[0]; // Extract the date (YYYY-MM-DD)
                    const dateObject = new Date(dateString); // Convert to Date object
                    const day = dateObject.getDate(); // Get the day of the month
                    const isMobile = window.innerWidth <= 600; // Check if screen width is 600px or less
                    const month = isMobile 
                        ? dateObject.toLocaleString('default', { month: 'short' }) // Short month name for mobile
                        : dateObject.toLocaleString('default', { month: 'long' }); // Full month name for desktop

                    const description = item.weather[0].description;
                    const maxTemp = item.main.temp_max;
                    const minTemp = item.main.temp_min;

                    // Initialize if date not already in the map
                    if (!dailyForecast[dateString]) {
                        dailyForecast[dateString] = {
                            day: day,
                            month: month,
                            description: description,
                            icon: weatherIcons[description] || "<i class='fas fa-question'></i>", // Default icon
                            max: maxTemp,
                            min: minTemp
                        };
                    } else {
                        // Update overall max/min temperature for the date
                        dailyForecast[dateString].max = Math.max(dailyForecast[dateString].max, maxTemp);
                        dailyForecast[dateString].min = Math.min(dailyForecast[dateString].min, minTemp);
                    }
                });

                // Create table structure
                let tableHTML = `
                                <table border="1">
                                    <tr id="tabhead">
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Max Temp (°C)</th>
                                        <th>Min Temp (°C)</th>
                                    </tr>`;

                // Loop through the daily forecast map to populate the table
                for (const date in dailyForecast) {
                    const { day, month, description, icon, max, min } = dailyForecast[date];
                    tableHTML += `<tr>
                                    <td>${month} ${day}</td>
                                    <td id="weatherStatus">${icon} ${description}</td>
                                    <td>${max.toFixed(1)}</td>
                                    <td>${min.toFixed(1)}</td>
                                  </tr>`;
                }

                // Close table
                tableHTML += `</table>`;

                // Insert table into the page 
                document.getElementById("weatherTable").innerHTML = tableHTML;
                
                // Fetch current weather data to update temperature and real feel
                fetchCurrentWeather(cityName);
            } else {
                // Handle error for city not found
                document.getElementById("weatherTable").innerHTML = `<p>City not found. Please try another city.</p>`;
            }
        })
        .catch(error => {
            // Handle network or API errors
            document.getElementById("weatherTable").innerHTML = `<p>Error fetching data. Please try again later.</p>`;
            console.error("Error:", error);
        });
}


// Function to get user's location via GPS or fallback to IP address
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude; // Get latitude
                const lon = position.coords.longitude; // Get longitude
                console.log(`Latitude: ${lat}, Longitude: ${lon}`); // Print lat and lon in console
                fetchCityNameByCoordinates(lat, lon); // Get city name using coordinates
            }, 
            (error) => {
                console.warn(`ERROR(${error.code}): ${error.message}`);
                fetchWeatherByIP(); // Fallback to IP address
            }
        );
    } else {
        fetchWeatherByIP(); // Fallback to IP address
    }
}

// Function to get city name from latitude and longitude using OpenWeatherMap reverse geocoding
function fetchCityNameByCoordinates(lat, lon) {
    const geoUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiID}&units=metric`;

    fetch(geoUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                const cityName = data.name; // Get city name from response
                const currentTemperature = data.main.temp; // Current temperature
                const realFeel = data.main.feels_like; // Real feel temperature
                console.log(`City from GPS: ${cityName}`); // Log city name

                // Update temperature and real feel divs
                document.getElementById("temperature").innerText = currentTemperature.toFixed(1);
                document.getElementById("real-feel").innerText = realFeel.toFixed(1);

                displayWeatherTable(cityName); // Fetch weather using the city name
            } else {
                console.error("City not found from coordinates.");
                fetchWeatherByIP(); // Fallback to IP-based location
            }
        })
        .catch(error => {
            console.error("Error fetching city name:", error);
            fetchWeatherByIP(); // Fallback to IP-based location
        });
}

// Function to fetch weather based on user's IP address
function fetchWeatherByIP() {
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            const lat = data.latitude;
            const lon = data.longitude;
            console.log(`Fallback - Latitude: ${lat}, Longitude: ${lon}`); // Print lat and lon in console
            displayWeatherTableByCoordinates(lat, lon); // Fetch weather using coordinates
        })
        .catch(error => {
            console.error("Error fetching IP data:", error);
            document.getElementById("weatherTable").innerHTML = `<p>Error fetching data. Please try again later.</p>`;
        });
}

// Function to display weather table based on coordinates (if necessary)
function displayWeatherTableByCoordinates(lat, lon) {
    const geoUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiID}&units=metric`;

    fetch(geoUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                fetchCurrentWeather(data.name); // Use city name to get current weather
            } else {
                console.error("Error fetching weather data by coordinates.");
            }
        })
        .catch(error => {
            console.error("Error fetching weather data by coordinates:", error);
        });
}

// Call getLocation to initiate the process for GPS-based retrieval
getLocation();

/////////////////////////////


document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("searchButton");
    const cityInput = document.getElementById("cityInput");

    if (searchButton && cityInput) { // Check if elements exist
        searchButton.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default form submission
            const cityName = cityInput.value; // Get city name from input
            displayWeatherTable(cityName); // Call function with city name
            fetchCurrentWeather(cityName);
        });
    }
});


// Initialize map function (to be defined based on your map setup)

