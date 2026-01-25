/**
 * Simple Express server to proxy Anthropic API requests
 * Keeps API keys secure and avoids CORS issues
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// System prompt for Claude
const NARRATIVE_SYSTEM_PROMPT = `You are a historical timeline generator for an interactive map application.

When given a query about a historical event, period, or narrative, generate a structured JSON timeline with:
1. 5-15 chronological steps (events/locations)
2. Precise geographic coordinates (lat/lng)
3. Brief but engaging descriptions (2-3 sentences each)
4. Historical significance and context
5. Links to resources when relevant

Focus on:
- Historical accuracy and verifiable facts
- Geographic specificity (actual battle sites, cities, routes)
- Narrative flow (tell a compelling story)
- Educational value (context, significance, consequences)

Output ONLY valid JSON matching this schema:
{
  "title": "...",
  "description": "...",
  "theme": "...",
  "steps": [
    {
      "title": "...",
      "year": -480,
      "location": [38.7967, 22.5367],
      "description": "...",
      "eventType": "battle",
      "mapZoom": 8
    }
  ],
  "tags": ["tag1", "tag2"],
  "startYear": -480,
  "endYear": -323,
  "regions": ["Greece", "Persia"]
}`;

// API endpoint for narrative generation
app.post('/api/generate-narrative', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Server configuration error: ANTHROPIC_API_KEY not set'
    });
  }

  const { query, theme, startYear, endYear, stepCount } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    // Build the prompt
    let prompt = `Create a historical narrative timeline for: ${query}\n\n`;
    if (theme) prompt += `Theme: ${theme}\n`;
    if (startYear !== undefined && endYear !== undefined) {
      prompt += `Time period: ${startYear} to ${endYear}\n`;
    }
    if (stepCount) prompt += `Number of steps: approximately ${stepCount}\n`;
    prompt += '\nReturn ONLY the JSON object, no additional text.';

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        system: NARRATIVE_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return res.status(response.status).json({
        error: `API request failed: ${response.status}`
      });
    }

    const data = await response.json();

    if (!data.content || !data.content[0] || !data.content[0].text) {
      return res.status(500).json({ error: 'Invalid response from API' });
    }

    // Note: Embeddings disabled - Anthropic doesn't provide embeddings API
    // Narratives will persist without semantic search capability
    const queryEmbedding = null;

    // Return the AI response with optional embedding
    res.json({
      narrative: data.content[0].text,
      queryEmbedding
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// API endpoint for embeddings generation
// NOTE: Disabled - Anthropic doesn't provide embeddings API
// Voyage AI would need to be integrated separately for semantic search
// For now, narratives persist without embeddings
app.post('/api/embeddings', async (req, res) => {
  res.status(501).json({ 
    error: 'Embeddings endpoint not implemented',
    message: 'Anthropic does not provide embeddings. Narratives will persist without semantic search capability.'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.ANTHROPIC_API_KEY
  });
});

// Test endpoint to check available models
app.get('/api/test-models', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const modelsToTest = [
    'claude-sonnet-4-5-20250514',
    'claude-sonnet-4-5-20250929',
    'claude-opus-4-5-20251101',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ];

  const results = {};

  for (const model of modelsToTest) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }]
        }),
      });

      results[model] = response.ok ? 'Available' : `Error: ${response.status}`;
    } catch (error) {
      results[model] = `Error: ${error.message}`;
    }
  }

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/generate-narrative`);
  console.log(`🔑 API key configured: ${!!process.env.ANTHROPIC_API_KEY ? 'Yes' : 'No'}`);
});
