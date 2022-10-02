const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

const axios = require("axios");
const { getLatLngObj, getGroundTracks } = require("tle.js");

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/model", (req, res) => {
  res.sendFile(path.join(__dirname + "/model/isscombined.dae"));
});

app.get("/space.jpeg", (req, res) => {
  res.sendFile(path.join(__dirname + "/space.jpeg"));
});

app.post("/position", jsonParser, (req, res) => {
  console.log(req.body.data);
  const result = getLatLng(req.body.data);
  res.send(result);
});

app.get("/trajectory", (req, res) => {
  getTrajectory().then((trajectory) => res.send(trajectory));
});

const tle = `ISS (ZARYA)
1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;

function getTle() {
  axios
    .get(
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle"
    )
    .then((response) => {
      console.log(response.data);
    });
}

function getLatLng(time) {
  const latLongObj = getLatLngObj(tle, time);
  return latLongObj;
}

async function getTrajectory() {
  return await getGroundTracks({
    tle: tle,
    startTimeMs: Date.now(),
    stepMS: 1000,
    isLngLatFormat: true,
  });
}

getTle();
