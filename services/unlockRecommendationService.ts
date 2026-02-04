// Service to recommend anime that unlock new characters
// Characters only recommend franchises they're knowledgeable about

import { CHARACTER_UNLOCKS } from '../data/characterUnlockSystem';
import { getCharacterExpertise, getCharacterRating } from '../data/characterExpertise';
import { searchAnime } from './malApiService';

interface UnlockRecommendation {
  animeTitle: string;
  characterName: string;
  characterId: string;
  canRecommend: 'yes' | 'no' | 'neutral';
  genres?: string[];
}

/**
 * Get franchise anime that would unlock new characters
 * Filtered by what the current character is comfortable recommending
 */
export const getUnlockableAnimeForCharacter = async (
  currentCharacterId: string,
  unlockedCharacterIds: string[],
  userAnimeList: string[], // Titles the user has already watched
  malClientId: string
): Promise<{
  canRecommend: UnlockRecommendation[];
  cannotRecommend: UnlockRecommendation[];
}> => {
  const currentCharacterExpertise = getCharacterExpertise(currentCharacterId);
  
  if (!currentCharacterExpertise) {
    return { canRecommend: [], cannotRecommend: [] };
  }

  // Find all locked characters
  const lockedCharacters = CHARACTER_UNLOCKS.filter(
    char => !char.isStartingCharacter && !unlockedCharacterIds.includes(char.characterId)
  );

  const canRecommend: UnlockRecommendation[] = [];
  const cannotRecommend: UnlockRecommendation[] = [];

  // Check each locked character
  for (const lockedChar of lockedCharacters) {
    // Get franchise requirement
    const franchiseCondition = lockedChar.unlockConditions.find(
      c => c.type === 'franchise_seen'
    );

    if (!franchiseCondition || !Array.isArray(franchiseCondition.value)) {
      continue;
    }

    // Get the first franchise title (primary)
    const franchiseTitle = franchiseCondition.value[0];

    // Check if user already watched it
    const alreadyWatched = userAnimeList.some(userTitle => 
      userTitle.toLowerCase().includes(franchiseTitle.toLowerCase()) ||
      franchiseTitle.toLowerCase().includes(userTitle.toLowerCase())
    );

    if (alreadyWatched) {
      continue; // Skip - user already watched this
    }

    // Fetch genres for this franchise anime
    let genres: string[] = [];
    try {
      const result = await searchAnime(franchiseTitle, malClientId, false);
      genres = result.genres || [];
    } catch (error) {
      console.warn(`Could not fetch genres for ${franchiseTitle}`);
    }

    // Check current character's comfort level with this anime's genres
    let overallRating: 'expert' | 'neutral' | 'weak' = 'neutral';
    let hasExpertGenre = false;
    let hasWeakGenre = false;

    // Map MAL genres to internal system for checking
    const internalGenres = mapMalGenresToInternal(genres);
    
    for (const genre of internalGenres) {
      const rating = getCharacterRating(currentCharacterId, genre as any);
      if (rating === '+') hasExpertGenre = true;
      if (rating === '-') hasWeakGenre = true;
    }

    // Determine if character can recommend this
    if (hasWeakGenre) {
      overallRating = 'weak';
    } else if (hasExpertGenre) {
      overallRating = 'expert';
    }

    const recommendation: UnlockRecommendation = {
      animeTitle: franchiseTitle,
      characterName: formatCharacterName(lockedChar.characterId),
      characterId: lockedChar.characterId,
      canRecommend: overallRating === 'weak' ? 'no' : (overallRating === 'expert' ? 'yes' : 'neutral'),
      genres: genres
    };

    if (overallRating === 'weak') {
      cannotRecommend.push(recommendation);
    } else {
      canRecommend.push(recommendation);
    }
  }

  return { canRecommend, cannotRecommend };
};

// Helper to format character names
const formatCharacterName = (characterId: string): string => {
  const nameMap: { [key: string]: string } = {
    'marin': 'Marin Kitagawa',
    'kinta': 'Kinta Sakata',
    'veldora': 'Veldora Tempest',
    'ainz': 'Ainz Ooal Gown',
    'rikka': 'Rikka Takanashi',
    'daru': 'Itaru "Daru" Hashida',
    'shinpachi': 'Shimura Shinpachi',
    'ishigami': 'Yu Ishigami',
    'ichikawa': 'Ichikawa Kyoutarou',
    'kakashi': 'Kakashi Hatake',
    'yuji': 'Yuji Itadori',
    'bakugo': 'Katsuki Bakugo',
    'kanbaru': 'Suruga Kanbaru',
    'rudeus': 'Rudeus Greyrat'
  };
  
  return nameMap[characterId] || characterId;
};

// Map MAL genres to internal system
const mapMalGenresToInternal = (malGenres: string[]): string[] => {
  const genreMapping: {[key: string]: string} = {
    'Action': 'action',
    'Adventure': 'adventure',
    'Comedy': 'comedy',
    'Drama': 'drama',
    'Romance': 'romance',
    'Slice of Life': 'sliceOfLife',
    'Horror': 'horror',
    'Thriller': 'psychological',
    'Psychological': 'psychological',
    'Sci-Fi': 'sciFi',
    'Fantasy': 'fantasy',
    'Supernatural': 'supernatural',
    'Sports': 'sports',
    'Ecchi': 'ecchi',
    'Harem': 'harem',
    'Mecha': 'mecha',
    'School': 'school',
    'Music': 'music',
    'Military': 'military',
    'Shounen': 'shonen',
    'Shoujo': 'shojo',
    'Seinen': 'seinen',
    'Josei': 'josei',
    'Isekai': 'isekai'
  };
  
  const internalGenres: string[] = [];
  malGenres.forEach(malGenre => {
    const mapped = genreMapping[malGenre];
    if (mapped && !internalGenres.includes(mapped)) {
      internalGenres.push(mapped);
    }
  });
  
  return internalGenres;
};

/**
 * Detect if user is asking about unlocking characters
 */
export const isUnlockQuery = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  
  const unlockKeywords = [
    'unlock',
    'unlock more',
    'unlock new',
    'unlock character',
    'unlock contact',
    'get more character',
    'get new character',
    'how do i unlock',
    'how to unlock',
    'what should i watch to unlock',
    'what to watch to unlock',
    'shows to unlock',
    'anime to unlock',
    'watch to unlock'
  ];
  
  return unlockKeywords.some(keyword => lowerMessage.includes(keyword));
};


