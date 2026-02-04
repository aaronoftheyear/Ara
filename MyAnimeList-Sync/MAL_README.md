# MyAnimeList → Gemini Sync Solution

## 📋 What This Is

A complete Google Apps Script solution that automatically synchronizes your MyAnimeList anime collection to Google Sheets, making it accessible to Gemini AI for personalized recommendations and analysis.

## 🎯 Quick Navigation

### 🚀 **Getting Started** → [`MAL_SYNC_SUMMARY.md`](MAL_SYNC_SUMMARY.md)
Complete overview with your credentials and 5-minute setup guide.

### ⭐ **Your Script** → [`MyAnimeListSync_Configured.gs`](MyAnimeListSync_Configured.gs)
Pre-configured with your credentials. **Use this file!**

### 📖 **Step-by-Step Guide** → [`MAL_QUICK_START.md`](MAL_QUICK_START.md)
Simple setup instructions with screenshots.

### 🔧 **Troubleshooting** → [`MAL_TROUBLESHOOTING.md`](MAL_TROUBLESHOOTING.md)
Fix missing personal data, API errors, and connection issues.

### 📚 **Full Documentation** → [`MYANIMELIST_SYNC_GUIDE.md`](MYANIMELIST_SYNC_GUIDE.md)
Complete technical documentation and advanced features.

## 📂 File Structure

```
troubleshooting-project/
│
├── MyAnimeListSync_Configured.gs     ⭐ START HERE - Your configured script
├── MyAnimeListSync.gs                  Generic template version
│
├── MAL_SYNC_SUMMARY.md                 📋 Overview & quick reference
├── MAL_QUICK_START.md                  🚀 5-minute setup guide
├── MAL_TROUBLESHOOTING.md              🔧 Problem solving guide
├── MYANIMELIST_SYNC_GUIDE.md           📚 Complete documentation
├── MAL_README.md                       📖 This file
│
└── changelog.md                        📝 Development log
```

## 🎬 Quick Start (3 Steps)

### 1. Open Your Script
```
File: MyAnimeListSync_Configured.gs
Your credentials are already filled in!
```

### 2. Follow Setup Guide
```
Guide: MAL_QUICK_START.md
Time: 5-10 minutes
```

### 3. Connect to Gemini
```
Share spreadsheet → Add to Gemini Gem as knowledge
```

## ✅ What You Get

### Automatic Sync
- ✅ Every 6 hours (configurable)
- ✅ All anime statuses (watching, completed, etc.)
- ✅ Your personal ratings and dates
- ✅ Complete anime metadata

### Gemini Integration
- ✅ Personalized recommendations
- ✅ Genre analysis
- ✅ Progress tracking
- ✅ Contextual discussions

### Rich Data
- 18 columns of data per anime
- 500+ anime synced
- Genres, studios, synopsis
- MAL scores and rankings

## 🆘 Need Help?

| Problem | Solution |
|---------|----------|
| **First time setup** | Read `MAL_SYNC_SUMMARY.md` |
| **Missing personal data** | Check `MAL_TROUBLESHOOTING.md` |
| **API connection error** | Run `testAPIConnection` function |
| **Gemini can't access** | Verify spreadsheet sharing is ON |
| **Understanding how it works** | Read `MYANIMELIST_SYNC_GUIDE.md` |

## 🔑 Your Credentials

**Configured in:** `MyAnimeListSync_Configured.gs`

- Username: `Aaronoftheyear`
- Client ID: `894ab82a4b887725b1ddfd7b98ef1c1d`
- Profile: https://myanimelist.net/animelist/Aaronoftheyear

## 🛠️ Key Functions

Once script is deployed, run these from Apps Script editor:

| Function | Purpose |
|----------|---------|
| `testAPIConnection` | ✅ Test your credentials (run this first!) |
| `initialSetup` | 🚀 First-time setup and sync |
| `manualSync` | 🔄 Force immediate sync |
| `getSyncStatus` | ℹ️ Check last sync time |

## 🔄 How It Works

```
1. Script fetches your MAL data via Official API
   ↓
2. Extracts personal info (status, scores, dates)
   ↓
3. Formats into 18-column spreadsheet structure
   ↓
4. Updates Google Sheet with all anime data
   ↓
5. Repeats every 6 hours automatically
   ↓
6. Gemini accesses sheet as knowledge source
```

## 📊 Data Columns

### Personal Data (Your Info)
- My Status (Watching, Completed, etc.)
- My Score (0-10 rating)
- Episodes Watched
- My Start Date
- My Finish Date

### Anime Info (From MAL)
- MAL ID, Title, English Title
- Type, Episodes, Status
- MAL Score, Rank, Popularity
- Genres, Studios
- Synopsis, Image URL

## 🎯 Use Cases with Gemini

Ask Gemini:
- "What should I watch next based on my favorites?"
- "Analyze my genre preferences"
- "Recommend anime similar to [title] I rated highly"
- "What's in my Plan to Watch list?"
- "Track my watching progress"

## 🐛 Common Issues & Fixes

### Issue: Personal data columns empty

**Fix:** See `MAL_TROUBLESHOOTING.md` → "Missing Personal Data" section

### Issue: API test fails

**Fix:** Verify Client ID and username in script CONFIG

### Issue: Gemini can't see data

**Fix:** Ensure spreadsheet sharing is "Anyone with link can view"

## 🔒 Security Notes

- ✅ Script runs under YOUR Google account
- ✅ Client ID is for read-only access
- ✅ No sensitive tokens stored
- ⚠️ MAL profile must be PUBLIC
- ⚠️ Share spreadsheet as "view only"

## 📝 Version History

**v2.0** (2025-10-13) - Current
- Fixed personal data extraction
- Added API connection test
- Enhanced debug logging
- Created troubleshooting guide

**v1.0** (2025-10-13) - Initial
- Dual API support (MAL + Jikan)
- Automatic sync triggers
- Gemini integration ready

## 📞 Support Chain

1. **Setup Issues** → `MAL_QUICK_START.md`
2. **Data Problems** → `MAL_TROUBLESHOOTING.md`
3. **Technical Deep Dive** → `MYANIMELIST_SYNC_GUIDE.md`
4. **API Questions** → [MAL API Docs](https://myanimelist.net/apiconfig/references/api/v2)

## 🚀 Next Steps

1. ✅ Read `MAL_SYNC_SUMMARY.md` for overview
2. ✅ Copy code from `MyAnimeListSync_Configured.gs`
3. ✅ Follow `MAL_QUICK_START.md` setup steps
4. ✅ Run `testAPIConnection` to verify
5. ✅ Run `initialSetup` to sync
6. ✅ Connect to Gemini
7. ✅ Start getting AI-powered recommendations!

---

**Created for:** Aaronoftheyear  
**Status:** ✅ Ready to Deploy  
**Last Updated:** 2025-10-13

**Start here:** [`MAL_SYNC_SUMMARY.md`](MAL_SYNC_SUMMARY.md) 🎌

