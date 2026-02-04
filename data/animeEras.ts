/**
 * Anime Era System
 * Defines 5 eras of anime history and character expertise across eras
 */

export enum AnimeEra {
  ORIGINS = 'origins',          // 1910s-1970s: Early TV, Tezuka, Astro Boy, Gundam
  GOLDEN_AGE = 'golden_age',    // 1980s: OVA boom, Studio Ghibli, Akira, Dragon Ball
  GLOBAL_EXPLOSION = 'global',  // 1990s: Digital transition, Evangelion, Cowboy Bebop
  INTERNET = 'internet',        // 2000s-2010s: Big Three, isekai, Attack on Titan
  GLOBALIZATION = 'globalization' // 2020s+: High budget, streaming giants, JJK, Chainsaw Man
}

export type EraRating = '+' | '0' | '-';

export interface EraExpertise {
  eras: {
    [AnimeEra.ORIGINS]?: EraRating;
    [AnimeEra.GOLDEN_AGE]?: EraRating;
    [AnimeEra.GLOBAL_EXPLOSION]?: EraRating;
    [AnimeEra.INTERNET]?: EraRating;
    [AnimeEra.GLOBALIZATION]?: EraRating;
  };
}

/**
 * Get year range for an era
 */
export function getEraYearRange(era: AnimeEra): { start: number; end: number } {
  switch (era) {
    case AnimeEra.ORIGINS:
      return { start: 1910, end: 1979 };
    case AnimeEra.GOLDEN_AGE:
      return { start: 1980, end: 1989 };
    case AnimeEra.GLOBAL_EXPLOSION:
      return { start: 1990, end: 1999 };
    case AnimeEra.INTERNET:
      return { start: 2000, end: 2019 };
    case AnimeEra.GLOBALIZATION:
      return { start: 2020, end: 2030 };
    default:
      return { start: 0, end: 0 };
  }
}

/**
 * Determine era from release year
 */
export function getEraFromYear(year: number): AnimeEra {
  if (year >= 2020) return AnimeEra.GLOBALIZATION;
  if (year >= 2000) return AnimeEra.INTERNET;
  if (year >= 1990) return AnimeEra.GLOBAL_EXPLOSION;
  if (year >= 1980) return AnimeEra.GOLDEN_AGE;
  return AnimeEra.ORIGINS;
}

/**
 * Parse year from user request
 * Matches patterns like "2020s", "1995", "early 2000s"
 */
export function parseYearFromRequest(request: string): number | null {
  const lower = request.toLowerCase();
  
  // Match decade patterns (e.g., "2020s", "90s")
  const decadeMatch = lower.match(/(\d{4})s|(\d{2})s/);
  if (decadeMatch) {
    const fullYear = decadeMatch[1] || `19${decadeMatch[2]}`;
    return parseInt(fullYear);
  }
  
  // Match specific year (e.g., "1995", "2008")
  const yearMatch = lower.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    return parseInt(yearMatch[0]);
  }
  
  // Match "early 2000s", "late 90s", etc.
  const earlyLateMatch = lower.match(/(early|late)\s*(\d{4})s|(early|late)\s*(\d{2})s/);
  if (earlyLateMatch) {
    const year = earlyLateMatch[2] || earlyLateMatch[4];
    if (year) {
      const fullYear = year.length === 4 ? parseInt(year) : parseInt(`19${year}`);
      return earlyLateMatch[1] === 'early' || earlyLateMatch[3] === 'early' 
        ? fullYear + 2 
        : fullYear + 7;
    }
  }
  
  return null;
}

/**
 * Parse season from user request
 * Matches patterns like "spring 2023", "winter anime", "summer 2025"
 */
export function parseSeasonFromRequest(request: string): { season: string | null; year: number | null } {
  const lower = request.toLowerCase();
  
  // Match season names
  const seasons = ['spring', 'summer', 'fall', 'autumn', 'winter'];
  let season = null;
  for (const s of seasons) {
    if (lower.includes(s)) {
      season = s === 'autumn' ? 'fall' : s;
      break;
    }
  }
  
  // Extract year if present - allow both 19xx and 20xx, and reasonable future years
  const yearMatch = lower.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0]) : null;
  
  // Validate year is reasonable (1900-2030)
  if (year && (year < 1900 || year > 2030)) {
    return { season, year: null };
  }
  
  // If no year but season is specified, default to current year for recent seasons
  if (season && !year) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-11
    
    // Default to current year or next year based on season
    if ((season === 'winter' && currentMonth >= 9) || // Oct-Dec
        (season === 'spring' && currentMonth <= 5) || // Jan-Jun
        (season === 'summer' && currentMonth >= 3 && currentMonth <= 8) || // Apr-Sep
        (season === 'fall' && currentMonth >= 6 && currentMonth <= 11)) { // Jul-Dec
      return { season, year: currentYear };
    }
  }
  
  return { season, year };
}

