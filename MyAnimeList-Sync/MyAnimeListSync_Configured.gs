/**
 * MyAnimeList to Google Sheets Synchronization Script
 * CONFIGURED VERSION FOR: Aaronoftheyear
 * 
 * Setup Instructions:
 * 1. Open Google Sheets and create a new spreadsheet
 * 2. Go to Extensions > Apps Script
 * 3. Copy this entire script into the Code.gs file
 * 4. Run 'testAPIConnection' function first to verify your credentials
 * 5. If test passes, run 'initialSetup' function to set up the sync
 * 6. The sheet will auto-update every 6 hours
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
  MAL_USERNAME: 'Aaronoftheyear',
  MAL_CLIENT_ID: '894ab82a4b887725b1ddfd7b98ef1c1d',
  SHEET_NAME: 'MyAnimeList',
  UPDATE_INTERVAL_HOURS: 6,
  API_DELAY_MS: 1000
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

/**
 * Auto-export CSV for live Gemini access
 */
function autoExportCSV() {
  Logger.log('Exporting live CSV for Gemini access...');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    Logger.log('ERROR: MyAnimeList sheet not found');
    return null;
  }
  
  // Get the data
  const data = sheet.getDataRange().getValues();
  
  // Convert to CSV
  const csvContent = data.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  
  try {
    // Find existing file or create new one
    const files = DriveApp.getFilesByName('my_anime_list_live.csv');
    let file;
    
    if (files.hasNext()) {
      file = files.next();
      file.setContent(csvContent);
      Logger.log('Updated existing CSV file');
    } else {
      file = DriveApp.createFile('my_anime_list_live.csv', csvContent, MimeType.CSV);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      Logger.log('Created new CSV file');
    }
    
    const fileUrl = file.getDownloadUrl();
    Logger.log('CSV exported: ' + fileUrl);
    
    return fileUrl;
    
  } catch (error) {
    Logger.log('ERROR exporting CSV: ' + error.toString());
    return null;
  }
}

/**
 * Setup live integration for Gemini
 */
