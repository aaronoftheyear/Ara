# 🔑 API Key Restrictions - Critical Fix

**Date:** 2025-10-15  
**Issue:** API key works in curl but fails in browser SDK  
**Root Cause:** AI Studio keys may have auto-applied restrictions

---

## ⚠️ The Problem

Your API key **works perfectly in direct API calls** (curl test succeeded), but **fails in the browser SDK**.

This indicates the key has **restrictions** that block browser usage!

---

## 🔧 Solution 1: Check & Remove Restrictions

### **Step 1: Go to Google Cloud Console**

Visit: [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

### **Step 2: Find Your API Key**

Look for your API key (starts with `AIzaSyDVdFcd...`)

### **Step 3: Click on the Key Name**

This will open the key details page

### **Step 4: Check Restrictions**

Look for these sections:

**Application Restrictions:**
- If set to "HTTP referrers" or "IP addresses" → Click "None"
- If set to "Android apps" or "iOS apps" → Click "None"

**API Restrictions:**
- If set to "Restrict key" → Either:
  - Change to "Don't restrict key" (for testing)
  - OR ensure "Generative Language API" is selected

### **Step 5: Save**

- Click "Save" button
- Wait 1-2 minutes for changes to propagate
- Restart your app and test

---

## 🔧 Solution 2: Create Unrestricted Key

### **Easier Option - Fresh Start:**

**1. Go to Google Cloud Console:**
   - [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

**2. Create New API Key:**
   - Click "CREATE CREDENTIALS" → "API Key"
   - New key will be generated

**3. Configure as Unrestricted:**
   - Click on the new key
   - **Application restrictions:** Select "None"
   - **API restrictions:** Select "Don't restrict key" (for testing)
   - Click "Save"

**4. Copy New Key:**
   - Copy the key (starts with `AIza...`)
   - Update your `.env` file:
     ```env
     GEMINI_API_KEY=your_new_unrestricted_key
     ```

**5. Restart:**
   ```bash
   npm run dev
   ```

---

## 🔧 Solution 3: Enable Generative Language API

Your key might work but the API isn't enabled:

**1. Go to:**
   [console.cloud.google.com/apis/library/generativelanguage.googleapis.com](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)

**2. Select your project** (the one your API key belongs to)

**3. Click "ENABLE"** button

**4. Wait for confirmation** (30 seconds)

**5. Restart your app** and test

---

## 💡 Why This Happens

**AI Studio vs Cloud Console Keys:**
- Keys created in AI Studio may have auto-restrictions
- Keys created in Cloud Console give you full control
- Browser usage may be blocked by default for security

**According to [Google's documentation](https://ai.google.dev/gemini-api/docs/api-key#import-projects):**
> "Only API keys that have no restrictions, or are restricted to the Generative Language API are displayed."

---

## 🎯 Recommended Action

**Create a completely new unrestricted key:**

1. Cloud Console → APIs & Services → Credentials
2. CREATE CREDENTIALS → API Key
3. Edit key → Application restrictions: **None**
4. Edit key → API restrictions: **Don't restrict key**
5. Save and copy the key
6. Replace in `.env` file
7. Test

This should resolve the issue immediately!

---

**Next:** Create unrestricted key and test

