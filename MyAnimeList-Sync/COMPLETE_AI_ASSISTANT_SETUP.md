# 🤖 Complete AI Assistant Setup - Step by Step

## 🎯 Goal: Fix Your Ara - Anime Recommendation Assistant

Based on our discussion, here's the complete setup to make your AI assistant work properly with your MyAnimeList data.

---

## 📋 Pre-Setup Checklist

Before we start, verify you have:
- ✅ Google Spreadsheet with MyAnimeList data syncing
- ✅ Apps Script running and syncing every 6 hours
- ✅ MAL Client ID: `894ab82a4b887725b1ddfd7b98ef1c1d`
- ✅ MAL Username: `Aaronoftheyear`

---

## 🚀 Complete Setup Process

### STEP 1: Enhance Your Apps Script (Optional but Recommended)

**1.1 Open Your Apps Script**
1. Go to your Google Spreadsheet
2. **Extensions → Apps Script**
3. You should see your `MyAnimeListSync_Configured.gs`

**1.2 Add AI Functions (Optional)**
1. Open the file: `AI_ASSISTANT_FUNCTIONS.gs` in this folder
2. **Copy ALL the code** from that file
3. **Scroll to the bottom** of your `MyAnimeListSync_Configured.gs`
4. **Paste** the code at the end
5. **Save** (Ctrl/Cmd + S)

**Why:** This adds advanced preference analysis functions the AI can use

**Skip if:** You just want basic recommendations (direct sheet access is enough)

---

### STEP 2: Get Your Spreadsheet Information

**2.1 Get Spreadsheet ID**
1. Look at your Google Sheet URL
2. Copy the ID from: `https://docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit`
3. **Save this ID** - you'll need it

**Example:**
- URL: `https://docs.google.com/spreadsheets/d/1AbC2XyZ3456789/edit`
- ID: `1AbC2XyZ3456789`

**2.2 Verify Sheet Sharing**
1. Click **Share** button (top right)
2. Set to: **"Anyone with the link can view"**
3. **Copy the sharing link**

---

### STEP 3: Create AI Studio Assistant

