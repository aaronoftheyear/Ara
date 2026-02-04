# 🔑 Gemini API Key Troubleshooting

**Date:** 2025-10-15  
**Issue:** API key showing as invalid  
**Error:** "API key not valid. Please pass a valid API key."

---

## 🔍 Possible Causes

### **1. API Key Restrictions**
Your API key might have restrictions set when it was created.

**Check & Fix:**
1. Go to: [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Find your API key
3. Click "Edit"
4. Under "API restrictions":
   - Select **"Don't restrict key"** (for testing)
   - OR select "Restrict key" and enable "Generative Language API"
5. Under "Application restrictions":
   - Select **"None"** (for testing)
6. Save changes
7. Wait 1-2 minutes for changes to propagate

---

### **2. Generative Language API Not Enabled**
The API might not be enabled in your Google Cloud project.

**Check & Fix:**
1. Go to: [console.cloud.google.com/apis/library/generativelanguage.googleapis.com](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)
2. Click **"Enable"** button
3. Wait for confirmation
4. Try your app again

---

### **3. Wrong API Key Type**
You might have created an OAuth client ID instead of an API key.

**Verify:**
1. Your key should start with: `AIza...`
2. It should be ~39 characters long
3. Created at: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

**If wrong type:**
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Select or create a Google Cloud project
4. Copy the new key
5. Replace in `.env` file

---

### **4. API Key From AI Studio vs Cloud Console**
There are TWO ways to get a Gemini API key:

**Method A: AI Studio (Easier) ✅**
- Go to: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- Click "Create API Key"
- Choose a project (or create new)
- Copy key immediately

**Method B: Cloud Console (More complex)**
- Requires Google Cloud project setup
- Need to enable APIs manually
- More configuration steps

**Use Method A** - simpler and more reliable!

---

### **5. Project Not Selected**
When creating the API key, you must select a Google Cloud project.

**Fix:**
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. If you see "Select a project" or "Create project"
3. Either:
   - Select an existing project
   - OR click "Create new project" → Give it a name → Create
4. Then create API key for that project

---

## 🎯 Recommended Solution

**Start fresh with a new API key:**

### **Step 1: Create New API Key**
1. Go to: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **"Create API Key"**
3. Select **"Create API key in new project"** (easiest)
4. Wait for project creation (~30 seconds)
5. Copy the API key immediately

### **Step 2: Update .env**
Replace the key in your `.env` file:
```env
GEMINI_API_KEY=AIza_your_new_key_here
```

### **Step 3: Restart**
```bash
# Stop the dev server (Ctrl+C)
npm run dev
```

### **Step 4: Test**
Try: "Recommend 2 anime for me"

---

## 🔐 API Key Checklist

Verify your API key:

- [ ] Starts with `AIza`
- [ ] About 39 characters long
- [ ] Created at aistudio.google.com (not cloud console)
- [ ] Associated with a Google Cloud project
- [ ] Generative Language API is enabled
- [ ] No IP/application restrictions (for testing)

---

## 🆘 If Still Not Working

### **Option 1: Check API Status**
- Go to: [status.cloud.google.com](https://status.cloud.google.com)
- Verify "Generative Language API" is operational

### **Option 2: Verify Key in Browser**
Test your API key directly:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

Replace `YOUR_API_KEY` with your actual key.

**Expected:** JSON response with generated text  
**If error:** API key is definitely invalid

### **Option 3: Try Different Model**
Some models might require different permissions:
- `gemini-1.5-flash` ✅ (most stable)
- `gemini-1.5-pro` (higher quality)
- `gemini-2.0-flash-exp` (experimental, may have restrictions)

We're currently using `gemini-1.5-flash` (stable).

---

## 💡 Most Likely Issue

**You probably need to:**
1. **Enable the Generative Language API** in your Google Cloud project
2. **Remove API restrictions** from your key

**Quick fix:**
- Go to: [console.cloud.google.com/apis/library/generativelanguage.googleapis.com](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)
- Click "Enable"
- Wait 1-2 minutes
- Try app again

---

**Status:** 🟡 **API KEY NEEDS CONFIGURATION**  
**Next:** Enable Generative Language API or create new unrestricted key

