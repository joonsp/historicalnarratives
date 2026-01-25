/**
 * Sample Narrative Timelines
 *
 * Pre-defined historical journeys for testing and demonstration.
 * These serve as examples of the narrative timeline structure.
 */

import type { NarrativeTimeline, NarrativeStep } from './narrativeTimelines';
import { registerNarrative, calculateTotalDuration } from './narrativeTimelines';

// Band of Brothers - WWII Easy Company Journey
const bandOfBrothersSteps: NarrativeStep[] = [
  {
    id: 'bob-1',
    sequenceNumber: 1,
    year: 1942,
    location: [34.5794, -83.7034], // Camp Toccoa, Georgia
    duration: 6,
    title: 'Training at Camp Toccoa',
    description: 'Easy Company, 506th Parachute Infantry Regiment begins grueling training under Captain Sobel. The men endure brutal physical conditioning, including runs up Currahee Mountain, forging the bonds that will carry them through the war.',
    eventType: 'founding',
    mapZoom: 10,
    transitionType: 'fly',
    transitionDuration: 2,
    links: [
      {
        title: 'Camp Toccoa History',
        url: 'https://en.wikipedia.org/wiki/Camp_Toccoa'
      }
    ]
  },
  {
    id: 'bob-2',
    sequenceNumber: 2,
    year: 1944,
    location: [49.4144, -1.1772], // Normandy, France
    duration: 8,
    title: 'D-Day: Operation Overlord',
    description: 'June 6, 1944. Easy Company parachutes into Normandy under heavy fire. Scattered across the countryside, the men must regroup and complete their mission to secure causeways off Utah Beach. Lieutenant Winters leads an assault on German artillery at Brécourt Manor.',
    eventType: 'battle',
    mapZoom: 9,
    transitionType: 'fly',
    transitionDuration: 3,
    links: [
      {
        title: 'D-Day Overview',
        url: 'https://en.wikipedia.org/wiki/Normandy_landings'
      }
    ]
  },
  {
    id: 'bob-3',
    sequenceNumber: 3,
    year: 1944,
    location: [51.6924, 5.8012], // Eindhoven, Netherlands
    duration: 7,
    title: 'Operation Market Garden',
    description: 'September 1944. Easy Company participates in the largest airborne operation in history, jumping into Holland to secure bridges. Though initially successful, the operation becomes a costly failure as British forces at Arnhem are surrounded.',
    eventType: 'battle',
    mapZoom: 9,
    transitionType: 'fly',
    transitionDuration: 2.5,
    links: [
      {
        title: 'Operation Market Garden',
        url: 'https://en.wikipedia.org/wiki/Operation_Market_Garden'
      }
    ]
  },
  {
    id: 'bob-4',
    sequenceNumber: 4,
    year: 1944,
    location: [50.0059, 5.7160], // Bastogne, Belgium
    duration: 8,
    title: 'The Siege of Bastogne',
    description: 'December 1944. Easy Company rushes to Bastogne to counter the German Ardennes Offensive. Surrounded, outnumbered, and freezing in the bitter winter, the 101st Airborne holds the line. When offered surrender, General McAuliffe replies simply: "Nuts!"',
    eventType: 'siege',
    mapZoom: 11,
    transitionType: 'fly',
    transitionDuration: 2,
    links: [
      {
        title: 'Battle of the Bulge',
        url: 'https://en.wikipedia.org/wiki/Battle_of_the_Bulge'
      }
    ]
  },
  {
    id: 'bob-5',
    sequenceNumber: 5,
    year: 1945,
    location: [51.5074, 13.4050], // Landsberg, Germany
    duration: 7,
    title: 'Discovery of the Concentration Camp',
    description: 'April 1945. Easy Company liberates a Landsberg concentration camp, confronting the full horror of the Holocaust. The men are forever changed by what they witness, understanding the true evil they have been fighting against.',
    eventType: 'discovery',
    mapZoom: 10,
    transitionType: 'fly',
    transitionDuration: 2.5,
  },
  {
    id: 'bob-6',
    sequenceNumber: 6,
    year: 1945,
    location: [47.6301, 12.9767], // Berchtesgaden, Germany - Eagle's Nest
    duration: 6,
    title: "Hitler's Eagle's Nest",
    description: 'May 8, 1945. Easy Company captures Hitler\'s mountain retreat at Berchtesgaden on VE Day. The war in Europe is over. Having jumped into Normandy, fought through France, Holland, Belgium, and Germany, the men can finally rest. They have been to hell and back together.',
    eventType: 'discovery',
    mapZoom: 12,
    transitionType: 'fly',
    transitionDuration: 2.5,
    links: [
      {
        title: 'Eagle\'s Nest',
        url: 'https://en.wikipedia.org/wiki/Kehlsteinhaus'
      }
    ]
  }
];

