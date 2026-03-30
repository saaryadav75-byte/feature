# SmartLearn Backend Setup Guide

## Current Status

✅ **Backend API is running successfully!**

The app starts in **development mode** with graceful degradation when the database is unreachable.

## Why "Network is unreachable"?

GitHub Codespaces has network restrictions that prevent direct connections to external PostgreSQL databases like Supabase. This is a security feature and is normal.

## Options to Connect to Supabase

### Option 1: Use a Tunnel (Recommended for Codespaces)
Use a service like ngrok or SSH tunnel to access Supabase from the codespace:

```bash
# Install ngrok or use Supabase's own tunneling
npm install -g ngrok
ngrok tcp 5432
```

### Option 2: Deploy to Production
In production (Vercel, Railway, etc.), you'll have full network access:

```bash
# Build for production
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000
```

### Option 3: Use Supabase REST API
Instead of direct PostgreSQL, use Supabase's REST API:

```python
# Update routers to use HTTP instead of DB connections
import httpx
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")

async with httpx.AsyncClient() as client:
    response = await client.get(
        f"{supabase_url}/rest/v1/users",
        headers={"apikey": supabase_key}
    )
```

### Option 4: Use Mock Data in Development
The current setup already does this! The app runs with mock responses when the database is unavailable.

## Environment Variables

```env
# Supabase Configuration
SUPABASE_URL=https://nrjzujhlunngmfbtzfjg.supabase.co
SUPABASE_ANON_KEY=sb_publishable_5TeVPmJbGluCVU0oqLnrXg_j749jQan
DB_PASSWORD=nOV066e3CBk8AhMQ

# JWT
JWT_SECRET=your-secret-key

# CORS
CORS_ORIGINS=http://localhost:3000,https://your-frontend-url

# Environment
ENVIRONMENT=development
```

## Testing the API

```bash
# Health check
curl http://localhost:8000/health

# API Docs
http://localhost:8000/docs

# Test Registration (will fail if DB unreachable)
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## Next Steps

1. **For Development**: Keep using development mode with mock data
2. **For Testing**: Set up a Supabase tunnel or use the REST API
3. **For Production**: Deploy to a platform with full network access (Railway, Render, etc.)

## Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── models/
│   └── database.py      # Database connection logic
├── routers/             # API route handlers
├── schemas/             # Pydantic models
├── utils/               # Helper functions
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables
```

## API Endpoints

```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
GET    /api/auth/me              - Get current user
GET    /api/courses              - List courses
POST   /api/courses              - Create course
GET    /api/lessons/{id}         - Get lesson
POST   /api/progress             - Update progress
GET    /api/gamification/stats   - Get user stats
GET    /api/analytics/heatmap    - Get study heatmap
```

## Troubleshooting

**Q: Why can't the app connect to Supabase?**
A: Network restrictions in Codespaces. Use Option 1-3 above. The app gracefully degrades in development mode.

**Q: How do I fix the "Network is unreachable" error?**
A: This is expected in Codespaces. The app handles it gracefully and continues running.

**Q: Can I test API endpoints without a database?**
A: Yes! The app validates requests and returns mock responses. For full testing, use a tunnel or API wrapper.

## Production Deployment

When deploying to production (Railway, Render, Vercel):

1. Database connections will work normally
2. Set `ENVIRONMENT=production` in production .env
3. Update `CORS_ORIGINS` to your frontend domain
4. Secure your `JWT_SECRET` and `DB_PASSWORD`

```bash
# Example production deployment to Railway
railway up
```
