# 🔄 Live Data Setup Guide - Auto-Updating Gemini Access

## 🎯 Solution: Auto-Updating CSV for Gemini

Your MyAnimeList data will automatically export to a CSV file that updates every 6 hours, giving Gemini access to your current data.

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Live Integration Setup
1. Open your Google Apps Script editor
2. Select `setupLiveIntegration` function
3. Click **Run ▶️**
4. Wait for "Live Integration Ready" message
5. **Copy the CSV URL** from the popup

### Step 2: Create Gemini Gem with Live Data
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Create new Gem
3. **Add Knowledge → Web URL**
4. **Paste your CSV URL** (from Step 1)
5. Gemini will access your live data

### Step 3: Test Live Updates
Ask Gemini:
```
What anime did I most recently add to my Plan to Watch list?
```

If it can answer with recent data, the live integration is working!

## 📊 How It Works

### Automatic Updates
- **Every 6 hours:** Your MyAnimeList syncs from MAL API
- **Immediately after:** CSV file exports with new data
- **Gemini access:** Always sees your current anime list

### Data Flow
```
MAL API → Google Sheets → Auto-Export CSV → Gemini Knowledge
```

## 🔧 Available Functions

### New Functions Added to Your Script:

1. **`setupLiveIntegration`** - One-time setup (run this first)
2. **`autoExportCSV`** - Manual CSV export
3. **`getLiveDataURL`** - Get the current CSV URL
4. **`setupAutoExportTrigger`** - Set up automatic exports

### Usage:

**One-Time Setup:**
```
Run: setupLiveIntegration
Result: Creates auto-updating CSV for Gemini
```

**Manual Export:**
```
Run: autoExportCSV
Result: Updates CSV with current data
```

**Get URL:**
```
Run: getLiveDataURL
Result: Shows CSV URL for Gemini
```

## 📋 Gemini Instructions

Use this prompt in your Gemini Gem:

```
You have access to my live MyAnimeList data via an auto-updating CSV file.

TASK: Analyze my current anime list and recommend based on my latest watch history.

DATA SOURCE: The attached CSV contains my complete anime collection that updates automatically every 6 hours with my latest:
- Watch status (Watching, Completed, On Hold, Dropped, Plan to Watch)
- Personal ratings (0-10 scores)
- Episodes watched progress
- Recent additions and changes

ANALYSIS REQUIRED:
1. Review my Completed anime to identify preferred genres and themes
2. Analyze my high-rated anime (8+ scores) to understand my taste patterns
3. Check my Dropped anime to identify what I dislike
4. Consider my recent additions to Plan to Watch list

RECOMMENDATION CRITERIA:
- Must NOT be in my Completed, Dropped, or Plan to Watch lists
- Should align with genres I've rated highly (8+ scores)
- Consider my current request (e.g., "comedy romance", "action", "like One Piece")
- Prioritize highly-rated anime (MAL score 8.0+)

OUTPUT FORMAT - For each recommendation:

**Anime Title** (DUB available if confirmed)
- **MAL Rating:** X.XX/10.00
- **Why Perfect:** [2-3 sentences explaining fit based on my actual watch history]
- **Genres:** [3-4 key genres/themes]
- **Based on:** [specific anime from my list that this matches]

Show me your analysis of my current preferences first, then provide recommendations.
```

## 🔍 Verification Steps

### Test 1: Data Access
```
Can you see my anime list? How many anime do I have total?
```

### Test 2: Recent Updates
```
What anime did I most recently add to my Plan to Watch list?
```

### Test 3: Preferences Analysis
```
What are my top 3 favorite genres based on my high ratings (8+)?
```

### Test 4: Recommendations
```
Recommend 2 anime based on my current watch history. Make sure they're not in my Completed or Dropped lists.
```

## 📊 Expected Results

**Good Response (Live Data Working):**
```
Based on your current anime list (674 entries), I can see you recently added [recent anime] to your Plan to Watch list.

Your current preferences show:
- Top Genres: Action (45%), Supernatural (32%), Adventure (28%)
- Recent High Ratings: [current high-rated anime]

Recommendations based on your live data:

**Hunter x Hunter** (DUB available)
- **MAL Rating:** 9.04/10.00
- **Why Perfect:** Based on your 9/10 rating for One Piece, you clearly love epic adventures with deep world-building...
- **Genres:** Action, Adventure, Supernatural, Shounen
- **Based on:** One Piece (9/10) - epic adventure preference
```

## 🛠️ Troubleshooting

### Issue: CSV not updating
**Solution:**
1. Run `autoExportCSV` manually
2. Check if triggers are set up: Look for "Auto-export trigger created" in logs
3. Verify your sheet has recent data

### Issue: Gemini can't access CSV
**Solution:**
1. Run `getLiveDataURL` to get current URL
2. Test URL in browser - should download CSV
3. Re-add URL to Gemini knowledge

### Issue: Outdated data in Gemini
**Solution:**
1. Wait 6 hours for automatic update
2. Or run `autoExportCSV` manually to force update
3. Ask Gemini to refresh its knowledge

## 📈 Benefits

### ✅ Advantages:
- **Always Current:** Data updates every 6 hours automatically
- **No Manual Work:** Set once, works forever
- **Full Dataset:** Gemini sees your complete 674 anime entries
- **Reliable Access:** CSV format is universally supported
- **Easy Testing:** Simple URL verification

### 🔄 Update Cycle:
- **Hour 0:** MAL API sync + CSV export
- **Hour 6:** MAL API sync + CSV export
- **Hour 12:** MAL API sync + CSV export
- **Continuous:** Gemini always has current data

## 🚀 Quick Start Commands

**Setup (Run Once):**
```
setupLiveIntegration
```

**Manual Update (When Needed):**
```
autoExportCSV
```

**Get URL (For Gemini):**
```
getLiveDataURL
```

---

**Status:** ✅ Live data integration ready  
**Last Updated:** 2025-10-13  
**Purpose:** Enable Gemini access to auto-updating MyAnimeList data