function setupLiveIntegration() {
  Logger.log('Setting up live integration for Gemini...');
  
  try {
    // 1. Create public folder for anime data
    let folder;
    const folders = DriveApp.getFoldersByName('MyAnimeList Live Data');
    
    if (folders.hasNext()) {
      folder = folders.next();
      Logger.log('Using existing folder');
    } else {
      folder = DriveApp.createFolder('MyAnimeList Live Data');
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      Logger.log('Created new folder');
    }
    
    // 2. Export CSV to folder
    const csvUrl = autoExportCSV();
    
    // 3. Set up auto-export trigger
    setupAutoExportTrigger();
    
    Logger.log('Live integration setup complete!');
    Logger.log('Folder URL: ' + folder.getUrl());
    Logger.log('CSV URL: ' + csvUrl);
    
    SpreadsheetApp.getUi().alert('Live Integration Ready', 
      'Your anime data is now available for Gemini:\n\n' +
      'CSV URL: ' + csvUrl + '\n\n' +
      'The CSV will update automatically every 6 hours.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    
    return {
      folderUrl: folder.getUrl(),
      csvUrl: csvUrl
    };
    
  } catch (error) {
    Logger.log('ERROR setting up live integration: ' + error.toString());
    SpreadsheetApp.getUi().alert('Setup Error', 
      'Error setting up live integration: ' + error.toString(),
      SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
}

/**
 * Setup auto-export trigger
 */
function setupAutoExportTrigger() {
  // Remove existing auto-export triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'autoExportCSV') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new auto-export trigger
  ScriptApp.newTrigger('autoExportCSV')
    .timeBased()
    .everyHours(CONFIG.UPDATE_INTERVAL_HOURS)
    .create();
  
  Logger.log('Auto-export trigger created: Every ' + CONFIG.UPDATE_INTERVAL_HOURS + ' hours');
}

/**
 * Get live data URL for Gemini
 */
function getLiveDataURL() {
  try {
    const files = DriveApp.getFilesByName('my_anime_list_live.csv');
    if (files.hasNext()) {
      const file = files.next();
      const url = file.getDownloadUrl();
      Logger.log('Live data URL: ' + url);
      return url;
    } else {
      Logger.log('No live CSV file found. Run setupLiveIntegration first.');
      return null;
    }
  } catch (error) {
    Logger.log('ERROR getting live data URL: ' + error.toString());
    return null;
  }
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

/**
 * AI Studio Integration Functions
 * Enhanced functions for direct AI assistant integration
 */

// ==================== AI STUDIO INTEGRATION FUNCTIONS ====================

/**
 * Get comprehensive anime preferences analysis
 */
function getAnimePreferences() {
  Logger.log('Analyzing user anime preferences...');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    return { error: 'MyAnimeList sheet not found' };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indices
  const titleIndex = headers.indexOf('Title');
  const statusIndex = headers.indexOf('My Status');
  const scoreIndex = headers.indexOf('My Score');
  const genresIndex = headers.indexOf('Genres');
  const episodesWatchedIndex = headers.indexOf('Episodes Watched');
  const episodesIndex = headers.indexOf('Episodes');
  
  const rows = data.slice(1);
  
  // Filter data
  const highRated = rows.filter(row => row[scoreIndex] >= 8);
  const completed = rows.filter(row => row[statusIndex] === 'Completed');
  const dropped = rows.filter(row => row[statusIndex] === 'Dropped');
  const watching = rows.filter(row => row[statusIndex] === 'Watching');
  const planToWatch = rows.filter(row => row[statusIndex] === 'Plan to Watch');
  
  // Analyze genres from high-rated anime
  const genreAnalysis = {};
  highRated.forEach(row => {
    const genres = String(row[genresIndex]).split(', ');
    genres.forEach(genre => {
      const cleanGenre = genre.trim();
      if (cleanGenre && cleanGenre !== 'undefined') {
        genreAnalysis[cleanGenre] = (genreAnalysis[cleanGenre] || 0) + 1;
      }
    });
  });
  
  // Get top completed anime
  const topCompleted = completed
    .sort((a, b) => (b[scoreIndex] || 0) - (a[scoreIndex] || 0))
    .slice(0, 15)
    .map(row => ({
      title: row[titleIndex],
      score: row[scoreIndex] || 0,
      genres: row[genresIndex] || '',
      episodesWatched: row[episodesWatchedIndex] || 0,
      totalEpisodes: row[episodesIndex] || 0
    }));
  
  // Analyze dropped patterns
  const droppedGenres = {};
  dropped.forEach(row => {
    const genres = String(row[genresIndex]).split(', ');
    genres.forEach(genre => {
      const cleanGenre = genre.trim();
      if (cleanGenre && cleanGenre !== 'undefined') {
        droppedGenres[cleanGenre] = (droppedGenres[cleanGenre] || 0) + 1;
      }
    });
  });
  
  // Calculate average score
  const totalScore = completed.reduce((sum, row) => sum + (row[scoreIndex] || 0), 0);
  const avgScore = completed.length > 0 ? (totalScore / completed.length) : 0;
  
  const preferences = {
    totalAnime: rows.length,
    completedCount: completed.length,
    watchingCount: watching.length,
    planToWatchCount: planToWatch.length,
    droppedCount: dropped.length,
    highRatedCount: highRated.length,
    averageScore: Math.round(avgScore * 10) / 10,
    topGenres: Object.entries(genreAnalysis)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8),
    droppedGenres: Object.entries(droppedGenres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    topCompleted: topCompleted,
    currentlyWatching: watching.map(row => ({
      title: row[titleIndex],
      episodesWatched: row[episodesWatchedIndex] || 0,
      totalEpisodes: row[episodesIndex] || 0,
      progress: row[episodesIndex] > 0 ? Math.round(((row[episodesWatchedIndex] || 0) / row[episodesIndex]) * 100) : 0
    }))
  };
  
  Logger.log('Preferences analysis complete');
  return preferences;
}

/**
 * Get personalized recommendations based on user request
 */
function getPersonalizedRecommendations(userRequest) {
  Logger.log('Generating personalized recommendations for: ' + userRequest);
  
  const preferences = getAnimePreferences();
  
  // Analyze recommendation strategy based on request
  const strategies = analyzeRecommendationStrategy(preferences, userRequest);
  
  // Generate recommendation criteria
  const criteria = {
    preferredGenres: preferences.topGenres.slice(0, 3).map(g => g[0]),
    avoidGenres: preferences.droppedGenres.slice(0, 2).map(g => g[0]),
    targetScore: preferences.averageScore + 0.5,
    minScore: 7.5,
    requestAnalysis: userRequest.toLowerCase()
  };
  
  return {
    userPreferences: preferences,
    request: userRequest,
    strategies: strategies,
    criteria: criteria,
    recommendationNotes: generateRecommendationNotes(preferences, userRequest)
  };
}

/**
 * Analyze recommendation strategy based on user preferences and request
 */
function analyzeRecommendationStrategy(preferences, request) {
  const strategies = [];
  const requestLower = request.toLowerCase();
  
  // Genre-based strategy
  if (preferences.topGenres.length > 0) {
    strategies.push({
      type: 'genre_based',
      genres: preferences.topGenres.slice(0, 3).map(g => g[0]),
      confidence: 0.8,
      reason: 'Based on your high-rated anime'
    });
  }
  
  // Score-based strategy
  strategies.push({
    type: 'score_based',
    targetScore: preferences.averageScore + 0.5,
    confidence: 0.7,
    reason: 'Based on your average rating of ' + preferences.averageScore
  });
  
  // Request-based strategy
  if (requestLower.includes('comedy')) {
    strategies.push({
      type: 'request_based',
      genres: ['Comedy'],
      confidence: 0.9,
      reason: 'Direct request for comedy anime'
    });
  }
  
  if (requestLower.includes('action')) {
    strategies.push({
      type: 'request_based',
      genres: ['Action'],
      confidence: 0.9,
      reason: 'Direct request for action anime'
    });
  }
  
  if (requestLower.includes('romance')) {
    strategies.push({
      type: 'request_based',
      genres: ['Romance'],
      confidence: 0.9,
      reason: 'Direct request for romance anime'
    });
  }
  
  // Avoid dropped genres
  if (preferences.droppedGenres.length > 0) {
    strategies.push({
      type: 'avoidance_based',
      avoidGenres: preferences.droppedGenres.slice(0, 2).map(g => g[0]),
      confidence: 0.8,
      reason: 'Avoiding genres you frequently drop'
    });
  }
  
  return strategies;
}

/**
 * Generate recommendation notes based on analysis
 */
function generateRecommendationNotes(preferences, request) {
  const notes = [];
  
  // Top genres note
  if (preferences.topGenres.length > 0) {
    const topGenre = preferences.topGenres[0];
    notes.push(`You highly rate ${topGenre[0]} anime (${topGenre[1]} high-rated anime in this genre)`);
  }
  
  // Average score note
  notes.push(`Your average rating is ${preferences.averageScore}/10, so I'll recommend anime rated ${preferences.averageScore + 0.5}+`);
  
  // Completion rate note
  const completionRate = Math.round((preferences.completedCount / (preferences.completedCount + preferences.droppedCount)) * 100);
  notes.push(`You have a ${completionRate}% completion rate, showing good taste in anime selection`);
  
  // Request-specific notes
  const requestLower = request.toLowerCase();
  if (requestLower.includes('like') || requestLower.includes('similar')) {
    notes.push('Looking for anime similar to your favorites based on genre and theme patterns');
  }
  
  return notes;
}

/**
 * Get current sync status and data freshness
 */
function getSyncStatus() {
  Logger.log('Checking sync status...');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const metaSheet = ss.getSheetByName('Sync Metadata');
  
  if (metaSheet) {
    const lastSync = metaSheet.getRange('B2').getValue();
    const totalEntries = metaSheet.getRange('B5').getValue();
    const apiMethod = metaSheet.getRange('B3').getValue();
    
    // Calculate time since last sync
    const lastSyncDate = new Date(lastSync);
    const now = new Date();
    const hoursSinceSync = Math.round((now - lastSyncDate) / (1000 * 60 * 60));
    
    return {
      status: 'active',
      lastSync: lastSync,
      totalEntries: totalEntries,
      apiMethod: apiMethod,
      hoursSinceSync: hoursSinceSync,
      dataFreshness: hoursSinceSync < 6 ? 'fresh' : 'stale',
      nextSyncIn: Math.max(0, 6 - hoursSinceSync)
    };
  }
  
  return {
    status: 'inactive',
    error: 'Sync metadata not found'
  };
}

/**
 * Get anime data in structured format for AI analysis
 */
function getAnimeData() {
  Logger.log('Retrieving anime data for AI analysis...');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    return { error: 'MyAnimeList sheet not found' };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  const structuredData = rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return {
    headers: headers,
    data: structuredData,
    totalEntries: structuredData.length,
    lastUpdated: new Date().toISOString(),
    syncStatus: getSyncStatus()
  };
}

/**
 * Get specific anime recommendations based on criteria
 */
function getRecommendationCandidates(criteria) {
  Logger.log('Finding recommendation candidates...');
  
  // This would integrate with an anime database API
  // For now, return analysis of what to look for
  return {
    searchCriteria: criteria,
    recommendedApproach: [
      'Search MyAnimeList for anime with target genres: ' + criteria.preferredGenres.join(', '),
      'Filter by minimum score: ' + criteria.minScore,
      'Avoid genres: ' + criteria.avoidGenres.join(', '),
      'Consider anime similar to user\'s top completed anime',
      'Prioritize highly-rated anime (8.0+ MAL score)'
    ],
    nextSteps: [
      'Query MAL API for anime matching criteria',
      'Filter out user\'s completed/dropped anime',
      'Rank by score and genre match',
      'Provide top 3-5 recommendations with explanations'
    ]
  };
}

/**
 * API endpoint handler for AI Studio integration
 */
function doGet(e) {
  const action = e.parameter.action;
  
  Logger.log('API request: ' + action);
  
  try {
    let result;
    
    switch(action) {
      case 'preferences':
        result = getAnimePreferences();
        break;
        
      case 'recommendations':
        const request = e.parameter.request || '';
        result = getPersonalizedRecommendations(request);
        break;
        
      case 'status':
        result = getSyncStatus();
        break;
        
      case 'anime_data':
        result = getAnimeData();
        break;
        
      case 'candidates':
        const criteria = JSON.parse(e.parameter.criteria || '{}');
        result = getRecommendationCandidates(criteria);
        break;
        
      default:
        result = { 
          error: 'Invalid action',
          availableActions: ['preferences', 'recommendations', 'status', 'anime_data', 'candidates']
        };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('API Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Setup AI Studio integration
 */
function setupAIStudioIntegration() {
  Logger.log('Setting up AI Studio integration...');
  
  try {
    // Deploy as web app for API access
    const webAppUrl = ScriptApp.getService().getUrl();
    
    // Test all functions
    const preferences = getAnimePreferences();
    const status = getSyncStatus();
    const recommendations = getPersonalizedRecommendations('action anime');
    
    Logger.log('AI Studio integration setup complete');
    
    return {
      webAppUrl: webAppUrl,
      apiEndpoints: {
        preferences: webAppUrl + '?action=preferences',
        recommendations: webAppUrl + '?action=recommendations&request=',
        status: webAppUrl + '?action=status',
        animeData: webAppUrl + '?action=anime_data'
      },
      testResults: {
        preferences: preferences.totalAnime > 0 ? 'OK' : 'ERROR',
        status: status.status === 'active' ? 'OK' : 'ERROR',
        recommendations: recommendations.userPreferences ? 'OK' : 'ERROR'
      }
    };
    
  } catch (error) {
    Logger.log('AI Studio integration setup failed: ' + error.toString());
    return {
      error: error.toString(),
      status: 'failed'
    };
  }
}
