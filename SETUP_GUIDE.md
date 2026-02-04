# 🚀 Ara - Anime Recommendation Assistant Setup Guide

## Quick Setup for AI Studio

### Step 1: Upload to AI Studio

1. **Zip the entire folder** (`personal-anime-assistant`)
2. **Go to AI Studio** at [aistudio.google.com](https://aistudio.google.com)
3. **Create new project** or **Import existing**
4. **Upload the zip file**

### Step 2: Configure Google Sheet Connection

1. **In AI Studio, add your Google Sheet:**
   - Look for **"Add data"** or **"Connect data"**
   - Select **"Google Sheets"**
   - **Paste your spreadsheet ID** or sharing link
   - **Select "MyAnimeList" sheet** (not Sync Metadata)

2. **Verify your sheet is shared:**
   - Google Sheet → Share → "Anyone with the link can view"

### Step 3: Set Environment Variables

1. **Get your Gemini API key:**
   - Go to [AI Studio API keys](https://aistudio.google.com/app/apikey)
   - Create new API key
   - Copy the key

2. **Set in AI Studio:**
   - Look for environment variables or config
   - Add: `API_KEY=your_gemini_api_key_here`

### Step 4: Test the Assistant

**Test Data Access:**
```
Can you see my anime list? How many anime do I have total?
```

**Test Recommendations:**
```
Recommend 2 action anime for me based on my preferences.
```

**Expected Response:**
```
Based on your list, your top genres are: Action (45%), Supernatural (32%), Adventure (28%)

**Hunter x Hunter** (DUB available)
- **MAL Rating:** 9.04/10.00
- **Why Perfect for You:** Based on your 9/10 rating for Attack on Titan and One Piece, you clearly love epic action anime with deep world-building and complex character development.
- **Genres:** Action, Adventure, Supernatural, Shounen
- **Based on:** Attack on Titan (9/10) and One Piece (9/10)
```

## Key Features

### ✅ What the Assistant Can Do:
- **Analyze your complete MyAnimeList data** (674+ entries)
- **Identify your genre preferences** from high-rated anime
- **Avoid recommending completed/dropped** anime
- **Provide personalized explanations** based on your data
- **Track currently watching** anime progress
- **Match recommendations to your specific requests**

### 🎯 Sample Interactions:

**Preference Analysis:**
```
"What are my top 3 favorite genres?"
```

**Genre-Specific Recommendations:**
```
"Recommend 2 comedy anime for me"
```

**Similar Anime Suggestions:**
```
"Recommend something like Attack on Titan"
```

**Progress Checking:**
```
"What am I currently watching?"
```

## Troubleshooting

### Issue: "Can't access your data"
**Solutions:**
1. Check Google Sheet sharing: "Anyone with link can view"
2. Verify "MyAnimeList" sheet is selected (not Sync Metadata)
3. Re-add the sheet connection in AI Studio

### Issue: "Generic recommendations"
**Solutions:**
1. Ask: "Based on MY anime list, recommend..."
2. Verify the assistant can see your data first
3. Check that custom instructions are loaded

### Issue: "Recommends anime I've watched"
**Solutions:**
1. Remind: "Check my Completed list first"
2. Ask: "Make sure these aren't in my list already"

## Configuration Details

### System Instructions
The assistant is configured with detailed instructions to:
- Always reference your actual Google Sheet data
- Analyze your preference patterns from ratings
- Avoid recommending completed/dropped anime
- Provide detailed explanations for each recommendation
- Match recommendations to your specific requests

### API Settings
- **Model**: Gemini 2.5 Flash
- **Temperature**: 0.7 (balanced creativity)
- **Response Format**: JSON with markdown recommendations
- **Data Source**: Connected Google Sheet

## Expected Capabilities

Once properly set up, your assistant will:

✅ **Access your complete anime list** (674+ entries)  
✅ **Analyze your rating patterns** and preferences  
✅ **Avoid redundant recommendations** (completed/dropped)  
✅ **Provide personalized explanations** based on YOUR data  
✅ **Track your progress** on currently watching anime  
✅ **Match recommendations** to your specific genre requests  
✅ **Reference your actual anime** in explanations  

## Quick Start Commands

After setup, try these:

1. **"Can you see my anime list?"**
2. **"What are my favorite genres?"**
3. **"Recommend 2 anime for me"**
4. **"What am I currently watching?"**
5. **"Recommend something like [your favorite anime]"**

---

**Status:** ✅ Ready for AI Studio upload  
**Last Updated:** 2025-10-13  
**Purpose:** Complete setup guide for personal anime assistant
