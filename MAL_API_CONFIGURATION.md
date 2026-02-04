# 🔑 MyAnimeList API Configuration Guide

## 📋 What You Need to Configure

When setting up your MyAnimeList API application at [https://myanimelist.net/apiconfig](https://myanimelist.net/apiconfig), you'll be asked for:

1. **App Redirect URL**
2. **Homepage URL**

---

## 🌐 URLs to Use

### **For Local Development:**

**Homepage URL:**
```
http://localhost:3000
```

**App Redirect URL:**
```
http://localhost:3000
```

### **For Production/Deployment:**

**Homepage URL:**
```
https://your-app-name.netlify.app
```
(Replace with your actual deployment URL)

**App Redirect URL:**
```
https://your-app-name.netlify.app
```
(Same as homepage URL)

---

## ⚙️ Complete MyAnimeList API Setup Steps

### **Step 1: Create MAL API Application**

1. Go to: [https://myanimelist.net/apiconfig](https://myanimelist.net/apiconfig)
2. Click **"Create ID"** or **"Add"** to create a new application
3. Fill in the form:

   **App Name:** `Ara - Anime Recommendation Assistant` (or any name you prefer)
   
   **App Type:** `web`
   
   **App Description:** `Personal anime recommendation assistant`
   
   **Homepage URL:** `http://localhost:3000`
   
   **App Redirect URL:** `http://localhost:3000`
   
4. Click **Submit**

### **Step 2: Get Your Client ID and Secret**

After creating the app, you'll see:
- **Client ID** - A 32-character alphanumeric string
- **Client Secret** - A longer alphanumeric string (also required)

**Copy both** - you'll need them for your `.env` file.

---

## 📝 Important Notes

### **Why These URLs Don't Matter Much:**

This application uses **direct API calls** with the Client ID in headers, not OAuth redirect flow. The URLs are required by MAL but won't actually be used for redirects in our implementation.

### **MAL requests (CORS / proxy):**

The app calls the MAL API via a **same-origin serverless proxy** (`/api/mal-proxy`) when deployed (e.g. Vercel), so you don't depend on third-party CORS proxies. If the proxy isn't available (e.g. local dev without `vercel dev`), it falls back to public CORS proxies. No extra configuration needed.

### **Client Secret:**

The Client Secret is required and should be added to your `.env` file. Keep it private and never commit it to version control.

---

## 🔐 .env File Configuration

After getting your MAL Client ID and Secret, update your `.env` file:

```env
# Groq API Configuration
GROQ_API_KEY=gsk_your_groq_api_key_here

# MyAnimeList API Configuration  
MAL_CLIENT_ID=your_32_character_client_id_here
MAL_CLIENT_SECRET=your_client_secret_here
```

**Example:**
```env
GROQ_API_KEY=gsk_abc123xyz789...
MAL_CLIENT_ID=894ab82a4b887725b1ddfd7b98ef1c1d
MAL_CLIENT_SECRET=1e0f5a774932edb11ab8110823b72f98081e79b8773336b414fbdd49437aa09a
```

**Note:** Your MAL username will be requested when you first launch the app and saved in browser localStorage.

---

## 🚀 Quick Setup Checklist

- [ ] **1. Create MAL API App** at [myanimelist.net/apiconfig](https://myanimelist.net/apiconfig)
  - Homepage URL: `http://localhost:3000`
  - App Redirect URL: `http://localhost:3000`
  
- [ ] **2. Copy Client ID and Client Secret**

- [ ] **3. Get Groq API Key** at [console.groq.com/keys](https://console.groq.com/keys)

- [ ] **4. Create `.env` file** in project root:
  ```env
  GROQ_API_KEY=your_groq_key
  MAL_CLIENT_ID=your_mal_client_id
  MAL_CLIENT_SECRET=your_mal_client_secret
  ```

- [ ] **5. Start the app:**
  ```bash
  npm run dev
  ```

- [ ] **6. Enter your MAL username** when prompted (first time only)

- [ ] **7. App loads and syncs your anime list**

---

## 🔧 Troubleshooting

### **Issue: "Failed to fetch from MAL API"**

**Possible causes:**
1. **Invalid Client ID** - Check it's exactly 32 characters
2. **MAL list is private** - Make sure your anime list is public
3. **Username typo** - Verify exact spelling (case-sensitive)
4. **Proxy unavailable** - When deployed, the app uses its own `/api/mal-proxy`; if that returns 404/502 or you're in local dev, it falls back to public CORS proxies (which can be rate-limited or return 403).

**Solutions:**
- **Production:** Deploy to Vercel (or similar) so `/api/mal-proxy` runs; set `MAL_CLIENT_ID` in the host's environment variables.
- **Local dev:** Run `vercel dev` so the MAL proxy is available locally; otherwise the app will try CORS fallbacks (you may need to open cors-anywhere once to "request access").
- Verify credentials in `.env`; ensure MAL list is public and not empty.

### **Issue: "Missing environment variables"**

**Solution:**
- Ensure `.env` file exists in project root
- Check variable names are exactly: `GROQ_API_KEY`, `MAL_CLIENT_ID`, `MAL_USERNAME`
- Restart dev server after creating/editing `.env`

### **Issue: App shows setup screen instead of loading**

**Solution:**
```bash
# Check if .env exists
ls -la .env

# If missing, create it:
cat > .env << 'EOF'
GROQ_API_KEY=your_key_here
MAL_CLIENT_ID=your_client_id_here
MAL_CLIENT_SECRET=your_client_secret_here
EOF

# Restart server
npm run dev
```

---

## 📊 How the MAL API Works (Technical)

### **Our Implementation:**

1. **Fetches anime list directly** via MAL API v2:
   ```
   GET https://api.myanimelist.net/v2/users/{username}/animelist
   Headers: X-MAL-CLIENT-ID: {your_client_id}
   ```

2. **Uses same-origin proxy** when deployed (`/api/mal-proxy`), with optional CORS-proxy fallbacks for local dev:
   ```
   GET /api/mal-proxy?path=https://api.myanimelist.net/v2/...
   Header: X-MAL-CLIENT-ID
   ```

3. **Pagination** - Automatically fetches all pages (limit: 1000 per page)

4. **Data extracted:**
   - Title
   - Score (your rating)
   - Status (Completed, Watching, Dropped, etc.)
   - Finish date

### **What We DON'T Use:**

- ❌ OAuth redirect flow (no user login required)
- ❌ Client Secret (not needed for this implementation)
- ❌ Authorization tokens (Client ID in headers is sufficient)
- ❌ Write operations (read-only access)

---

## 🌍 Deployment Considerations

### **When hosting on static-only providers (e.g. one.com):**

one.com and similar hosts serve only static files (no Node/serverless), so `/api/mal-proxy` is not available there. Use a **remote proxy** and point the app at it:

1. **Deploy the MAL proxy to Vercel (free)** so you have a working proxy URL:
   - Push this project to GitHub (if not already).
   - Go to [vercel.com](https://vercel.com) → New Project → Import this repo.
   - Vercel will detect the `api/` folder and deploy `api/mal-proxy.js` as a serverless function.
   - After deploy, your proxy URL is: `https://<your-project>.vercel.app` (no `/api/mal-proxy` in the env — the app adds that path).

2. **Set the proxy URL when building** for one.com. In your `.env` (or in your one.com build environment), add:
   ```env
   VITE_MAL_PROXY_URL=https://<your-project>.vercel.app
   ```
   Replace `<your-project>` with your actual Vercel project URL (e.g. `anime-assistant-xyz` → `https://anime-assistant-xyz.vercel.app`).

3. **Build and upload to one.com** as usual (`npm run build`, then upload the `dist/` contents). The app will call the Vercel proxy for MAL requests, so the MAL sync works from your one.com site.

4. **Optional:** In the Vercel project, add `MAL_CLIENT_ID` under Environment Variables so the proxy can use it server-side; otherwise the app sends it in the request header (already supported).

### **When deploying to Netlify/Vercel:**

1. **Update MAL API URLs:**
   - Go back to [myanimelist.net/apiconfig](https://myanimelist.net/apiconfig)
   - Edit your app
   - Update URLs to your production domain:
     - Homepage URL: `https://your-app.netlify.app`
     - App Redirect URL: `https://your-app.netlify.app`

2. **Set environment variables in hosting platform:**
   - Netlify: Site settings → Environment variables
   - Vercel: Project settings → Environment Variables
   - Add: `GROQ_API_KEY`, `MAL_CLIENT_ID`, `MAL_CLIENT_SECRET`
   
3. **Note:** Username prompt will appear for each new browser/device (stored in localStorage)

3. **Redeploy** after updating environment variables

---

## 📧 Support

**MAL API Documentation:**  
[https://myanimelist.net/apiconfig/references/api/v2](https://myanimelist.net/apiconfig/references/api/v2)

**Project Location:**  
`/Users/aaron/Cursor Projects/Anime-Assistant-Project`

**Key Configuration Files:**
- `.env` - Environment variables (create this!)
- `vite.config.ts` - Loads env vars
- `services/malApiService.ts` - MAL API integration

---

**Last Updated:** 2025-10-15  
**Status:** ✅ **Complete Configuration Guide**  
**Estimated Setup Time:** 5 minutes

