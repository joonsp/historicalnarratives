// Health check endpoint for Vercel serverless function
export default function handler(req, res) {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

  res.status(200).json({
    status: 'ok',
    hasApiKey,
    timestamp: new Date().toISOString()
  });
}
