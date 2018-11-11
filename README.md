runmeter2geojson
================

Export workouts from [Runmeter](https://abvio.com/runmeter/) database to GeoJSON and/or GPX.

## Usage

Runs from Runmeter database can be exported to geojson with the command below:

```bash
node runmeter2geojson.js <path-to-db> <path-to-geojson>
```

Services like Strava don't support GeoJSON but do support GPX. Newly created GeoJSON can be then converted to GPX the command below. For every individual run a separate gpx-file will be created.

```bash
node geojson2gpx.js <path-to-geojson> <path-to-folder-with-gpx-files>
```
