// Place Happenings endpoint for Vercel serverless function
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

  const { place, mode, offset, exclude } = req.body;

  if (!place) {
    return res.status(400).json({ error: 'place is required' });
  }

  const safeOffset = typeof offset === 'number' ? offset : 0;
  const safeMode = mode === 'popculture' ? 'popculture' : 'history';

  const systemPrompt = safeMode === 'history'
    ? `You are a historical significance ranker. Given a place, return the most significant historical happenings there, ranked by global significance (not chronologically). Return JSON array of exactly 10 items starting from rank ${safeOffset + 1}.

Each item must have:
- "title": short name of the event
- "year": integer year (negative for BCE, e.g. -44 for 44 BCE)
- "significance": one sentence explaining why this matters
- "location": [latitude, longitude] array with precise coordinates at or near the place
- "eventType": one of "battle", "treaty", "revolution", "founding", "collapse", "journey"

Return ONLY a valid JSON array, no additional text.`
    : `You are a pop culture expert. Given a place, return the most notable movies, TV series, fiction books, video games, and other cultural works set in or strongly associated with that place. Ranked by cultural impact. Return JSON array of exactly 10 items starting from rank ${safeOffset + 1}.

Each item must have:
- "title": name of the work (include type, e.g. "Roman Holiday (1953 film)")
- "year": release/publication year as integer
- "significance": one sentence explaining the cultural impact or connection to the place
- "location": [latitude, longitude] array with precise coordinates of the key location in the place
- "eventType": "journey"

Return ONLY a valid JSON array, no additional text.`;

  const safeExclude = Array.isArray(exclude) ? exclude : [];
  let userPrompt = `Place: ${place}\nReturn items ranked ${safeOffset + 1} through ${safeOffset + 10}.`;
  if (safeExclude.length > 0) {
    userPrompt += `\nDo NOT include any of these already-listed items:\n${safeExclude.map(t => `- ${t}`).join('\n')}`;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
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

    // Parse and validate the JSON array
    const text = data.content[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'No valid JSON array found in response' });
    }

    const happenings = JSON.parse(jsonMatch[0]);

    res.json({ happenings });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
