// Simplified historical borders data for Europe 1800-2000
// In a real app, this would come from CShapes or similar datasets

export interface HistoricalBorder {
  year: number;
  name: string;
  color: string;
  coordinates: [number, number][][]; // GeoJSON polygon format
  info?: string;
}

export interface HistoricalEvent {
  id: string;
  year: number;
  name: string;
  type: 'battle' | 'treaty' | 'revolution' | 'founding' | 'collapse';
  location: [number, number];
  description: string;
  wikipediaUrl?: string;
}

// Major historical events
export const historicalEvents: HistoricalEvent[] = [
  {
    id: 'french-rev',
    year: 1789,
    name: 'French Revolution Begins',
    type: 'revolution',
    location: [48.8566, 2.3522],
    description: 'Storming of the Bastille marks the beginning of the French Revolution',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/French_Revolution'
  },
  {
    id: 'waterloo',
    year: 1815,
    name: 'Battle of Waterloo',
    type: 'battle',
    location: [50.6800, 4.4120],
    description: 'Napoleon\'s final defeat by the Duke of Wellington and Prussian forces',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Battle_of_Waterloo'
  },
  {
    id: 'congress-vienna',
    year: 1815,
    name: 'Congress of Vienna',
    type: 'treaty',
    location: [48.2082, 16.3738],
    description: 'European powers redraw the map after the Napoleonic Wars',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Congress_of_Vienna'
  },
  {
    id: 'german-unification',
    year: 1871,
    name: 'German Unification',
    type: 'founding',
    location: [52.5200, 13.4050],
    description: 'Proclamation of the German Empire at Versailles',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Unification_of_Germany'
  },
  {
    id: 'italian-unification',
    year: 1861,
    name: 'Italian Unification',
    type: 'founding',
    location: [41.9028, 12.4964],
    description: 'The Kingdom of Italy is proclaimed',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Italian_unification'
  },
  {
    id: 'sarajevo',
    year: 1914,
    name: 'Assassination of Archduke Franz Ferdinand',
    type: 'revolution',
    location: [43.8563, 18.4131],
    description: 'The spark that ignited World War I',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Assassination_of_Archduke_Franz_Ferdinand'
  },
  {
    id: 'versailles',
    year: 1919,
    name: 'Treaty of Versailles',
    type: 'treaty',
    location: [48.8049, 2.1204],
    description: 'Peace treaty ending World War I',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Treaty_of_Versailles'
  },
  {
    id: 'russian-rev',
    year: 1917,
    name: 'Russian Revolution',
    type: 'revolution',
    location: [59.9343, 30.3351],
    description: 'Bolsheviks seize power in Russia',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Russian_Revolution'
  },
  {
    id: 'ww2-start',
    year: 1939,
    name: 'World War II Begins',
    type: 'battle',
    location: [52.2297, 21.0122],
    description: 'Germany invades Poland, starting WWII',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Invasion_of_Poland'
  },
  {
    id: 'dday',
    year: 1944,
    name: 'D-Day',
    type: 'battle',
    location: [49.3675, -0.8739],
    description: 'Allied invasion of Normandy',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Normandy_landings'
  },
  {
    id: 'berlin-fall',
    year: 1945,
    name: 'Fall of Berlin',
    type: 'battle',
    location: [52.5200, 13.4050],
    description: 'Soviet forces capture Berlin, ending WWII in Europe',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Battle_of_Berlin'
  },
  {
    id: 'berlin-wall-fall',
    year: 1989,
    name: 'Fall of the Berlin Wall',
    type: 'revolution',
    location: [52.5163, 13.3777],
    description: 'The Berlin Wall falls, symbolizing the end of the Cold War',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Fall_of_the_Berlin_Wall'
  },
  {
    id: 'soviet-collapse',
    year: 1991,
    name: 'Dissolution of the Soviet Union',
    type: 'collapse',
    location: [55.7558, 37.6173],
    description: 'The USSR officially dissolves',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Dissolution_of_the_Soviet_Union'
  },
  // Ancient events
  {
    id: 'thermopylae',
    year: -480,
    name: 'Battle of Thermopylae',
    type: 'battle',
    location: [38.7967, 22.5367],
    description: '300 Spartans make their legendary stand against the Persian Empire',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Battle_of_Thermopylae'
  },
  {
    id: 'caesar-rubicon',
    year: -49,
    name: 'Caesar Crosses the Rubicon',
    type: 'revolution',
    location: [44.0678, 12.4326],
    description: 'Julius Caesar starts the civil war that ends the Roman Republic',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Crossing_the_Rubicon'
  },
  {
    id: 'rome-fall',
    year: 476,
    name: 'Fall of Rome',
    type: 'collapse',
    location: [41.9028, 12.4964],
    description: 'Romulus Augustulus deposed; the Western Roman Empire ends',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Fall_of_the_Western_Roman_Empire'
  },
  {
    id: 'genghis-khan',
    year: 1206,
    name: 'Rise of Genghis Khan',
    type: 'founding',
    location: [47.9212, 106.9057],
    description: 'Temüjin is proclaimed Genghis Khan, founding the Mongol Empire',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Genghis_Khan'
  },
  {
    id: 'constantinople-fall',
    year: 1453,
    name: 'Fall of Constantinople',
    type: 'battle',
    location: [41.0082, 28.9784],
    description: 'Ottoman conquest ends the Byzantine Empire',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Fall_of_Constantinople'
  },
];

