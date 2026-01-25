# Narrative Persistence Implementation

**Status:** ✅ Complete (Basic Persistence)
**Date:** 2026-01-25

## What Was Implemented

### ✅ Persistent Narratives (Working)
AI-generated narratives now save to localStorage and persist across page reloads.

**Features:**
- Narratives automatically save when generated
- Survive browser refresh
- Show in Browse tab with 🤖 badges
- LRU eviction keeps max 50 narratives (~100KB)
- Automatic loading on app startup

### ⏳ Semantic Caching (Not Yet Implemented)
The semantic search feature requires an embeddings API, which Anthropic doesn't provide.

**What's Missing:**
- Anthropic's Claude API only does text generation (no embeddings)
- Would need Voyage AI, OpenAI, or similar for embeddings
- Cost: ~$0.0001 per query with Voyage AI
- Benefit: Detect similar queries like "Napoleon's Russian campaign" vs "Napoleon's 1812 invasion"

**Current Behavior:**
- Similar queries will regenerate (no semantic matching)
- Exact duplicate queries still use transient cache
- All narratives persist regardless

## How It Works Now

### User Flow

**1. Generate a narrative:**
```
User: "HBO's Rome"
→ No exact cache match
→ Generate via Claude ($0.30)
→ Save to localStorage (WITHOUT embedding)
→ Show in Browse tab with 🤖 badge
```

**2. Refresh page:**
```
App starts
→ Load from localStorage
→ Register in global store
→ Browse tab shows: 3 samples + N AI narratives
```

**3. Same query again:**
```
User: "HBO's Rome" (exact same)
→ Transient cache hit (instant)
→ No regeneration needed
```

**4. Similar query:**
```
User: "HBO Rome show"
→ No cache match (semantic search disabled)
→ Generates new narrative ($0.30)
→ Both narratives persist separately
```

## Files Changed

### New Files
- `src/lib/stores/persistedNarratives.ts` - localStorage persistence
- `src/lib/utils/semanticSearch.ts` - Cosine similarity (ready for future use)
- `src/lib/api/embeddingsClient.ts` - Embeddings client (disabled)

### Modified Files
- `server/index.js` - Embeddings endpoint returns 501 (not implemented)
- `src/lib/api/narrativeGenerator.ts` - Save all narratives (no embedding required)
- `src/lib/data/narrativeTimelines.ts` - Load persisted narratives on startup
- `src/lib/components/NarrativeLibrary.svelte` - Show persisted narratives in Browse tab

## Storage Structure

**localStorage key:** `historymap-persisted-narratives`

```typescript
[
  {
    id: "ai-hbo-s-rome-the-fall-of-the-republic",
    query: "hbo's rome",
    queryEmbedding: [], // Empty array (no embeddings)
    narrative: { /* NarrativeTimeline object */ },
    generatedAt: "2026-01-25T...",
    lastAccessed: "2026-01-25T...",
    model: "voyage-3-lite",
    version: 1
  },
  // ... up to 50 narratives
]
```

**Size:** ~2KB per narrative, ~100KB for 50 narratives (well under 5MB limit)

## Testing

### ✅ Verify Persistence Works

1. **Generate a narrative:**
   - Go to ✨ Create tab
   - Enter any historical query
   - Click Generate

2. **Check console logs:**
   ```
   🤖 Generating new narrative for: X
   💾 Saving to persistent storage WITHOUT embedding
   💾 Saved narrative "..." to localStorage (1 total)
   ```

3. **Verify in Browse tab:**
   - Switch to Browse tab
   - Should see your narrative with 🤖 badge

4. **Refresh page (F5):**
   ```
   📂 Loaded 1 narratives from localStorage
   📚 Loading 1 persisted narratives: [...]
   ```

5. **Browse tab still shows it:**
   - AI narrative still visible
   - Can click and play without regenerating

### ✅ Check localStorage

```javascript
// In browser console
const data = JSON.parse(localStorage.getItem('historymap-persisted-narratives'));
console.log('Stored narratives:', data.length);
console.log('Titles:', data.map(n => n.narrative.title));
```