const bandOfBrothers: NarrativeTimeline = {
  id: 'band-of-brothers',
  title: 'Band of Brothers: Easy Company\'s Journey',
  description: 'Follow the men of Easy Company, 506th PIR, from training in Georgia through the liberation of Europe, 1942-1945.',
  theme: 'WWII',
  steps: bandOfBrothersSteps,
  totalDuration: calculateTotalDuration(bandOfBrothersSteps),
  createdBy: 'manual',
  createdAt: new Date('2026-01-25'),
  tags: ['WWII', 'airborne', 'europe', 'D-Day', 'Bastogne'],
  startYear: 1942,
  endYear: 1945,
  regions: ['North America', 'Western Europe']
};

// War of the Roses - English Civil War
const warOfRosesSteps: NarrativeStep[] = [
  {
    id: 'wor-1',
    sequenceNumber: 1,
    year: 1455,
    location: [51.7951, -0.3020], // St. Albans
    duration: 6,
    title: 'First Battle of St. Albans',
    description: 'May 22, 1455. The Wars of the Roses begin in the streets of St. Albans. Richard of York\'s forces ambush King Henry VI\'s retinue, killing the Duke of Somerset. The king is wounded and captured, marking the start of three decades of civil war between Lancaster and York.',
    eventType: 'battle',
    mapZoom: 11,
    transitionType: 'fly',
    transitionDuration: 2
  },
  {
    id: 'wor-2',
    sequenceNumber: 2,
    year: 1461,
    location: [53.8366, -1.2647], // Towton
    duration: 7,
    title: 'Battle of Towton',
    description: 'March 29, 1461. The bloodiest battle ever fought on English soil. In a snowstorm, 50,000 men clash near Towton. By nightfall, 28,000 lie dead. Edward of York\'s victory is decisive, securing his claim to the throne as Edward IV. The snow runs red with blood.',
    eventType: 'battle',
    mapZoom: 10,
    transitionType: 'fly',
    transitionDuration: 2.5
  },
  {
    id: 'wor-3',
    sequenceNumber: 3,
    year: 1471,
    location: [51.5074, -0.1278], // London
    duration: 6,
    title: 'Edward IV Secures the Throne',
    description: 'After defeating Warwick the Kingmaker at Barnet and crushing the Lancastrian army at Tewkesbury, Edward IV finally secures his throne. Henry VI dies in the Tower of London. The House of York appears triumphant, but the peace is fragile.',
    eventType: 'decision',
    mapZoom: 9,
    transitionType: 'fly',
    transitionDuration: 2
  },
  {
    id: 'wor-4',
    sequenceNumber: 4,
    year: 1485,
    location: [52.6369, -1.4146], // Bosworth Field
    duration: 8,
    title: 'Battle of Bosworth Field',
    description: 'August 22, 1485. Richard III, the last Yorkist king, faces Henry Tudor at Bosworth. In the crucial moment, Lord Stanley\'s forces switch sides. Richard charges directly at Henry in a desperate bid, crying "Treason!" He dies in the melee, his crown retrieved from a thorn bush.',
    eventType: 'battle',
    mapZoom: 11,
    transitionType: 'fly',
    transitionDuration: 2.5,
    links: [
      {
        title: 'Battle of Bosworth Field',
        url: 'https://en.wikipedia.org/wiki/Battle_of_Bosworth_Field'
      }
    ]
  },
  {
    id: 'wor-5',
    sequenceNumber: 5,
    year: 1486,
    location: [51.5074, -0.1278], // London
    duration: 6,
    title: 'The Tudor Dynasty Begins',
    description: 'Henry VII marries Elizabeth of York, uniting the two houses. The red rose of Lancaster and the white rose of York become the Tudor rose. After 30 years of civil war, England begins an era of stability and prosperity under the Tudor dynasty.',
    eventType: 'treaty',
    mapZoom: 9,
    transitionType: 'fly',
    transitionDuration: 2
  }
];

const warOfRoses: NarrativeTimeline = {
  id: 'war-of-roses',
  title: 'The Wars of the Roses',
  description: 'The brutal 30-year civil war between the Houses of Lancaster and York for the English throne, 1455-1485.',
  theme: 'Medieval',
  steps: warOfRosesSteps,
  totalDuration: calculateTotalDuration(warOfRosesSteps),
  createdBy: 'manual',
  createdAt: new Date('2026-01-25'),
  tags: ['medieval', 'England', 'civil war', 'Lancaster', 'York', 'Tudor'],
  startYear: 1455,
  endYear: 1486,
  regions: ['England']
};

