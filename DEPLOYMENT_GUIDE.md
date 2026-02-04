# 🚀 Deployment Guide - Share Ara, the Anime Recommendation Assistant

**Purpose:** Make your anime assistant accessible to anyone on the internet for testing
**Cost:** FREE
**Difficulty:** Easy (5-10 minutes)

---

## 🎯 **OPTION 1: Vercel (RECOMMENDED)**

### **Why Vercel?**
- ✅ **Free forever** - Generous free tier
- ✅ **Perfect for Vite/React** - Built specifically for this stack
- ✅ **Auto HTTPS** - Secure by default
- ✅ **Global CDN** - Fast worldwide
- ✅ **Environment variables** - Secure API key storage
- ✅ **Automatic deployments** - Push to GitHub = instant deploy

### **Step-by-Step Deployment:**

#### **1. Prepare Your Project**

First, make sure you have a `.env` file with your API keys (this stays LOCAL - never commit it):

```bash
GEMINI_API_KEY=your_gemini_api_key_here
MAL_CLIENT_ID=your_mal_client_id_here
```

#### **2. Initialize Git (if not already done)**

```bash
cd "/Users/aaron/Cursor Projects/Anime-Assistant-Project"
git init
git add .
git commit -m "Initial commit - Ara assistant with Veldora interrupt"
```

#### **3. Create GitHub Repository**

