// Wrap jQuery code in Document Ready event to prevent code being executed before document is finished loading
$(document).ready(function(){
  var APIKey = "dda9f109c012cbe0169e71d8a23518f5";
  var searchHistoryEl = $("#searchHistory");
  var stored = localStorage.getItem("weatherHistory");
  var historyArray = JSON.parse(stored);

  var setLocationHistory = function() {
    if (searchHistoryEl.children() !== null) {
      searchHistoryEl.children().remove();
    }
    if (historyArray !== null) {
      for (var i = 0; i < historyArray.length; i++) {
        var searchHistoryItem = $("<li class='list-group-item border-0 mt-3'>");
        searchHistoryItem.text(historyArray[i]);
        searchHistoryEl.append(searchHistoryItem);
      }
    }
  }
  
  setLocationHistory();
  
  var displayWeather = function() {
    var cityInput = $("#city").val();

    if (cityInput.includes(",")) {
      var cityArray = cityInput.split(", ");
      var city = cityArray[0];
      var state = cityArray[1];
      var geoURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "," + state + ",&limit=1&appid=" + APIKey;
    } else if (Number(cityInput) != NaN) {
      var zip = cityInput;
      var geoURL = "https://api.openweathermap.org/geo/1.0/zip?zip=" + zip + "&limit=1&appid=" + APIKey;
    }
    var fetchCoordinates = fetch(geoURL)
      .then(function (response){
        if (response.status === 200) {
          return response.json();
        }        
      })
      .then(function (data) {
        console.log(data);
        if (geoURL.includes("direct")) {
          var lat = data[0].lat;
          var lon = data[0].lon;
          return {lat, lon};
        } else
          var lat = data.lat;
          var lon = data.lon;
          return {lat, lon};
      })
    
    fetchCoordinates.then(function(coordinates) {
      var currentWeatherURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + coordinates.lat + "&lon=" + coordinates.lon + "&units=imperial&appid=" + APIKey;

      var fetchCurrentWeather = fetch(currentWeatherURL)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          console.log(data);
          var cityName = data.name;
          var weatherIcon = data.weather[0].icon;
          var temp = data.main.temp;
          var humidity = data.main.humidity;
          var wind = data.wind.speed;
          $("#intro").attr("style", "display: none;")
          $("#weatherData").attr("style", "display: block;")
          $("#cityName").html(cityName + "<span id='currentDate'>" + dayjs().format("MM/DD/YYYY") + "<img src=https://openweathermap.org/img/wn/" + weatherIcon + ".png alt='Weather Icon' />");
          $("#currentTemp").html("Temp: " + temp + " &deg;F");
          $("#currentHumidity").text("Humidity: " + humidity + " %");
          $("#currentWind").text("Wind Speed: " + wind + " mph");
        })
    })

    fetchCoordinates.then(function(coordinates) {
      var forecastWeatherURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + coordinates.lat + "&lon=" + coordinates.lon + "&units=imperial&appid=" + APIKey;

      var fetchForecastWeather = fetch(forecastWeatherURL)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        console.log(data);
        var dateArray = [];
        var iconArray = [];
        var tempArray = [];
        var windArray = [];
        var humidityArray = [];
        console.log(dayjs(dayjs.unix(data.list[0].dt)).hour())
        console.log(data.list.length);
        for (var i = 0; i < data.list.length; i++) {
          if (dayjs(dayjs.unix(data.list[i].dt)).hour() === 12 || dayjs(dayjs.unix(data.list[i].dt)).hour() === 13 || dayjs(dayjs.unix(data.list[i].dt)).hour() === 14) {
            dateArray.push(dayjs(dayjs.unix(data.list[i].dt)).format("MM/DD/YYYY"));
            iconArray.push(data.list[i].weather[0].icon);
            tempArray.push(data.list[i].main.temp);
            windArray.push(data.list[i].wind.speed);
            humidityArray.push(data.list[i].main.humidity);
          }
        }
        console.log(dateArray);
        console.log(iconArray);
        console.log(tempArray);
        console.log(windArray);
        console.log(humidityArray);

        var dateClass = document.querySelectorAll(".date");
        for (var i = 0; i < dateArray.length; i++) {
          dateClass[i].textContent = dateArray[i];
        };

        var iconClass = document.querySelectorAll(".icon");
        for (var i = 0; i < iconArray.length; i++) {
          iconClass[i].innerHTML = "<img src=https://openweathermap.org/img/wn/" + iconArray[i] + ".png alt='Weather Icon' />"
        };

        var tempClass = document.querySelectorAll(".temp");
        for (var i = 0; i < tempArray.length; i++) {
          tempClass[i].innerHTML = "Temp: " + tempArray[i] + " &deg;F";
        };

        var humidityClass = document.querySelectorAll(".humidity");
        for (var i = 0; i < humidityArray.length; i++) {
          humidityClass[i].innerHTML = "Humidity: " + humidityArray[i] + " %";
        };

        var windClass = document.querySelectorAll(".wind");
        for (var i = 0; i < windArray.length; i++) {
          windClass[i].innerHTML = "Wind Speed: " + windArray[i] + " mph";
        };

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
      })
    })
  }

  $("#searchBtn").on("click", function(event) {
    event.preventDefault();
    displayWeather();
    $("#city").val("");
  })

  $("#searchHistory").on("click", "li", function(event) {
    $("#city").val(event.target.textContent);
    displayWeather();
    $("#city").val("");
  })
});