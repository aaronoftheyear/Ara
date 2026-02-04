// Buddy Selection Service for System 3.0
// Implements the "best buddy" algorithm for character referrals

import { getBuddiesForCharacter, BuddyPreference } from '../data/characterBuddies';
import { getCharacterExpertise, CHARACTER_EXPERTISE } from '../data/characterExpertise';
import { detectSpecialty, SPECIALTIES } from '../data/characterSpecialties';
import type { CharacterExpertise as CharacterExpertiseType } from '../data/characterExpertise';

// Type for genre matching
type GenreKey = keyof CharacterExpertiseType['genres'];

const GENRE_PRIORITY: Record<string, string[]> = {
  sliceoflife: ['shinpachi', 'marin'],
  idol: ['shinpachi'],
  idolmusic: ['shinpachi'],
  idolperformances: ['shinpachi'],
  magicalgirl: ['marin'],
  mecha: ['kinta'],
  fanservice: ['marin', 'rudeus', 'kanbaru'],
  ecchi: ['marin', 'rudeus', 'kanbaru'],
  harem: ['rudeus', 'kanbaru'],
  sports: ['kanbaru', 'shinpachi'],
};

/**
 * Selects the best buddy for a given set of requested genres
 * Returns the buddy that best matches the requested genres
 */
export function selectBestBuddy(
  requestedGenres: string[],
  currentCharacterId: string,
  isMangaRequest: boolean = false
): BuddyPreference | null {
  const buddies = getBuddiesForCharacter(currentCharacterId);
  
  if (buddies.length === 0) {
    return null;
  }
  
  // Filter buddies based on manga/anime context
  let relevantBuddies = buddies;
  
  // For Veldora/Kakashi, filter by manga vs anime
  if (currentCharacterId === 'veldora' || currentCharacterId === 'kakashi') {
    if (isMangaRequest) {
      // Only progressive buddies for manga requests (Kakashi/Veldora mutual referrals)
      relevantBuddies = buddies.filter(b => 
        b.type === 'progressive' && b.note?.includes('manga')
      );
    } else {
      // Only back referrals for anime requests
      relevantBuddies = buddies.filter(b => 
        b.type === 'back_referral' || b.type === 'special'
      );
    }
  }
  
  // Score each buddy based on how well they match the requested genres
  const normalizedRequested = requestedGenres.map(normalizeGenreName);

  const scoredBuddies = relevantBuddies.map(buddy => {
    const buddyExpertise = getCharacterExpertise(buddy.characterId);
    if (!buddyExpertise) {
      return { buddy, score: 0, matchingGenres: 0 };
    }
    
    let matchingGenres = 0;
    let totalScore = 0;
    
    // Check how many requested genres the buddy is strong in
    for (const genre of requestedGenres) {
      const genreKey = normalizeGenreName(genre) as GenreKey;
      if (genreKey && buddyExpertise.genres[genreKey]) {
        const rating = buddyExpertise.genres[genreKey];
        if (rating === '+') {
          matchingGenres++;
          totalScore += 10; // High score for strength
        } else if (rating === '0') {
          totalScore += 1; // Low score for neutral
        }
        // Negative rating gets 0 points
      }
    }
    
    // Bonus for matching buddy.genres (the genres listed in the buddy definition)
    const buddyGenreMatches = buddy.genres.filter(bg => 
      requestedGenres.some(rg => bg.toLowerCase().includes(rg.toLowerCase()))
    ).length;
    
    totalScore += buddyGenreMatches * 5;

    // Apply explicit genre priority overrides
    for (const genre of normalizedRequested) {
      const priorityList = GENRE_PRIORITY[genre];
      if (!priorityList) continue;
      const priorityIndex = priorityList.indexOf(buddy.characterId);
      if (priorityIndex === -1) continue;
      totalScore += 40 - priorityIndex * 5; // strong bias toward earlier entries
    }
    
    // Factor in rank (lower rank = better)
    const rankPenalty = (buddy.rank - 1) * 2;
    totalScore -= rankPenalty;
    
    return { buddy, score: totalScore, matchingGenres };
  });
  
  // Sort by:
  // 1. Number of matching genres (more = better)
  // 2. Total score (higher = better)
  // 3. Rank (lower = better)
  scoredBuddies.sort((a, b) => {
    if (a.matchingGenres !== b.matchingGenres) {
      return b.matchingGenres - a.matchingGenres;
    }
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    return a.buddy.rank - b.buddy.rank;
  });
  
  // Return the best buddy if score > 0, otherwise null
  const best = scoredBuddies[0];
  return (best && best.score > 0) ? best.buddy : null;
}

