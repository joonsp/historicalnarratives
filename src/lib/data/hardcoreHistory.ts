// Hardcore History episode metadata
export interface HHEpisode {
  id: string;
  number: number;
  title: string;
  releaseDate: string;
  description: string;
  periodStart: number; // year
  periodEnd: number;
  regions: string[];
  center: [number, number]; // lat, lng
  zoom: number;
  url: string;
  series?: string;
}

export const hardcoreHistoryEpisodes: HHEpisode[] = [
  // Blueprint for Armageddon series (WWI)
  {
    id: 'bfa-1',
    number: 50,
    title: 'Blueprint for Armageddon I',
    releaseDate: '2013-10-29',
    description: 'The assassination of Archduke Franz Ferdinand and the outbreak of WWI',
    periodStart: 1914,
    periodEnd: 1914,
    regions: ['Europe', 'Balkans'],
    center: [48.2082, 16.3738], // Vienna
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-50-blueprint-for-armageddon-i/',
    series: 'Blueprint for Armageddon'
  },
  {
    id: 'bfa-2',
    number: 51,
    title: 'Blueprint for Armageddon II',
    releaseDate: '2013-12-16',
    description: 'The war of movement ends and trench warfare begins',
    periodStart: 1914,
    periodEnd: 1915,
    regions: ['Western Front', 'France', 'Belgium'],
    center: [49.4, 2.8],
    zoom: 6,
    url: 'https://www.dancarlin.com/product/hardcore-history-51-blueprint-for-armageddon-ii/',
    series: 'Blueprint for Armageddon'
  },
  {
    id: 'bfa-3',
    number: 52,
    title: 'Blueprint for Armageddon III',
    releaseDate: '2014-04-24',
    description: 'Transition to trench warfare and the grueling stalemate',
    periodStart: 1915,
    periodEnd: 1916,
    regions: ['Western Front', 'France'],
    center: [49.16, 5.38], // Verdun
    zoom: 7,
    url: 'https://www.dancarlin.com/product/hardcore-history-52-blueprint-for-armageddon-iii/',
    series: 'Blueprint for Armageddon'
  },
  {
    id: 'bfa-4',
    number: 53,
    title: 'Blueprint for Armageddon IV',
    releaseDate: '2014-08-17',
    description: 'Verdun and the Somme - the bloodiest battles in human history',
    periodStart: 1916,
    periodEnd: 1916,
    regions: ['Western Front', 'France'],
    center: [49.93, 2.30], // Somme
    zoom: 7,
    url: 'https://www.dancarlin.com/product/hardcore-history-53-blueprint-for-armageddon-iv/',
    series: 'Blueprint for Armageddon'
  },
  {
    id: 'bfa-5',
    number: 54,
    title: 'Blueprint for Armageddon V',
    releaseDate: '2014-12-30',
    description: 'Politics, revolution, and the continued warfare grinding down empires',
    periodStart: 1917,
    periodEnd: 1918,
    regions: ['Europe', 'Russia', 'Western Front'],
    center: [50.0, 10.0], // Central Europe
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-54-blueprint-for-armageddon-v/',
    series: 'Blueprint for Armageddon'
  },
  {
    id: 'bfa-6',
    number: 55,
    title: 'Blueprint for Armageddon VI',
    releaseDate: '2015-05-06',
    description: 'American entry and Germany\'s last desperate offensive - the war ends',
    periodStart: 1918,
    periodEnd: 1919,
    regions: ['Europe', 'Western Front'],
    center: [48.8566, 2.3522], // Paris
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-55-blueprint-for-armageddon-vi/',
    series: 'Blueprint for Armageddon'
  },
  // Ghosts of the Ostfront (WWII Eastern Front)
  {
    id: 'goto-1',
    number: 27,
    title: 'Ghosts of the Ostfront I',
    releaseDate: '2009-04-19',
    description: 'Operation Barbarossa begins - the Nazi invasion of the Soviet Union',
    periodStart: 1941,
    periodEnd: 1941,
    regions: ['Eastern Europe', 'Soviet Union', 'Germany'],
    center: [52.5200, 21.0122],
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-ghosts-of-the-ostfront-series/',
    series: 'Ghosts of the Ostfront'
  },
  {
    id: 'goto-2',
    number: 28,
    title: 'Ghosts of the Ostfront II',
    releaseDate: '2009-06-17',
    description: 'The German offensive towards Moscow in 1941 and the brutal winter',
    periodStart: 1941,
    periodEnd: 1941,
    regions: ['Soviet Union', 'Russia'],
    center: [55.7558, 37.6173], // Moscow
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-ghosts-of-the-ostfront-series/',
    series: 'Ghosts of the Ostfront'
  },
  {
    id: 'goto-3',
    number: 29,
    title: 'Ghosts of the Ostfront III',
    releaseDate: '2009-08-10',
    description: 'The Soviet situation 1942-1943 and the epic Battle of Stalingrad',
    periodStart: 1942,
    periodEnd: 1943,
    regions: ['Soviet Union', 'Southern Russia'],
    center: [48.7080, 44.5133], // Stalingrad/Volgograd
    zoom: 6,
    url: 'https://www.dancarlin.com/product/hardcore-history-ghosts-of-the-ostfront-series/',
    series: 'Ghosts of the Ostfront'
  },
  {
    id: 'goto-4',
    number: 30,
    title: 'Ghosts of the Ostfront IV',
    releaseDate: '2009-10-10',
    description: 'The German retreat and Soviet retaliation - the fall of Berlin',
    periodStart: 1944,
    periodEnd: 1945,
    regions: ['Germany', 'Eastern Europe'],
    center: [52.5200, 13.4050], // Berlin
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-ghosts-of-the-ostfront-series/',
    series: 'Ghosts of the Ostfront'
  },
  // Death Throes of the Republic (Roman Republic)
  {
    id: 'dtor-1',
    number: 34,
    title: 'Death Throes of the Republic I',
    releaseDate: '2010-06-28',
    description: 'Rome\'s superpower status and the beginning of political decline',
    periodStart: -133,
    periodEnd: -121,
    regions: ['Roman Republic', 'Italy'],
    center: [41.9028, 12.4964], // Rome
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-death-throes-of-the-republic-series/',
    series: 'Death Throes of the Republic'
  },
  {
    id: 'dtor-2',
    number: 35,
    title: 'Death Throes of the Republic II',
    releaseDate: '2010-08-29',
    description: 'Marius emerges and the political crisis escalates',
    periodStart: -107,
    periodEnd: -100,
    regions: ['Roman Republic', 'North Africa'],
    center: [41.9028, 12.4964],
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-death-throes-of-the-republic-series/',
    series: 'Death Throes of the Republic'
  },
  {
    id: 'dtor-3',
    number: 36,
    title: 'Death Throes of the Republic III',
    releaseDate: '2010-10-31',
    description: 'Marius and Sulla - political violence reaches new heights',
    periodStart: -91,
    periodEnd: -82,
    regions: ['Roman Republic', 'Italy'],
    center: [41.9028, 12.4964],
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-death-throes-of-the-republic-series/',
    series: 'Death Throes of the Republic'
  },
  {
    id: 'dtor-4',
    number: 37,
    title: 'Death Throes of the Republic IV',
    releaseDate: '2011-01-28',
    description: 'Sulla\'s civil war and the beginning of partisan payback',
    periodStart: -82,
    periodEnd: -78,
    regions: ['Roman Republic', 'Mediterranean'],
    center: [41.9028, 12.4964],
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-death-throes-of-the-republic-series/',
    series: 'Death Throes of the Republic'
  },
  {
    id: 'dtor-5',
    number: 38,
    title: 'Death Throes of the Republic V',
    releaseDate: '2011-04-01',
    description: 'The rise of Caesar, Cato, Cicero, Crassus, and Pompey - the First Triumvirate',
    periodStart: -70,
    periodEnd: -54,
    regions: ['Roman Republic', 'Mediterranean'],
    center: [41.9028, 12.4964],
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-death-throes-of-the-republic-series/',
    series: 'Death Throes of the Republic'
  },
  {
    id: 'dtor-6',
    number: 39,
    title: 'Death Throes of the Republic VI',
    releaseDate: '2011-06-30',
    description: 'The final fall of the Roman Republic - Caesar, Pompey, and the end of an era',
    periodStart: -49,
    periodEnd: -27,
    regions: ['Roman Republic', 'Mediterranean'],
    center: [41.9028, 12.4964],
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-death-throes-of-the-republic-series/',
    series: 'Death Throes of the Republic'
  },
  // Wrath of the Khans (Mongol Empire)
  {
    id: 'wotk-1',
    number: 43,
    title: 'Wrath of the Khans I',
    releaseDate: '2012-06-14',
    description: 'Mongol nomad societies and the beginning of their expansion',
    periodStart: 1162,
    periodEnd: 1206,
    regions: ['Mongolia', 'Central Asia'],
    center: [47.9212, 106.9057], // Mongolia
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-wrath-of-the-khans-series/',
    series: 'Wrath of the Khans'
  },
  {
    id: 'wotk-2',
    number: 44,
    title: 'Wrath of the Khans II',
    releaseDate: '2012-07-31',
    description: 'Genghis Khan\'s strategic genius and the Mongol war machine',
    periodStart: 1206,
    periodEnd: 1221,
    regions: ['Mongolia', 'Central Asia', 'Persia'],
    center: [40.0, 60.0], // Central Asia
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-wrath-of-the-khans-series/',
    series: 'Wrath of the Khans'
  },
  {
    id: 'wotk-3',
    number: 45,
    title: 'Wrath of the Khans III',
    releaseDate: '2012-09-23',
    description: 'Continued Mongol expansion across Eurasia',
    periodStart: 1221,
    periodEnd: 1241,
    regions: ['Eurasia', 'Eastern Europe', 'China'],
    center: [45.0, 85.0],
    zoom: 3,
    url: 'https://www.dancarlin.com/product/hardcore-history-wrath-of-the-khans-series/',
    series: 'Wrath of the Khans'
  },
  {
    id: 'wotk-4',
    number: 46,
    title: 'Wrath of the Khans IV',
    releaseDate: '2012-11-13',
    description: 'Post-Genghis Khan momentum and the push into Europe',
    periodStart: 1227,
    periodEnd: 1258,
    regions: ['Europe', 'Eastern Europe', 'Russia'],
    center: [50.0, 35.0], // Eastern Europe
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-wrath-of-the-khans-series/',
    series: 'Wrath of the Khans'
  },
  {
    id: 'wotk-5',
    number: 47,
    title: 'Wrath of the Khans V',
    releaseDate: '2013-01-13',
    description: 'The Mongol Empire succession, governance, and eventual fragmentation',
    periodStart: 1258,
    periodEnd: 1294,
    regions: ['Eurasia', 'China', 'Middle East'],
    center: [39.9042, 116.4074], // Beijing
    zoom: 3,
    url: 'https://www.dancarlin.com/product/hardcore-history-wrath-of-the-khans-series/',
    series: 'Wrath of the Khans'
  },
  // Supernova in the East (Pacific War)
  {
    id: 'site-1',
    number: 62,
    title: 'Supernova in the East I',
    releaseDate: '2018-07-14',
    description: 'Japanese society transformation and the origins of the Asia-Pacific War',
    periodStart: 1894,
    periodEnd: 1937,
    regions: ['Japan', 'Pacific', 'Asia'],
    center: [35.6762, 139.6503], // Tokyo
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-62-supernova-in-the-east-i/',
    series: 'Supernova in the East'
  },
  {
    id: 'site-2',
    number: 63,
    title: 'Supernova in the East II',
    releaseDate: '2019-01-12',
    description: 'Japanese war crimes allegations and the road to Pearl Harbor',
    periodStart: 1937,
    periodEnd: 1941,
    regions: ['China', 'Japan', 'Pacific'],
    center: [31.2, 121.5], // Shanghai
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-63-supernova-in-the-east-ii/',
    series: 'Supernova in the East'
  },
  {
    id: 'site-3',
    number: 64,
    title: 'Supernova in the East III',
    releaseDate: '2019-10-25',
    description: 'Japanese expansion and escalation of the Pacific Theater',
    periodStart: 1941,
    periodEnd: 1942,
    regions: ['Pacific', 'Southeast Asia'],
    center: [10.0, 130.0],
    zoom: 3,
    url: 'https://www.dancarlin.com/product/hardcore-history-64-supernova-in-the-east-iii/',
    series: 'Supernova in the East'
  },
  {
    id: 'site-4',
    number: 65,
    title: 'Supernova in the East IV',
    releaseDate: '2020-06-04',
    description: 'Battles of Coral Sea, Midway, and Guadalcanal',
    periodStart: 1942,
    periodEnd: 1943,
    regions: ['Pacific', 'Solomon Islands'],
    center: [-9.4, 160.0], // Solomon Islands
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-65-supernova-in-the-east-iv/',
    series: 'Supernova in the East'
  },
  {
    id: 'site-5',
    number: 66,
    title: 'Supernova in the East V',
    releaseDate: '2020-11-14',
    description: 'Japanese determination confronts material insufficiency',
    periodStart: 1943,
    periodEnd: 1944,
    regions: ['Pacific', 'Philippines'],
    center: [12.8797, 121.7740],
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-66-supernova-in-the-east-v/',
    series: 'Supernova in the East'
  },
  {
    id: 'site-6',
    number: 67,
    title: 'Supernova in the East VI',
    releaseDate: '2021-06-09',
    description: 'The final year of the Japanese war and the atomic weapons',
    periodStart: 1945,
    periodEnd: 1945,
    regions: ['Japan', 'Pacific'],
    center: [34.3853, 132.4553], // Hiroshima
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-67-supernova-in-the-east-vi/',
    series: 'Supernova in the East'
  },
  // King of Kings (Persian Empire)
  {
    id: 'kok-1',
    number: 56,
    title: 'King of Kings I',
    releaseDate: '2015-10-29',
    description: 'Achaemenid Persian empire history and the rise of Cyrus the Great',
    periodStart: -550,
    periodEnd: -530,
    regions: ['Persia', 'Middle East'],
    center: [32.6539, 51.6660], // Isfahan
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-56-kings-of-kings/',
    series: 'King of Kings'
  },
  {
    id: 'kok-2',
    number: 57,
    title: 'King of Kings II',
    releaseDate: '2016-03-20',
    description: 'Persian empire conspiracies, conflicts, and combat',
    periodStart: -522,
    periodEnd: -490,
    regions: ['Persia', 'Middle East', 'Egypt'],
    center: [35.0, 50.0],
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-57-kings-of-kings-ii/',
    series: 'King of Kings'
  },
  {
    id: 'kok-3',
    number: 58,
    title: 'King of Kings III',
    releaseDate: '2016-08-07',
    description: 'Xerxes, Spartans, Immortals, and Alexander - The Persian Wars',
    periodStart: -490,
    periodEnd: -479,
    regions: ['Greece', 'Persia', 'Mediterranean'],
    center: [38.0, 24.0], // Aegean
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-58-kings-of-kings-iii/',
    series: 'King of Kings'
  },
  // Punic Wars Series (Rome vs Carthage)
  {
    id: 'punic-1',
    number: 21,
    title: 'Punic Nightmares I',
    releaseDate: '2008-07-27',
    description: 'The origins of the Rome-Carthage conflict',
    periodStart: -264,
    periodEnd: -241,
    regions: ['Mediterranean', 'Sicily', 'North Africa'],
    center: [37.5, 14.0], // Sicily
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-punic-nightmares-series/',
    series: 'Punic Nightmares'
  },
  {
    id: 'punic-2',
    number: 22,
    title: 'Punic Nightmares II',
    releaseDate: '2008-09-18',
    description: 'Hannibal\'s legendary Italian campaign',
    periodStart: -218,
    periodEnd: -202,
    regions: ['Italy', 'Mediterranean'],
    center: [43.0, 12.0], // Central Italy
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-punic-nightmares-series/',
    series: 'Punic Nightmares'
  },
  {
    id: 'punic-3',
    number: 23,
    title: 'Punic Nightmares III',
    releaseDate: '2008-10-30',
    description: 'Roman recovery and the ultimate destruction of Carthage',
    periodStart: -202,
    periodEnd: -146,
    regions: ['North Africa', 'Mediterranean'],
    center: [36.8, 10.3], // Carthage/Tunis
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-punic-nightmares-series/',
    series: 'Punic Nightmares'
  },
  // Standalone Episodes
  {
    id: 'thors-angels',
    number: 41,
    title: 'Thor\'s Angels',
    releaseDate: '2012-01-19',
    description: 'European Dark Ages and the transformation of barbarian tribes',
    periodStart: 370,
    periodEnd: 800,
    regions: ['Europe', 'Mediterranean'],
    center: [50.0, 10.0], // Central Europe
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-41-thors-angels/',
  },
  {
    id: 'prophets-doom',
    number: 48,
    title: 'Prophets of Doom',
    releaseDate: '2013-04-22',
    description: 'Protestant Reformation religious anarchy in Münster',
    periodStart: 1534,
    periodEnd: 1535,
    regions: ['Germany', 'Holy Roman Empire'],
    center: [51.9607, 7.6261], // Münster
    zoom: 6,
    url: 'https://www.dancarlin.com/product/hardcore-history-48-prophets-of-doom/',
  },
  {
    id: 'american-peril',
    number: 49,
    title: 'The American Peril',
    releaseDate: '2013-07-25',
    description: 'U.S. late 19th century imperialism and its contradictions',
    periodStart: 1898,
    periodEnd: 1902,
    regions: ['Philippines', 'Pacific', 'Caribbean'],
    center: [12.8797, 121.7740], // Philippines
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-49-the-american-peril/',
  },
  // Celtic Holocaust
  {
    id: 'ch',
    number: 60,
    title: 'The Celtic Holocaust',
    releaseDate: '2017-08-10',
    description: 'Julius Caesar\'s conquest of Gaul and the destruction of Celtic civilization',
    periodStart: -58,
    periodEnd: -50,
    regions: ['Gaul', 'France', 'Roman Republic'],
    center: [47.0, 2.0], // France
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-60-the-celtic-holocaust/',
  },
  // Recent Episodes (2022-2025)
  {
    id: 'human-resources',
    number: 68,
    title: 'Human Resources',
    releaseDate: '2022-03-07',
    description: 'Comprehensive examination of the Atlantic Slave Trade',
    periodStart: 1500,
    periodEnd: 1865,
    regions: ['Atlantic', 'Africa', 'Americas'],
    center: [15.0, -30.0], // Mid-Atlantic
    zoom: 3,
    url: 'https://www.dancarlin.com/product/hardcore-history-68-human-resources/',
  },
  {
    id: 'twilight-aesir-1',
    number: 69,
    title: 'Twilight of the Æsir',
    releaseDate: '2023-01-15',
    description: 'Pagan Germanic Vikings and their transition period',
    periodStart: 793,
    periodEnd: 1066,
    regions: ['Scandinavia', 'Northern Europe', 'North Atlantic'],
    center: [60.0, 10.0], // Scandinavia
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-69-twilight-of-the-aesir/',
    series: 'Twilight of the Æsir'
  },
  {
    id: 'twilight-aesir-2',
    number: 70,
    title: 'Twilight of the Æsir II',
    releaseDate: '2023-11-19',
    description: 'Viking transformation into Christian monarchs and kingdoms',
    periodStart: 1000,
    periodEnd: 1100,
    regions: ['Scandinavia', 'England', 'Normandy'],
    center: [55.0, 5.0],
    zoom: 4,
    url: 'https://www.dancarlin.com/product/hardcore-history-70-twilight-of-the-aesir-ii/',
    series: 'Twilight of the Æsir'
  },
  {
    id: 'mania-1',
    number: 71,
    title: 'Mania for Subjugation',
    releaseDate: '2024-06-07',
    description: 'Alexander the Great - nature, nurture, and nepotism in creating an apex predator',
    periodStart: -356,
    periodEnd: -336,
    regions: ['Macedonia', 'Greece'],
    center: [40.6, 22.9], // Macedonia
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-71-mania-for-subjugation/',
    series: 'Mania for Subjugation'
  },
  {
    id: 'mania-2',
    number: 72,
    title: 'Mania for Subjugation II',
    releaseDate: '2025-01-03',
    description: 'Alexander as young king facing regional threats and beginning his conquests',
    periodStart: -336,
    periodEnd: -334,
    regions: ['Macedonia', 'Greece', 'Persia'],
    center: [38.0, 30.0],
    zoom: 5,
    url: 'https://www.dancarlin.com/product/hardcore-history-72-mania-for-subjugation-ii/',
    series: 'Mania for Subjugation'
  },
];

// Get episodes sorted by release date
export function getEpisodesByReleaseDate(): HHEpisode[] {
  return [...hardcoreHistoryEpisodes].sort((a, b) => 
    new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );
}

// Get episodes sorted by period covered
export function getEpisodesByPeriod(): HHEpisode[] {
  return [...hardcoreHistoryEpisodes].sort((a, b) => a.periodStart - b.periodStart);
}

// Get episode for a given year
export function getEpisodeForYear(year: number): HHEpisode | undefined {
  return hardcoreHistoryEpisodes.find(ep => 
    year >= ep.periodStart && year <= ep.periodEnd
  );
}

// Get all episodes for a given year range
export function getEpisodesForYearRange(startYear: number, endYear: number): HHEpisode[] {
  return hardcoreHistoryEpisodes.filter(ep => 
    (ep.periodStart >= startYear && ep.periodStart <= endYear) ||
    (ep.periodEnd >= startYear && ep.periodEnd <= endYear) ||
    (ep.periodStart <= startYear && ep.periodEnd >= endYear)
  );
}
