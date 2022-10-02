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

app.get("/sattelite", async (req, res) => {
  const response = [];

  const tleData = await getTle();
  tleData.map((item) => {
    var position = getLatLng(item, null);
    var result = {
      name: item.substring(0, item.indexOf("\n")),
      position: position,
    };

    response.push(result);
  });

  res.send(response);
});

const tle = `ISS (ZARYA)             
1 25544U 98067A   22275.03521722  .00046746  00000+0  83199-3 0  9999
2 25544  51.6418 167.2146 0003169 263.1060 229.2717 15.49661688361757`;

function getTle() {
  var tleData = [];
  return axios
    .get(
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle"
    )
    .then((response) => {
      const data = response.data.split(/\r?\n/);
      for (var i = 0; i < data.length; i += 3) {
        var name = data[i].trim();
        name += "\n";
        var one = (data[i + 1] += "\n");
        var two = data[i + 2];

        var tle = name.concat(one).concat(two);

        tleData.push(tle);
      }
      return tleData;
    });
}

function getLatLng(tle, time) {
  try {
    const latLongObj = getLatLngObj(tle, time);
    return latLongObj;
  } catch (e) {
    console.log(e);
  }

  return null;
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
