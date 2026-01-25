# HistoryMap Agent-Native Specification

**AI-Powered Historical Storytelling on Interactive Maps**

---

## Concept

Allow users to ask natural language questions like "tell me about the war of the roses" and have the AI construct an interactive timeline on the map, highlighting relevant locations, events, and context.

---

## Terminology

### **Data Source Types:**

1. **Collections** - Curated episode/content series
   - Examples: Hardcore History, The Rest is History podcast, Ken Burns documentaries
   - Pre-defined episode lists with metadata
   - User navigates through existing content

2. **Narratives** - AI-generated or pre-authored historical sequences
   - Examples: Band of Brothers (following 101st Airborne), War of the Roses, Napoleonic campaigns
   - Dynamic or scripted event sequences
   - Can be generated on-demand or pre-made

---

## Feature: AI Timeline Constructor

### User Experience:

```
User: "Tell me about Band of Brothers"

AI Response:
→ Generates timeline of Easy Company, 101st Airborne (1942-1945)
→ Map animates through key locations:
  - Camp Toccoa (training)
  - D-Day drop zones (Normandy)
  - Operation Market Garden (Netherlands)
  - Battle of the Bulge (Bastogne)
  - Eagle's Nest (Germany)
→ Each location has event card with context, dates, links
```

### Flow:

1. **User Query** → Natural language input
2. **AI Processing** → LLM generates structured timeline
3. **Map Animation** → Fly-through of locations in chronological order
4. **Event Cards** → Pop-ups with context, images, links
5. **Playback Controls** → Pause, speed up, replay

---

## Architecture

### Components:

```
┌─────────────────────────────────────────────┐
│  User Input                                 │
│  "Tell me about the War of the Roses"      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  AI Agent (OpenRouter/Anthropic)           │
│  - Parse query                              │
│  - Generate timeline JSON                   │
│  - Return structured narrative              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Timeline Renderer                          │
│  - Parse AI response                        │
│  - Extract locations, dates, events         │
│  - Generate map waypoints                   │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Map Animator                               │
│  - Fly through locations                    │
│  - Show event markers                       │
│  - Display context cards                    │
│  - Play/pause controls                      │
└─────────────────────────────────────────────┘
```

---

## Data Models

### AI Response Format (JSON):

```json
{
  "narrative": {
    "id": "band-of-brothers",
    "title": "Band of Brothers: Easy Company, 101st Airborne",
    "description": "Follow Easy Company from training through WWII Europe",
    "timespan": {
      "start": "1942-08-01",
      "end": "1945-05-08"
    },
    "events": [
      {
        "id": "evt-1",
        "title": "Training at Camp Toccoa",
        "date": "1942-08-15",
        "location": {
          "name": "Camp Toccoa, Georgia, USA",
          "lat": 34.5925,
          "lng": -83.3282
        },
        "description": "Easy Company begins grueling training under Captain Sobel. Men bond through shared hardship, running Currahee mountain repeatedly.",
        "significance": "Formation of unit cohesion that would carry through the war",
        "links": [
          {
            "title": "Episode 1: Currahee",
            "url": "https://www.hbo.com/band-of-brothers"
          },
          {
            "title": "Camp Toccoa (Wikipedia)",
            "url": "https://en.wikipedia.org/wiki/Camp_Toccoa"
          }
        ],
        "media": {
          "image": "https://example.com/toccoa.jpg",
          "caption": "Soldiers training at Camp Toccoa, 1942"
        }
      },
      {
        "id": "evt-2",
        "title": "D-Day: Jump into Normandy",
        "date": "1944-06-06",
        "location": {
          "name": "Sainte-Mère-Église, Normandy, France",
          "lat": 49.4086,
          "lng": -1.3175
        },
        "description": "Easy Company parachutes behind enemy lines in the early hours of D-Day. Scattered drops lead to chaos and improvisation.",
        "significance": "First combat action; destruction of German artillery at Brécourt Manor",
        "links": [
          {
            "title": "Episode 2: Day of Days",
            "url": "https://www.hbo.com/band-of-brothers"
          },
          {
            "title": "Battle of Brécourt Manor",
            "url": "https://en.wikipedia.org/wiki/Assault_on_Br%C3%A9court_Manor"
          }
        ]
      },
      {
        "id": "evt-3",
        "title": "Operation Market Garden",
        "date": "1944-09-17",
        "location": {
          "name": "Eindhoven, Netherlands",
          "lat": 51.4416,
          "lng": 5.4697
        },
        "description": "Easy Company participates in ambitious Allied airborne assault to capture bridges across the Rhine.",
        "significance": "Strategic failure, but Easy Company secures objectives",
        "links": [
          {
            "title": "Episode 4: Replacements",
            "url": "https://www.hbo.com/band-of-brothers"
          }
        ]
      },
      {
        "id": "evt-4",
        "title": "Battle of the Bulge - Bastogne",
        "date": "1944-12-16",
        "location": {
          "name": "Bastogne, Belgium",
          "lat": 50.0041,
          "lng": 5.7181
        },
        "description": "Easy Company rushed to Bastogne to hold the line during Germany's last major offensive. Frozen foxholes, constant shelling, and brutal cold.",
        "significance": "Turning point of the Battle of the Bulge; unit pushed to breaking point",
        "links": [
          {
            "title": "Episode 6: Bastogne",
            "url": "https://www.hbo.com/band-of-brothers"
          },
          {
            "title": "Siege of Bastogne",
            "url": "https://en.wikipedia.org/wiki/Siege_of_Bastogne"
          }
        ],
        "media": {
          "image": "https://example.com/bastogne.jpg",
          "caption": "Foxhole in Bastogne forest, winter 1944"
        }
      },
      {
        "id": "evt-5",
        "title": "Discovery of Concentration Camp",
        "date": "1945-04-29",
        "location": {
          "name": "Kaufering, Germany",
          "lat": 48.0864,
          "lng": 10.8658
        },
        "description": "Easy Company liberates a Nazi concentration camp, confronting the true horror of the regime they've been fighting.",
        "significance": "Moral clarity; understanding the stakes of the war",
        "links": [
          {
            "title": "Episode 9: Why We Fight",
            "url": "https://www.hbo.com/band-of-brothers"
          }
        ]
      },
      {
        "id": "evt-6",
        "title": "Eagle's Nest & War's End",
        "date": "1945-05-08",
        "location": {
          "name": "Berchtesgaden, Germany",
          "lat": 47.6308,
          "lng": 13.0025
        },
        "description": "Easy Company occupies Hitler's Eagle's Nest retreat as the war in Europe ends. Soldiers contemplate survival and what comes next.",
        "significance": "Symbolic end; occupation of Hitler's personal retreat",
        "links": [
          {
            "title": "Episode 10: Points",
            "url": "https://www.hbo.com/band-of-brothers"
          },
          {
            "title": "Kehlsteinhaus (Eagle's Nest)",
            "url": "https://en.wikipedia.org/wiki/Kehlsteinhaus"
          }
        ]
      }
    ],
    "themes": ["WWII", "Airborne warfare", "Unit cohesion", "European Theater"],
    "relatedNarratives": ["The Pacific", "WWII Eastern Front", "D-Day operations"]
  }
}
```

