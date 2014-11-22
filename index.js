var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('Meter.db');
var fs = require('fs');
var path = require('path');
var geojson = { type: "FeatureCollection", features: [] };

function getRunCoordinates(run, callback) {
  var coordinates = [];

  db.each('select latitude, longitude from coordinate where runID = ?', { 1: run.runID }, function(err, row) {
    coordinates.push([row.longitude, row.latitude]);
  }, function() {
    callback(run, coordinates);
  });
}

function parseRuns(rows, doneParsingCallback) {
  var i = 0;

  function createRun(run, coordinates) {
    var feature = {
      type: 'Feature',
      properties: {
        id: run.runID,
        start_time: run.startTime,
        run_time: Math.floor(run.runTime/60) + ":" + Math.floor(run.runTime % 60),
        distance: Math.floor(run.distance)/1000,
        ascent: Math.floor(run.ascent),
        descent: Math.floor(run.descent),
        calories: Math.floor(run.calories),
        locality: run.locality
      }
    }
    console.log(feature)
    if (!coordinates || coordinates.length < 2) {
      feature.geometry = null;
    } else {
      feature.geometry = { type: 'LineString', coordinates: coordinates };
    }

    geojson.features.push(feature);

    i++;

    if (i < rows.length) {
      getRunCoordinates(rows[i], createRun);
    } else {
      console.log("Exported", rows.length, "runs");
      doneParsingCallback();
    }
  }

  getRunCoordinates(rows[i], createRun);
}

function writeToFile() {
  fs.writeFileSync(path.join(__dirname, 'runs.geojson'), JSON.stringify(geojson));
}

db.all("select runID, startTime, runTime, distance, ascent, descent, calories, locality from run", [], function(err, rows) {
  parseRuns(rows, writeToFile);
});