// Get events for a given year (±tolerance)
export function getEventsForYear(year: number, tolerance = 2): HistoricalEvent[] {
  return historicalEvents.filter(e => Math.abs(e.year - year) <= tolerance);
}

// Get events in a range
export function getEventsInRange(startYear: number, endYear: number): HistoricalEvent[] {
  return historicalEvents.filter(e => e.year >= startYear && e.year <= endYear);
}

// ============================================================================
// HISTORICAL BORDERS SYSTEM
// ============================================================================

export interface BorderSnapshot {
  year: number;
  path: string;
  description: string;
  empires: string[];
}

export interface BorderFeature {
  type: 'Feature';
  properties: {
    name: string;
    type?: string;
    year?: number;
    color?: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface BorderCollection {
  type: 'FeatureCollection';
  features: BorderFeature[];
}

// 12 historical time period snapshots spanning -1000 BCE to 2000 CE
// Data source: aourednik/historical-basemaps (GPL-3.0)
// https://github.com/aourednik/historical-basemaps
export const BORDER_SNAPSHOTS: BorderSnapshot[] = [
  {
    year: -1000,
    path: '/data/borders/ancient/bc_1000.geojson',
    description: 'Ancient Near East - Neo-Assyrian Era',
    empires: ['Assyria', 'Egypt', 'Zhou Dynasty', 'Nubia', 'Urartu', 'Phrygia']
  },
  {
    year: -500,
    path: '/data/borders/ancient/bc_500.geojson',
    description: 'Persian Empire Era - Classical Age',
    empires: ['Achaemenid Empire', 'Greek city-states', 'Carthage', 'Gandhara', 'Kush', 'Olmec']
  },
  {
    year: -1,
    path: '/data/borders/ancient/bc_1.geojson',
    description: 'Late Roman Republic - Augustan Age',
    empires: ['Roman Empire', 'Parthian Empire', 'Han Dynasty', 'Kushan Empire', 'Axum', 'Armenia']
  },
  {
    year: 400,
    path: '/data/borders/medieval/ad_400.geojson',
    description: 'Late Roman Empire - Migration Period',
    empires: ['Western Roman Empire', 'Eastern Roman Empire', 'Sassanid Persia', 'Gupta Empire', 'Axum', 'Teotihuacan']
  },
  {
    year: 800,
    path: '/data/borders/medieval/ad_800.geojson',
    description: 'Carolingian Empire - Islamic Golden Age',
    empires: ['Frankish Empire', 'Abbasid Caliphate', 'Byzantine Empire', 'Tang Dynasty', 'Pala Empire', 'Tiwanaku']
  },
  {
    year: 1200,
    path: '/data/borders/medieval/ad_1200.geojson',
    description: 'Mongol Expansion - High Middle Ages',
    empires: ['Mongol Empire', 'Holy Roman Empire', 'Almohad Caliphate', 'Angevin Empire', 'Ayyubid Dynasty', 'Song Dynasty']
  },
  {
    year: 1500,
    path: '/data/borders/modern/1500.geojson',
    description: 'Age of Discovery - Renaissance',
    empires: ['Ottoman Empire', 'Spanish Empire', 'Ming Dynasty', 'Safavid Persia', 'Inca Empire', 'Aztec Empire']
  },
  {
    year: 1650,
    path: '/data/borders/modern/1650.geojson',
    description: 'Post-Westphalia - Colonial Era',
    empires: ['Habsburg Empire', 'Ottoman Empire', 'Qing Dynasty', 'Mughal Empire', 'Dutch Empire', 'Swedish Empire']
  },
  {
    year: 1815,
    path: '/data/borders/modern/1815.geojson',
    description: 'Congress of Vienna - Napoleonic Aftermath',
    empires: ['British Empire', 'Russian Empire', 'Austrian Empire', 'Prussia', 'Qing Dynasty', 'Ottoman Empire']
  },
  {
    year: 1914,
    path: '/data/borders/modern/1914.geojson',
    description: 'Pre-WWI Europe - Imperial Powers',
    empires: ['British Empire', 'German Empire', 'Russian Empire', 'Austria-Hungary', 'Ottoman Empire', 'French Empire']
  },
  {
    year: 1945,
    path: '/data/borders/modern/1945.geojson',
    description: 'Post-WWII - Allied Victory',
    empires: ['Soviet Union', 'United States', 'British Empire', 'China', 'France']
  },
  {
    year: 2000,
    path: '/data/borders/modern/2000.geojson',
    description: 'Modern World - Post-Cold War',
    empires: ['United States', 'Russia', 'China', 'European Union', 'India', 'Brazil']
  }
];

// Empire color palette for visual styling
export const EMPIRE_COLORS: Record<string, string> = {
  // Ancient empires
  'Achaemenid Persia': '#d4af37',
  'Persian Empire': '#d4af37',
  'Sassanid Persia': '#c19a6b',
  'Egypt': '#e6b800',
  'Assyria': '#8b4513',
  'Carthage': '#9370db',

  // Classical
  'Roman Republic': '#dc143c',
  'Roman Empire': '#dc143c',
  'Western Roman Empire': '#b22222',
  'Eastern Roman Empire': '#9932cc',
  'Byzantine Empire': '#9932cc',
  'Parthian Empire': '#ff8c00',
  'Greek City-States': '#4169e1',

  // Medieval
  'Frankish Empire': '#4682b4',
  'Holy Roman Empire': '#ffd700',
  'Abbasid Caliphate': '#2e8b57',
  'Mongol Empire': '#00bfff',
  'Ayyubid Dynasty': '#32cd32',
  'Ottoman Empire': '#e74c3c',

  // Early Modern
  'Spanish Empire': '#ff4500',
  'Habsburg Empire': '#ffeb3b',
  'Austrian Empire': '#ffc107',
  'British Empire': '#e91e63',
  'Russian Empire': '#1e88e5',
  'Qing Dynasty': '#ff6f00',
  'Ming Dynasty': '#d32f2f',
  'Prussia': '#455a64',
  'German Empire': '#37474f',

  // Modern
  'Austria-Hungary': '#ff9800',
  'Soviet Union': '#c62828',
  'United States': '#1976d2',
  'China': '#d32f2f',
  'European Union': '#0277bd',
  'Germany': '#424242',
  'France': '#1565c0',
  'Italy': '#388e3c',
  'Japan': '#c62828',

  // Default for unknown empires
  'default': '#78909c'
};

/**
 * Find the closest historical border snapshot for a given year
 * Uses binary search for efficiency
 */
export function findClosestSnapshot(year: number): BorderSnapshot | null {
  if (BORDER_SNAPSHOTS.length === 0) return null;

  // Before first snapshot
  if (year < BORDER_SNAPSHOTS[0].year) {
    return null; // No borders before -1000 BCE
  }

  // After last snapshot
  if (year >= BORDER_SNAPSHOTS[BORDER_SNAPSHOTS.length - 1].year) {
    return BORDER_SNAPSHOTS[BORDER_SNAPSHOTS.length - 1];
  }

  // Binary search for closest snapshot at or before the year
  let left = 0;
  let right = BORDER_SNAPSHOTS.length - 1;
  let closest = BORDER_SNAPSHOTS[0];

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const snapshot = BORDER_SNAPSHOTS[mid];

    if (snapshot.year === year) {
      return snapshot;
    } else if (snapshot.year < year) {
      closest = snapshot;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return closest;
}

/**
 * Load GeoJSON border data for a specific year
 * Returns cached data if available, otherwise fetches from server
 */
export async function loadBordersForYear(year: number): Promise<BorderCollection | null> {
  const snapshot = findClosestSnapshot(year);
  if (!snapshot) return null;

  try {
    const response = await fetch(snapshot.path);
    if (!response.ok) {
      console.warn(`Failed to load borders for year ${snapshot.year}: ${response.statusText}`);
      return null;
    }

    const data: BorderCollection = await response.json();
    return data;
  } catch (error) {
    console.error(`Error loading borders for year ${year}:`, error);
    return null;
  }
}

/**
 * Get color for an empire/state
 */
export function getEmpireColor(name: string): string {
  return EMPIRE_COLORS[name] || EMPIRE_COLORS['default'];
}

// Simplified European borders by era (very simplified polygons)
// In production, you'd load proper GeoJSON from historical data sources
export const europeBordersTimeline: { year: number; description: string }[] = [
  { year: 1800, description: 'Napoleonic Europe' },
  { year: 1815, description: 'Congress of Vienna' },
  { year: 1871, description: 'German & Italian Unification' },
  { year: 1914, description: 'Pre-WWI Europe' },
  { year: 1919, description: 'Post-WWI / Treaty of Versailles' },
  { year: 1939, description: 'Pre-WWII Europe' },
  { year: 1945, description: 'Post-WWII Europe' },
  { year: 1991, description: 'Post-Soviet Europe' },
  { year: 2000, description: 'Modern Europe' },
];
