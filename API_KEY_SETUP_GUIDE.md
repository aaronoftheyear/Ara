# 🔑 API Key Setup Guide - New Project

**Issue:** New API key from different project not showing usage

---

## ✅ **Step-by-Step Setup**

### **1. Create API Key in AI Studio**

1. Go to [AI Studio](https://aistudio.google.com/apikey)
2. Click **"Create API Key"**
3. Select **"Create API key in new project"** (or select existing project)
4. Copy the API key

**Note:** API keys are created in AI Studio, but they're tied to a Google Cloud project behind the scenes.

---

### **2. Find Your Project in Google Cloud Console**

**AI Studio projects might not show up immediately or have different names:**

**Method 1: Check Project Name in AI Studio**
1. Go to [AI Studio API Keys](https://aistudio.google.com/apikey)
2. Look at your API key - it should show which project it belongs to
3. Note the project name (might be something like "My Project" or auto-generated)

**Method 2: Find All Projects in Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the **project dropdown** at the top (next to "Google Cloud")
3. You'll see a list of ALL your projects
4. Look for:
   - The project name you saw in AI Studio
   - Projects with names like "My Project", "Project 1", etc.
   - Any recently created projects

**Method 3: Check Project ID**
1. In AI Studio, if you can see project details, note the **Project ID** (not the name)
2. In Google Cloud Console, the Project ID is shown in the project dropdown
3. Match the Project ID to find the right project

**If you still can't find it:**
- The project might be in a different Google account
- Try checking if you're logged into the same Google account in both places
- The project might be created but not visible until you access it via API first

---

### **3. Enable Gemini API in the Project (If Needed)**

**Once you find the project:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select the project from the dropdown
3. Go to **APIs & Services** → **Library**
4. Search for **"Generative Language API"** (or "Generative AI API")
5. If it says "Enable" → Click it
6. If it says "API enabled" → You're good!

**Note:** Usually AI Studio enables this automatically, but sometimes it needs manual enabling.

---

### **4. Verify API Key in AI Studio**

1. Go to [AI Studio API Keys](https://aistudio.google.com/apikey)
2. You'll see your API keys listed
3. Each key shows which project it belongs to
4. Make sure you have:
   - ✅ One key from **Project A** (for recommendations)
   - ✅ One key from **Project B** (for chat/referrals)

**Note:** AI Studio doesn't show detailed restrictions - those are managed in Google Cloud Console if needed.

---

### **5. Check API Key Restrictions (Optional)**

**By default, AI Studio keys have no restrictions.** If you want to add restrictions:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select the project
3. **APIs & Services** → **Credentials**
4. Find your API key (it will show the first few characters)
5. Click on it
6. Under **API restrictions:**
   - **For testing:** Leave as "Don't restrict key"
   - **For production:** Restrict to "Generative Language API"

**Note:** Usually no restrictions needed for development!

---

### **6. Update .env File**

Make sure your `.env` file has the correct key:

```env
# Original project (recommendations)
VITE_GEMINI_REC_API_KEY=your_original_key_here

# New project (chat/referrals)
VITE_GEMINI_CHAT_API_KEY=your_new_key_here
```

**Restart your dev server** after updating!

---

### **7. Verify Usage**

**Usage tracking happens in Google Cloud Console:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select the project that your new API key belongs to
3. Go to **APIs & Services** → **Dashboard**
4. Look for **"Generative Language API"** (or "Generative AI API")
5. Click to see usage metrics

**Note:** 
- Usage can take 5-15 minutes to appear
- Each project tracks its own usage separately
- If you don't see the API listed, it might not be enabled (see step 2)

---

## 🔍 **Troubleshooting**

### **Problem: API key not working**

**Check:**
- ✅ Is the API enabled in the project?
- ✅ Are there API restrictions blocking it?
- ✅ Is the key correct in `.env`?
- ✅ Did you restart the dev server?

### **Problem: Usage not showing**

**Possible reasons:**
1. **Delayed metrics:** Usage can take 5-15 minutes to appear
2. **Wrong project:** Make sure you're checking the correct project
3. **API not enabled:** The API must be enabled for usage to track
4. **No requests yet:** Make a test request and wait

### **Problem: 404 errors**

**Solution:**
- Only `gemini-2.5-flash` works in v1beta API
- `gemini-1.5-pro` and `gemini-1.5-flash` don't exist in v1beta
- We're using `gemini-2.5-flash` (the only option)

---

## 📊 **Expected Behavior**

**After setup:**
- ✅ API key works (no 404 errors)
- ✅ Requests go through
- ✅ Usage appears in dashboard (after 5-15 min delay)
- ✅ Each project tracks its own usage separately

---

## 🎯 **Quick Checklist**

- [ ] Created new API key in [AI Studio](https://aistudio.google.com/apikey) (in new project)
- [ ] Verified API is enabled in Google Cloud Console (usually automatic)
- [ ] Updated `.env` with new key
- [ ] Restarted dev server
- [ ] Made test request
- [ ] Checked usage dashboard in Google Cloud Console (wait 5-15 min)

---

**If still not working:** Check the browser console for specific error messages!

