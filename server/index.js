/**
 * Local dev server that reuses the Vercel serverless function handlers.
 * No endpoint logic lives here — it all lives in api/*.js
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import generateNarrative from '../api/generate-narrative.js';
import placeHappenings from '../api/place-happenings.js';
import scrapeUrl from '../api/scrape-url.js';
import health from '../api/health.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mount Vercel handlers directly — single source of truth
app.post('/api/generate-narrative', generateNarrative);
app.post('/api/place-happenings', placeHappenings);
app.post('/api/scrape-url', scrapeUrl);
app.get('/api/health', health);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`API key configured: ${!!process.env.ANTHROPIC_API_KEY ? 'Yes' : 'No'}`);
});
