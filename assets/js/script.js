// Wrap jQuery code in Document Ready event to prevent code being executed before document is finished loading
$(document).ready(function(){
  var APIKey = "dda9f109c012cbe0169e71d8a23518f5";
  var searchHistoryEl = $("#searchHistory");
  var stored = localStorage.getItem("weatherHistory");
  var historyArray = JSON.parse(stored);

  // Get location history from local storage and display in list
  var setLocationHistory = function() {
    if (searchHistoryEl.children() !== null) {
      searchHistoryEl.children().remove();
    }
    if (historyArray !== null) {
      for (var i = 0; i < historyArray.length; i++) {
        var searchHistoryItem = $("<li class='list-group-item border text-center rounded mt-3'>");
        searchHistoryItem.text(historyArray[i]);
        searchHistoryEl.append(searchHistoryItem);
      }
    }
  }
  
  setLocationHistory();

  // Function for using coordinates that were fetched for current conditions
  var useCoordinatesCurrent = function(lat, lon) {
    var currentWeatherURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + APIKey;

    var fetchCurrentWeather = fetch(currentWeatherURL)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        populateCurrentWeather(data);
      })
  };

  // Function for using coordinates that were fetched for forecast
  var useCoordinatesForecast = function(lat, lon, cityInput) {
    var forecastWeatherURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + APIKey;

      var fetchForecastWeather = fetch(forecastWeatherURL)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        populateForecast(data);

        // Update location history
        if (historyArray === null) {
          historyArray = [cityInput]
        } else if (historyArray.includes(cityInput)) {
          return;
        } else if (historyArray.length === 10) {
          historyArray.pop();
          historyArray.unshift(cityInput);
        } else {
          historyArray.unshift(cityInput);
        };

        localStorage.setItem("weatherHistory", JSON.stringify(historyArray));

        setLocationHistory();
      });
  };

  // Function for inserting current weather values into HTML
  var populateCurrentWeather = function(data) {
    var cityName = data.name;
    var weatherIcon = data.weather[0].icon;
    var temp = data.main.temp;
    var humidity = data.main.humidity;
    var wind = data.wind.speed;
    $("#intro").attr("style", "display: none;");
    $("#weatherData").attr("style", "display: block;");
    $("#cityName").html(cityName + "<span id='currentDate'>" + dayjs().format("MM/DD/YYYY") + "<img src=https://openweathermap.org/img/wn/" + weatherIcon + ".png alt='Weather Icon' />");
    $("#currentTemp").html("Temp: " + temp + " &deg;F");
    $("#currentHumidity").text("Humidity: " + humidity + " %");
    $("#currentWind").text("Wind: " + wind + " mph");
  }

  // Function for inserting forecast values into HTML
  var populateForecast = function(data) {
    var dateArray = [];
    var iconArray = [];
    var tempArray = [];
    var windArray = [];
    var humidityArray = [];

    // Check for forecast for hours between 12pm and 2pm and display forecast for those times for future five days
    for (var i = 0; i < data.list.length; i++) {
      if (dayjs.unix(data.list[i].dt).hour() === 12 || dayjs.unix(data.list[i].dt).hour() === 13 || dayjs.unix(data.list[i].dt).hour() === 14) {
        dateArray.push(dayjs.unix(data.list[i].dt).format("MM/DD/YYYY"));
        iconArray.push(data.list[i].weather[0].icon);
        tempArray.push(data.list[i].main.temp);
        windArray.push(data.list[i].wind.speed);
        humidityArray.push(data.list[i].main.humidity);
      }
    }

    var dateClass = document.querySelectorAll(".date");
    var iconClass = document.querySelectorAll(".icon");
    var tempClass = document.querySelectorAll(".temp");
    var humidityClass = document.querySelectorAll(".humidity");
    var windClass = document.querySelectorAll(".wind");
    for (var i = 0; i < dateArray.length; i++) {
      dateClass[i].textContent = dateArray[i];
      iconClass[i].innerHTML = "<img src=https://openweathermap.org/img/wn/" + iconArray[i] + ".png alt='Weather Icon' />"
      tempClass[i].innerHTML = "Temp: " + tempArray[i] + " &deg;F";
      humidityClass[i].innerHTML = "Humidity: " + humidityArray[i] + " %";
      windClass[i].innerHTML = "Wind: " + windArray[i] + " mph";
    };
  }
  
  // Function for getting coordinates of location from input and display weather
  var displayWeather = function(cityInput) {

    // Separate zip code from city, state input and fetch coordinates
    if (cityInput.includes(",")) {
      var cityArray = cityInput.split(", ");
      var city = cityArray[0];
      var state = cityArray[1];
      var geoURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "," + state + ",&limit=1&appid=" + APIKey;
    } else if (!isNaN(cityInput)) {
      var zip = cityInput;
      var geoURL = "https://api.openweathermap.org/geo/1.0/zip?zip=" + zip + "&limit=1&appid=" + APIKey;
    } else {
      var geoURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityInput + ",&limit=1&appid=" + APIKey;
    }
    var fetchCoordinates = fetch(geoURL)
      .then(function(response) {
        if (response.status === 200) {
          $("#errorMessage").attr("style", "display: none;")
          return response.json();
        } else {
          $("#errorStatus").html("<pre>Error: " + response.status + " - " + response.statusText + "!");
          $("#weatherData").attr("style", "display: none;");
          $("#intro").attr("style", "display: none;");
          $("#errorMessage").attr("style", "display: block;");
        }        
      })
      .then(function(data) {
        if (geoURL.includes("direct")) {
          useCoordinatesCurrent(data[0].lat, data[0].lon);
          useCoordinatesForecast(data[0].lat, data[0].lon, cityInput);
        } else {
          useCoordinatesCurrent(data.lat, data.lon);
          useCoordinatesForecast(data.lat, data.lon, cityInput);
        }
      })
  }

  // Set event listeners
  $("#searchBtn").on("click", function(event) {
    event.preventDefault();
    displayWeather($("#city").val());
    $("#city").val("");
  })

  $("#searchHistory").on("click", "li", function() {
    displayWeather($(this).text());
    $("#city").val("");
  })
});