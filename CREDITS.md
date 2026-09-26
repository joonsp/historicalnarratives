# Credits & Acknowledgements

## Data Sources

### Historical Borders
**Source:** [aourednik/historical-basemaps](https://github.com/aourednik/historical-basemaps)
**License:** GPL-3.0
**Description:** GeoJSON datasets of historical country borders spanning 1000 BCE to 2000 CE. Provides 12 time period snapshots used for the map overlays.
**Credit:** Ourednik, A. (2018). Historical Basemaps. GitHub repository.

### Land Polygons
**Source:** [Natural Earth](https://www.naturalearthdata.com/) — `ne_50m_land` (1:50m physical vectors)
**License:** Public domain
**Description:** Landmasses for the schematic atlas, drawn with a dithered fill instead of raster map tiles. Properties stripped and coordinates rounded to 3 decimals to reduce file size.

### Podcast Metadata
**Source:** [Dan Carlin's Hardcore History](https://www.dancarlin.com/hardcore-history-series/)
**Description:** Episode metadata including titles, release dates, time periods, and geographic coordinates manually curated for this project.
**Note:** All podcast content, episode titles, and descriptions are © Dan Carlin. This project is not affiliated with or endorsed by Dan Carlin.

## Technology Stack

### Core Frameworks
- **[Svelte 5](https://svelte.dev/)** - Reactive UI framework
- **[Leaflet](https://leafletjs.com/)** - Interactive map library
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### Backend & AI
- **[Express.js](https://expressjs.com/)** - Node.js web framework
- **[Anthropic Claude API](https://www.anthropic.com/)** - AI-powered narrative generation
  - Model: Claude Sonnet 4.5
  - Used for generating historical narrative journeys

### Fonts
All from Google Fonts, SIL Open Font License:
- **[Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)** - pixel display headings
- **[EB Garamond](https://fonts.google.com/specimen/EB+Garamond)** - body copy
- **[IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono)** - metadata
- **[VT323](https://fonts.google.com/specimen/VT323)** - terminal accents

## Development Tools
- **Node.js** - JavaScript runtime
- **npm** - Package manager
- **Git** - Version control

## Inspiration

This project was inspired by:
- The rich storytelling of Dan Carlin's Hardcore History podcast
- Interactive historical timelines like [Chronozoom](http://www.chronozoomproject.org/)
- The CShapes historical borders dataset used in political science research
- Modern web mapping applications that make data exploration engaging

## License

This project is open source. Individual components retain their original licenses:
- Historical basemaps data: GPL-3.0
- Natural Earth land data: public domain
- Application code: GPL-3.0

## Contributing

Historical data corrections, new event additions, and code improvements are welcome! Please see the repository's contribution guidelines.

---

**Built with ❤️ for history enthusiasts**
