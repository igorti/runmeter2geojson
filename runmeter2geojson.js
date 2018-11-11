var sqlite3 = require('sqlite3').verbose(),
    fs = require('fs'),
    path = require('path'),
    input = process.argv[2],
    output = path.resolve(__dirname, process.argv[3]),
    db = new sqlite3.Database(input);

var geojson = { type: "FeatureCollection", features: [] };

function getRunCoordinates(run, callback) {
  var coordinates = [],
      times = [],
      startTime = new Date(run.startTime);

  db.each('select latitude, longitude, timeOffset from coordinate where runID = ?', { 1: run.runID }, function(err, row) {
    coordinates.push([row.longitude, row.latitude]);
    var coordTime = new Date(startTime.getTime() + row.timeOffset*1000);
    times.push(coordTime);
  }, function() {
    callback(run, coordinates, times);
  });
}

function parseRuns(rows, doneParsingCallback) {
  var i = 0;

  function createRun(run, coordinates, times) {
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
        locality: run.locality,
        times: times
      }
    }

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

var sql = "select runID, startTime, runTime, distance, ascent, descent, calories, locality from run";

db.all(sql, [], function(err, rows) {
  parseRuns(rows, function() {
    fs.writeFileSync(output, JSON.stringify(geojson));
  });
});
