// Service to parse unformatted anime lists from user notes
// Uses fuzzy matching and MAL API validation

import { searchAnime } from './malApiService';

interface ParsedAnime {
  detectedText: string;
  matchedTitle?: string;
  confidence: 'high' | 'medium' | 'low';
}

// Common anime abbreviations and variations
const COMMON_ABBREVIATIONS: { [key: string]: string[] } = {
  'hxh': ['Hunter x Hunter', 'Hunter × Hunter'],
  'bnha': ['My Hero Academia', 'Boku no Hero Academia'],
  'mha': ['My Hero Academia', 'Boku no Hero Academia'],
  'aot': ['Attack on Titan', 'Shingeki no Kyojin'],
  'snk': ['Attack on Titan', 'Shingeki no Kyojin'],
  'fmab': ['Fullmetal Alchemist: Brotherhood'],
  'fma': ['Fullmetal Alchemist'],
  'jjk': ['Jujutsu Kaisen'],
  'kny': ['Demon Slayer', 'Kimetsu no Yaiba'],
  'ds': ['Demon Slayer', 'Kimetsu no Yaiba'],
  'op': ['One Piece'],
  'dbz': ['Dragon Ball Z'],
  'db': ['Dragon Ball'],
  'sao': ['Sword Art Online'],
  'nge': ['Neon Genesis Evangelion'],
  'eva': ['Neon Genesis Evangelion', 'Evangelion'],
  'steins gate': ['Steins;Gate'],
  'code geass': ['Code Geass'],
  're zero': ['Re:Zero', 'Re: Zero'],
  'konosuba': ['KonoSuba'],
  'overlord': ['Overlord'],
  'slime': ['That Time I Got Reincarnated as a Slime'],
  'mob psycho': ['Mob Psycho 100'],
  'opm': ['One Punch Man'],
  'toradora': ['Toradora!'],
  'clannad': ['Clannad'],
  'your name': ['Your Name', 'Kimi no Na wa'],
  'silent voice': ['A Silent Voice', 'Koe no Katachi'],
  'weathering with you': ['Weathering with You', 'Tenki no Ko']
};

// Common typos and variations
const TYPO_PATTERNS: { pattern: RegExp; replacements: string[] }[] = [
  { pattern: /peak piece/i, replacements: ['One Piece'] },
  { pattern: /dragon ball zee?/i, replacements: ['Dragon Ball Z'] },
  { pattern: /attack on titans?/i, replacements: ['Attack on Titan'] },
  { pattern: /full ?metal/i, replacements: ['Fullmetal Alchemist'] },
  { pattern: /sword ?art/i, replacements: ['Sword Art Online'] },
  { pattern: /demon ?slayers?/i, replacements: ['Demon Slayer'] },
  { pattern: /jujutsu ?kaisen/i, replacements: ['Jujutsu Kaisen'] },
  { pattern: /my ?hero/i, replacements: ['My Hero Academia'] },
  { pattern: /naruto.*shippuden/i, replacements: ['Naruto Shippuden'] }
];

/**
 * Extract potential anime titles from unformatted text
 * Strategy: Conservative matching - only include confirmed anime
 * Detects sections: Watched vs Plan-to-Watch
 */
