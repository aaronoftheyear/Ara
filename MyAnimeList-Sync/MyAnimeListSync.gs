/**
 * MyAnimeList to Google Sheets Synchronization Script
 * 
 * This script fetches your MyAnimeList data and maintains a synchronized Google Spreadsheet
 * for use with Gemini AI knowledge integration.
 * 
 * Setup Instructions:
 * 1. Open Google Sheets and create a new spreadsheet
 * 2. Go to Extensions > Apps Script
 * 3. Copy this entire script into the Code.gs file
 * 4. Update the CONFIG object with your MyAnimeList username
 * 5. Optional: Add your MAL Client ID for API access (get from https://myanimelist.net/apiconfig)
 * 6. Run 'initialSetup' function once to authorize and set up triggers
 * 7. The sheet will auto-update every 6 hours
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
  MAL_USERNAME: 'YOUR_USERNAME_HERE',  // Replace with your MyAnimeList username
  MAL_CLIENT_ID: '',  // Optional: Your MAL API Client ID for enhanced access
  SHEET_NAME: 'MyAnimeList',
  UPDATE_INTERVAL_HOURS: 6,
  API_DELAY_MS: 1000  // Delay between API calls to respect rate limits
};

// ==================== MAIN FUNCTIONS ====================

/**
 * Initial setup function - Run this once manually
 */
function initialSetup() {
  Logger.log('Commencing initial setup protocol...');
  
  // Create the main sheet if it doesn't exist
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  
  // Set up headers
  setupHeaders(sheet);
  
  // Initial sync
  syncMyAnimeList();
  
  // Set up automatic triggers
  setupTriggers();
  
  Logger.log('Initial setup complete. Automatic synchronization activated.');
  SpreadsheetApp.getUi().alert('Setup Complete', 
    'MyAnimeList sync initialized. Data will update every ' + CONFIG.UPDATE_INTERVAL_HOURS + ' hours.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Main synchronization function
 */
function syncMyAnimeList() {
  Logger.log('Initiating MyAnimeList synchronization...');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    Logger.log('ERROR: Sheet not found. Run initialSetup first.');
    return;
  }
  
  try {
    let animeData;
    
    if (CONFIG.MAL_CLIENT_ID) {
      // Use official API if client ID is provided
      animeData = fetchFromOfficialAPI();
    } else {
      // Use Jikan API (unofficial but no auth required)
      animeData = fetchFromJikanAPI();
    }
    
    if (animeData && animeData.length > 0) {
      updateSheet(sheet, animeData);
      
      // Update metadata
      const metaSheet = getOrCreateMetadataSheet(ss);
      updateMetadata(metaSheet);
      
      Logger.log(`Synchronization complete. ${animeData.length} entries processed.`);
    } else {
      Logger.log('WARNING: No data retrieved from MyAnimeList.');
    }
    
  } catch (error) {
    Logger.log('ERROR during sync: ' + error.toString());
    sendErrorNotification(error);
  }
}

// ==================== API FUNCTIONS ====================

/**
 * Fetch data using official MyAnimeList API
 */
function fetchFromOfficialAPI() {
  Logger.log('Accessing official MyAnimeList API...');
  
  const animeData = [];
  const statuses = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'];
  
  for (const status of statuses) {
    Logger.log(`Fetching ${status} anime...`);
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      // CRITICAL: For animelist endpoint, use 'list_status' NOT 'my_list_status'
      // URL encode the fields parameter to handle special characters
      const fields = encodeURIComponent('id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,list_status{status,score,num_episodes_watched,start_date,finish_date,is_rewatching,updated_at},num_episodes,start_season,broadcast,source,average_episode_duration,rating,studios');
      const url = `https://api.myanimelist.net/v2/users/${CONFIG.MAL_USERNAME}/animelist?status=${status}&limit=100&offset=${offset}&fields=${fields}`;
      
      const options = {
        method: 'get',
        headers: {
          'X-MAL-CLIENT-ID': CONFIG.MAL_CLIENT_ID
        },
        muteHttpExceptions: true
      };
      
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      Logger.log(`API Response Code: ${responseCode}`);
      
      if (responseCode !== 200) {
        Logger.log(`ERROR: API returned ${responseCode}: ${responseText}`);
        hasMore = false;
        continue;
      }
      
      const json = JSON.parse(responseText);
      
      if (json.data && json.data.length > 0) {
        // Debug: Log first item structure
        if (offset === 0 && animeData.length === 0) {
          Logger.log('Sample API response structure: ' + JSON.stringify(json.data[0]).substring(0, 500));
        }
        
        animeData.push(...json.data);
        Logger.log(`  Retrieved ${json.data.length} items for ${status} (offset ${offset})`);
        offset += 100;
        
        if (!json.paging || !json.paging.next) {
          hasMore = false;
        }
        
        Utilities.sleep(CONFIG.API_DELAY_MS);
      } else {
        hasMore = false;
      }
    }
  }
  
  Logger.log(`Total anime retrieved: ${animeData.length}`);
  return formatOfficialAPIData(animeData);
}

