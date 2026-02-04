# MyAnimeList → Gemini Quick Start

## 5-Minute Setup

### Step 1: Create Spreadsheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **+ Blank spreadsheet**
3. Name it "MyAnimeList Sync"

### Step 2: Add Script
1. Click **Extensions** → **Apps Script**
2. Delete existing code
3. Copy all code from `MyAnimeListSync_Configured.gs` (your credentials are pre-filled!)
4. Paste into editor
5. Save (Ctrl/Cmd + S)

### Step 3: Test Connection (NEW!)
1. Select `testAPIConnection` from dropdown
2. Click ▶️ Run
3. Click **Review Permissions** → **Advanced** → **Go to... (unsafe)** → **Allow**
4. Should show "API Test Successful" ✅

**If test fails:** See `MAL_TROUBLESHOOTING.md`

### Step 4: Run Setup
1. Select `initialSetup` from dropdown
2. Click ▶️ Run
3. Wait 30-60 seconds for first sync

### Step 5: Verify
- Check spreadsheet for **MyAnimeList** tab with your anime
- **IMPORTANT:** Verify these columns have data:
  - ✅ **My Status** (Watching, Completed, etc.)
  - ✅ **My Score** (your ratings 0-10)
  - ✅ **Episodes Watched** (your progress)
  - ✅ **My Start Date / Finish Date**
- Check **Sync Metadata** tab for last sync time

**If personal data is missing:** See `MAL_TROUBLESHOOTING.md`

### Step 6: Connect to Gemini
1. In spreadsheet, click **Share**
2. Set to "Anyone with link can view"
3. Copy link
4. Go to [aistudio.google.com](https://aistudio.google.com)
5. Create new Gem
6. Add Knowledge → Google Sheets → Paste link
7. Select "MyAnimeList" sheet

### Step 7: Add Instructions to Gem
```
You have access to my complete MyAnimeList via the connected spreadsheet.
Use this to provide personalized anime recommendations based on my tastes,
viewing history, and current watching list.
```

## Done! 🎉

Your anime list will auto-sync every 6 hours. Gemini now has full knowledge of your anime preferences!

---

## Optional: Get Better Data (Official API)

### Get MAL Client ID
1. Go to [myanimelist.net/apiconfig](https://myanimelist.net/apiconfig)
2. Click **Create ID**
3. Fill in:
   - **App Name**: MyAnimeList Sync
   - **App Type**: Web  
   - **Description**: Personal anime sync
   - **Redirect URL**: https://script.google.com/macros/
4. Submit and copy **Client ID**
5. Add to script CONFIG:
```javascript
MAL_CLIENT_ID: 'your_client_id_here',
```
6. Run `initialSetup` again

---

## Troubleshooting

**No data showing?**
- Ensure MAL profile is public
- Check username spelling
- Try official API with Client ID

**Not updating?**
- Run `manualSync` to test
- Check Apps Script triggers (clock icon)

**Gemini can't see it?**
- Verify spreadsheet sharing is ON
- Select correct "MyAnimeList" sheet in Gemini
- Wait a few minutes after adding

---

## Commands Reference

| Function | Purpose |
|----------|---------|
| `initialSetup` | First-time setup (run once) |
| `manualSync` | Force immediate sync |
| `getSyncStatus` | Check last sync time |
| `setupTriggers` | Recreate auto-sync |
| `removeAllTriggers` | Stop auto-syncing |

Run these from the Apps Script editor dropdown.

---

**Full documentation:** See `MYANIMELIST_SYNC_GUIDE.md`