1. Go to [github.com/new](https://github.com/new)
2. Create a **private** repository named `anime-assistant`
3. **DO NOT** initialize with README (you already have files)
4. Copy the repository URL

#### **4. Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/anime-assistant.git
git branch -M main
git push -u origin main
```

#### **5. Deploy to Vercel**

1. **Go to:** [vercel.com](https://vercel.com)
2. **Sign up/Login** with GitHub
3. **Click:** "Add New Project"
4. **Import** your `anime-assistant` repository
5. **Configure:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add: `GEMINI_API_KEY` = `your_key_here`
   - Add: `MAL_CLIENT_ID` = `your_client_id_here`
   - Select: "Production, Preview, Development"

7. **Click:** "Deploy"

#### **6. Share Your URL**

After deployment (1-2 minutes), you'll get a URL like:
```
https://anime-assistant-abc123.vercel.app
```

**This URL is now accessible by ANYONE worldwide!**

---

## 🎯 **OPTION 2: Netlify (Alternative)**

### **Why Netlify?**
- ✅ **Free forever**
- ✅ **Drag-and-drop deployment**
- ✅ **Environment variables**
- ✅ **Easy to use**

### **Quick Deployment:**

#### **Method A: Netlify CLI (Recommended)**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build your app
npm run build

# Deploy
netlify deploy --prod

# Follow prompts:
# - Create new site
# - Team: Your team
# - Site name: anime-assistant (or custom)
# - Publish directory: dist
```

#### **Add Environment Variables:**
1. Go to [app.netlify.com](https://app.netlify.com)
2. Select your site
3. **Site settings → Environment variables**
4. Add:
   - `GEMINI_API_KEY`
   - `MAL_CLIENT_ID`
5. **Redeploy** to apply changes

#### **Method B: Drag & Drop**

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Go to:** [app.netlify.com/drop](https://app.netlify.com/drop)
3. **Drag** the `dist` folder
4. **Get instant URL**

**⚠️ WARNING:** Drag & drop doesn't support environment variables easily. Use Method A for production.

---

## 🎯 **OPTION 3: Quick Share with Ngrok (Temporary Testing)**

### **For Quick Testing (Session-based - URL expires when you close it)**

```bash
# Install ngrok
brew install ngrok

# Start your dev server
npm run dev

# In another terminal, create tunnel
ngrok http 3000
```

**You'll get a URL like:**
```
https://abc123.ngrok-free.app
```

**Share this URL** - anyone can access your app while ngrok is running.

**⚠️ Limitations:**
- URL changes each time you restart ngrok
- Only works while your computer is on
- Free tier has session limits

---

## 🔐 **Security Considerations**

### **API Key Protection:**

**Current Issue:** Your API keys are embedded in the build. Anyone can extract them from the deployed app.

**Solutions:**

#### **Option A: Users Provide Their Own Keys (Recommended for Public Testing)**

Modify `SetupScreen.tsx` to require users to input their own:
- Gemini API Key
- MAL Client ID

Store in `localStorage` instead of environment variables.

#### **Option B: Backend Proxy (Production Solution)**

Create a simple backend that:
1. Receives requests from frontend
2. Adds API keys server-side
3. Forwards to Gemini/MAL APIs
4. Returns results to frontend

**Simple Vercel Backend:**
```javascript
// api/gemini.js
export default async function handler(req, res) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  // Forward request to Gemini
  const response = await fetch('https://api.gemini...', {
    headers: { 'Authorization': `Bearer ${GEMINI_API_KEY}` }
  });
  
  const data = await response.json();
  res.json(data);
}
```

#### **Option C: Rate Limiting (If Sharing Your Keys)**

If you deploy with your own API keys embedded, implement:
- Rate limiting per IP
- Usage monitoring
- Cost alerts

---

## 📋 **Deployment Checklist**

### **Before Deployment:**
- [ ] Test locally: `npm run dev`
- [ ] Build successfully: `npm run build`
- [ ] Check `.gitignore` excludes `.env`
- [ ] Verify all images load from `/public/characters/`
- [ ] Test all character unlock paths
- [ ] Test Veldora interrupt sequence

### **After Deployment:**
- [ ] Test MAL API connection with a username
- [ ] Test Gemini AI recommendations
- [ ] Test character switching
- [ ] Test unlock system
- [ ] Test Veldora interrupt with "battle shonen manga"
- [ ] Verify environment variables loaded correctly
- [ ] Check browser console for errors

---

## 🎯 **Recommended Workflow**

### **For Public Testing:**

1. **Deploy to Vercel** (permanent URL)
2. **Modify SetupScreen** to require users input their own API keys
3. **Share deployment URL** with testers
4. **Provide setup instructions:**
   - Get Gemini API key: [aistudio.google.com](https://aistudio.google.com)
   - Get MAL Client ID: [myanimelist.net/apiconfig](https://myanimelist.net/apiconfig)

### **For Private Testing:**

1. **Deploy to Vercel** with your API keys
2. **Share URL** with trusted testers only
3. **Monitor API usage** in Gemini dashboard
4. **Set spending alerts** to prevent unexpected costs

---

## 🚨 **Troubleshooting**

### **Build Fails:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### **Environment Variables Not Working:**
- Vercel: Make sure you selected "Production" scope
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### **Images Not Loading:**
- Images must be in `/public/characters/`
- Paths should be `/characters/image.jpg` (no /public/)
- Verify all image files committed to Git

### **API Errors After Deployment:**
- Check environment variables set correctly
- Verify API keys valid and not expired
- Check API quotas not exceeded
- Test API keys locally first

---

## 📊 **Cost Monitoring**

### **Gemini API Free Tier:**
- 60 requests per minute
- 1,500 requests per day
- Monitor: [aistudio.google.com](https://aistudio.google.com)

### **MAL API Free Tier:**
- No official rate limit documentation
- Generally very generous for personal use
- Monitor your Client ID usage

### **Vercel Free Tier:**
- 100 GB bandwidth/month
- 100 deployments/day
- Serverless function execution limits
- Monitor: [vercel.com/dashboard](https://vercel.com/dashboard)

---

## ✅ **Success Verification**

After deployment, test this sequence:

1. **Visit your Vercel URL**
2. **Enter a MAL username** (e.g., "Xinil")
3. **Verify data loads** ("Successfully connected to MAL")
4. **Ask for recommendation:** "Recommend action anime"
5. **Test character unlock:** Ask for genres that unlock new characters
6. **Test Veldora interrupt:** Message "recommend battle shonen manga"
   - Should see "Unknown character" or "Veldora Tempest" entrance
   - Should see kick message
   - Should get Veldora's dramatic speech
   - Should receive 3 manga recommendations

---

**Deployment Status:** Ready for immediate deployment
**Recommended Option:** Vercel with GitHub integration
**Estimated Setup Time:** 10 minutes
**Monthly Cost:** $0 (Free tier)




