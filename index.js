//server side software

const express = require("express");
const fetch = require("node-fetch");
const Datastore = require("nedb");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;

const db = new Datastore({ filename: "database" });

db.loadDatabase(function (err) {
  if (err) {
    console.error(err);
  }
});

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get("/weather/:latlon", async (request, response) => {
  const latlong = request.params.latlon.split(",");
  const lat = latlong[0];
  const lon = latlong[1];

  const weather_url = `https://weatherbit-v1-mashape.p.rapidapi.com/current?lat=${lat}&lon=${lon}`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.API_KEY,
      "X-RapidAPI-Host": "weatherbit-v1-mashape.p.rapidapi.com",
    },
  };

  let aq_url = `https://api.openaq.org/v2/latest?limit=100&page=1&offset=0&sort=desc&has_geo=true&coordinates=${lat}%2C${lon}&radius=20000&order_by=lastUpdated&dumpRaw=false`;
  aq_url = aq_url.replace(/\s+/g, "");
  db.insert({ lat: lat, long: lon });
  const weather_response = await fetch(weather_url, options);
  const weather_data = await weather_response.json();
  const aq_response = await fetch(aq_url);
  const aq_data = await aq_response.json();
  const allData = { weather_data, aq_data };
  response.json(allData);
});

app.get("/weatherData", (request, response) => {
  db.find({}, function (err, docs) {
    response.json(docs);
  });
});