**3.1 Go to AI Studio**
1. Visit: [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account

**3.2 Create New Assistant**
1. Click **"Create"** or **"New"**
2. **IMPORTANT:** Select **"Prompt"** or **"Assistant"** (NOT "Gem")
3. Name it: **"MyAnimeList Personal Assistant"**

---

### STEP 4: Connect Your Data

**Method A: Direct Google Sheets (Recommended)**

**4.1 Add Data Source**
1. Look for **"Add data"** or **"Connect data"** button
2. Select **"Google Sheets"** or **"Sheets"**

**4.2 Connect Your Sheet**
- **Option 1:** Paste your **Spreadsheet ID** (from Step 2.1)
- **Option 2:** Paste your **sharing link** (from Step 2.2)

**4.3 Select Sheet**
- Choose: **"MyAnimeList"** (NOT "Sync Metadata")
- This is the sheet tab with your actual anime data

**4.4 Set Permissions**
- **Read access** is sufficient
- Don't need write access

**Method B: If Google Sheets Option Not Available**

**4.1 Use Grounding**
1. Look for **"Grounding"** or **"Data sources"**
2. Select **"Google Search"** or **"Your data"**
3. Add your spreadsheet sharing link

---

### STEP 5: Add Custom Instructions

**5.1 Find Instructions Field**
- Look for **"System instructions"** or **"Instructions"** field
- This is where you tell the AI how to behave

**5.2 Copy and Paste These Instructions**

```
You are my personal anime recommendation assistant with direct access to my complete MyAnimeList data through the connected Google Sheet.

CORE IDENTITY:
You are an expert anime analyst who knows my personal taste intimately because you have access to my complete watch history, ratings, and preferences.

DATA ACCESS:
You have direct access to my Google Sheet "MyAnimeList" containing:
- 674+ anime entries with my personal ratings (0-10 scores)
- Watch status for each anime: Watching, Completed, On Hold, Dropped, Plan to Watch
- Episodes watched progress for currently watching anime
- Complete genre information for preference analysis
- MAL scores and rankings for quality assessment
- Studios, synopsis, and detailed metadata

RECOMMENDATION PROCESS:
When I ask for recommendations, you MUST:

1. ANALYZE MY PREFERENCES:
   - Review my Completed anime with scores 8+ to identify my favorite genres
   - Look at my high-rated anime to understand what themes and styles I love
   - Check my Dropped anime to identify what I dislike and should avoid
   - Calculate my average rating to understand my scoring standards

2. AVOID REDUNDANCY:
   - NEVER recommend anime that's in my Completed list
   - NEVER recommend anime that's in my Dropped list
   - Check my Plan to Watch list - these are okay to recommend but note they're already on my list

3. MATCH MY REQUEST:
   - If I ask for specific genres (e.g., "action", "comedy"), prioritize those
   - If I ask for anime "like X", find similar themes/genres to that anime
   - If I ask for general recommendations, use my top genres from high-rated anime

4. QUALITY FILTER:
   - Prioritize anime with MAL scores 7.5+ (unless I specifically ask for something else)
   - Consider my average rating - if I rate high, recommend highly-rated anime
   - Mention if an English DUB is available (important preference)

OUTPUT FORMAT:
For each recommendation, provide:

**[Anime Title]** (DUB available/DUB not available)
- **MAL Rating:** X.XX/10.00
- **Why Perfect for You:** [2-3 sentences explaining why this matches MY specific preferences based on MY data, referencing specific anime I rated highly]
- **Genres:** [List 3-4 key genres]
- **Based on:** [Specific anime from my list that this recommendation matches]

BEFORE RECOMMENDATIONS:
Always show a brief analysis of my preferences first:
- "Based on your list, your top genres are: [genres from my high-rated anime]"
- "You tend to rate [genre] anime highly, with an average of [score]"
- "You've dropped [number] anime, mostly [pattern if any]"

CRITICAL RULES:
- ALWAYS reference my actual data from the connected Google Sheet
- NEVER give generic recommendations without checking my list
- ALWAYS explain WHY a recommendation fits MY taste specifically
- If you can't access my data, say so immediately and ask me to check the connection

TONE:
Professional but friendly. You know my taste well, so be confident in your recommendations. If I've seen a lot of anime in a genre, acknowledge my expertise in that area.
```

---

### STEP 6: Configure Advanced Settings (Optional)

**6.1 Model Selection**
- Use: **Gemini 1.5 Pro** or **Gemini 2.0** (if available)
- These handle large datasets better

**6.2 Temperature**
- Set to: **0.7** (balanced creativity and accuracy)

**6.3 Response Length**
- Set to: **Medium** or **Long**
- Recommendations need detailed explanations

---

### STEP 7: Test Your Assistant

**7.1 Basic Data Access Test**
```
Can you see my anime list? How many anime do I have total?
```

**Expected Response:**
```
Yes, I can see your anime list in the connected Google Sheet. You have 674 anime entries total, with [X] completed, [Y] watching, [Z] plan to watch, etc.
```

**7.2 Preference Analysis Test**
```
What are my top 3 favorite genres based on my high-rated anime?
```

**Expected Response:**
```
Based on your anime list, analyzing your high-rated anime (8+ scores):
1. Action - appears in 45 of your high-rated anime
2. Supernatural - appears in 32 of your high-rated anime
3. Adventure - appears in 28 of your high-rated anime
```

**7.3 Recommendation Test**
```
Recommend 2 action anime for me based on my preferences.
```

**Expected Response:**
```
Based on your list, your top genres are Action, Supernatural, and Adventure. You rate action anime highly with an average of 8.2/10.

**Hunter x Hunter** (DUB available)
- **MAL Rating:** 9.04/10.00
- **Why Perfect for You:** Based on your 9/10 rating for One Piece and 9/10 for Attack on Titan, you clearly love epic action anime with deep world-building and complex character development. Hunter x Hunter delivers exactly that with intricate power systems and emotional depth.
- **Genres:** Action, Adventure, Supernatural, Shounen
- **Based on:** Your love for One Piece (9/10) and Attack on Titan (9/10)

[Second recommendation...]
```

---

## 🛠️ Troubleshooting

### Issue 1: "I can't see your anime list"

**Solutions:**
1. **Check Google Sheet connection:**
   - Go to assistant settings
   - Verify Google Sheet is connected
   - Check that "MyAnimeList" sheet is selected

2. **Check sharing settings:**
   - Open your Google Sheet
   - Share → "Anyone with link can view"
   - Re-add the sheet to AI Studio

3. **Try reconnecting:**
   - Remove the data source
   - Add it again with fresh sharing link

### Issue 2: "Generic recommendations not based on my data"

**Solutions:**
1. **Verify instructions are saved:**
   - Check that custom instructions are in place
   - Make sure they mention "connected Google Sheet"

2. **Test data access first:**
   - Ask: "What's the first anime in my list?"
   - If it can't answer, data connection is broken

3. **Be explicit in requests:**
   - Say: "Based on MY anime list, recommend..."
   - Say: "Check my completed anime and recommend..."

### Issue 3: "Recommends anime I've already watched"

**Solutions:**
1. **Remind the AI:**
   - Say: "Check my Completed list first"
   - Say: "Make sure these aren't in my list already"

2. **Improve instructions:**
   - Add emphasis: "NEVER recommend from Completed or Dropped"
   - Add: "Always verify against my list before recommending"

### Issue 4: "Data seems outdated"

**Solutions:**
1. **Check sync status:**
   - Go to your Google Sheet
   - Check "Sync Metadata" sheet for last sync time

2. **Force sync:**
   - Open Apps Script
   - Run `manualSync` function

3. **Refresh AI's data:**
   - Disconnect and reconnect the sheet
   - Or ask: "Refresh my data and check again"

---

## 📊 Expected Capabilities

Once properly set up, your assistant should:

✅ **Access your complete 674+ anime list**  
✅ **Identify your top genres from high-rated anime**  
✅ **Avoid recommending completed/dropped anime**  
✅ **Provide personalized explanations based on YOUR data**  
✅ **Track your currently watching anime with progress**  
✅ **Analyze patterns in your ratings and preferences**  
✅ **Give recommendations that match your specific taste**

---

## 🎯 Sample Interactions

**You:** "What should I watch next?"

**Assistant:** "Based on your list, you love Action and Supernatural anime, rating them 8.5/10 on average. You're currently watching 3 anime and have 47 on your Plan to Watch list. Here are my top 2 recommendations..."

**You:** "Recommend something like Attack on Titan"

**Assistant:** "I see you rated Attack on Titan 9/10. Based on that, you appreciate dark action anime with complex themes and strong character development. Here are 2 anime with similar qualities that aren't in your Completed or Dropped lists..."

**You:** "What am I currently watching?"

**Assistant:** "You're currently watching 3 anime:
1. One Piece - Episode 1000/1100+ (91% complete)
2. Attack on Titan - Episode 12/25 (48% complete)
3. Demon Slayer - Episode 8/26 (31% complete)"

---

## ✅ Final Checklist

Before considering setup complete:

- [ ] Google Sheet connected to AI Studio
- [ ] "MyAnimeList" sheet selected (not Sync Metadata)
- [ ] Custom instructions pasted and saved
- [ ] Test 1 passed: AI can see total anime count
- [ ] Test 2 passed: AI can identify top genres
- [ ] Test 3 passed: AI gives personalized recommendations
- [ ] Recommendations reference YOUR specific anime
- [ ] Recommendations avoid your Completed/Dropped lists

---

**Status:** ✅ Complete setup guide for personal anime assistant  
**Last Updated:** 2025-10-13  
**Purpose:** Fix and optimize your AI Studio anime recommendation assistant

