# 🔧 Backend Setup for AI Generation

## Why a Backend?

The Anthropic API doesn't allow direct browser requests due to CORS security policies. To enable AI-powered narrative generation, we need a simple backend server that:

1. **Keeps API keys secure** - Never exposes your API key to the frontend
2. **Avoids CORS issues** - Backend can call Anthropic API without restrictions
3. **Adds validation** - Can validate requests before forwarding to API

## Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Enable cross-origin requests
- `dotenv` - Environment variable management
- `concurrently` - Run multiple servers simultaneously

### 2. Configure API Key

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit it with your API key
nano .env
```

Add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Important**: Use `ANTHROPIC_API_KEY` (not `VITE_ANTHROPIC_API_KEY`)
- `VITE_` prefix exposes variables to the frontend (security risk!)
- Without `VITE_` prefix, the variable stays server-side only

### 3. Start Both Servers

```bash
npm run dev:all
```

This starts:
- **Frontend** on http://localhost:5175 (Vite)
- **Backend** on http://localhost:3001 (Express)

You should see:
```
🚀 Backend server running on http://localhost:3001
📡 API endpoint: http://localhost:3001/api/generate-narrative
🔑 API key configured: Yes

  VITE v7.3.1  ready in 179 ms
  ➜  Local:   http://localhost:5175/
```

## Alternative: Run Servers Separately

If you prefer to run them in separate terminals:

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Backend):**
```bash
npm run dev:server
```

## Testing the Backend

### 1. Health Check

Visit http://localhost:3001/api/health in your browser.

You should see:
```json
{
  "status": "ok",
  "hasApiKey": true
}
```

If `hasApiKey` is `false`, check your `.env` file.

### 2. Test Narrative Generation

Open the app at http://localhost:5175

1. Click "Narratives" button
2. Go to "Create" tab
3. Type a query: "Tell me about the Seven Years War"
4. Click "Generate"
5. Wait 5-10 seconds
6. Your custom narrative should appear!

## Troubleshooting

### "Backend Server Required" Warning

**Problem**: The Create tab shows a warning about backend server.

**Solution**:
1. Make sure backend is running: `npm run dev:server`
2. Check console for errors
3. Verify API key is set in `.env`

### "Failed to fetch" Error

**Problem**: Network error when generating narratives.

**Solution**:
1. Confirm backend is running on port 3001
2. Check browser console for CORS errors
3. Try accessing http://localhost:3001/api/health directly

### "API key not configured" Error

**Problem**: Backend can't find your API key.

**Solution**:
1. Check `.env` file exists in project root
2. Verify it contains `ANTHROPIC_API_KEY=sk-ant-...`
3. Restart backend server after editing `.env`

### Port Already in Use

**Problem**: Port 3001 is already taken.

**Solution**:
```bash
# Find what's using port 3001
lsof -i :3001

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or change the port in server/index.js
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Frontend (Vite + Svelte)                       │
│  http://localhost:5175                          │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │ NarrativeLibrary.svelte                │    │
│  │ (AI generation UI)                     │    │
│  └───────────┬────────────────────────────┘    │
│              │                                  │
│              │ POST /api/generate-narrative    │
│              │ { query: "..." }                │
└──────────────┼──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Backend (Express)                              │
│  http://localhost:3001                          │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │ server/index.js                        │    │
│  │ - Validates request                    │    │
│  │ - Reads ANTHROPIC_API_KEY from .env    │    │
│  │ - Calls Anthropic API                  │    │
│  │ - Returns generated narrative          │    │
│  └───────────┬────────────────────────────┘    │
└──────────────┼──────────────────────────────────┘
               │
               │ HTTPS + API Key
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Anthropic API                                  │
│  https://api.anthropic.com/v1/messages          │
│                                                 │
│  Claude 3.5 Sonnet generates narrative JSON    │
└─────────────────────────────────────────────────┘
```

## Security Notes

### ✅ What's Secure

- API key stays on server (never sent to browser)
- Backend validates all requests
- CORS properly configured
- Environment variables not exposed to frontend

### ⚠️ What's Not Secure (for production)

- No authentication (anyone can generate narratives)
- No rate limiting (could be abused)
- No request logging or monitoring
- No API key rotation

**For production**, you'd want to add:
- User authentication (JWT, session, etc.)
- Rate limiting per user/IP
- Request logging and monitoring
- API key rotation and secrets management
- Input validation and sanitization
- Error tracking (Sentry, etc.)

## Cost Considerations

Each narrative generation costs approximately **$0.05-0.06** in API usage.

The app includes **caching** to minimize costs:
- Identical queries return cached results
- Cache stores up to 20 narratives
- Cache expires after 30 days
- Check browser console for "Using cached narrative"

**Estimated monthly costs:**
- 100 unique queries: $5-6
- 1,000 unique queries: $50-60

## Environment Variables

### Backend (.env)
```env
# Required: Anthropic API key (server-side only)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional: Backend port (defaults to 3001)
PORT=3001
```

### Frontend (optional)
```env
# Optional: Backend URL (defaults to http://localhost:3001)
VITE_BACKEND_URL=http://localhost:3001
```

**Note**: Only use `VITE_` prefix for variables that SHOULD be exposed to the frontend (like API URLs). Never use it for secrets!

## Production Deployment

For deploying to production, consider:

### Option 1: Serverless Functions
- Vercel Functions
- Netlify Functions
- AWS Lambda

### Option 2: Container
- Docker + Railway/Render
- Heroku
- DigitalOcean App Platform

### Option 3: Traditional Server
- VPS with PM2
- Kubernetes
- Docker Swarm

See the plan document for Phase 8 details on Supabase + Serverless architecture.

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure API key in `.env`
3. ✅ Start servers: `npm run dev:all`
4. ✅ Test generation in the app
5. 🔜 Deploy to production (see Phase 8)

---

**Backend is ready!** 🎉

Open http://localhost:5175 and try generating your first AI narrative!
