#!/usr/bin/env node

const fs = require('fs');

const files = [
  'final-data/bc_1000.geojson',
  'final-data/bc_500.geojson',
  'final-data/bc_1.geojson',
  'final-data/ad_400.geojson',
  'final-data/ad_800.geojson',
  'final-data/ad_1200.geojson',
  'final-data/1500.geojson',
  'final-data/1650.geojson',
  'final-data/1815.geojson',
  'final-data/1914.geojson',
  'final-data/1945.geojson',
  'final-data/2000.geojson'
];

console.log('Validating GeoJSON files...\n');

let allValid = true;

files.forEach(file => {
  console.log(`Checking ${file}...`);

  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));

    // Check structure
    if (data.type !== 'FeatureCollection') {
      console.error(`  ✗ Not a FeatureCollection`);
      allValid = false;
      return;
    }

    if (!Array.isArray(data.features)) {
      console.error(`  ✗ Missing features array`);
      allValid = false;
      return;
    }

    // Validate each feature
    let hasInvalidCoords = false;
    let missingProps = 0;
    let nullGeometries = 0;

    data.features.forEach((feature, i) => {
      // Check required properties
      if (!feature.properties ||
          !feature.properties.name ||
          !feature.properties.year ||
          !feature.properties.color) {
        missingProps++;
      }

      // Check for null geometry
      if (!feature.geometry || !feature.geometry.coordinates) {
        nullGeometries++;
        return;
      }

      // Check coordinate bounds
      const coords = feature.geometry.coordinates;
      const checkCoord = (coord) => {
        if (Array.isArray(coord[0])) {
          coord.forEach(checkCoord);
        } else {
          const [lng, lat] = coord;
          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            hasInvalidCoords = true;
          }
        }
      };
      checkCoord(coords);
    });

    // File size
    const stats = fs.statSync(file);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`  ✓ Valid GeoJSON`);
    console.log(`  ✓ ${data.features.length} features`);
    console.log(`  ✓ File size: ${sizeMB} MB`);

    if (nullGeometries > 0) {
      console.log(`  ⚠ ${nullGeometries} features have null geometries (will be filtered)`);
    }

    if (hasInvalidCoords) {
      console.log(`  ⚠ Has some coordinates out of bounds`);
    }

    if (missingProps > 0) {
      console.log(`  ⚠ ${missingProps} features missing required properties`);
    }

    if (sizeMB > 1.5) {
      console.log(`  ⚠ File size exceeds 1.5 MB`);
    }

    console.log('');

  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    allValid = false;
  }
});

if (allValid) {
  console.log('✅ All files are valid!');
} else {
  console.log('❌ Some files have issues');
  process.exit(1);
}