/**
 * Check if a year is upcoming (in the future)
 */
export function isUpcomingYear(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year > currentYear;
}

/**
 * Check if a season is upcoming (in the future)
 */
export function isUpcomingSeason(season: string | null, year: number | null): boolean {
  if (!season || !year) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  
  // Season ranges: Winter (Jan-Mar), Spring (Apr-Jun), Summer (Jul-Sep), Fall (Oct-Dec)
  const getSeasonMonth = (seasonName: string): number => {
    switch (seasonName) {
      case 'winter': return 0; // Jan
      case 'spring': return 3; // Apr
      case 'summer': return 6; // Jul
      case 'fall': return 9; // Oct
      default: return 0;
    }
  };
  
  // If year is in the future, it's upcoming
  if (year > currentYear) return true;
  
  // If same year, check if season hasn't started yet
  if (year === currentYear) {
    const seasonStartMonth = getSeasonMonth(season);
    return currentMonth < seasonStartMonth;
  }
  
  return false;
}

/**
 * Character Era Expertise
 * 
 * Spectrum-based expertise:
 * - Strength (+): Excellent knowledge of this era
 * - Neutral (0): Familiar with this era, no preference
 * - Weakness (-): Limited knowledge or dislikes this era
 * 
 * Spectrum: If good at Era 2, should be at least neutral at Era 1 or 3
 * (unless the character has a specific reason for a gap)
 */

