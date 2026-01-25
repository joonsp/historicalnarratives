// AI Narrative Generation endpoint for Vercel serverless function
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Server configuration error: ANTHROPIC_API_KEY not set'
    });
  }

  const { query, theme, startYear, endYear, stepCount } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  // Build the prompt
  let userPrompt = `Create a historical narrative timeline for: ${query}\n\n`;
  if (theme) userPrompt += `Theme: ${theme}\n`;
  if (startYear !== undefined && endYear !== undefined) {
    userPrompt += `Time period: ${startYear} to ${endYear}\n`;
  }
  if (stepCount) userPrompt += `Number of steps: approximately ${stepCount}\n`;
  userPrompt += '\nReturn ONLY the JSON object, no additional text.';

  const systemPrompt = `You are a historical timeline generator for an interactive map application.

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

  try {
    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
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
}
