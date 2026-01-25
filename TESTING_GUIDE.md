# Historical Borders Testing Guide

## Quick Start

The historical borders feature is now live! Open your browser to:
**http://localhost:5174/**

## Visual Testing Checklist

### ✅ Initial Load
- [ ] App loads without errors
- [ ] Map displays with dark CartoDB tiles
- [ ] Border Controls panel visible in top-right corner
- [ ] Timeline slider shows year 1800
- [ ] Historical borders should be visible (showing 1650 snapshot since that's the closest at or before 1800)

### ✅ Border Controls
- [ ] **Toggle Button**: Click to hide borders → borders disappear
- [ ] Click again → borders reappear
- [ ] **Opacity Slider**: Move slider left → borders become more transparent
- [ ] Move slider right → borders become more opaque
- [ ] Slider range: 10% (very faint) to 60% (quite visible)

### ✅ Timeline Navigation

**Test Key Historical Snapshots:**

1. **Slide to year -500 (500 BCE)**
   - Should load "Persian Empire Era" borders
   - Expect: Large Persian Empire, Greek City-States
   - Hover over regions → tooltips show "Achaemenid Persia", "Greek City-States"

2. **Slide to year 400 CE**
   - Should load "Late Roman Empire" borders
   - Expect: Western Roman Empire, Eastern Roman Empire, Sassanid Persia
   - Borders should change from previous snapshot

3. **Slide to year 1815**
   - Should load "Congress of Vienna" borders
   - Expect: British Empire, Russian Empire, Austrian Empire, Prussia, France, Ottoman Empire
   - More complex border patterns

4. **Slide to year 1914**
   - Should load "Pre-WWI Europe" borders
   - Expect: German Empire, Austria-Hungary, British Empire, Russian Empire, etc.
   - Seven distinct empires visible

5. **Slide to year 1945**
   - Should load "Post-WWII" borders
   - Expect: Soviet Union (large), divided Germany, France, British Empire, Italy
   - Different configuration from 1914

### ✅ Interactivity

- [ ] **Hover over border** → tooltip appears with empire name
- [ ] Tooltip shows year (e.g., "1815 CE" or "500 BCE")
- [ ] Border opacity increases slightly on hover
- [ ] Moving mouse away → border returns to normal opacity
- [ ] Event markers remain clickable above borders (z-index correct)

### ✅ Performance

- [ ] **Press Play Button** (space bar)
- [ ] Timeline animates smoothly through years
- [ ] Borders update as timeline crosses snapshot boundaries
- [ ] No visible lag or stuttering
- [ ] Browser DevTools → Network tab:
  - Each GeoJSON file loads only once (cached)
  - No repeated fetches when revisiting same time periods

### ✅ Edge Cases

1. **Very Early History**
   - Slide to year -2000 (before first snapshot)
   - Expected: No borders shown (or year -1000 borders if using "show latest before")

2. **Far Future**
   - Slide to year 3000
   - Expected: Shows year 2000 borders (latest available)

3. **Rapid Scrubbing**
   - Quickly drag timeline slider back and forth
   - Expected: Borders update smoothly without errors
   - Console should show no warnings

### ✅ Browser Console

Open DevTools Console and check:
- [ ] No error messages (red text)
- [ ] No 404s for GeoJSON files
- [ ] No warnings about missing data
- [ ] Look for: "Failed to load borders" → should NOT appear

## Expected Behavior Summary

### Default State (Year 1800)
- Borders: **Enabled**
- Opacity: **25%**
- Visible snapshot: **1650** (Post-Westphalia)
- Empires shown: Habsburg Empire, Ottoman Empire, France

### Border Updates
- Borders change at these years: -1000, -500, -1, 400, 800, 1200, 1500, 1650, 1815, 1914, 1945, 2000
- Between snapshots: Shows the most recent (earlier) snapshot
- Example: Year 1700 shows 1650 snapshot, Year 1900 shows 1815 snapshot

### Color Coding
- **Roman Empire**: Dark Red (#dc143c)
- **Persian Empire**: Gold (#d4af37)
- **Byzantine Empire**: Purple (#9932cc)
- **British Empire**: Pink (#e91e63)
- **Russian Empire**: Blue (#1e88e5)
- **German Empire**: Dark Gray (#37474f)
- **Ottoman Empire**: Red (#e74c3c)
- **France**: Blue (#1565c0)
- And more in `EMPIRE_COLORS` map

## Known Limitations (Current Placeholder Data)

⚠️ **The current GeoJSON files contain simplified placeholder data:**

- Borders are **rectangular approximations**, not historically accurate
- Only major empires represented (2-7 per time period)
- Simplified to demonstrate functionality
- **Real historical accuracy requires replacing these files** with data from:
  - aourednik/historical-basemaps (recommended)
  - CShapes 2.0 (modern era)

## Reporting Issues

If you find bugs:
1. Note the year when bug occurs
2. Check browser console for errors
3. Note which border/empire is affected
4. Take a screenshot if visual issue
5. Check Network tab for failed fetches

## Performance Benchmarks

**Target Performance:**
- Initial load: < 2 seconds
- Border update on year change: < 100ms
- Memory usage: 50-70MB with 5 cached snapshots
- Animation FPS: > 30fps during playback

**Test in DevTools:**
1. Open Performance tab
2. Click Record
3. Press Play on timeline
4. Let it run for 10 seconds
5. Stop recording
6. Check FPS graph → should be smooth green line

## Next Steps After Testing

If everything works:
1. ✅ Mark implementation as successful
2. 📥 Download real historical data from aourednik/historical-basemaps
3. 🗺️ Replace placeholder GeoJSON files
4. 🎨 Fine-tune colors and styling
5. 📱 Test on mobile devices
6. 🚀 Deploy to production

---

**Happy Testing! 🗺️**
