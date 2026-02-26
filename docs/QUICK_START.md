# 🎬 Quick Start: Testing AI-Powered Narrative Timelines

## Open the App

Both servers are now running:
- **Frontend**: http://localhost:5176 (Vite)
- **Backend**: http://localhost:3001 (Express API)

Open **http://localhost:5176** in your browser to start testing!

> **Note**: AI generation requires both servers. They're already running via `npm run dev:all`

## 5-Minute Test Flow

### 1. Test Band of Brothers Narrative (60 seconds)

1. Click the **"Narratives"** button (top right control bar)
2. In the library panel, click **"Band of Brothers: Easy Company's Journey"**
3. Watch the map fly to Camp Toccoa, Georgia
4. Click the **"▶ Play"** button at the bottom
5. Watch as it automatically progresses through:
   - Camp Toccoa (training)
   - Normandy (D-Day)
   - Holland (Market Garden)
   - Bastogne (Siege)
   - Germany (Liberation)
   - Eagle's Nest (VE Day)

### 2. Test Interactive Controls (30 seconds)

While the narrative is playing:
- Press `Space` to pause/play
- Press `→` to skip to next step
- Press `←` to go back
- Press `H` to hide/show the step details card
- Click any numbered marker on the map to jump to that step
- Adjust the speed slider (try 2x speed!)

### 3. Test Another Narrative (60 seconds)

1. Press `ESC` to exit the current narrative
2. Open Narratives panel again
3. Try **"The Wars of the Roses"** or **"Alexander's Persian Campaign"**
4. Notice how each narrative has a unique theme and historical period

### 4. Explore the Create Tab (30 seconds)

1. In the Narratives panel, click the **"✨ Create"** tab
2. You should see the AI generation interface (backend is running!)
3. Type or click an example query
4. The interface is ready to generate custom narratives

### 5. Test AI Generation (2 minutes)

1. Go to Create tab (should show AI generation interface, no warnings!)
2. Type or click: **"Tell me about the Seven Years War"**
3. Click **"✨ Generate"**
4. Wait 5-10 seconds (watch the spinner)
5. Claude creates a custom narrative with 5-15 steps!
6. The narrative auto-loads and starts playing
7. Try it again with the same query - should load instantly from cache!

## Keyboard Shortcuts Reference

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `→` | Next step |
| `←` | Previous step |
| `ESC` | Exit narrative mode |
| `H` | Toggle step card visibility |
| `A` | Toggle auto-advance |
| `+` | Increase speed |
| `-` | Decrease speed |

## What to Look For

### ✅ Good Signs
- Map smoothly flies between locations
- Progress bar updates in real-time
- Step card shows rich descriptions
- Markers are numbered and clickable
- Blue animated path connects all steps
- Current step has a pulsing effect
- Auto-advance progresses through steps
- Keyboard shortcuts respond immediately

### ⚠️ Potential Issues
- If map doesn't animate: check browser console
- If narratives don't load: check sample data registration
- If AI generation fails: verify API key in `.env`
- If keyboard shortcuts don't work: click the map first

## Sample Narratives Overview

### 🎖️ Band of Brothers (6 steps, WWII)
**Timeline**: 1942-1945
**Regions**: USA, France, Netherlands, Belgium, Germany
**Highlights**: D-Day, Market Garden, Battle of the Bulge

### ⚔️ War of the Roses (5 steps, Medieval)
**Timeline**: 1455-1486
**Regions**: England
**Highlights**: St. Albans, Towton, Bosworth Field

### 🏛️ Alexander's Persian Campaign (7 steps, Ancient)
**Timeline**: 334-323 BCE
**Regions**: Greece, Turkey, Syria, Lebanon, Egypt, Iraq
**Highlights**: Granicus, Issus, Gaugamela, Alexandria

## Advanced Testing

### Test Auto-Advance
1. Load any narrative
2. Enable "Auto-advance" checkbox
3. Set speed to 2x
4. Press Play
5. Watch it progress through all steps automatically

### Test Step Jumping
1. Load a narrative
2. Click any numbered marker on the map
3. Should jump directly to that step
4. Progress bar should update accordingly

### Test Caching
1. Generate an AI narrative (requires API key)
2. Note the query you used
3. Generate the same query again
4. Should load instantly from cache (check console)

### Test Search & Filter
1. Open Narratives → Browse tab
2. Type "Alexander" in search
3. Should filter to show only matching narratives
4. Try theme filters: Ancient, Medieval, WWII

## Screenshots to Take

If you want to document the implementation:

1. **Free Explore Mode** - default state with timeline
2. **Narrative Library** - Browse tab with sample narratives
3. **Narrative Player** - Bottom control bar during playback
4. **Step Card** - Right panel showing step details
5. **Map Animation** - Journey path with numbered markers
6. **Create Tab** - AI generation interface
7. **Mobile View** - Responsive layout on narrow screen

## Next Steps After Testing

1. ✅ Confirm all sample narratives work
2. ✅ Verify smooth animations
3. ✅ Test all keyboard shortcuts
4. ✅ Check responsive design
5. 🔜 Add your API key for AI generation
6. 🔜 Generate custom narratives
7. 🔜 Provide feedback on UX
8. 🔜 Consider Phase 8 (database) for production

## Need Help?

- Check `NARRATIVE_IMPLEMENTATION.md` for detailed documentation
- Check browser console for errors
- Verify all dependencies are installed: `npm install`
- Restart dev server if needed: `npm run dev`

---

**Happy Testing! 🚀**

*The narrative feature is fully implemented and ready for exploration.*
