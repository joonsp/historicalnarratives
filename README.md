# 🗺️ Historical Narrative

An interactive historical map web app that lets you explore history through time or create AI-generated narrative journeys, with integration to Dan Carlin's Hardcore History podcast.

![Historical Narrative](https://img.shields.io/badge/Svelte-5-ff3e00?style=flat-square&logo=svelte)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=flat-square&logo=leaflet)

## ✨ Features

- **AI Narrative Journeys**: Generate custom historical narratives using Claude AI
  - Natural language queries (e.g., "Napoleon's Russian campaign")
  - Auto-generated step-by-step journeys with maps
  - Persistent narratives that survive page reloads
- **Interactive Map**: Dark-themed map powered by Leaflet + CartoDB tiles
- **Time Slider**: Navigate from 1000 BCE to 2026 CE with play/pause animation
- **Timeline Modes**:
  - 📅 Chronological (default)
  - 🎙️ Hardcore History - Release Order
  - ⏳ Hardcore History - Chronological (by period covered)
- **Event Markers**: Historical events (battles, treaties, revolutions) appear on the map
- **Episode Panel**: Browse Hardcore History episodes, click to jump to that era/region
- **Keyboard Shortcuts**: Space (play/pause), arrows (navigate), ↑↓ (speed)
- **Glassmorphism UI**: Modern blur effects and smooth animations

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| `Space` | Play/Pause timeline |
| `←` / `→` | Step 10 years back/forward |
| `Shift + ←/→` | Jump 50 years |
| `↑` / `↓` | Increase/decrease speed |

## 📚 Credits

Data sources and acknowledgements:
- **Historical Borders**: [aourednik/historical-basemaps](https://github.com/aourednik/historical-basemaps) (GPL-3.0)
- **Map Tiles**: CartoDB Dark Matter (CC BY 3.0)
- **Podcast Metadata**: Dan Carlin's Hardcore History (manually curated)
- **AI Generation**: Anthropic Claude Sonnet 4.5

See [CREDITS.md](CREDITS.md) for full acknowledgements.

## 🎙️ Hardcore History Integration

The app includes metadata for major Hardcore History series:
- **Blueprint for Armageddon** (WWI)
- **Ghosts of the Ostfront** (WWII Eastern Front)
- **Death Throes of the Republic** (Roman Republic)
- **Wrath of the Khans** (Mongol Empire)
- **Supernova in the East** (Pacific War/Japan)
- **King of Kings** (Persian Empire)
- **The Celtic Holocaust** (Gaul)

Click any episode to fly to that region and time period.

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── Map.svelte         # Leaflet map with event markers
│   │   ├── TimeSlider.svelte  # Timeline controls
│   │   ├── EpisodePanel.svelte # HH episode browser
│   │   └── EventInfo.svelte   # Event/episode info overlay
│   ├── data/
│   │   ├── hardcoreHistory.ts # Episode metadata
│   │   └── borders.ts         # Historical events data
│   └── stores/
│       └── timeline.ts        # Timeline state management
├── App.svelte                 # Main app component
├── main.ts                    # Entry point
└── app.css                    # Global styles
```

## 🔮 Future Enhancements

- [ ] Dynamic historical border overlays (GeoJSON)
- [ ] More historical events database
- [ ] Deep linking (share specific moment in history)
- [ ] Search across events and episodes
- [ ] Mobile gesture controls
- [ ] Additional podcast integrations

## 🛠️ Tech Stack

- **Svelte 5** + TypeScript
- **Leaflet** for mapping
- **Tailwind CSS** for styling
- **Vite** for build tooling

## 📜 License

MIT

---

*"The past is a foreign country: they do things differently there." - L.P. Hartley*
