let lat, lon;
var map = L.map("map").setView([-30, 150], 1);
document.getElementById("map").style.visibility = "hidden";
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(async (position) => {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    document.getElementById("lat").textContent = lat.toFixed(2);
    document.getElementById("lon").textContent = lon.toFixed(2);

    map.setView([lat, lon], 1);

    const data_url = `/weather/${lat}, ${lon}`;
    const response = await fetch(data_url);
    const json = await response.json();
    const weatherData = json.weather_data;
    const air_qualityData = json.aq_data;
    try {
      document.getElementById("location").textContent =
        weatherData.data[0].city_name;
      document.getElementById("summary").textContent =
        weatherData.data[0].weather.description;
      const iconElement = document.getElementById("icon");
      iconElement.src = `icons/${weatherData.data[0].weather.icon}.png`;
      iconElement.style.width = "30px";
      document.getElementById("temperature").textContent =
        weatherData.data[0].app_temp;
    } catch (error) {
      console.log("Something went wrong retrieving weather data...");
      document.getElementById("weather").innerHTML =
        "Sorry - There is no weather information at this location.";
    }
    try {
      const measurements = air_qualityData.results[0].measurements;
      document.getElementById("aq_parameter").textContent =
        measurements[0].parameter;
      document.getElementById("aq_location").textContent =
        air_qualityData.results[0].location;
      document.getElementById("aq_time").textContent =
        measurements[0].lastUpdated;
      document.getElementById(
        "aq_pm_ten"
      ).textContent = `${measurements[0].value} ${measurements[0].unit}`;
    } catch (error) {
      console.log("Something went wrong retrieving air quality data...");
      document.getElementById("air_quality").innerHTML =
        "Sorry - There is no air quality information at this location.";
    }
  });
} else {
  console.log("geolocation IS NOT available");
}

const button = document.getElementById("checkin");
button.addEventListener("click", addMarkers);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap",
}).addTo(map);
var markers = L.layerGroup();

async function addMarkers() {
  document.getElementById("map").style.visibility = "visible";
  const api_url = "/weatherData";
  const response = await fetch(api_url);
  const json = await response.json();
  markers.clearLayers();
  var latlngsArray = [];

  for (let i = 0; i < json.length; i++) {
    latlngsArray.push([json[i].lat, json[i].long]);
    const marker = L.marker([json[i].lat, json[i].long])
      .bindPopup(
        `The temperature in ${json[i].city} at ${json[i].time} on ${json[i].date} was ${json[i].temp}°C`
      )
      .openPopup();
    markers.addLayer(marker);
  }
  markers.addTo(map);

  //zoom map to fit all markers
  var polyline = L.polyline(latlngsArray);
  map.fitBounds(polyline.getBounds());
}

async function postStuff() {
  const data = await fetch("/api", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify({ data: "hello" }), // body data type must match "Content-Type" header
  });
  const text = await data.text();
  console.log(text);
}

postStuff();
