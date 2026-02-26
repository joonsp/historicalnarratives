# Historical Borders - Manual Testing Checklist

## Quick Start

```bash
# Development server is already running at http://localhost:5173
# Just open in your browser and follow the checklist below
```

## Visual Testing Checklist

### Basic Functionality ✅

- [ ] Open http://localhost:5173 in browser
- [ ] Map renders without errors
- [ ] Timeline controls are visible and functional

### Border Rendering (Test Each Snapshot)

Navigate through each year using the timeline slider:

**Ancient Period:**
- [ ] **-1000 BCE**: Ancient Near East renders (Assyria, Egypt, Zhou)
- [ ] **-500 BCE**: Persian Empire Era renders (Achaemenid, Greek states)
- [ ] **-1 BCE**: Late Roman Republic renders (Roman, Parthian, Han)

**Medieval Period:**
- [ ] **400 CE**: Late Roman Empire renders (W/E Roman, Sassanid)
- [ ] **800 CE**: Carolingian Empire renders (Frankish, Abbasid, Byzantine)
- [ ] **1200 CE**: Mongol Expansion renders (Mongol, HRE, Almohad)

**Modern Period:**
- [ ] **1500 CE**: Age of Discovery renders (Ottoman, Spanish, Ming)
- [ ] **1650 CE**: Post-Westphalia renders (Habsburg, Ottoman, Qing)
- [ ] **1815 CE**: Congress of Vienna renders (British, Russian, Austrian)
- [ ] **1914 CE**: Pre-WWI renders (British, German, Russian, A-H, Ottoman)
- [ ] **1945 CE**: Post-WWII renders (Soviet, USA, British, China)
- [ ] **2000 CE**: Modern World renders (USA, Russia, China, EU)

### Visual Quality Checks

For each snapshot:
- [ ] Borders appear smooth and realistic
- [ ] Coastlines match actual geography
- [ ] Colors are distinct and visible
- [ ] No visual artifacts or rendering errors
- [ ] Tooltips show entity names on hover
- [ ] Major empires are clearly identifiable

### Performance Testing

- [ ] Timeline animation runs smoothly (target >30 FPS)
- [ ] No lag when scrubbing timeline
- [ ] Memory usage stays reasonable (<500 MB in DevTools)
- [ ] Border transitions are smooth
- [ ] Initial load time is acceptable (<5 seconds)

**Check Network Tab:**
- [ ] GeoJSON files load once and cache
- [ ] No 404 errors for border files
- [ ] File sizes are reasonable (see table below)

**Expected File Sizes:**
- bc_1000.geojson: 498K
- bc_500.geojson: 529K
- bc_1.geojson: 839K
- ad_400.geojson: 758K
- ad_800.geojson: 601K
- ad_1200.geojson: 676K
- 1500.geojson: 779K
- 1650.geojson: 1.6M ⚠️ (largest)
- 1815.geojson: 1.3M
- 1914.geojson: 696K
- 1945.geojson: 759K
- 2000.geojson: 992K

### Historical Accuracy Spot Checks

Cross-reference with known historical events:

**Ancient Period:**
- [ ] **-480 BCE** (near -500): Persian Empire should extend to Greece
- [ ] **-49 BCE** (near -1): Roman Republic should control Mediterranean
- [ ] **476 CE** (near 400): Western and Eastern Roman Empire split visible

**Medieval Period:**
- [ ] **1206 CE** (near 1200): Mongol Empire should be present in Central Asia
- [ ] **1453 CE** (near 1500): Ottoman Empire should control Anatolia and Balkans

**Modern Period:**
- [ ] **1789 CE** (near 1815): Pre-revolutionary French borders
- [ ] **1815 CE**: Post-Napoleonic borders (Congress of Vienna)
- [ ] **1914 CE**: Austria-Hungary, German, Russian, Ottoman empires present
- [ ] **1939 CE** (near 1945): Pre-WWII European borders
- [ ] **1945 CE**: Soviet expansion visible, divided Germany
- [ ] **1991 CE** (near 2000): Soviet Union should be dissolved

### Edge Cases

- [ ] Year -2000 (before first snapshot): No borders displayed
- [ ] Year 3000 (after last snapshot): 2000 CE borders displayed
- [ ] Rapid timeline scrubbing: No crashes or errors
- [ ] Browser refresh: App reloads correctly with cached data

## Console Checks

Open DevTools Console (F12) and check for:
- [ ] No JavaScript errors
- [ ] No failed network requests
- [ ] No warnings about invalid GeoJSON

## Mobile Testing (Optional)

If testing on mobile device:
- [ ] Map renders correctly on small screen
- [ ] Timeline controls are usable
- [ ] Performance is acceptable
- [ ] Touch gestures work (pan, zoom)

## Known Issues to Verify

### Expected Behaviors (Not Bugs):

1. **Some entities don't render**: This is expected - some features have null geometries in the source data
2. **Border "jumps" between snapshots**: Normal - we have 12 discrete snapshots, not continuous data
3. **Small islands may be missing**: Source data omits very small territories

### Report If You See:

1. **Major empires missing**: e.g., Roman Empire not visible in -1 BCE
2. **Completely wrong geography**: e.g., continents in wrong places
3. **Rendering errors**: Distorted polygons, missing coastlines
4. **Performance issues**: Lag, freezing, excessive memory use
5. **Console errors**: JavaScript errors or failed network requests

## Quick Fixes

### If borders don't load:

```bash
# Check network tab in DevTools
# Verify files exist:
ls -lh public/data/borders/*/*.geojson

# Restart dev server:
npm run dev
```

### If you need to rollback:

```bash
# Restore placeholder data:
cp -r public/data/borders_backup_* public/data/borders/
```

## Success Criteria

**Minimum Viable:**
- ✅ All 12 snapshots load without errors
- ✅ Major empires are visible and recognizable
- ✅ Timeline animation works smoothly

**Ideal:**
- ✅ All visual quality checks pass
- ✅ Performance is excellent (>30 FPS)
- ✅ Historical accuracy spot checks confirm correctness
- ✅ No console errors or warnings

## Reporting Issues

If you find any issues, note:
1. **Snapshot year** where issue occurs
2. **Entity name** if applicable
3. **Screenshot** of the issue
4. **Browser** and version
5. **Console errors** (if any)

Save to a file or create a GitHub issue with these details.

## Additional Resources

- **Full Implementation Summary**: See IMPLEMENTATION_SUMMARY.md
- **Color Mappings**: See color-mappings.json
- **Validation Scripts**: See scripts/validate-geojson.cjs
