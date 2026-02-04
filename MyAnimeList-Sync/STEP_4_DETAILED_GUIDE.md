# 📋 Step 4: Configure Integration - Detailed Guide

## 🎯 Goal: Connect Your Google Spreadsheet to AI Studio

This guide walks you through connecting your MyAnimeList Google Sheet to Google AI Studio so the AI can directly access your anime data.

---

## 🚀 Step-by-Step Process

### Step 4.1: Get Your Spreadsheet ID

1. **Open your MyAnimeList Google Spreadsheet**
   - The one where your anime data syncs

2. **Look at the URL in your browser**
   - It looks like: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`

3. **Copy the SPREADSHEET_ID part**
   - Example URL: `https://docs.google.com/spreadsheets/d/1AbC_2XyZ3456789/edit`
   - The ID is: `1AbC_2XyZ3456789`
   - Copy this ID - you'll need it

### Step 4.2: Verify Sheet Sharing Settings

1. **Click the "Share" button** (top right of your Google Sheet)

2. **Set sharing to:**
   - **"Anyone with the link can view"**
   - OR at minimum: Give AI Studio access

3. **Why this matters:**
   - AI Studio needs permission to read your sheet
   - If not shared, the AI won't be able to access your data

### Step 4.3: Go to Google AI Studio

1. **Visit:** [aistudio.google.com](https://aistudio.google.com)

2. **Sign in** with your Google account
   - Use the same account that owns the spreadsheet

3. **You should see the AI Studio dashboard**

### Step 4.4: Create New Assistant (Not Gem)

1. **Click "Create"** or **"New Assistant"**
   - **IMPORTANT:** Choose **"Assistant"** not "Gem"
   - Assistants have better integration capabilities

2. **Name your assistant:**
   - Example: "MyAnimeList Personal Assistant"
   - Or: "Anime Recommendation Assistant"

3. **Click "Create"**

### Step 4.5: Add Google Sheets Integration

**Option A: Direct Google Sheets Connection (Recommended)**

1. **In your new assistant, look for "Add Knowledge" or "Add Tools"**

2. **Click on it and select "Google Sheets"**

3. **You'll see a connection dialog:**
   - **Option 1:** Paste your spreadsheet URL
   - **Option 2:** Paste your spreadsheet ID

4. **Enter your spreadsheet information:**
   - **Spreadsheet ID:** [paste the ID you copied in Step 4.1]
   - **Sheet Name:** `MyAnimeList` (the name of your sheet tab)

5. **Set Permissions:**
   - **Read access** is sufficient for recommendations
   - Don't need write access unless you want the AI to update your list

6. **Click "Connect" or "Add"**

**Option B: Web URL Method (Alternative)**

If direct Google Sheets isn't available:

1. **In your assistant, look for "Add Knowledge Source"**

2. **Select "Web URL" or "Link"**

3. **Paste your Google Sheet sharing link:**
   - Get it from the "Share" button
   - Should look like: `https://docs.google.com/spreadsheets/d/[ID]/edit?usp=sharing`

4. **Click "Add"**

### Step 4.6: Configure Sheet Access

1. **Select the specific sheet:**
   - Choose **"MyAnimeList"** (not "Sync Metadata")
   - This is the sheet with your actual anime data

2. **Set data refresh:**
   - If available, set to "Auto-refresh" or "Live data"
   - This ensures AI always sees current data

3. **Verify connection:**
   - AI Studio should show "Connected" or show a preview of your data
   - You might see a sample of your anime titles

### Step 4.7: Test the Connection

**Quick Test in AI Studio:**

1. **In the assistant chat, type:**
   ```
   Can you see my anime list? Tell me how many anime I have total.
   ```

2. **Expected Response:**
   - AI should respond with your actual anime count
   - Example: "I can see your anime list with 674 entries"

3. **If it works:**
   - ✅ Connection successful! Move to Step 5 (Custom Instructions)

4. **If it doesn't work:**
   - ❌ See Troubleshooting section below

---

## 🔍 Verification Checklist

Before moving to Step 5, verify:

- [ ] Spreadsheet ID copied correctly
- [ ] Spreadsheet is shared (at least "view" access)
- [ ] AI Studio assistant created (not Gem)
- [ ] Google Sheets integration added
- [ ] "MyAnimeList" sheet selected (not Sync Metadata)
- [ ] Connection shows as "Connected" or "Active"
- [ ] Test question confirms AI can see your data

---

## 🛠️ Troubleshooting

### Issue 1: "Can't access spreadsheet"

**Solutions:**
1. **Check sharing settings:**
   - Spreadsheet → Share → "Anyone with link can view"

2. **Verify spreadsheet ID:**
   - Copy it again from the URL
   - Make sure no extra characters

3. **Try web URL method:**
   - Use sharing link instead of ID

### Issue 2: "Google Sheets option not available"

**Solutions:**
1. **Try "Web URL" option instead:**
   - Use your spreadsheet sharing link
   - AI can still scrape the data

2. **Check if you're using "Assistant" not "Gem":**
   - Gems have limited integration
   - Delete and create new Assistant

3. **Deploy Apps Script as Web App:**
   - Use the API endpoint method
   - See AI_STUDIO_INTEGRATION.md for details

### Issue 3: "AI sees data but it's outdated"

**Solutions:**
1. **Refresh the spreadsheet:**
   - Go to your Google Sheet
   - Run `manualSync` in Apps Script

2. **Wait for auto-sync:**
   - Your data updates every 6 hours
   - Check sync timestamp

3. **Force AI to refresh:**
   - Disconnect and reconnect the sheet
   - Or ask: "Refresh my data and check again"

### Issue 4: "AI sees Sync Metadata instead of anime data"

**Solutions:**
1. **Select correct sheet:**
   - Must choose "MyAnimeList" sheet
   - Not "Sync Metadata" sheet

2. **Re-configure integration:**
   - Remove current connection
   - Add again, carefully select "MyAnimeList"

---

## 📊 Visual Guide

### What You're Looking For:

**In Google AI Studio:**
```
Assistant Settings
├── Name: MyAnimeList Personal Assistant
├── Knowledge Sources
│   └── Google Sheets
│       ├── Spreadsheet ID: [YOUR_ID]
│       ├── Sheet Name: MyAnimeList
│       └── Status: ✅ Connected
└── Tools
    └── Google Sheets Reader: Enabled
```

**Expected Data Preview:**
```
MyAnimeList Sheet Preview:
- MAL ID | Title | Type | Episodes | Anime Status | My Status | My Score | ...
- 31646 | 3-gatsu no Lion | TV | 22 | Finished Airing | Completed | 8 | ...
- [Your other anime entries...]
```

---

## 🎯 Next Steps

Once Step 4 is complete and verified:

1. **Proceed to Step 5:** Add Custom Instructions
2. **Copy the instruction template** from AI_STUDIO_SETUP_GUIDE.md
3. **Paste into your assistant's instructions**
4. **Test with recommendation requests**

---

## 💡 Pro Tips

1. **Use the same Google account:**
   - For spreadsheet and AI Studio
   - Simplifies permissions

2. **Keep spreadsheet organized:**
   - Don't delete "MyAnimeList" sheet
   - Don't rename it after integration

3. **Monitor sync status:**
   - Check "Sync Metadata" sheet for last update time
   - Ensure data is current before asking for recommendations

4. **Test thoroughly:**
   - Ask specific questions about your data
   - Verify AI uses YOUR data, not generic info

---

**Status:** ✅ Step 4 detailed guide complete  
**Last Updated:** 2025-10-13  
**Next:** Step 5 - Add Custom Instructions