---

## AI Prompt Template

**System Prompt:**

```
You are a historical timeline generator for an interactive map application.

When given a query about a historical event, period, or narrative, generate a structured JSON timeline with:
1. Chronological events
2. Geographic locations (lat/lng)
3. Brief descriptions
4. Historical significance
5. Links to resources (Wikipedia, primary sources, media)

Focus on:
- Accuracy and verifiable facts
- Geographic specificity (actual coordinates)
- Narrative flow (tell a story)
- Educational value

Output format: JSON matching the schema provided.
```

**User Prompt Example:**

```
Generate a timeline for: "Band of Brothers - Easy Company, 101st Airborne Division in WWII"

Include:
- Key training locations
- Major combat operations (D-Day, Market Garden, Bastogne, etc.)
- Geographic coordinates
- Links to HBO episodes and historical sources
- 6-10 major events
```

---

## Implementation Plan

### Phase 1: AI Integration (Week 1)

- [ ] Add OpenRouter/Anthropic API integration
- [ ] Create prompt templates for timeline generation
- [ ] Build JSON parser for AI responses
- [ ] Test with 3-5 narratives (Band of Brothers, War of the Roses, Napoleonic Wars)

### Phase 2: Timeline Renderer (Week 2)

- [ ] Build event card component
- [ ] Implement map flythrough animation
- [ ] Add playback controls (play, pause, speed, step)
- [ ] Display event markers on timeline slider

### Phase 3: UI/UX (Week 3)

- [ ] Chat interface for queries
- [ ] Example queries / suggestions
- [ ] Save/share generated timelines
- [ ] Export timeline as shareable link

### Phase 4: Content Library (Week 4)

- [ ] Pre-generate 10-20 popular narratives
- [ ] Cache AI responses to reduce API costs
- [ ] Add "Browse Narratives" section
- [ ] User-submitted narrative requests

---

## Collections vs Narratives

### **Collections** (existing feature)

**Definition:** Pre-curated series of content (podcasts, documentaries, books)

**Examples:**
- Hardcore History (Dan Carlin)
- The Rest is History (podcast)
- Ken Burns documentaries
- History of Rome podcast

**Characteristics:**
- Fixed episode list
- External content (links to episodes)
- Focus on consumption
- Manually curated metadata

**UI Treatment:**
- Listed in sidebar
- Click episode → jump to that era/region
- Chronological or release order

---

### **Narratives** (new feature)

**Definition:** Event sequences telling a specific historical story

**Types:**

1. **AI-Generated** - Created on-demand from user queries
   - "Tell me about the siege of Vienna"
   - "What happened during the French Revolution?"

2. **Pre-Authored** - Manually created timelines
   - Band of Brothers (following Easy Company)
   - Lawrence of Arabia (Arabian campaign)
   - Lewis & Clark Expedition

3. **Hybrid** - AI-enhanced human curation
   - Human picks topic, AI fills in details
   - Editorial review before publishing

