let hourlyTemp = [];
let dailyTemp = {};
$(function () {
  $(".today-date").text(getFullDate());
});
function getFullDate() {
  let d = new Date();
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let weekday = new Array(7);
  weekday[0] = "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";
  return `${weekday[d.getDay()]}, ${
    months[d.getMonth()]
  } ${d.getDate()}, ${d.getFullYear()}`;
}
function getWeekday(timeUnix) {
  let time = new Date(timeUnix * 1000);
  let weekday = new Array(7);
  weekday[0] = "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";
  return weekday[time.getDay()];
}
function getTime(timeUnix) {
  let time = new Date(timeUnix * 1000);
  return time.getHours();
}
function getClouds(cloudData) {
  let cloudDataString = "";
  if (cloudData >= 88) {
    cloudDataString = "Cloudy";
  } else if (cloudData >= 70 && cloudData <= 87) {
    cloudDataString = "Mostly Cloudy";
  } else if (cloudData >= 51 && cloudData <= 69) {
    cloudDataString = "Partly Sunny";
  } else if (cloudData >= 26 && cloudData <= 50) {
    cloudDataString = "Mostly Sunny";
  } else if (cloudData >= 6 && cloudData <= 25) {
    cloudDataString = "Sunny";
  } else if (cloudData >= 0 && cloudData <= 5) {
    cloudDataString = "Clear";
  }
  return cloudDataString;
}
function mapDataCurrentTemp(currentTemp) {
  $(".today-temp").text(`${Math.round(currentTemp["temp"])}°C`);
  $(".today-cloudy").text(`${getClouds(currentTemp["clouds"])}`);
  $(".today-humidity").text(`Humidity: ${currentTemp["humidity"]}%`);
  $(".today-wind").text(`Wind speed: ${currentTemp["wind"]} km/h`);
  $(".today-icon").css(
    "background-image",
    `url("./img/${currentTemp["condition"].toLowerCase()}.png")`
  );
}
function mapDataHourlyTemp(hourlyTemp) {
  $(".period__forecast").empty();
  hourlyTemp.forEach(function (temp) {
    $(".period__forecast").append(`
    <div class="period__weather">
    <p class="period__day">${getWeekday(temp["dt"])}</p>
    <p class="period__time">${getTime(temp["dt"])}:00</p>
    <span class="period__icon" style="background-image: url('./img/${
      temp.weather[0].main.toLowerCase()
    }.png');"></span>
    <p class="period__temp">${Math.round(temp["temp"])}°C</p>
    <p class="period__cloudy">${getClouds(temp["clouds"])}</p>
  </div>;`);
  });
}
function mapDataDailyTemp() {}
$(".location-form").submit(function (event) {
  event.preventDefault();
  let coodinates = { lat: "", lng: "" };
  let input = $(this).serializeArray()[0]["value"];
  if (input.trim()) {
    $(".location-error").text("");
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/weather?q=${input}&units=metric&appid=7fbb02f8c26e09f99f9bf3f703972dcc`,
    })
      .done(function (data) {
        let currentTemp = {};
        currentTemp["temp"] = data.main.temp;
        currentTemp["clouds"] = data.clouds.all;
        currentTemp["humidity"] = data.main.humidity;
        currentTemp["wind"] = data.wind.speed;
        currentTemp["condition"] = data.weather[0].main;
        coodinates["lat"] = data.coord.lat;
        coodinates["lng"] = data.coord.lon;
        mapDataCurrentTemp(currentTemp);
        $.ajax({
          url: `https://api.openweathermap.org/data/2.5/onecall?lat=${coodinates.lat}&lon=${coodinates.lng}&exclude=current,minutely,alerts&units=metric&appid=7fbb02f8c26e09f99f9bf3f703972dcc`,
        })
          .done(function (data) {
            hourlyTemp = data["hourly"];
            mapDataHourlyTemp(hourlyTemp.splice(0, 12));
            $.ajax({
              url: `https://api.unsplash.com/search/photos?page=1?perpage=1&query=${input}`,
              beforeSend: function (xhr) {
                xhr.setRequestHeader(
                  "Authorization",
                  `Client-ID ev1l1FTXQ10y4nUET8Fkv1aiUvcrgXnoObnkC8y4SVo`
                );
              },
            })
              .done(function (data) {
                $(".main-wrapper").css(
                  "background",
                  `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
                url("${data.results[0].urls.regular}") no-repeat fixed center / cover`
                );
              })
              .fail(function (data) {});
          })
          .fail(function () {
            $(".location-error").text("Inlavid city name, please try again.");
          });
      })
      .fail(function () {
        $(".location-error").text("Inlavid city name, please try again.");
      });
  } else {
    $(".location-error").text("Please type valid city name.");
  }
});
