# ✅ Verify Generative Language API Setup

**You found the API! Now let's make sure everything is configured correctly.**

---

## 🔍 **Step 1: Check if API is Enabled**

1. In Google Cloud Console, you should see the **Generative Language API** page
2. Look for the status at the top:
   - ✅ **"API enabled"** → You're good!
   - ⚠️ **"Enable API"** button → Click it to enable

**If you see "Enable API":**
- Click the button
- Wait a few seconds
- Refresh the page
- Should now say "API enabled"

---

## 📊 **Step 2: Check Usage (After Making Requests)**

**Usage takes 5-15 minutes to appear:**

1. On the Generative Language API page
2. Look for **"Metrics"** or **"Usage"** tab
3. You should see:
   - Number of requests
   - API calls over time
   - Error rates

**If you don't see usage yet:**
- Make a test request in your app
- Wait 5-15 minutes
- Refresh the page
- Usage should appear

---

## 🎯 **Step 3: Verify API Key is Working**

**Test in your app:**
1. Make sure your new API key is in `.env`:
   ```env
   VITE_GEMINI_CHAT_API_KEY=your_new_key_here
   ```
2. Restart your dev server
3. Make a test request (ask for a recommendation)
4. Check browser console:
   - ✅ **No errors** → API key works!
   - ❌ **403/401** → API not enabled or key invalid
   - ❌ **404** → Wrong model (should be gemini-2.5-flash)

---

## 📈 **Step 4: Compare Usage Between Projects**

**To verify keys are using different projects:**

1. **Project A (original key):**
   - Select original project in Google Cloud Console
   - Check Generative Language API usage
   - Note the request count

2. **Project B (new key):**
   - Select new project in Google Cloud Console
   - Check Generative Language API usage
   - Note the request count

3. **Make test requests:**
   - Use recommendation feature (uses original key)
   - Use chat feature (uses new key)
   - Wait 5-15 minutes
   - Check both projects - usage should increase in different projects

---

## ✅ **What You Should See**

**If everything is working:**
- ✅ API is enabled in both projects
- ✅ API keys work (no errors in console)
- ✅ Usage appears in both projects (after 5-15 min)
- ✅ Each project tracks its own usage separately
- ✅ You have 2 separate quotas (15 req/min each = 30 total)

---

## 🎉 **Success Indicators**

**You'll know it's working when:**
1. API shows "enabled" in both projects
2. No errors when using the app
3. Usage metrics appear in both projects
4. Each project shows different usage numbers
5. You can make more requests without hitting limits as quickly

---

**Next:** Make some test requests and check the usage metrics in both projects after 5-15 minutes!

