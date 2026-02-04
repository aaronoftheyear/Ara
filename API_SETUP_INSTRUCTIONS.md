# API Setup Instructions

## What You Need to Do

The monitoring features (active users & error logging) require backend API endpoints to be deployed. Here's what you need to do:

### Option 1: Deploy to Vercel (Recommended - Easiest)

1. **If you're already using Vercel:**
   - The `/api` folder functions are automatically detected
   - Just push to your repository and Vercel will deploy them
   - No additional configuration needed!

2. **If you're not using Vercel yet:**
   - Sign up at [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Vercel will auto-detect the `/api` folder and deploy the functions

### Option 2: Deploy to Netlify

1. Move the API functions to `/netlify/functions/`:
   ```bash
   mkdir -p netlify/functions
   cp api/*.js netlify/functions/
   ```

2. Deploy to Netlify - functions will be available at `/api/*`

### Option 3: Custom Node.js Server

If you have your own server, you can use Express:

```javascript
const express = require('express');
const app = express();

app.use(express.json());
app.use('/api/error', require('./api/error'));
app.use('/api/heartbeat', require('./api/heartbeat'));
app.use('/api/active-users', require('./api/active-users'));
app.use('/api/errors', require('./api/errors'));
```

### Option 4: Skip Backend (Monitoring Won't Work)

If you don't want to set up the backend right now:
- The app will still work normally
- Error logging will fail silently (won't break the app)
- Session tracking will fail silently
- The Monitoring tab in dev menu will show 0 users and no errors

## Environment Variable (Optional)

If your API is on a different domain, set in `.env`:
```
VITE_API_BASE_URL=https://your-api-domain.com
```

If not set, it defaults to `/api` (same domain).

## Data Storage

**Current Setup:** JSON files in `/api/data/` (works for development)

**For Production:** Replace with a database:
- PostgreSQL
- MongoDB
- Firebase
- Any other database

Update the `load*` and `save*` functions in each API file to use your database instead of file system.

## Security Note

⚠️ **Before deploying to production:**
- Add authentication/rate limiting
- Add CORS restrictions
- Consider adding API keys
- The current setup allows anyone to log errors (fine for testing, not for production)

## Testing

Once deployed, test the endpoints:
- `GET /api/active-users` - Should return `{count: 0, sessions: []}` initially
- `GET /api/errors` - Should return `{errors: [], total: 0}` initially
- The Monitoring tab in dev menu should show data after users start using the app








