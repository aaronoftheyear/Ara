# 🤖 Gemini Integration Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Issue 1: "Can't Access" or "Can't See" File Error

**Root Cause:** Incorrect sharing settings or sheet selection in Gemini.

**Solution:**
1. **Verify Spreadsheet Sharing:**
   - Open your Google Spreadsheet
   - Click **Share** button (top right)
   - Set to: **"Anyone with the link can view"**
   - Click **Copy link**

2. **Correct Sheet Selection in Gemini:**
   - In Gemini Gem settings, add the **MyAnimeList** sheet (not Sync Metadata)
   - Use the sharing link (not the editing link)
   - Ensure you select the correct sheet tab

### Issue 2: Gemini Not Using Attached Data

**Root Cause:** Instructions not properly referencing the knowledge source.

**Solution - Updated Instructions:**

```
You are an expert anime recommendation engine. Your tone is strictly professional and concise.

CORE TASK: Analyze my anime data from the attached Google Sheet and recommend 2-3 best anime for me to watch next.

DATA SOURCE: Use ONLY the "MyAnimeList" sheet from the attached Google Spreadsheet. This contains my complete anime list with:
- My Status (Watching, Completed, On Hold, Dropped, Plan to Watch)
- My Scores (0-10 ratings)
- Episodes Watched (my progress)
- Genres, Studios, Synopsis for each anime

ANALYSIS REQUIREMENTS:
1. Review my Completed anime to identify my preferred genres and themes
2. Check my high-rated anime (scores 8+) to understand my tastes
3. Identify patterns in my Dropped anime to avoid similar content
4. Check my Plan to Watch list to see what I'm already considering

RECOMMENDATION CRITERIA:
- Must NOT be in my Completed or Dropped lists
- Should align with genres I've rated highly
- Consider my current request (e.g., "comedy romance", "action")
- Prioritize highly-rated anime (MAL score 8.0+)

OUTPUT FORMAT:
For each recommendation (2-3 total):

**Anime Title** (DUB available if confirmed)
- **MAL Rating:** X.XX/10.00
- **Why Perfect:** [2-3 sentences based on my watch history]
- **Genres:** [3-4 key genres/themes]

If you cannot access the attached data, state: "I cannot access your anime list data. Please check the Google Sheet sharing settings."
```

### Issue 3: Knowledge Source Setup Problems

**Step-by-Step Gemini Setup:**

1. **Create New Gem:**
   - Go to [aistudio.google.com](https://aistudio.google.com)
   - Click **Create Gem**

2. **Add Knowledge:**
   - Click **Add Knowledge**
   - Select **Google Sheets**
   - Paste your spreadsheet sharing link
   - **IMPORTANT:** Select **"MyAnimeList"** sheet (not Sync Metadata)

3. **Test Connection:**
   - Ask: "Can you see my anime list data?"
   - Should respond with details about your anime

### Issue 4: Data Format Issues

**Verify Your Spreadsheet Has:**
- ✅ **MyAnimeList** sheet with anime data
- ✅ **My Status** column (Watching, Completed, etc.)
- ✅ **My Score** column (your ratings)
- ✅ **Genres** column populated
- ✅ **Synopsis** column with descriptions

**If data is missing:**
1. Run `manualSync` in your Apps Script
2. Wait 30-60 seconds
3. Refresh the spreadsheet
4. Re-add to Gemini knowledge

## 🔧 Alternative Approach: Direct Data Export

If Gemini continues to have issues, try this alternative:

### Method 1: CSV Export
1. In Google Sheets: File → Download → CSV
2. Upload CSV directly to Gemini as knowledge source
3. Use same instructions as above

### Method 2: Manual Data Sharing
1. Copy a sample of your anime data (10-15 entries)
2. Paste directly in chat with Gemini
3. Ask for recommendations based on that sample

## 📋 Verification Checklist

Before asking for recommendations:

- [ ] Spreadsheet is shared as "Anyone with link can view"
- [ ] Gemini Gem has "MyAnimeList" sheet added as knowledge
- [ ] Test question: "Can you see my anime list?"
- [ ] Gemini responds with actual anime titles from your list
- [ ] Instructions reference "attached Google Sheet" data
- [ ] MyAnimeList sheet has all personal data populated

## 🚀 Quick Test Commands

**Test 1 - Data Access:**
```
Can you see my anime list data from the attached Google Sheet? List 3 anime from my Completed list.
```

**Test 2 - Genre Analysis:**
```
Based on my anime list, what are my top 3 favorite genres?
```

**Test 3 - Recommendation:**
```
Recommend 2 anime for me based on my watch history. Make sure they're not in my Completed or Dropped lists.
```

## 📞 If Still Not Working

**Troubleshooting Steps:**
1. **Recreate Gem:** Delete current Gem, create new one
2. **Re-add Knowledge:** Remove sheet, re-add with fresh link
3. **Check Permissions:** Ensure sheet sharing is correct
4. **Verify Data:** Confirm MyAnimeList sheet has recent data
5. **Try Alternative:** Use CSV export method

**Emergency Solution:**
If all else fails, copy-paste your anime data directly into the chat and ask for recommendations based on that text data.

---

**Status:** ✅ Comprehensive troubleshooting guide created  
**Last Updated:** 2025-10-13  
**Issue:** Gemini knowledge integration problems  
**Solution:** Step-by-step setup and alternative methods

