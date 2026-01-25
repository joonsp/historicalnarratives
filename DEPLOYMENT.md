# Deployment Guide - Vercel

## ✅ Pre-deployment Checklist

- [x] No API keys in frontend code
- [x] `.env` added to `.gitignore`
- [x] Serverless functions created in `/api` directory
- [x] Credits and acknowledgements added
- [x] `vercel.json` configuration ready

## 🚀 Deploy to Vercel

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser for authentication.

### Step 3: Deploy

```bash
# First deployment (preview)
vercel

# For production
vercel --prod
```

### Step 4: Add Environment Variable

After first deployment, add your API key:

```bash
vercel env add ANTHROPIC_API_KEY
```

When prompted:
1. Select "Production"
2. Paste your API key: `sk-ant-api03-...`
3. Press Enter

Or add via Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your API key
   - Environment: Production

### Step 5: Redeploy

After adding the environment variable:

```bash
vercel --prod
```

## 🔗 Your App URLs

After deployment, you'll get:
- **Production:** `https://historical-narrative.vercel.app`
- **Preview:** `https://historical-narrative-xyz123.vercel.app`

## 📋 What Gets Deployed

### Frontend (Static)
- Built Vite app from `/dist`
- All static assets
- HTML, CSS, JavaScript bundles

### Backend (Serverless Functions)
- `/api/health.js` → Health check endpoint
- `/api/generate-narrative.js` → AI narrative generation

### Environment Variables
- `ANTHROPIC_API_KEY` (stored securely, never exposed)
- `NODE_ENV=production`

## 🔒 Security Notes

✅ **Frontend is secure:**
- No API keys in code
- All API calls go through Vercel serverless functions
- CORS properly configured
- HTTPS by default

✅ **Backend is secure:**
- API key stored as Vercel environment variable
- Not exposed in client-side code
- Serverless functions run in isolated environment

## 🧪 Testing After Deployment

1. **Test health endpoint:**
```bash
curl https://your-app.vercel.app/api/health
# Should return: {"status":"ok","hasApiKey":true}
```

2. **Test in browser:**
- Open your Vercel URL
- Click "✨ Create" tab
- Try generating a narrative
- Should work without errors!

3. **Check persistence:**
- Generate a narrative
- Refresh the page
- Check "Browse" tab → should still be there

## 🐛 Troubleshooting

### "Backend Server Required" error

**Cause:** API key not set or functions not deployed

**Fix:**
```bash
# Check if env var is set
vercel env ls

# Add if missing
vercel env add ANTHROPIC_API_KEY

# Redeploy
vercel --prod
```

### CORS errors

**Cause:** Frontend trying to call wrong URL

**Fix:** Vercel automatically handles this. Make sure you're using relative URLs:
```javascript
// Good (relative URL)
fetch('/api/generate-narrative', ...)

// Bad (hardcoded localhost)
fetch('http://localhost:3001/api/generate-narrative', ...)
```

### Slow cold starts

**Cause:** Serverless functions wake up after inactivity

**Solution:** This is normal for free tier. First request may take 1-2 seconds, subsequent requests are fast.

## 📊 Monitoring

Vercel Dashboard provides:
- **Analytics:** Page views, performance metrics
- **Logs:** Function execution logs
- **Speed Insights:** Core Web Vitals
- **Usage:** API calls, bandwidth

Access at: https://vercel.com/dashboard

## 💰 Costs

**Free Tier includes:**
- 100 GB bandwidth/month
- 100 GB-hours serverless function execution
- Unlimited deployments
- Custom domains
- Automatic SSL

**Your usage estimate:**
- ~1000 narrative generations/month
- Each generation: ~5-10 seconds function time
- Well within free tier limits

**If you exceed:**
- Bandwidth: $40 per 100 GB
- Functions: $40 per 100 GB-hours

## 🔄 Future Deployments

After initial setup, just push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push
```

Or redeploy manually:
```bash
vercel --prod
```

## 🌐 Custom Domain (Optional)

To use your own domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `historicalnarrative.com`)
3. Update DNS records as instructed
4. Vercel handles SSL automatically

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ Yes | Your Claude API key for narrative generation |
| `NODE_ENV` | Auto-set | Set to `production` by Vercel |

---

**Ready to deploy?** Run `vercel --prod` and you're live! 🚀