export const CHARACTER_ERA_EXPERTISE: { [characterId: string]: EraExpertise } = {
  // Golden Age Expert (Studio Ghibli, classics)
  'rikka': {
    eras: {
      [AnimeEra.ORIGINS]: '0',      // Aware of classics
      [AnimeEra.GOLDEN_AGE]: '+',   // Loves 80s anime, fantasy
      [AnimeEra.GLOBAL_EXPLOSION]: '+', // Evangelion, magical realism
      [AnimeEra.INTERNET]: '0',     // Neutral on modern
      [AnimeEra.GLOBALIZATION]: '-' // Too modern for her vibe
    }
  },
  
  // Global Explosion Expert (90s classics)
  'kakashi': {
    eras: {
      [AnimeEra.ORIGINS]: '-',           // Too old
      [AnimeEra.GOLDEN_AGE]: '0',        // Some classics
      [AnimeEra.GLOBAL_EXPLOSION]: '+',  // Peak 90s expert
      [AnimeEra.INTERNET]: '+',          // Big Three era
      [AnimeEra.GLOBALIZATION]: '0'      // Neutral on new gen
    }
  },
  
  // Internet Era Specialist (2000s-2010s)
  'yuji': {
    eras: {
      [AnimeEra.ORIGINS]: '-',
      [AnimeEra.GOLDEN_AGE]: '-',
      [AnimeEra.GLOBAL_EXPLOSION]: '0',  // Some classics
      [AnimeEra.INTERNET]: '+',          // Big Three, battle shonen
      [AnimeEra.GLOBALIZATION]: '+'      // JJK, new gen
    }
  },
  
  // New Gen Specialist
  'bakugo': {
    eras: {
      [AnimeEra.ORIGINS]: '-',
      [AnimeEra.GOLDEN_AGE]: '-',
      [AnimeEra.GLOBAL_EXPLOSION]: '-',
      [AnimeEra.INTERNET]: '0',
      [AnimeEra.GLOBALIZATION]: '+'      // Only interested in new stuff
    }
  },
  
  // Old School Expert
  'kinta': {
    eras: {
      [AnimeEra.ORIGINS]: '+',           // Classic mecha!
      [AnimeEra.GOLDEN_AGE]: '+',        // Gundam, robots
      [AnimeEra.GLOBAL_EXPLOSION]: '+',  // Evangelion, classic mecha
      [AnimeEra.INTERNET]: '0',          // Some modern mecha
      [AnimeEra.GLOBALIZATION]: '-'      // Too flashy
    }
  },
  
  // Spectrum: Intermediate eras
  'marin': {
    eras: {
      [AnimeEra.ORIGINS]: '-',           // Too old
      [AnimeEra.GOLDEN_AGE]: '0',        // Some classics
      [AnimeEra.GLOBAL_EXPLOSION]: '+',  // Fashion, aesthetics
      [AnimeEra.INTERNET]: '+',          // Modern romance
      [AnimeEra.GLOBALIZATION]: '0'      // Neutral
    }
  },
  
  // Historical Spectrum
  'ainz': {
    eras: {
      [AnimeEra.ORIGINS]: '0',      // Strategic thinking
      [AnimeEra.GOLDEN_AGE]: '+',   // Complex stories
      [AnimeEra.GLOBAL_EXPLOSION]: '+', // Deep narratives
      [AnimeEra.INTERNET]: '+',     // Isekai era!
      [AnimeEra.GLOBALIZATION]: '0' // Neutral
    }
  },
  
  // Balanced spectrum
  'konata': {
    eras: {
      [AnimeEra.ORIGINS]: '+',      // Ultimate otaku - knows everything
      [AnimeEra.GOLDEN_AGE]: '+',   
      [AnimeEra.GLOBAL_EXPLOSION]: '+',
      [AnimeEra.INTERNET]: '+',
      [AnimeEra.GLOBALIZATION]: '+' // Total otaku expert
    }
  },
  
  // Default for characters not yet assigned
  'veldora': {
    eras: {
      [AnimeEra.ORIGINS]: '0',
      [AnimeEra.GOLDEN_AGE]: '+',
      [AnimeEra.GLOBAL_EXPLOSION]: '+',
      [AnimeEra.INTERNET]: '+',
      [AnimeEra.GLOBALIZATION]: '0'
    }
  },
  
  'king': {
    eras: {
      [AnimeEra.ORIGINS]: '-',
      [AnimeEra.GOLDEN_AGE]: '0',
      [AnimeEra.GLOBAL_EXPLOSION]: '0',
      [AnimeEra.INTERNET]: '+',        // Gaming references
      [AnimeEra.GLOBALIZATION]: '+'
    }
  },
  
  'daru': {
    eras: {
      [AnimeEra.ORIGINS]: '0',
      [AnimeEra.GOLDEN_AGE]: '0',
      [AnimeEra.GLOBAL_EXPLOSION]: '+', // Sci-fi, tech
      [AnimeEra.INTERNET]: '+',
      [AnimeEra.GLOBALIZATION]: '0'
    }
  },
  
  'ichikawa': {
    eras: {
      [AnimeEra.ORIGINS]: '-',
      [AnimeEra.GOLDEN_AGE]: '-',
      [AnimeEra.GLOBAL_EXPLOSION]: '-',
      [AnimeEra.INTERNET]: '+',        // Modern romance
      [AnimeEra.GLOBALIZATION]: '+'
    }
  },
  
  'rudeus': {
    eras: {
      [AnimeEra.ORIGINS]: '0',
      [AnimeEra.GOLDEN_AGE]: '0',
      [AnimeEra.GLOBAL_EXPLOSION]: '0',
      [AnimeEra.INTERNET]: '+',        // Isekai era
      [AnimeEra.GLOBALIZATION]: '+'
    }
  },
  
  'shinpachi': {
    eras: {
      [AnimeEra.ORIGINS]: '0',
      [AnimeEra.GOLDEN_AGE]: '0',
      [AnimeEra.GLOBAL_EXPLOSION]: '+', // Comedy, slice of life
      [AnimeEra.INTERNET]: '+',
      [AnimeEra.GLOBALIZATION]: '0'
    }
  },
  
  'ishigami': {
    eras: {
      [AnimeEra.ORIGINS]: '0',
      [AnimeEra.GOLDEN_AGE]: '0',
      [AnimeEra.GLOBAL_EXPLOSION]: '+', // Gaming culture
      [AnimeEra.INTERNET]: '+',
      [AnimeEra.GLOBALIZATION]: '+'
    }
  },
  
  'kanbaru': {
    eras: {
      [AnimeEra.ORIGINS]: '-',
      [AnimeEra.GOLDEN_AGE]: '0',
      [AnimeEra.GLOBAL_EXPLOSION]: '0',
      [AnimeEra.INTERNET]: '+',        // Sports, slice of life
      [AnimeEra.GLOBALIZATION]: '0'
    }
  }
};

/**
 * Get era expertise for a character
 */
export function getEraExpertise(characterId: string): EraExpertise | null {
  return CHARACTER_ERA_EXPERTISE[characterId] || null;
}

/**
 * Check if character has strength in an era
 */
export function hasEraStrength(characterId: string, era: AnimeEra): boolean {
  const expertise = getEraExpertise(characterId);
  return expertise?.eras[era] === '+';
}

/**
 * Check if character has weakness in an era
 */
export function hasEraWeakness(characterId: string, era: AnimeEra): boolean {
  const expertise = getEraExpertise(characterId);
  return expertise?.eras[era] === '-';
}

