# Historical Border Data Mapping

## Data Source
Repository: aourednik/historical-basemaps
Location: /tmp/historical-basemaps
License: GPL-3.0

## Year Mappings (All Exact Matches ✓)

| Target Year | Available File          | Source Year | Match Type   |
|-------------|-------------------------|-------------|--------------|
| -1000 BCE   | world_bc1000.geojson    | -1000       | Exact        |
| -500 BCE    | world_bc500.geojson     | -500        | Exact        |
| -1 BCE      | world_bc1.geojson       | -1          | Exact        |
| 400 CE      | world_400.geojson       | 400         | Exact        |
| 800 CE      | world_800.geojson       | 800         | Exact        |
| 1200 CE     | world_1200.geojson      | 1200        | Exact        |
| 1500 CE     | world_1500.geojson      | 1500        | Exact        |
| 1650 CE     | world_1650.geojson      | 1650        | Exact        |
| 1815 CE     | world_1815.geojson      | 1815        | Exact        |
| 1914 CE     | world_1914.geojson      | 1914        | Exact        |
| 1945 CE     | world_1945.geojson      | 1945        | Exact        |
| 2000 CE     | world_2000.geojson      | 2000        | Exact        |

## Output File Paths

| Period    | Output File                          |
|-----------|--------------------------------------|
| Ancient   | public/data/borders/ancient/bc_1000.geojson |
| Ancient   | public/data/borders/ancient/bc_500.geojson  |
| Ancient   | public/data/borders/ancient/bc_1.geojson    |
| Medieval  | public/data/borders/medieval/ad_400.geojson |
| Medieval  | public/data/borders/medieval/ad_800.geojson |
| Medieval  | public/data/borders/medieval/ad_1200.geojson|
| Modern    | public/data/borders/modern/1500.geojson     |
| Modern    | public/data/borders/modern/1650.geojson     |
| Modern    | public/data/borders/modern/1815.geojson     |
| Modern    | public/data/borders/modern/1914.geojson     |
| Modern    | public/data/borders/modern/1945.geojson     |
| Modern    | public/data/borders/modern/2000.geojson     |

## Processing Steps

1. Copy from /tmp/historical-basemaps/geojson/ to raw-data/
2. Simplify with mapshaper (15% complexity)
3. Add metadata (name, year, color)
4. Validate GeoJSON syntax
5. Copy to public/data/borders/

## Status

- [x] Repository cloned
- [x] Year mappings identified (all exact matches)
- [ ] Directories created
- [ ] Files downloaded
- [ ] Files simplified
- [ ] Metadata added
- [ ] Files validated
- [ ] Files deployed