### ✅ Test LRU Eviction

Generate 51+ narratives to trigger auto-pruning:
```javascript
// Check before/after
console.log('Count:', JSON.parse(localStorage.getItem('historymap-persisted-narratives')).length);
// Should be capped at 50
```

## Cost Analysis

**Without Semantic Search:**
- First query: $0.30 (Claude generation)
- Exact duplicate: $0.00 (transient cache)
- Similar query: $0.30 (regenerates)

**If Semantic Search Were Added:**
- First query: $0.30 + $0.0001 (generation + embedding)
- Exact duplicate: $0.00 (transient cache)
- Similar query: $0.0001 (embedding only, returns cached)
- **Savings: $0.30 per similar query**

## Adding Embeddings (Future Enhancement)

To enable semantic search, you would need to:

### Option 1: Voyage AI (Recommended)
```bash
# Add Voyage AI API key to .env
VOYAGE_API_KEY=pa-xxx...

# Update server/index.js embeddings endpoint to call Voyage API
# https://docs.voyageai.com/reference/embeddings-api
```

### Option 2: OpenAI Embeddings
```bash
# Add OpenAI API key to .env
OPENAI_API_KEY=sk-xxx...

# Use model: text-embedding-3-small
# Cost: ~$0.00002 per query
```

### Option 3: Local Embeddings (Free)
```bash
# Use sentence-transformers locally
# No API calls, but requires Python backend
# Model: all-MiniLM-L6-v2 (384 dims)
```

Then uncomment the embedding generation code in `src/lib/api/narrativeGenerator.ts` (line ~160).

## Known Limitations

1. **No semantic search** - Similar queries regenerate ($0.30 each)
2. **No cross-browser sync** - localStorage is per-browser
3. **50 narrative limit** - Oldest are auto-removed (LRU)
4. **Dates stored as strings** - Fixed during deserialization

## Success Criteria

- ✅ AI-generated narratives persist across page reloads
- ✅ Browse tab shows both sample and AI narratives
- ✅ localStorage stays under quota (50 narrative limit)
- ✅ Backward compatibility: exact cache still works
- ⏳ Semantic search: Requires embeddings API (not yet added)

## Console Messages

**Generation:**
- `🤖 Generating new narrative for: X`
- `💾 Saving to persistent storage WITHOUT embedding`
- `💾 Saved narrative "..." to localStorage (N total)`

**Loading:**
- `📂 Loaded N narratives from localStorage`
- `📚 Loading N persisted narratives: [...]`
- `✅ Registered narrative: ... (ai)`

**Display:**
- `📖 getAllNarratives called: N narratives (version X)`
- `🔍 Browse tab: N total narratives, M AI narratives`

## Troubleshooting

**Q: Narratives don't persist after refresh?**
- Check console for `📚 Loading N persisted narratives`
- Verify localStorage: `localStorage.getItem('historymap-persisted-narratives')`
- Check for JavaScript errors during startup

**Q: Browse tab doesn't update after generation?**
- Check console for reactivity logs
- Verify narrative has `createdBy: 'ai'` property
- Try refreshing the page

**Q: Want to enable semantic search?**
- Add embeddings service (Voyage AI, OpenAI, or local)
- Uncomment embedding code in narrativeGenerator.ts
- Update backend /api/embeddings endpoint

**Q: Clear all persisted narratives?**
```javascript
localStorage.removeItem('historymap-persisted-narratives');
location.reload();
```

## Next Steps (Optional Enhancements)

1. **Add embeddings service** for semantic search
2. **Export/import narratives** as JSON files
3. **Share narratives** via URL with narrative ID
4. **Analytics dashboard** showing cache stats
5. **Backend persistence** for cross-device sync
6. **Manual pruning UI** to delete specific narratives
7. **Search/filter** AI narratives by tags or date

---

**Result:** Basic persistence works perfectly! Semantic search can be added later if needed.