/**
 * Fetch data using Jikan API (unofficial, no auth required)
 */
function fetchFromJikanAPI() {
  Logger.log('Accessing Jikan API (unofficial MAL API)...');
  
  const animeData = [];
  const statuses = ['watching', 'completed', 'onhold', 'dropped', 'plantowatch'];
  
  for (const status of statuses) {
    const url = `https://api.jikan.moe/v4/users/${CONFIG.MAL_USERNAME}/animelist/${status}`;
    
    try {
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      const json = JSON.parse(response.getContentText());
      
      if (json.data && json.data.length > 0) {
        animeData.push(...json.data);
      }
      
      // Jikan has strict rate limits - wait between requests
      Utilities.sleep(CONFIG.API_DELAY_MS);
      
    } catch (error) {
      Logger.log(`Error fetching ${status}: ${error}`);
    }
  }
  
  return formatJikanAPIData(animeData);
}

// ==================== DATA FORMATTING ====================

function formatOfficialAPIData(data) {
  return data.map((item, index) => {
    const anime = item.node;
    // CRITICAL FIX: Personal data is in item.list_status, NOT anime.my_list_status
    const myListStatus = item.list_status;
    
    // Debug logging for first few items
    if (index < 2) {
      Logger.log(`Formatting item ${index}: ${anime.title}`);
      Logger.log(`  list_status: ${JSON.stringify(myListStatus)}`);
    }
    
    // Convert MAL status to readable format
    const statusMap = {
      'watching': 'Watching',
      'completed': 'Completed',
      'on_hold': 'On Hold',
      'dropped': 'Dropped',
      'plan_to_watch': 'Plan to Watch'
    };
    
    return {
      id: anime.id,
      title: anime.title,
      englishTitle: anime.alternative_titles?.en || '',
      type: anime.media_type || '',
      episodes: anime.num_episodes || 0,
      status: anime.status || '',
      myStatus: statusMap[myListStatus?.status] || myListStatus?.status || '',
      myScore: myListStatus?.score || 0,
      myEpisodesWatched: myListStatus?.num_episodes_watched || 0,
      myStartDate: myListStatus?.start_date || '',
      myFinishDate: myListStatus?.finish_date || '',
      score: anime.mean || 0,
      rank: anime.rank || 0,
      popularity: anime.popularity || 0,
      genres: anime.genres?.map(g => g.name).join(', ') || '',
      studios: anime.studios?.map(s => s.name).join(', ') || '',
      synopsis: anime.synopsis || '',
      imageUrl: anime.main_picture?.medium || ''
    };
  });
}

function formatJikanAPIData(data) {
  // Jikan status mapping
  const statusMap = {
    1: 'Watching',
    2: 'Completed',
    3: 'On Hold',
    4: 'Dropped',
    6: 'Plan to Watch'
  };
  
  return data.map((item, index) => {
    const anime = item.anime || item;
    
    // Debug logging for first few items
    if (index < 2) {
      Logger.log(`Jikan formatting item ${index}: ${anime.title}`);
      Logger.log(`  watching_status: ${item.watching_status}, score: ${item.score}`);
    }
    
    return {
      id: anime.mal_id,
      title: anime.title,
      englishTitle: anime.title_english || '',
      type: anime.type || '',
      episodes: anime.episodes || 0,
      status: anime.status || '',
      myStatus: statusMap[item.watching_status] || item.watching_status || '',
      myScore: item.score || 0,
      myEpisodesWatched: item.watched_episodes || 0,
      myStartDate: item.start_date || '',
      myFinishDate: item.finish_date || '',
      score: anime.score || 0,
      rank: anime.rank || 0,
      popularity: anime.popularity || 0,
      genres: anime.genres?.map(g => g.name).join(', ') || '',
      studios: anime.studios?.map(s => s.name).join(', ') || '',
      synopsis: anime.synopsis || '',
      imageUrl: anime.images?.jpg?.image_url || ''
    };
  });
}

// ==================== SHEET MANAGEMENT ====================

