# MyAnimeList to Google Sheets Sync - Setup Guide

## Overview
This Google Apps Script automatically synchronizes your MyAnimeList anime collection to a Google Spreadsheet, enabling Gemini AI to access your anime data as knowledge for personalized recommendations and discussions.

## Features
- ✅ Automatic synchronization every 6 hours
- ✅ Complete anime list data (watching, completed, on hold, dropped, plan to watch)
- ✅ Dual API support (Official MAL API or Jikan API)
- ✅ Comprehensive metadata (scores, genres, studios, synopsis)
- ✅ Error handling and logging
- ✅ Gemini-optimized data structure

## Setup Instructions

### Step 1: Create Google Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "MyAnimeList Sync" (or your preferred name)

### Step 2: Access Apps Script Editor
1. In your spreadsheet, click **Extensions** → **Apps Script**
2. Delete any existing code in the editor
3. Copy the entire contents of `MyAnimeListSync.gs` into the editor
4. Save the project (Ctrl/Cmd + S)

### Step 3: Configure Settings

#### Option A: Using Jikan API (No Authentication Required)
1. In the script, find the `CONFIG` object
2. Replace `'YOUR_USERNAME_HERE'` with your MyAnimeList username
3. Leave `MAL_CLIENT_ID` empty
4. Save the script

```javascript
const CONFIG = {
  MAL_USERNAME: 'your_mal_username',  // Your actual username
  MAL_CLIENT_ID: '',  // Leave empty for Jikan API
  // ... rest of config
};
```

#### Option B: Using Official MAL API (Recommended for Better Data)
1. Go to [MyAnimeList API Config](https://myanimelist.net/apiconfig)
2. Click "Create ID"
3. Fill in the form:
   - **App Name**: MyAnimeList Sync
   - **App Type**: Web
   - **App Description**: Personal anime list sync
   - **App Redirect URL**: https://script.google.com/macros/
   - **Homepage URL**: https://myanimelist.net
4. Submit and copy your **Client ID**
5. In the script, update the CONFIG:

```javascript
const CONFIG = {
  MAL_USERNAME: 'your_mal_username',
  MAL_CLIENT_ID: 'your_client_id_here',
  // ... rest of config
};
```

### Step 4: Run Initial Setup
1. In the Apps Script editor, select **initialSetup** from the function dropdown
2. Click the **Run** button (▶️)
3. When prompted, click **Review Permissions**
4. Select your Google account
5. Click **Advanced** → **Go to [Your Project Name] (unsafe)**
6. Click **Allow**
7. Wait for the script to complete (check the execution log)

### Step 5: Verify Setup
1. Return to your Google Spreadsheet
2. You should see:
   - **MyAnimeList** sheet with your anime data
   - **Sync Metadata** sheet with sync information
3. Check the "Last Sync" timestamp in the Metadata sheet

## Using with Gemini

### Step 1: Share Spreadsheet
1. Click **Share** button in Google Sheets
2. Set sharing to "Anyone with the link can view"
3. Copy the sharing link

### Step 2: Create Gemini Gem
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create a new Gem
3. In the "Knowledge" section, add your Google Sheet:
   - Click **Add Knowledge**
   - Select **Google Sheets**
   - Paste your spreadsheet link
   - Select the **MyAnimeList** sheet

### Step 3: Configure Gem Instructions
Add instructions to your Gem to utilize the anime list:

```
You have access to my complete MyAnimeList collection via the connected spreadsheet. 
Use this data to:
- Provide personalized anime recommendations based on my preferences
- Analyze my watching patterns and genre preferences  
- Suggest similar anime to ones I've rated highly
- Help me decide what to watch next from my plan to watch list
- Track my progress on currently watching anime
```

## Customization Options

### Adjust Sync Frequency
In the `CONFIG` object, modify `UPDATE_INTERVAL_HOURS`:
```javascript
UPDATE_INTERVAL_HOURS: 3,  // Sync every 3 hours
```

### Manual Sync
To manually trigger a sync:
1. In Apps Script editor, select `manualSync` function
2. Click Run button
3. Return to spreadsheet to see updated data

### Check Sync Status
To view last sync time:
1. Select `getSyncStatus` function
2. Click Run
3. Check the execution log (View → Logs)

## Spreadsheet Structure

The synchronized spreadsheet contains the following columns:

| Column | Description |
|--------|-------------|
| MAL ID | MyAnimeList unique identifier |
| Title | Original anime title |
| English Title | English localized title |
| Type | TV, Movie, OVA, etc. |
| Episodes | Total episode count |
| Anime Status | Currently Airing, Finished Airing, etc. |
| My Status | Watching, Completed, On Hold, Dropped, Plan to Watch |
| My Score | Your rating (0-10) |
| Episodes Watched | Your progress |
| My Start Date | When you started watching |
| My Finish Date | When you completed it |
| MAL Score | Community average score |
| Rank | MyAnimeList ranking |
| Popularity | Popularity ranking |
| Genres | Comma-separated genre list |
| Studios | Production studios |
| Synopsis | Anime description |
| Image URL | Cover image link |

## Troubleshooting

### Script Fails to Run
- **Check username**: Ensure your MAL username is spelled correctly
- **API limits**: Jikan API has rate limits; script includes delays
- **Permissions**: Re-run authorization if needed

### No Data Appears
- **Profile privacy**: Ensure your MAL anime list is set to public
- **Check execution logs**: View → Logs in Apps Script editor
- **Try official API**: Get MAL Client ID for more reliable access

### Sync Not Updating
- **Check triggers**: Run `setupTriggers()` to recreate automatic sync
- **View triggers**: Apps Script → Triggers (clock icon) to verify
- **Manual sync**: Use `manualSync()` to test

### Gemini Can't Access Data
- **Sharing settings**: Ensure spreadsheet is shared with link viewing
- **Correct sheet**: Select "MyAnimeList" sheet in Gemini knowledge settings
- **Refresh connection**: Remove and re-add the spreadsheet in Gemini

## Advanced Features

### Email Notifications
Uncomment the email notification code in `sendErrorNotification()`:
```javascript
function sendErrorNotification(error) {
  MailApp.sendEmail(Session.getActiveUser().getEmail(), 
    'MyAnimeList Sync Error', 
    'Error occurred during sync: ' + error.toString());
}
```

### Custom Data Fields
To add additional fields, modify the API request URLs to include more fields in the `fields` parameter.

### Multiple Users
Create separate spreadsheets for different MAL accounts by duplicating the spreadsheet and updating the username in each script.

## API Rate Limits

### Jikan API (Free, No Auth)
- **Rate Limit**: 3 requests per second, 60 per minute
- **Delay**: Script includes 1-second delays between requests
- **Reliability**: May experience downtime during MAL maintenance

### Official MAL API (Requires Client ID)
- **Rate Limit**: More generous limits
- **Reliability**: Direct access to MAL servers
- **Setup**: Requires API application approval (instant for personal use)

## Support

For issues with:
- **MyAnimeList API**: Check [MAL API Docs](https://myanimelist.net/apiconfig/references/api/v2)
- **Jikan API**: Check [Jikan Docs](https://docs.api.jikan.moe/)
- **Google Apps Script**: Check [Apps Script Docs](https://developers.google.com/apps-script)
- **Gemini Integration**: Check [AI Studio Docs](https://ai.google.dev/gemini-api/docs)

## Security Notes

- Your MAL Client ID is stored in the script (only accessible by you)
- Spreadsheet should be shared as "view only" for Gemini
- Never share your Client ID publicly
- Scripts run under your Google account permissions

## Changelog Updates

All modifications will be documented in the project changelog for future reference.

