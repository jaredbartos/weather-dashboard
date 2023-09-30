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
    
    var retrieveWeather = function() {
      fetchCoordinates.then(function(coordinates) {
        var weatherURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + coordinates.lat + "&lon=" + coordinates.lon + "&units=imperial&appid=" + APIKey;

        var fetchWeather = fetch(weatherURL)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            console.log(data);
          })
      })
    }

    retrieveWeather();
  }

  $("#searchBtn").on("click", function(event) {
    event.preventDefault();
    getWeatherAPI();
  })
});