function setupHeaders(sheet) {
  const headers = [
    'MAL ID',
    'Title',
    'English Title',
    'Type',
    'Episodes',
    'Anime Status',
    'My Status',
    'My Score',
    'Episodes Watched',
    'My Start Date',
    'My Finish Date',
    'MAL Score',
    'Rank',
    'Popularity',
    'Genres',
    'Studios',
    'Synopsis',
    'Image URL'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

function updateSheet(sheet, animeData) {
  Logger.log('Updating spreadsheet data...');
  
  // Clear existing data (except headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  // Prepare data rows
  const rows = animeData.map(anime => [
    anime.id,
    anime.title,
    anime.englishTitle,
    anime.type,
    anime.episodes,
    anime.status,
    anime.myStatus,
    anime.myScore,
    anime.myEpisodesWatched,
    anime.myStartDate,
    anime.myFinishDate,
    anime.score,
    anime.rank,
    anime.popularity,
    anime.genres,
    anime.studios,
    anime.synopsis,
    anime.imageUrl
  ]);
  
  // Write data to sheet
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  // Sort by My Status and Title
  const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
  range.sort([{column: 7, ascending: true}, {column: 2, ascending: true}]);
}

function getOrCreateMetadataSheet(ss) {
  let metaSheet = ss.getSheetByName('Sync Metadata');
  
  if (!metaSheet) {
    metaSheet = ss.insertSheet('Sync Metadata');
    metaSheet.getRange('A1:B1').setValues([['Property', 'Value']]).setFontWeight('bold');
  }
  
  return metaSheet;
}

function updateMetadata(metaSheet) {
  const metadata = [
    ['Last Sync', new Date().toLocaleString()],
    ['Username', CONFIG.MAL_USERNAME],
    ['API Method', CONFIG.MAL_CLIENT_ID ? 'Official MAL API' : 'Jikan API'],
    ['Total Entries', SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME).getLastRow() - 1]
  ];
  
  metaSheet.getRange(2, 1, metadata.length, 2).setValues(metadata);
}

// ==================== TRIGGER MANAGEMENT ====================

function setupTriggers() {
  // Remove existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'syncMyAnimeList') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new time-based trigger
  ScriptApp.newTrigger('syncMyAnimeList')
    .timeBased()
    .everyHours(CONFIG.UPDATE_INTERVAL_HOURS)
    .create();
  
  Logger.log(`Trigger established: Sync every ${CONFIG.UPDATE_INTERVAL_HOURS} hours`);
}

function removeAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  Logger.log('All triggers removed');
}

// ==================== ERROR HANDLING ====================

function sendErrorNotification(error) {
  // Optional: Send email notification on error
  // MailApp.sendEmail(Session.getActiveUser().getEmail(), 
  //   'MyAnimeList Sync Error', 
  //   'Error occurred during sync: ' + error.toString());
  
  Logger.log('Error logged: ' + error.toString());
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Manual trigger function for testing
 */
function manualSync() {
  syncMyAnimeList();
  SpreadsheetApp.getUi().alert('Sync Complete', 
    'MyAnimeList data has been synchronized.', 
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Get current sync status
 */
function getSyncStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const metaSheet = ss.getSheetByName('Sync Metadata');
  
  if (metaSheet) {
    const lastSync = metaSheet.getRange('B2').getValue();
    Logger.log('Last sync: ' + lastSync);
    return lastSync;
  }
  
  return 'No sync data available';
}

/**
 * Test API connection and credentials
 */
function testAPIConnection() {
  Logger.log('Testing API connection...');
  
  // IMPORTANT: For animelist endpoint, personal data is in 'list_status' NOT 'my_list_status'
  // URL encode the fields parameter to handle special characters
  const fields = encodeURIComponent('id,title,list_status{status,score,num_episodes_watched,start_date,finish_date}');
  const url = `https://api.myanimelist.net/v2/users/${CONFIG.MAL_USERNAME}/animelist?limit=1&fields=${fields}`;
  
  Logger.log('Request URL: ' + url);
  
  const options = {
    method: 'get',
    headers: {
      'X-MAL-CLIENT-ID': CONFIG.MAL_CLIENT_ID
    },
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log(`API Test Response Code: ${responseCode}`);
    Logger.log(`API Test Response: ${responseText.substring(0, 800)}`);
    
    if (responseCode === 200) {
      const json = JSON.parse(responseText);
      if (json.data && json.data.length > 0) {
        const firstItem = json.data[0];
        Logger.log('SUCCESS: API connection working!');
        Logger.log('Sample data structure:');
        Logger.log(JSON.stringify(firstItem, null, 2));
        
        // Check if list_status exists
        if (firstItem.list_status) {
          Logger.log('✅ Personal data (list_status) is present!');
          Logger.log('Status: ' + firstItem.list_status.status);
          Logger.log('Score: ' + firstItem.list_status.score);
          
          SpreadsheetApp.getUi().alert('API Test Successful ✅', 
            'Connected to MyAnimeList API successfully!\n\n' +
            'Username: ' + CONFIG.MAL_USERNAME + '\n' +
            'Personal data extraction: WORKING\n' +
            'Sample anime: ' + firstItem.node.title + '\n' +
            'Your status: ' + firstItem.list_status.status + '\n' +
            'Your score: ' + (firstItem.list_status.score || 'Not rated'),
            SpreadsheetApp.getUi().ButtonSet.OK);
        } else {
          Logger.log('⚠️ WARNING: list_status field is missing!');
          SpreadsheetApp.getUi().alert('API Test - Warning', 
            'API connected but personal data (list_status) is missing.\n\n' +
            'This may indicate an API permission issue.',
            SpreadsheetApp.getUi().ButtonSet.OK);
        }
      }
    } else {
      Logger.log('ERROR: API test failed with code ' + responseCode);
      SpreadsheetApp.getUi().alert('API Test Failed', 
        'API returned error code: ' + responseCode + '\n\n' +
        'Response: ' + responseText,
        SpreadsheetApp.getUi().ButtonSet.OK);
    }
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    SpreadsheetApp.getUi().alert('API Test Error', 
      'Error testing API: ' + error.toString(),
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