export const parseAnimeList = async (
  rawText: string,
  malClientId: string
): Promise<{ 
  excludedTitles: string[]; 
  planToWatchTitles: string[];
  totalMatches: number;
  unrecognized: string[];
}> => {
  console.log("📝 Starting anime list parsing with section detection...");
  
  // Step 1: Detect sections (Watched vs Plan-to-Watch)
  const { watchedSection, ptwSection } = detectSections(rawText);
  
  console.log(`📝 Watched section: ${watchedSection ? 'Found' : 'Not found'}`);
  console.log(`📝 PTW section: ${ptwSection ? 'Found' : 'Not found'}`);
  
  // Step 2: Parse watched section
  const watchedLines = (watchedSection || rawText) // Use entire text if no sections detected
    .split(/[\n,;]/)
    .map(line => {
      return line
        .replace(/\([^)]*\)/g, '')
        .replace(/\s*-\s*.*/g, '')
        .trim();
    })
    .filter(line => line.length > 2);
  
  console.log(`📝 Watched: Split into ${watchedLines.length} potential entries`);
  
  const watchedTitles: string[] = [];
  const ptwTitles: string[] = [];
  const unrecognized: string[] = [];
  const processedCount = { total: 0, matched: 0, skipped: 0 };
  
  // Step 3: Process watched section
  for (const line of watchedLines.slice(0, 200)) {
    processedCount.total++;
    const potentials = await extractTitlesFromLine(line, malClientId);
    
    if (potentials.length > 0) {
      watchedTitles.push(...potentials);
      processedCount.matched++;
      console.log(`✅ Watched: "${line}" → ${potentials.join(', ')}`);
    } else if (line.length > 2) {
      unrecognized.push(line);
      processedCount.skipped++;
    }
    
    if (processedCount.total % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Step 4: Process PTW section if exists
  if (ptwSection) {
    const ptwLines = ptwSection
      .split(/[\n,;]/)
      .map(line => line.replace(/\([^)]*\)/g, '').replace(/\s*-\s*.*/g, '').trim())
      .filter(line => line.length > 2);
    
    console.log(`📝 PTW: Split into ${ptwLines.length} potential entries`);
    
    for (const line of ptwLines.slice(0, 100)) {
      const potentials = await extractTitlesFromLine(line, malClientId);
      
      if (potentials.length > 0) {
        ptwTitles.push(...potentials);
        console.log(`✅ PTW: "${line}" → ${potentials.join(', ')}`);
      }
      
      if (processedCount.total % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  // Step 5: Remove duplicates (case-insensitive)
  const uniqueWatched = [...new Set(watchedTitles.map(t => t.toLowerCase()))]
    .map(lower => watchedTitles.find(t => t.toLowerCase() === lower) || lower);
  
  const uniquePTW = [...new Set(ptwTitles.map(t => t.toLowerCase()))]
    .map(lower => ptwTitles.find(t => t.toLowerCase() === lower) || lower);
  
  console.log(`✅ Parsed ${uniqueWatched.length} watched titles`);
  console.log(`✅ Parsed ${uniquePTW.length} plan-to-watch titles`);
  console.log(`📊 Stats: ${processedCount.matched} matched, ${processedCount.skipped} skipped`);
  console.log(`⚠️ ${unrecognized.length} unrecognized entries`);
  
  return {
    excludedTitles: uniqueWatched,
    planToWatchTitles: uniquePTW,
    totalMatches: uniqueWatched.length + uniquePTW.length,
    unrecognized: unrecognized.slice(0, 10)
  };
};

/**
 * Detect sections in user's notes
 * Looks for headers like "Watched:", "Plan to Watch:", etc.
 */
const detectSections = (text: string): { watchedSection?: string; ptwSection?: string } => {
  const lowerText = text.toLowerCase();
  
  // PTW section markers
  const ptwMarkers = [
    'plan to watch',
    'ptw',
    'want to watch',
    'to watch',
    'watch list',
    'watchlist',
    'recommendations',
    'recommended',
    'queue'
  ];
  
  // Watched section markers
  const watchedMarkers = [
    'watched',
    'completed',
    'finished',
    'seen',
    'already watched'
  ];
  
  let ptwStart = -1;
  let ptwMarker = '';
  
  // Find PTW section
  for (const marker of ptwMarkers) {
    const patterns = [
      new RegExp(`^${marker}:?\\s*$`, 'im'),
      new RegExp(`^\\*\\*${marker}\\*\\*:?\\s*$`, 'im'),
      new RegExp(`^#+\\s*${marker}:?\\s*$`, 'im')
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match.index !== undefined) {
        ptwStart = match.index;
        ptwMarker = marker;
        break;
      }
    }
    
    if (ptwStart !== -1) break;
  }
  
  // Find Watched section
  let watchedStart = -1;
  for (const marker of watchedMarkers) {
    const patterns = [
      new RegExp(`^${marker}:?\\s*$`, 'im'),
      new RegExp(`^\\*\\*${marker}\\*\\*:?\\s*$`, 'im'),
      new RegExp(`^#+\\s*${marker}:?\\s*$`, 'im')
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match.index !== undefined) {
        watchedStart = match.index;
        break;
      }
    }
    
    if (watchedStart !== -1) break;
  }
  
  // Extract sections based on positions
  if (ptwStart !== -1 && watchedStart !== -1) {
    // Both sections found
    if (watchedStart < ptwStart) {
      return {
        watchedSection: text.substring(watchedStart, ptwStart).split('\n').slice(1).join('\n'),
        ptwSection: text.substring(ptwStart).split('\n').slice(1).join('\n')
      };
    } else {
      return {
        watchedSection: text.substring(watchedStart).split('\n').slice(1).join('\n'),
        ptwSection: text.substring(ptwStart, watchedStart).split('\n').slice(1).join('\n')
      };
    }
  } else if (ptwStart !== -1) {
    // Only PTW section found - treat everything before as watched
    return {
      watchedSection: text.substring(0, ptwStart),
      ptwSection: text.substring(ptwStart).split('\n').slice(1).join('\n')
    };
  } else if (watchedStart !== -1) {
    // Only watched section found
    return {
      watchedSection: text.substring(watchedStart).split('\n').slice(1).join('\n'),
      ptwSection: undefined
    };
  }
  
  // No sections detected - treat everything as watched
  return { watchedSection: text, ptwSection: undefined };
};

/**
 * Extract anime titles from a single line of text
 * Uses abbreviations, typo patterns, and MAL API validation
 * CONSERVATIVE: Only accept high-confidence matches
 */
const extractTitlesFromLine = async (
  line: string,
  malClientId: string
): Promise<string[]> => {
  const lowerLine = line.toLowerCase().trim();
  const matches: string[] = [];
  
  // Skip very short lines or common words
  if (line.length < 2) {
    return [];
  }
  
  // Skip common non-anime words
  const commonWords = ['wait', 'already', 'wrote', 'this', 'that', 'lol', 'the', 'and', 'but', 'for'];
  if (commonWords.includes(lowerLine)) {
    return [];
  }
  
  // Strategy 1: Check for known abbreviations (EXACT MATCH ONLY)
  for (const [abbrev, fullTitles] of Object.entries(COMMON_ABBREVIATIONS)) {
    // Exact match or abbreviation as standalone word
    const abbrevPattern = new RegExp(`\\b${abbrev}\\b`, 'i');
    if (lowerLine === abbrev || abbrevPattern.test(lowerLine)) {
      console.log(`🎯 Abbreviation match: "${line}" → ${fullTitles[0]}`);
      matches.push(fullTitles[0]); // Only add first (primary) title
      return matches; // Return immediately - don't try other strategies
    }
  }
  
  // Strategy 2: Check for typo patterns
  for (const { pattern, replacements } of TYPO_PATTERNS) {
    if (pattern.test(line)) {
      console.log(`🎯 Typo pattern match: "${line}" → ${replacements[0]}`);
      matches.push(replacements[0]);
      return matches; // Return immediately
    }
  }
  
  // Strategy 3: MAL API validation (ONLY if line looks like an anime title)
  // Skip if line has too many common words or is too short
  if (line.length >= 3 && line.length <= 100) {
    try {
      const result = await searchAnime(line, malClientId, false);
      
      // STRICT: Only accept if we get BOTH cover image AND MAL URL
      if (result.coverImage && result.malUrl) {
        console.log(`✅ MAL validation: "${line}" is valid anime`);
        matches.push(line);
        return matches;
      }
    } catch (error) {
      // Silent fail - just means it's not a valid anime
    }
  }
  
  return []; // No matches found
};

/**
 * Quick validation - check if a title exists in MAL
 */
export const validateAnimeTitle = async (
  title: string,
  malClientId: string
): Promise<boolean> => {
  try {
    const result = await searchAnime(title, malClientId, false);
    return !!(result.coverImage || result.malUrl);
  } catch {
    return false;
  }
};

