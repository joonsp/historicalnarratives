#!/bin/bash

# Simplify GeoJSON borders using mapshaper
# Usage: ./simplify-borders.sh

set -e

RAW_DIR="raw-data"
OUTPUT_DIR="processed-data"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "Starting GeoJSON simplification..."
echo "=================================="

# Ancient period
echo "Processing ancient period..."
npx mapshaper "$RAW_DIR/bc_1000_raw.geojson" \
  -simplify 15% keep-shapes \
  -o "$OUTPUT_DIR/bc_1000.geojson"
echo "✓ bc_1000.geojson simplified"

npx mapshaper "$RAW_DIR/bc_500_raw.geojson" \
  -simplify 15% keep-shapes \
  -o "$OUTPUT_DIR/bc_500.geojson"
echo "✓ bc_500.geojson simplified"

npx mapshaper "$RAW_DIR/bc_1_raw.geojson" \
  -simplify 15% keep-shapes \
  -o "$OUTPUT_DIR/bc_1.geojson"
echo "✓ bc_1.geojson simplified"

# Medieval period
echo "Processing medieval period..."
npx mapshaper "$RAW_DIR/ad_400_raw.geojson" \
  -simplify 15% keep-shapes \
  -o "$OUTPUT_DIR/ad_400.geojson"
echo "✓ ad_400.geojson simplified"

npx mapshaper "$RAW_DIR/ad_800_raw.geojson" \
  -simplify 15% keep-shapes \
  -o "$OUTPUT_DIR/ad_800.geojson"
echo "✓ ad_800.geojson simplified"

npx mapshaper "$RAW_DIR/ad_1200_raw.geojson" \
  -simplify 15% keep-shapes \
  -o "$OUTPUT_DIR/ad_1200.geojson"
echo "✓ ad_1200.geojson simplified"

# Modern period
echo "Processing modern period..."
npx mapshaper "$RAW_DIR/1500_raw.geojson" \
  -simplify 15% keep-shapes \
  -o "$OUTPUT_DIR/1500.geojson"
echo "✓ 1500.geojson simplified"

npx mapshaper "$RAW_DIR/1650_raw.geojson" \
  -simplify 15% keep-shapes \
  -o "$OUTPUT_DIR/1650.geojson"
echo "✓ 1650.geojson simplified"

npx mapshaper "$RAW_DIR/1815_raw.geojson" \
  -simplify 15% keep-shapes \
  -o "$OUTPUT_DIR/1815.geojson"
echo "✓ 1815.geojson simplified"

npx mapshaper "$RAW_DIR/1914_raw.geojson" \
  -simplify 15% keep-shapes \
  -o "$OUTPUT_DIR/1914.geojson"
echo "✓ 1914.geojson simplified"

npx mapshaper "$RAW_DIR/1945_raw.geojson" \
  -simplify 15% keep-shapes \
  -o "$OUTPUT_DIR/1945.geojson"
echo "✓ 1945.geojson simplified"

npx mapshaper "$RAW_DIR/2000_raw.geojson" \
  -simplify 15% keep-shapes \
  -o "$OUTPUT_DIR/2000.geojson"
echo "✓ 2000.geojson simplified"

echo ""
echo "=================================="
echo "Simplification complete!"
echo "Output directory: $OUTPUT_DIR"
echo ""
echo "File sizes:"
ls -lh "$OUTPUT_DIR" | tail -n +2 | awk '{printf "  %-25s %8s\n", $9, $5}'