/**
 * Check if a specialty should trigger for the current request
 */
export function checkSpecialtyTrigger(
  userInput: string,
  currentCharacterId: string
): { characterId: string; specialSequence: boolean } | null {
  const specialty = detectSpecialty(userInput);
  
  if (!specialty) {
    return null;
  }
  
  // Check if current character has this as a weakness (for if_weakness specialties)
  if (specialty.triggerCondition === 'if_weakness') {
    const currentExpertise = getCharacterExpertise(currentCharacterId);
    if (!currentExpertise) {
      return null;
    }
    
    // Check if any of the specialty keywords relate to a genre the character is weak in
    // This is a simplified check - the AI will do the actual genre mapping
    const hasWeakness = Object.entries(currentExpertise.genres).some(
      ([genre, rating]) => rating === '-'
    );
    
    if (!hasWeakness) {
      return null;
    }
  }
  
  return {
    characterId: specialty.characterId,
    specialSequence: specialty.specialSequence || false,
  };
}

/**
 * Normalize genre names to match expertise keys
 */
function normalizeGenreName(genre: string): string {
  const normalized = genre
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
    .trim();
  
  // Map common variations to standard keys
  const genreMap: { [key: string]: string } = {
    'romcom': 'romance',
    'romantic': 'romance',
    'sliceoflife': 'sliceOfLife',
    'sol': 'sliceOfLife',
    'scifi': 'sciFi',
    'sciencefiction': 'sciFi',
    'actionadventure': 'action',
    'battleshonen': 'battleShonen',
    'magicalgirl': 'magicalGirl',
    'mahoushojo': 'magicalGirl',
    'virtualreality': 'virtualReality',
    'vr': 'virtualReality',
  };
  
  return genreMap[normalized] || normalized;
}

/**
 * Detect if request is about manga (vs anime)
 */
export function isMangaRequest(userInput: string): boolean {
  const lowerInput = userInput.toLowerCase();
  return lowerInput.includes('manga') || 
         lowerInput.includes('comic') ||
         lowerInput.includes('manhwa') ||
         lowerInput.includes('manhua');
}

/**
 * Extract genres from user input
 * This is a helper - the AI will do the actual genre detection
 */
export function extractGenresFromInput(userInput: string): string[] {
  const lowerInput = userInput.toLowerCase();
  const detectedGenres: string[] = [];
  
  // Common genre keywords
  const genreKeywords = [
    'romance', 'action', 'comedy', 'drama', 'fantasy', 'scifi', 'sci-fi',
    'horror', 'thriller', 'mystery', 'supernatural', 'slice of life',
    'isekai', 'mecha', 'sports', 'music', 'idol', 'school', 'military',
    'psychological', 'seinen', 'shonen', 'shojo', 'josei', 'ecchi',
    'harem', 'adventure', 'cyberpunk', 'magical girl'
  ];
  
  for (const keyword of genreKeywords) {
    if (lowerInput.includes(keyword)) {
      detectedGenres.push(keyword);
    }
  }
  
  return detectedGenres;
}

/**
 * Detect era/year/season requests from user input
 */
export interface EraRequest {
  era: string | null;
  year: number | null;
  season: string | null;
}

