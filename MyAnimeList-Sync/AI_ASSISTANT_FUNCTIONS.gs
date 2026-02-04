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

