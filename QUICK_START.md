# ⚡ Quick Start Guide - Environment Configuration

## 🚀 You're Almost Ready!

Your app is now configured to use **environment variables** for API keys, with username input on first launch.

---

## 📝 Step 1: Fill in Your .env File

Open the `.env` file in the project root and add your API credentials:

```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
MAL_CLIENT_ID=your_actual_mal_client_id_here
MAL_CLIENT_SECRET=your_actual_mal_client_secret_here
```

**Replace the placeholder text with your actual values!**

**Note:** Your MAL username will be requested when you first launch the app.

---

## 🔑 Step 2: MAL API Configuration URLs

When setting up your MAL API at [https://myanimelist.net/apiconfig](https://myanimelist.net/apiconfig):

**Homepage URL:** `http://localhost:3000`

**App Redirect URL:** `http://localhost:3000`

*(These are just formality - the app uses direct API calls, not OAuth redirects)*

---

## ✅ Step 3: Start the App

```bash
npm run dev
```

**The app will:**
1. Automatically load API keys from `.env`
2. Prompt you for your MAL username (first time only)
3. Save your username in browser for future sessions
4. Connect to MAL API and sync your anime list

---

## 📋 Quick Reference

### **Where to Get API Keys:**

| Credential | Where to Get | How to Enter |
|------------|--------------|--------------|
| **Groq API Key** | [console.groq.com/keys](https://console.groq.com/keys) | In `.env` file |
| **MAL Client ID** | [myanimelist.net/apiconfig](https://myanimelist.net/apiconfig) | In `.env` file |
| **MAL Client Secret** | [myanimelist.net/apiconfig](https://myanimelist.net/apiconfig) | In `.env` file |
| **MAL Username** | Your MyAnimeList username | Enter when app starts |

### **Example .env File:**

```env
GROQ_API_KEY=gsk_abc123xyz789defghijklmnop
MAL_CLIENT_ID=894ab82a4b887725b1ddfd7b98ef1c1d
MAL_CLIENT_SECRET=1e0f5a774932edb11ab8110823b72f98081e79b8773336b414fbdd49437aa09a
```

**Then on first launch, you'll be prompted to enter your MAL username.**

---

## 🐛 Troubleshooting

### **App shows "Configuration Required" screen:**
- ✅ Check `.env` file exists in project root
- ✅ Verify variable names are exact (case-sensitive)
- ✅ Restart dev server: `Ctrl+C` then `npm run dev`

### **"Failed to fetch from MAL API":**
- ✅ Verify MAL Client ID is exactly 32 characters
- ✅ Check MAL username spelling (case-sensitive)
- ✅ Ensure your MAL anime list is public
- ✅ Make sure you have anime in your list

### **Need to reconfigure:**
- Just edit `.env` file
- Restart dev server
- Changes apply immediately

---

## 🎯 What Changed

**Configuration Flow:**
- **API Keys:** Stored securely in `.env` file (never committed to git)
- **Username:** Entered once on first launch, saved in browser localStorage
- **Setup Screen:** Only appears if `.env` is misconfigured
- **Production-ready:** API keys separate from user data

---

## 📁 Project Structure

```
Anime-Assistant-Project/
├── .env                    ← ADD YOUR KEYS HERE
├── .env.template           (example file)
├── vite.config.ts          (loads env vars)
├── App.tsx                 (reads env vars)
├── services/
│   ├── groqService.ts      (Groq API)
│   └── malApiService.ts    (MAL API)
└── ...
```

---

## 🚀 Ready to Go!

Once your `.env` file is configured:

```bash
npm run dev
```

Open browser → `http://localhost:3000` → App loads automatically! 🎉

---

**For detailed MAL API setup, see:** `MAL_API_CONFIGURATION.md`  
**For complete migration info, see:** `GROQ_MIGRATION_COMPLETE.md`

