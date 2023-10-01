// Wrap jQuery code in Document Ready event to prevent code being executed before document is finished loading
$(document).ready(function(){
  var APIKey = "dda9f109c012cbe0169e71d8a23518f5";

  var getWeatherAPI = function() {
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
        return response.json();
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
          return {cityName, weatherIcon, temp, humidity, wind};
        })
      
      fetchCurrentWeather.then(function(currentStats) {
        $("#intro").attr("style", "display: none;")
        $("#weatherData").attr("style", "display: block;")
        $("#cityName").html(currentStats.cityName + "<span id='currentDate'>" + dayjs().format("MM/DD/YYYY") + "<img src=https://openweathermap.org/img/wn/" + currentStats.weatherIcon + ".png alt='Weather Icon' />");
        $("#currentTemp").html("Temp: " + currentStats.temp + " &deg;F");
        $("#currentHumidity").text("Humidity: " + currentStats.humidity + " %");
        $("#currentWind").text("Wind Speed: " + currentStats.wind + " mph");
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
        $("#day1Date").text(dateArray[0]);
        $("#day2Date").text(dateArray[1]);
        $("#day3Date").text(dateArray[2]);
        $("#day4Date").text(dateArray[3]);
        $("#day5Date").text(dateArray[4]);
      })
    })
  }

  $("#searchBtn").on("click", function(event) {
    event.preventDefault();
    getWeatherAPI();
  })
});