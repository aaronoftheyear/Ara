# MyAnimeList to Gemini Sync - Complete Solution

## 🎯 What This Does

Automatically syncs your entire MyAnimeList anime collection to a Google Spreadsheet, enabling Gemini AI to:
- Provide personalized anime recommendations
- Analyze your viewing patterns and preferences
- Suggest what to watch next based on your ratings
- Discuss your completed anime with full context

## 📦 Files Overview

| File | Purpose |
|------|---------|
| **`MyAnimeListSync_Configured.gs`** | ⭐ **START HERE** - Script with your credentials pre-filled |
| `MyAnimeListSync.gs` | Generic version (template for others) |
| `MAL_QUICK_START.md` | Step-by-step setup (5-10 minutes) |
| `MAL_TROUBLESHOOTING.md` | Detailed troubleshooting guide |
| `MYANIMELIST_SYNC_GUIDE.md` | Complete technical documentation |
| `MAL_SYNC_SUMMARY.md` | This file - overview |

## 🚀 Quick Start (Use This!)

### Your Credentials
- **Username:** `Aaronoftheyear`
- **Client ID:** `894ab82a4b887725b1ddfd7b98ef1c1d`
- **Profile:** [https://myanimelist.net/animelist/Aaronoftheyear](https://myanimelist.net/animelist/Aaronoftheyear)

### Setup Steps (5 Minutes)

1. **Create Spreadsheet**
   - Go to [sheets.google.com](https://sheets.google.com)
   - Click "Blank spreadsheet"

2. **Add Script**
   - Extensions → Apps Script
   - Delete existing code
   - Copy ALL code from **`MyAnimeListSync_Configured.gs`**
   - Paste and Save

3. **Test Connection** ⚡
   - Select: `testAPIConnection`
   - Click: Run ▶️
   - Authorize (Review Permissions → Advanced → Allow)
   - Should see: "API Test Successful" ✅

4. **Initial Setup**
   - Select: `initialSetup`
   - Click: Run ▶️
   - Wait 30-60 seconds

5. **Verify Data** ✅
   - Check "MyAnimeList" sheet
   - Verify columns have data:
     - My Status (Watching, Completed, etc.)
     - My Score (your ratings)
     - Episodes Watched
     - Start/Finish Dates

6. **Connect to Gemini**
   - Share spreadsheet (Anyone with link can view)
   - Copy link
   - Go to [aistudio.google.com](https://aistudio.google.com)
   - Create Gem → Add Knowledge → Google Sheets
   - Paste link, select "MyAnimeList" sheet

## ✅ What Data Gets Synced

### Your Personal Data
- ✅ Watch status (Watching, Completed, On Hold, Dropped, Plan to Watch)
- ✅ Your ratings (0-10 scale)
- ✅ Episodes watched progress
- ✅ Start dates (when you began watching)
- ✅ Finish dates (when you completed)

### Anime Information
- ✅ Titles (original + English)
- ✅ Type (TV, Movie, OVA, etc.)
- ✅ Episode count
- ✅ MAL community score & rank
- ✅ Genres & studios
- ✅ Synopsis (for context)
- ✅ Cover images

## 🔄 Automatic Updates

- **Frequency:** Every 6 hours (configurable)
- **Trigger:** Time-based (automatic)
- **Manual Sync:** Run `manualSync` anytime

## 🐛 Troubleshooting

### Personal Data Missing?

**Symptoms:**
- Anime titles show but status/scores/dates are blank

**Fix:**
1. Open `MAL_TROUBLESHOOTING.md`
2. Verify you used `MyAnimeListSync_Configured.gs`
3. Run `testAPIConnection` to diagnose
4. Check execution logs (View → Logs)

### API Connection Failed?

**Common Causes:**
- Incorrect Client ID (check for typos)
- MAL profile set to private (must be public)
- MAL API temporarily down

**Fix:**
1. Verify credentials in script CONFIG section
2. Check profile privacy: [MAL Privacy Settings](https://myanimelist.net/editprofile.php?go=privacy)
3. Run `testAPIConnection` to see error details

### No Data Appearing?

**Check:**
- Username spelling: `Aaronoftheyear` (case-sensitive)
- Client ID: `894ab82a4b887725b1ddfd7b98ef1c1d`
- Execution logs for ERROR messages
- MAL profile is public

## 🔧 Useful Commands

Run these from Apps Script editor dropdown:

| Command | What It Does |
|---------|-------------|
| `testAPIConnection` | Test API credentials & show sample data |
| `initialSetup` | First-time setup (run once) |
| `manualSync` | Force immediate sync |
| `getSyncStatus` | Check last sync time |
| `setupTriggers` | Recreate automatic sync |
| `removeAllTriggers` | Stop automatic syncing |

## 📊 Spreadsheet Structure

### Sheet 1: MyAnimeList (Main Data)
18 columns of anime data sorted by status and title:
- MAL ID, Titles, Type, Episodes
- Anime Status, **My Status**, **My Score**
- **Episodes Watched**, **Start/Finish Dates**
- MAL Score, Rank, Popularity
- Genres, Studios, Synopsis, Image URL

### Sheet 2: Sync Metadata
Tracking information:
- Last Sync timestamp
- Username
- API method used
- Total entries synced

## 🤖 Using with Gemini

### Gem Instructions (Copy/Paste)

```
You have access to my complete MyAnimeList anime collection via the connected Google Sheet.

Use this data to:
- Provide personalized anime recommendations based on my viewing history and ratings
- Analyze my genre preferences and watching patterns
- Suggest what I should watch next from my "Plan to Watch" list
- Help me decide what to watch based on my mood or preferences
- Discuss anime I've completed with full context of my ratings and notes
- Track my currently watching anime and progress

When recommending anime:
- Consider my average scores per genre
- Prioritize highly-rated anime similar to ones I've scored 8+
- Avoid anime I've dropped or rated poorly
- Check my "Plan to Watch" list before suggesting new titles
```

### Example Queries to Ask Gemini

- "What should I watch next based on my highest-rated anime?"
- "Analyze my genre preferences from my completed list"
- "Recommend similar anime to [Anime Name] that I rated highly"
- "What's on my Plan to Watch list that matches my favorite genres?"
- "How many anime have I completed this year?"
- "What anime am I currently watching and how far along am I?"

## 🔒 Security & Privacy

✅ **Safe:**
- Script runs under YOUR Google account
- Only YOU have access to the Apps Script
- Client ID is for read-only access
- No authentication tokens stored

⚠️ **Important:**
- MAL profile must be PUBLIC for API access
- Share spreadsheet as "view only" for Gemini
- Never share your Client Secret (not needed for this script)

## 📈 Performance

- **Initial Sync:** 30-60 seconds (for ~500-1000 anime)
- **Auto Sync:** 6 hours (configurable)
- **API Limits:** Respects rate limits (1 second delays)
- **Reliability:** Falls back to Jikan API if MAL API fails

## 🎓 Advanced Customization

### Change Sync Frequency

In CONFIG section:
```javascript
UPDATE_INTERVAL_HOURS: 3,  // Sync every 3 hours
```

### Add Email Notifications

Uncomment in `sendErrorNotification()`:
```javascript
MailApp.sendEmail(Session.getActiveUser().getEmail(), 
  'MyAnimeList Sync Error', 
  'Error: ' + error.toString());
```

### Use Jikan API (No Client ID)

Set in CONFIG:
```javascript
MAL_CLIENT_ID: '',  // Empty = use Jikan API
```

## ❓ Support Resources

| Issue | Resource |
|-------|----------|
| Setup help | `MAL_QUICK_START.md` |
| Personal data missing | `MAL_TROUBLESHOOTING.md` |
| Technical details | `MYANIMELIST_SYNC_GUIDE.md` |
| API documentation | [MAL API Docs](https://myanimelist.net/apiconfig/references/api/v2) |
| Jikan API info | [Jikan Docs](https://docs.api.jikan.moe/) |

## 📝 Change Log

### v2.0 (2025-10-13) - Bug Fix Release
- ✅ Fixed: Personal data extraction (status, scores, dates)
- ✅ Added: `testAPIConnection()` for pre-flight checks
- ✅ Enhanced: Debug logging throughout
- ✅ Created: User-specific configured version
- ✅ Added: Comprehensive troubleshooting guide

### v1.0 (2025-10-13) - Initial Release
- ✅ Dual API support (MAL + Jikan)
- ✅ Automatic sync with time triggers
- ✅ 18-column data structure
- ✅ Gemini integration ready

## 🎉 Success Checklist

After setup, verify:

- [ ] Spreadsheet has "MyAnimeList" sheet with anime data
- [ ] "My Status" column shows: Watching, Completed, etc.
- [ ] "My Score" column shows your ratings (0-10)
- [ ] "Episodes Watched" shows your progress
- [ ] "My Start/Finish Date" columns populated (where applicable)
- [ ] "Sync Metadata" sheet shows recent sync time
- [ ] Spreadsheet shared with Gemini (view access)
- [ ] Gemini Gem has spreadsheet added as knowledge
- [ ] Gemini can answer questions about your anime list

## 🚨 Important Notes

1. **Use `MyAnimeListSync_Configured.gs`** - Your credentials are already filled in
2. **Run `testAPIConnection` FIRST** - Verifies everything works before full sync
3. **Check logs if issues occur** - View → Logs shows detailed execution info
4. **Profile must be public** - Private profiles can't be accessed via API
5. **Sync takes time** - Initial sync of 500+ anime takes 30-60 seconds

---

**Status:** ✅ Ready for Deployment  
**Last Updated:** 2025-10-13  
**Created for:** Aaronoftheyear

Your anime knowledge base awaits, Sir! 🎌