export function detectEraRequest(userInput: string): EraRequest {
  const lowerInput = userInput.toLowerCase();
  const result: EraRequest = { era: null, year: null, season: null };
  
  // Detect explicit era mentions
  if (lowerInput.includes('origins') || lowerInput.includes('1910s') || lowerInput.includes('1920s') || lowerInput.includes('1930s') || lowerInput.includes('1940s') || lowerInput.includes('1950s') || lowerInput.includes('1960s') || lowerInput.includes('1970s')) {
    result.era = 'Origins';
  } else if (lowerInput.includes('golden age') || lowerInput.includes('1980s')) {
    result.era = 'Golden Age';
  } else if (lowerInput.includes('global explosion') || lowerInput.includes('1990s')) {
    result.era = 'Global Explosion';
  } else if (lowerInput.includes('internet') || lowerInput.includes('2000s') || lowerInput.includes('2010s')) {
    result.era = 'Internet';
  } else if (lowerInput.includes('globalization') || lowerInput.includes('2020s') || lowerInput.includes('recent') || lowerInput.includes('modern') || lowerInput.includes('new') || lowerInput.includes('current')) {
    result.era = 'Globalization';
  } else if (lowerInput.includes('old school') || lowerInput.includes('old-school') || lowerInput.includes('classic') || lowerInput.includes('retro')) {
    result.era = 'Origins'; // Assume old school = pre-90s
  } else if (lowerInput.includes('golden generation') || lowerInput.includes('big three') || lowerInput.includes('naruto') || lowerInput.includes('bleach')) {
    result.era = 'Internet'; // Big Three era (2000s-2010s)
  }
  
  // Detect specific year (1900-2030 range)
  const yearMatch = lowerInput.match(/\b(19\d{2}|20[0-3]\d)\b/);
  if (yearMatch) {
    result.year = parseInt(yearMatch[1]);
    
    // Auto-detect era from year if not explicitly set
    if (!result.era) {
      const yearNum = result.year;
      if (yearNum < 1980) result.era = 'Origins';
      else if (yearNum < 1990) result.era = 'Golden Age';
      else if (yearNum < 2000) result.era = 'Global Explosion';
      else if (yearNum < 2020) result.era = 'Internet';
      else result.era = 'Globalization';
    }
  }
  
  // Detect season
  const seasons = ['spring', 'summer', 'fall', 'winter', 'autumn'];
  for (const season of seasons) {
    if (lowerInput.includes(season)) {
      result.season = season;
      break;
    }
  }
  
  return result;
}

/**
 * Check if current character should handle the request themselves
 * (has strength in requested genres)
 */
export function shouldHandleDirectly(
  characterId: string,
  requestedGenres: string[],
  isMangaReq: boolean
): boolean {
  const expertise = getCharacterExpertise(characterId);
  if (!expertise) {
    return false;
  }
  
  // For Veldora/Kakashi, check anime vs manga context
  if (characterId === 'veldora') {
    if (!isMangaReq) {
      // For anime, only handle action/adventure/shonen
      const animeGenres = ['action', 'adventure', 'shonen', 'battleshonen'];
      return requestedGenres.some(g => 
        animeGenres.some(ag => g.toLowerCase().includes(ag.toLowerCase()))
      );
    }
    // For manga, check normal strengths (but not romance/drama/psychological)
  }
  
  if (characterId === 'kakashi') {
    if (!isMangaReq) {
      // For anime, only handle romance/ecchi/fanservice
      const animeGenres = ['romance', 'ecchi', 'fanservice'];
      return requestedGenres.some(g => 
        animeGenres.some(ag => g.toLowerCase().includes(ag.toLowerCase()))
      );
    }
    // For manga, check normal strengths (but not action/adventure/shonen)
  }
  
  // For other characters, check if they have strength in any requested genre
  for (const genre of requestedGenres) {
    const genreKey = normalizeGenreName(genre) as GenreKey;
    if (genreKey && expertise.genres[genreKey] === '+') {
      return true;
    }
  }
  
  return false;
}


