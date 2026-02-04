# MyAnimeList Sync Troubleshooting Guide

## Issue: Missing Personal Data (Status, Scores, Dates)

### Problem
The spreadsheet shows anime titles but **missing**:
- ❌ Watch status (Watching, Completed, Dropped, etc.)
- ❌ Your ratings/scores
- ❌ Episodes watched
- ❌ Start/finish dates

### Root Cause (CORRECTED)
The MAL API v2 returns personal list data in the `list_status` field **at the same level** as the `node` object (not nested inside it). The field must be requested with object syntax: `list_status{status,score,...}` and extracted from `item.list_status` (not `anime.my_list_status`).

### Solution Applied

**Updated Code Sections:**

1. **Enhanced API Fetching** (lines 105-164)
   - Added response code validation
   - Added debug logging for API responses
   - Shows sample data structure in logs

2. **Fixed Data Formatting** (lines 199-282)
   - Correctly access `anime.my_list_status` from API response
   - Added status mapping (watching → "Watching", etc.)
   - Added debug logging for first 2 items
   - Handle both Official MAL API and Jikan API formats

3. **Added Test Function** (`testAPIConnection`)
   - Tests API credentials before full sync
   - Shows sample response structure
   - Validates personal data is accessible

### Steps to Fix

1. **Use the Configured Script**
   - File: `MyAnimeListSync_Configured.gs`
   - Your credentials are pre-filled:
     - Username: `Aaronoftheyear`
     - Client ID: `894ab82a4b887725b1ddfd7b98ef1c1d`

2. **Test First**
   ```
   Run: testAPIConnection
   ```
   - This verifies your API credentials work
   - Shows sample data structure in logs
   - Confirms personal data is accessible

3. **Run Initial Setup**
   ```
   Run: initialSetup
   ```
   - Creates sheet structure
   - Performs first sync
   - Sets up automatic triggers

4. **Check Logs**
   - Go to: View → Logs (or Ctrl/Cmd + Enter)
   - Look for:
     ```
     ✅ Personal data (list_status) is present!
     Status: watching
     Score: 8
     
     Formatting item 0: [Anime Title]
       list_status: {"status":"watching","score":8,...}
     ```
   - This confirms personal data is being extracted

### Expected Data Structure (CORRECTED)

**Official MAL API Response:**
```javascript
{
  "node": {
    "id": 12345,
    "title": "Anime Name",
    // ... anime metadata only
  },
  "list_status": {                   // ← CRITICAL: Sibling to node, not nested!
    "status": "watching",             // → My Status column
    "score": 8,                       // → My Score column
    "num_episodes_watched": 12,       // → Episodes Watched column
    "start_date": "2024-01-15",       // → My Start Date column
    "finish_date": null               // → My Finish Date column
  }
}
```

**Field Request Syntax:**
```
fields=id,title,list_status{status,score,num_episodes_watched,start_date,finish_date}
```
Note: Object fields require `{...}` syntax to specify sub-fields.

### Verification Checklist

After running the updated script:

- [ ] **My Status** column shows: Watching, Completed, On Hold, Dropped, or Plan to Watch
- [ ] **My Score** column shows: 0-10 (your rating)
- [ ] **Episodes Watched** column shows: your progress
- [ ] **My Start Date** column shows: when you started (format: YYYY-MM-DD)
- [ ] **My Finish Date** column shows: when you completed (if applicable)

### Common Issues & Fixes

#### Issue: All personal columns are empty

**Cause:** API not returning `my_list_status` field

**Fix:**
1. Ensure your MAL profile is **public** (not private)
2. Verify Client ID is correct (check for typos)
3. Run `testAPIConnection` to see actual API response
4. Check execution logs for error messages

#### Issue: API returns 401 Unauthorized

**Cause:** Invalid Client ID

**Fix:**
1. Go to: https://myanimelist.net/apiconfig
2. Verify your Client ID: `894ab82a4b887725b1ddfd7b98ef1c1d`
3. If incorrect, update in script CONFIG section
4. Re-run `testAPIConnection`

#### Issue: API returns 404 Not Found

**Cause:** Incorrect username

**Fix:**
1. Verify username: `Aaronoftheyear`
2. Check spelling and capitalization
3. Confirm profile exists: https://myanimelist.net/animelist/Aaronoftheyear
4. Update CONFIG if needed

#### Issue: Some dates missing

**Cause:** You haven't set start/finish dates on MAL

**Fix:**
- This is normal - blank dates mean you didn't record them on MAL
- Edit anime on MAL to add dates
- Next sync will pick them up

#### Issue: Score shows 0

**Cause:** You haven't rated that anime on MAL

**Fix:**
- 0 means "not rated"
- Rate the anime on MAL (1-10)
- Next sync will update the score

### Debug Mode

To see detailed logging, check these log messages after running:

1. **API Connection:**
   ```
   API Response Code: 200
   Sample API response structure: {...}
   ```

2. **Data Extraction:**
   ```
   Formatting item 0: [Title]
     my_list_status: {"status":"completed","score":9,...}
   ```

3. **Sync Summary:**
   ```
   Total anime retrieved: 674
   Synchronization complete. 674 entries processed.
   ```

### Manual Verification

1. **Check MAL Website:**
   - Visit: https://myanimelist.net/animelist/Aaronoftheyear
   - Pick an anime you've rated
   - Note: status, score, dates

2. **Check Spreadsheet:**
   - Find same anime in spreadsheet
   - Verify data matches MAL website
   - If mismatch, check logs for errors

### Advanced: API Field Mapping (CORRECTED)

| MAL Website | API Field | Spreadsheet Column |
|-------------|-----------|-------------------|
| Status dropdown | `list_status.status` | My Status |
| Score (1-10) | `list_status.score` | My Score |
| Episodes progress | `list_status.num_episodes_watched` | Episodes Watched |
| Start date | `list_status.start_date` | My Start Date |
| Finish date | `list_status.finish_date` | My Finish Date |

**CRITICAL:** Use `item.list_status` NOT `anime.my_list_status`

### Status Value Mapping

The script converts MAL's internal status codes to readable text:

| API Value | Display Text |
|-----------|-------------|
| `watching` | Watching |
| `completed` | Completed |
| `on_hold` | On Hold |
| `dropped` | Dropped |
| `plan_to_watch` | Plan to Watch |

### Still Not Working?

1. **Share execution log:**
   - Run script
   - Go to: View → Logs
   - Copy all log output
   - Check for ERROR messages

2. **Test with Jikan API:**
   - Set `MAL_CLIENT_ID: ''` (empty string)
   - Run `initialSetup` again
   - Jikan API uses different endpoint but should work

3. **Verify MAL Privacy Settings:**
   - Go to: https://myanimelist.net/editprofile.php?go=privacy
   - Ensure "Anime List" is set to **Public**

4. **Check API Status:**
   - MAL API: https://myanimelist.net/apiconfig
   - Jikan API: https://jikan.moe/
   - Both services may have downtime

### Success Indicators

✅ **Working Correctly When:**
- All columns populated with data
- Status shows readable text (not codes)
- Scores match your MAL ratings
- Dates match your MAL records
- Logs show no ERROR messages
- API test returns 200 status code

---

## Quick Fix Commands

Run these in Apps Script editor:

| Command | Purpose |
|---------|---------|
| `testAPIConnection` | Test API & show sample data |
| `manualSync` | Force immediate sync |
| `getSyncStatus` | Check last sync time |
| `initialSetup` | Reset and re-sync everything |

---

**Last Updated:** 2025-10-13  
**Script Version:** v2.0 (Enhanced Data Extraction)