**Characteristics:**
- Dynamic, story-driven
- Geographic journey
- Focused on specific event sequences
- Can be generated, authored, or both

**UI Treatment:**
- Chat interface for AI generation
- Browse library of pre-made narratives
- Animate through events on map
- Rich event cards with context

---

## Example Narratives (Reference Set)

### 1. **Band of Brothers** (WWII, 1942-1945)
- Training → D-Day → Market Garden → Bastogne → Germany
- ~10 events, 3 years
- Theme: Unit cohesion, airborne warfare

### 2. **War of the Roses** (1455-1487)
- Key battles: St. Albans, Towton, Bosworth Field
- ~15 events, 32 years
- Theme: Civil war, succession crisis

### 3. **Napoleon's Campaigns** (1796-1815)
- Italy → Egypt → Austerlitz → Russia → Waterloo
- ~20 events, 19 years
- Theme: Military genius, empire building

### 4. **Lewis & Clark Expedition** (1804-1806)
- St. Louis → Rocky Mountains → Pacific → Return
- ~30 events, 2.5 years
- Theme: Exploration, American expansion

### 5. **Mongol Invasions** (1206-1279)
- Genghis Khan's rise → Conquest of China → Invasion of Europe
- ~25 events, 73 years
- Theme: Empire expansion, military tactics

---

## API Provider Options

### OpenRouter
**Pros:**
- Access to multiple models (GPT-4, Claude, etc.)
- Cost-effective
- Good rate limits

**Cons:**
- Requires API key management
- Variable response quality

**Cost:** ~$0.02-0.10 per narrative generation

### Anthropic (Claude)
**Pros:**
- Excellent historical knowledge
- Reliable JSON output
- Strong reasoning

**Cons:**
- Higher cost than OpenRouter
- Need separate API key

**Cost:** ~$0.05-0.15 per narrative generation

### Hybrid Approach
- Cache generated narratives
- Pre-generate popular topics
- Only use API for new queries
- Store results in local database

---

## Caching Strategy

```typescript
// Local cache structure
interface NarrativeCache {
  query: string;           // Original user query
  queryHash: string;       // Hash for lookup
  narrative: Narrative;    // Generated timeline
  generatedAt: Date;
  model: string;           // Which AI model used
  version: number;         // Schema version
  upvotes: number;         // Community rating
  views: number;
}

// Check cache before API call
async function getNarrative(query: string): Promise<Narrative> {
  const hash = hashQuery(query);
  const cached = await cache.get(hash);
  
  if (cached && cached.version === CURRENT_VERSION) {
    return cached.narrative;
  }
  
  const generated = await callAI(query);
  await cache.set(hash, generated);
  return generated;
}
```

---

## User Interface Mockup

```
┌─────────────────────────────────────────────────────┐
│  HistoryMap                                  [×]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Ask me anything about history...          │   │
│  │  > "Tell me about Band of Brothers"        │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  📚 Collections         🎬 Narratives              │
│  ├─ Hardcore History    ├─ Band of Brothers        │
│  ├─ Rest is History     ├─ War of the Roses        │
│  └─ Ken Burns           ├─ Napoleon's Campaigns    │
│                         └─ Lewis & Clark           │
│                                                     │
│  ╔═══════════════════════════════════════════╗     │
│  ║                                            ║     │
│  ║         [MAP VIEW - Animated Path]         ║     │
│  ║                                            ║     │
│  ║  📍 Current: Bastogne, Belgium (1944)     ║     │
│  ║                                            ║     │
│  ╚═══════════════════════════════════════════╝     │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Event: Battle of the Bulge - Bastogne      │   │
│  │                                             │   │
│  │ Dec 16, 1944 - Jan 25, 1945                │   │
│  │                                             │   │
│  │ Easy Company rushed to Bastogne to hold    │   │
│  │ the line during Germany's last major...    │   │
│  │                                             │   │
│  │ [Watch Episode] [Read More] [Next Event →] │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Timeline: [●─────────────────────────────]   │  │
│  │  1942          ▶ Play       1945             │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Success Metrics

- **Engagement:** Users generate 10+ narratives/day
- **Accuracy:** AI responses verified against Wikipedia/sources
- **Performance:** Timeline renders in <2 seconds
- **Cost:** <$5/month in API costs (with caching)
- **Sharing:** Users share 20%+ of generated timelines

---

## Future Enhancements

1. **Multi-Perspective Narratives**
   - Same event from different sides (e.g., D-Day from German perspective)

2. **"What If" Scenarios**
   - AI generates alternate history timelines

3. **Compare & Contrast**
   - Show two narratives side-by-side (e.g., Eastern vs Western Front WWII)

4. **User Contributions**
   - Submit corrections or additions to narratives
   - Upvote/downvote AI-generated content

5. **Voice Narration**
   - Herzog-style AI voice reading event descriptions
   - Sync with map animation

6. **VR/AR Mode**
   - Immersive historical experiences
   - Walk through battle sites

---

*Generated: 2026-01-25 | Version: 1.0 | Author: Crab 🦀*
