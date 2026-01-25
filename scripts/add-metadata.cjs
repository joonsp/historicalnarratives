#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Existing empire colors from borders.ts
const EXISTING_COLORS = {
  'Achaemenid Persia': '#d4af37',
  'Persian Empire': '#d4af37',
  'Sassanid Persia': '#c19a6b',
  'Egypt': '#e6b800',
  'Assyria': '#8b4513',
  'Carthage': '#9370db',
  'Roman Republic': '#dc143c',
  'Roman Empire': '#dc143c',
  'Western Roman Empire': '#b22222',
  'Eastern Roman Empire': '#9932cc',
  'Byzantine Empire': '#9932cc',
  'Parthian Empire': '#ff8c00',
  'Greek City-States': '#4169e1',
  'Frankish Empire': '#4682b4',
  'Holy Roman Empire': '#ffd700',
  'Abbasid Caliphate': '#2e8b57',
  'Mongol Empire': '#00bfff',
  'Ayyubid Dynasty': '#32cd32',
  'Ottoman Empire': '#e74c3c',
  'Spanish Empire': '#ff4500',
  'Habsburg Empire': '#ffeb3b',
  'Austrian Empire': '#ffc107',
  'British Empire': '#e91e63',
  'Russian Empire': '#1e88e5',
  'Qing Dynasty': '#ff6f00',
  'Ming Dynasty': '#d32f2f',
  'Prussia': '#455a64',
  'German Empire': '#37474f',
  'Austria-Hungary': '#ff9800',
  'Soviet Union': '#c62828',
  'United States': '#c62828',
  'China': '#d32f2f',
  'European Union': '#0277bd',
  'Germany': '#424242',
  'France': '#1565c0',
  'Italy': '#388e3c',
  'Japan': '#c62828'
};

// Generate a color from HSL color space
function generateColor(index, total) {
  // Use golden ratio for hue distribution
  const hue = (index * 137.508) % 360; // Golden angle
  const saturation = 60 + (index % 20); // 60-80%
  const lightness = 45 + ((index * 7) % 20); // 45-65%

  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
}

// Convert HSL to hex
function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// File mappings
const files = [
  { input: 'processed-data/bc_1000.geojson', output: 'final-data/bc_1000.geojson', year: -1000 },
  { input: 'processed-data/bc_500.geojson', output: 'final-data/bc_500.geojson', year: -500 },
  { input: 'processed-data/bc_1.geojson', output: 'final-data/bc_1.geojson', year: -1 },
  { input: 'processed-data/ad_400.geojson', output: 'final-data/ad_400.geojson', year: 400 },
  { input: 'processed-data/ad_800.geojson', output: 'final-data/ad_800.geojson', year: 800 },
  { input: 'processed-data/ad_1200.geojson', output: 'final-data/ad_1200.geojson', year: 1200 },
  { input: 'processed-data/1500.geojson', output: 'final-data/1500.geojson', year: 1500 },
  { input: 'processed-data/1650.geojson', output: 'final-data/1650.geojson', year: 1650 },
  { input: 'processed-data/1815.geojson', output: 'final-data/1815.geojson', year: 1815 },
  { input: 'processed-data/1914.geojson', output: 'final-data/1914.geojson', year: 1914 },
  { input: 'processed-data/1945.geojson', output: 'final-data/1945.geojson', year: 1945 },
  { input: 'processed-data/2000.geojson', output: 'final-data/2000.geojson', year: 2000 }
];

// Create output directory
if (!fs.existsSync('final-data')) {
  fs.mkdirSync('final-data', { recursive: true });
}

// Collect all unique entities
const allEntities = new Set();
files.forEach(fileInfo => {
  const data = JSON.parse(fs.readFileSync(fileInfo.input, 'utf8'));
  data.features.forEach(feature => {
    const name = feature.properties.SUBJECTO;
    if (name && name.trim() !== '' && name !== 'null') {
      allEntities.add(name);
    }
  });
});

console.log(`Found ${allEntities.size} unique entities across all time periods`);

// Generate color map for all entities
const colorMap = { ...EXISTING_COLORS };
const sortedEntities = Array.from(allEntities).sort();
let colorIndex = 0;

sortedEntities.forEach((entity, index) => {
  if (!colorMap[entity]) {
    // Generate new color
    const hue = (colorIndex * 137.508) % 360;
    const saturation = 55 + (colorIndex % 25);
    const lightness = 50 + ((colorIndex * 11) % 20);
    colorMap[entity] = hslToHex(hue, saturation, lightness);
    colorIndex++;
  }
});

console.log(`Generated ${colorIndex} new colors`);
console.log(`Total color mappings: ${Object.keys(colorMap).length}`);

// Write color map to file for reference
fs.writeFileSync(
  'color-mappings.json',
  JSON.stringify(colorMap, null, 2)
);
console.log('Color mappings saved to color-mappings.json');

// Process each file
console.log('\nProcessing GeoJSON files...');
files.forEach(fileInfo => {
  console.log(`Processing ${path.basename(fileInfo.input)}...`);

  const data = JSON.parse(fs.readFileSync(fileInfo.input, 'utf8'));

  // Add metadata to each feature
  data.features = data.features.map(feature => {
    const name = feature.properties.SUBJECTO || 'Unknown';
    const color = colorMap[name] || '#78909c';

    return {
      ...feature,
      properties: {
        name: name,
        year: fileInfo.year,
        color: color,
        // Preserve original properties for reference
        originalName: feature.properties.NAME,
        type: feature.properties.TYPE,
        borderPrecision: feature.properties.BORDERPRECISION
      }
    };
  });

  // Write output file
  fs.writeFileSync(fileInfo.output, JSON.stringify(data, null, 2));
  console.log(`  ✓ Written to ${fileInfo.output}`);
});

console.log('\n✅ Metadata enhancement complete!');
console.log('\nNext steps:');
console.log('1. Review color-mappings.json');
console.log('2. Copy final-data/*.geojson to public/data/borders/');
console.log('3. Update EMPIRE_COLORS in src/lib/data/borders.ts');