// Alexander the Great's Persian Campaign
const alexanderSteps: NarrativeStep[] = [
  {
    id: 'alex-1',
    sequenceNumber: 1,
    year: -334,
    location: [40.1553, 27.0364], // Granicus River, Turkey
    duration: 6,
    title: 'Battle of the Granicus',
    description: 'May 334 BCE. Alexander crosses into Asia and faces the Persian satraps at the Granicus River. In a bold cavalry charge, Alexander personally leads his Companion Cavalry across the river, shattering the Persian line. His conquest of the Persian Empire begins.',
    eventType: 'battle',
    mapZoom: 9,
    transitionType: 'fly',
    transitionDuration: 2
  },
  {
    id: 'alex-2',
    sequenceNumber: 2,
    year: -333,
    location: [36.5987, 36.1699], // Issus, Turkey/Syria border
    duration: 7,
    title: 'Battle of Issus',
    description: 'November 333 BCE. Darius III, the Persian King of Kings, personally takes the field with a massive army. Alexander\'s tactical genius turns the narrow coastal plain into a killing ground. Darius flees, abandoning his family. The Persian Empire begins to crumble.',
    eventType: 'battle',
    mapZoom: 10,
    transitionType: 'fly',
    transitionDuration: 3,
    links: [
      {
        title: 'Battle of Issus',
        url: 'https://en.wikipedia.org/wiki/Battle_of_Issus'
      }
    ]
  },
  {
    id: 'alex-3',
    sequenceNumber: 3,
    year: -332,
    location: [33.2716, 35.2033], // Tyre, Lebanon
    duration: 7,
    title: 'Siege of Tyre',
    description: 'January-July 332 BCE. The island fortress of Tyre defies Alexander. Told it is impregnable, Alexander builds a causeway across the sea itself. After seven months, his siege engines breach the walls. The Mediterranean is now a Greek lake.',
    eventType: 'siege',
    mapZoom: 11,
    transitionType: 'fly',
    transitionDuration: 2.5
  },
  {
    id: 'alex-4',
    sequenceNumber: 4,
    year: -332,
    location: [30.0444, 31.2357], // Alexandria, Egypt
    duration: 6,
    title: 'Foundation of Alexandria',
    description: 'Winter 332 BCE. Alexander founds Alexandria at the mouth of the Nile. The city will become the greatest center of learning in the ancient world, home to the Library and Lighthouse. Egypt welcomes him as pharaoh and son of Amun-Ra.',
    eventType: 'founding',
    mapZoom: 10,
    transitionType: 'fly',
    transitionDuration: 3,
    links: [
      {
        title: 'Alexandria',
        url: 'https://en.wikipedia.org/wiki/Alexandria'
      }
    ]
  },
  {
    id: 'alex-5',
    sequenceNumber: 5,
    year: -331,
    location: [36.3606, 43.1536], // Gaugamela, Iraq
    duration: 8,
    title: 'Battle of Gaugamela',
    description: 'October 1, 331 BCE. On the plains of Gaugamela, Darius assembles the greatest army the world has ever seen: 250,000 men, war elephants, and scythed chariots. Alexander\'s 47,000 face impossible odds. Through brilliant tactics, he shatters the Persian host. Darius flees again, never to return.',
    eventType: 'battle',
    mapZoom: 10,
    transitionType: 'fly',
    transitionDuration: 3,
    links: [
      {
        title: 'Battle of Gaugamela',
        url: 'https://en.wikipedia.org/wiki/Battle_of_Gaugamela'
      }
    ]
  },
  {
    id: 'alex-6',
    sequenceNumber: 6,
    year: -331,
    location: [32.5355, 44.4209], // Babylon
    duration: 7,
    title: 'Entry into Babylon',
    description: 'The gates of Babylon open to Alexander. The ancient capital of Mesopotamia, city of Hammurabi and Nebuchadnezzar, welcomes its new master. The priests of Marduk proclaim him King of Babylon. The Persian Empire is his.',
    eventType: 'discovery',
    mapZoom: 11,
    transitionType: 'fly',
    transitionDuration: 2.5
  },
  {
    id: 'alex-7',
    sequenceNumber: 7,
    year: -323,
    location: [32.5355, 44.4209], // Babylon
    duration: 6,
    title: 'Death in Babylon',
    description: 'June 10, 323 BCE. After conquering from Greece to India, Alexander falls ill in Babylon at age 32. When asked who should succeed him, he whispers "To the strongest." His empire fragments. But his legend will live forever, inspiring conquerors for two thousand years.',
    eventType: 'decision',
    mapZoom: 11,
    transitionType: 'pan',
    transitionDuration: 2
  }
];

const alexander: NarrativeTimeline = {
  id: 'alexander-persian-campaign',
  title: "Alexander the Great's Persian Campaign",
  description: 'Follow Alexander of Macedon as he conquers the Persian Empire, 334-323 BCE.',
  theme: 'Ancient',
  steps: alexanderSteps,
  totalDuration: calculateTotalDuration(alexanderSteps),
  createdBy: 'manual',
  createdAt: new Date('2026-01-25'),
  tags: ['ancient', 'Greece', 'Persia', 'Alexander', 'conquest'],
  startYear: -334,
  endYear: -323,
  regions: ['Greece', 'Asia Minor', 'Middle East', 'Egypt']
};

// Register all sample narratives
export const sampleNarratives = [bandOfBrothers, warOfRoses, alexander];

sampleNarratives.forEach(narrative => registerNarrative(narrative));

// Export individual narratives for direct access
export { bandOfBrothers, warOfRoses, alexander };
