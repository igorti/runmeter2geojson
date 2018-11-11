var fs = require('fs'),
    path = require('path'),
    togpx = require('togpx')
    input = process.argv[2],
    output = path.resolve(__dirname, process.argv[3]);

if (!fs.existsSync(output)) {
  console.log("Folder", output, "doesn't exist. Please create output folder and try again");
  return;
}

var inputGeojson = JSON.parse(fs.readFileSync(path.resolve(__dirname, input)));

if (inputGeojson && inputGeojson.features) {
  var counter = 1;
  inputGeojson.features.forEach(function(f) {
      var gpx = togpx(f),
          filePath = path.resolve(__dirname, output, counter.toString() + ".gpx");

        fs.writeFileSync(filePath, gpx);
        console.log("Written", filePath)
        counter++;
  });
}
