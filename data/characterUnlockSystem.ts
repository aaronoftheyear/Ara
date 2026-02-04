// Character Unlock System
// Progressive character discovery system for the anime assistant

export interface UnlockCondition {
  type: 'referral' | 'genre_request' | 'interaction_count' | 'always_unlocked' | 'franchise_seen';
  value?: string | number | string[]; // genre name, character id, count threshold, or anime titles
  description: string; // User-friendly unlock hint
}

export interface CharacterUnlockData {
  characterId: string;
  isStartingCharacter: boolean;
  unlockConditions: UnlockCondition[];
  unlockMessage?: string; // Message shown when character is unlocked
}

// System 3.0: Discovery State Tracking
export interface CharacterDiscoveryState {
  characterId: string;
  discoveryCount: number; // 0 = locked, 1 = discovered, 2 = unlocked
  discoveredVia?: string; // Which character discovered them
  discoveredAt?: number; // Timestamp
  franchises: string[]; // Anime titles required to unlock
}

// FEATURE FLAG - Set to true to enable unlock system
export const UNLOCK_SYSTEM_ENABLED = true;

// Character unlock configuration
export const CHARACTER_UNLOCKS: CharacterUnlockData[] = [
  // Starting Characters (Always Available)
  {
    characterId: 'yuji',
    isStartingCharacter: true,
    unlockConditions: [
      {
        type: 'always_unlocked',
        description: 'Available from the start'
      }
    ],
    unlockMessage: undefined
  },
  
  // Unlockable Characters
  {
    characterId: 'marin',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['Sono Bisque Doll wa Koi wo Suru', 'My Dress-Up Darling'],
        description: 'Watch "My Dress-Up Darling" to unlock Marin'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred by another character when asking for her expertise'
      },
      {
        type: 'genre_request',
        value: 'magicalGirl',
        description: 'Ask for magical girl anime'
      }
    ],
    unlockMessage: '🎉 Marin Kitagawa has been unlocked! She\'s a magical girl fanatic and cosplay enthusiast!'
  },
  {
    characterId: 'kinta',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['Dandadan', 'DAN DA DAN', 'Dan Da Dan', 'DANDADAN'],
        description: 'Watch "Dandadan" to unlock Kinta'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred by another character when asking for mecha'
      },
      {
        type: 'genre_request',
        value: 'mecha',
        description: 'Ask for mecha anime'
      }
    ],
    unlockMessage: '🎉 Kinta Sakata has been unlocked! He\'s a mecha fanatic and Gundam collector!'
  },
  {
    characterId: 'veldora',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['Tensei shitara Slime Datta Ken', 'That Time I Got Reincarnated as a Slime'],
        description: 'Watch "That Time I Got Reincarnated as a Slime" to unlock Veldora'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred when asking for battle shonen manga (must be manga + shonen/action)'
      },
      {
        type: 'genre_request',
        value: 'shonen manga',
        description: 'Ask for shonen or action manga specifically'
      }
    ],
    unlockMessage: '🎉 Veldora Tempest has been unlocked! He considers manga his "sacred texts" and loves battle shonen!'
  },
  {
    characterId: 'ainz',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['Overlord'],
        description: 'Watch "Overlord" to unlock Ainz'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred when asking for horror, psychological, or isekai'
      },
      {
        type: 'genre_request',
        value: 'horror',
        description: 'Ask for horror, psychological, or isekai anime'
      }
    ],
    unlockMessage: '🎉 Ainz Ooal Gown has been unlocked! The Overlord brings his strategic mind and dark fantasy expertise!'
  },
  {
    characterId: 'rikka',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['Chuunibyou demo Koi ga Shitai!', 'Love, Chunibyo & Other Delusions'],
        description: 'Watch "Love, Chunibyo & Other Delusions" to unlock Rikka'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred when asking for supernatural or fantasy'
      },
      {
        type: 'genre_request',
        value: 'supernatural',
        description: 'Ask for supernatural or fantasy anime'
      }
    ],
    unlockMessage: '🎉 Rikka Takanashi has been unlocked! The Tyrant\'s Eye sees all supernatural mysteries!'
  },
  {
    characterId: 'daru',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['Steins;Gate'],
        description: 'Watch "Steins;Gate" to unlock Daru'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred when asking for ecchi or sci-fi'
      },
      {
        type: 'genre_request',
        value: 'ecchi',
        description: 'Ask for ecchi, fanservice, or sci-fi'
      }
    ],
    unlockMessage: '🎉 Itaru "Daru" Hashida has been unlocked! The ultimate otaku brings his moe and tech expertise!'
  },
  {
    characterId: 'ichikawa',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['Boku no Kokoro no Yabai Yatsu', 'The Dangers in My Heart', 'Dangers in My Heart'],
        description: 'Watch "The Dangers in My Heart" to unlock Ichikawa'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred when asking for horror or psychological'
      },
      {
        type: 'genre_request',
        value: 'horror',
        description: 'Ask for horror or psychological anime'
      }
    ],
    unlockMessage: '🎉 Ichikawa Kyoutarou has been unlocked! The shy horror manga otaku is here to help!'
  },
  {
    characterId: 'kakashi',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['Naruto', 'Naruto Shippuden', 'Naruto: Shippuuden'],
        description: 'Watch "Naruto" to unlock Kakashi'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred when asking for romance manga (must be manga + romance)'
      },
      {
        type: 'genre_request',
        value: 'romance manga',
        description: 'Ask for romance manga, light novels, or web novels specifically'
      }
    ],
    unlockMessage: '🎉 Kakashi Hatake has been unlocked! The laid-back Icha Icha reader joins the chat!'
  },
  {
    characterId: 'bakugo',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['Boku no Hero Academia', 'My Hero Academia'],
        description: 'Watch "My Hero Academia" to unlock Bakugo'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred when asking for battle shonen or sports'
      },
      {
        type: 'genre_request',
        value: 'battleShonen',
        description: 'Ask for battle shonen or sports anime'
      }
    ],
    unlockMessage: '🎉 Katsuki Bakugo has been unlocked! The explosive hero brings his competitive fire!'
  },
  {
    characterId: 'ishigami',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['Kaguya-sama wa Kokurasetai', 'Kaguya-sama: Love is War'],
        description: 'Watch "Kaguya-sama: Love is War" to unlock Ishigami'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred when asking for gaming or isekai'
      },
      {
        type: 'genre_request',
        value: 'gaming',
        description: 'Ask for gaming or virtual reality anime'
      }
    ],
    unlockMessage: '🎉 Yu Ishigami has been unlocked! The gloomy gamer otaku is here to help!'
  },
  {
    characterId: 'shinpachi',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['Gintama'],
        description: 'Watch "Gintama" to unlock Shinpachi'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred when asking for idol or music'
      },
      {
        type: 'genre_request',
        value: 'idol',
        description: 'Ask for idol or music anime'
      }
    ],
    unlockMessage: '🎉 Shimura Shinpachi has been unlocked! The Terakado Tsuu superfan is here!'
  },
  {
    characterId: 'kanbaru',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['Bakemonogatari', 'Monogatari Series', 'Monogatari'],
        description: 'Watch "Monogatari Series" to unlock Kanbaru'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred when asking for BL or sports'
      },
      {
        type: 'genre_request',
        value: 'sports',
        description: 'Ask for sports or BL anime'
      }
    ],
    unlockMessage: '🎉 Suruga Kanbaru has been unlocked! The athletic BL enthusiast is here, senpai!'
  },
  {
    characterId: 'rudeus',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['Mushoku Tensei', 'Mushoku Tensei: Isekai Ittara Honki Dasu', 'Jobless Reincarnation'],
        description: 'Watch "Mushoku Tensei" to unlock Rudeus'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred when asking for isekai or fantasy'
      },
      {
        type: 'genre_request',
        value: 'isekai',
        description: 'Ask for isekai with mature themes'
      }
    ],
    unlockMessage: '🎉 Rudeus Greyrat has been unlocked! The reformed NEET isekai expert is here!'
  },
  {
    characterId: 'king',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['One Punch Man', 'One-Punch Man', 'Wanpanman'],
        description: 'Watch "One Punch Man" to unlock King'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred when asking for gaming or psychological anime'
      },
      {
        type: 'genre_request',
        value: 'gaming',
        description: 'Ask for gaming, virtual reality, or psychological anime'
      }
    ],
    unlockMessage: '🎉 King has been unlocked! The "Strongest Man on Earth" brings his gaming expertise and strategic mind!'
  },
  {
    characterId: 'konata',
    isStartingCharacter: false,
    unlockConditions: [
      {
        type: 'franchise_seen',
        value: ['Lucky Star', 'Lucky☆Star'],
        description: 'Watch "Lucky Star" to unlock Konata'
      },
      {
        type: 'referral',
        value: 'any',
        description: 'Get referred when asking for slice of life or comedy'
      },
      {
        type: 'genre_request',
        value: 'sliceOfLife',
        description: 'Ask for slice of life, comedy, or school anime'
      }
    ],
    unlockMessage: '🎉 Konata Izumi has been unlocked! The ultimate otaku brings her slice of life expertise!'
  }
];

// Helper functions for unlock system
export const getStartingCharacters = (): string[] => {
  return CHARACTER_UNLOCKS
    .filter(char => char.isStartingCharacter)
    .map(char => char.characterId);
};

export const getUnlockDataForCharacter = (characterId: string): CharacterUnlockData | undefined => {
  return CHARACTER_UNLOCKS.find(char => char.characterId === characterId);
};

export const isCharacterUnlocked = (characterId: string, unlockedCharacters: string[]): boolean => {
  // If unlock system is disabled, all characters are unlocked
  if (!UNLOCK_SYSTEM_ENABLED) return true;
  
  return unlockedCharacters.includes(characterId);
};

export const checkUnlockCondition = (
  condition: UnlockCondition, 
  userRequest: string, 
  fromCharacterId?: string,
  userAnimeList?: string[] // List of anime titles the user has watched
): boolean => {
  switch (condition.type) {
    case 'always_unlocked':
      return true;
    
    case 'franchise_seen':
      // Check if user has watched any anime from this franchise
      if (!userAnimeList || !Array.isArray(condition.value)) return false;
      
      const franchiseTitles = condition.value as string[];
      return franchiseTitles.some(franchiseTitle => 
        userAnimeList.some(userAnime => 
          // Case-insensitive partial match (handles alternate titles)
          userAnime.toLowerCase().includes(franchiseTitle.toLowerCase()) ||
          franchiseTitle.toLowerCase().includes(userAnime.toLowerCase())
        )
      );
    
    case 'referral':
      // Check if referral came from specific character (or 'any' for any character)
      if (condition.value === 'any') return fromCharacterId !== undefined;
      return fromCharacterId === condition.value;
    
    case 'genre_request':
      // Check if user request contains genre keyword (handles compound requests like "romance manga")
      const lowerRequest = userRequest.toLowerCase();
      const genre = (condition.value as string).toLowerCase();
      
      // For compound requests like "romance manga", check if ALL parts are present
      if (genre.includes(' ')) {
        const parts = genre.split(' ');
        return parts.every(part => lowerRequest.includes(part));
      }
      
      return lowerRequest.includes(genre);
    
    case 'interaction_count':
      // This would need to be checked against stored interaction count
      // Not implemented in this basic structure
      return false;
    
    default:
      return false;
  }
};

export const tryUnlockCharacter = (
  characterId: string,
  userRequest: string,
  fromCharacterId: string | undefined,
  currentlyUnlocked: string[],
  userAnimeList?: string[]
): { unlocked: boolean; message?: string } => {
  // If unlock system is disabled, return unlocked
  if (!UNLOCK_SYSTEM_ENABLED) {
    return { unlocked: true };
  }
  
  // If already unlocked, return
  if (currentlyUnlocked.includes(characterId)) {
    return { unlocked: true };
  }
  
  const unlockData = getUnlockDataForCharacter(characterId);
  if (!unlockData) {
    return { unlocked: false };
  }
  
  // Check if ALL required conditions are met (franchise_seen must be true + at least one other condition)
  const franchiseCondition = unlockData.unlockConditions.find(c => c.type === 'franchise_seen');
  const otherConditions = unlockData.unlockConditions.filter(c => c.type !== 'franchise_seen');
  
  // If there's a franchise requirement, it MUST be met
  if (franchiseCondition) {
    console.log("🔍 Checking franchise condition for", characterId, ":", franchiseCondition.value);
    console.log("🔍 User anime list:", userAnimeList?.slice(0, 5), "...(", userAnimeList?.length, "total)");
    const franchiseMet = checkUnlockCondition(franchiseCondition, userRequest, fromCharacterId, userAnimeList);
    console.log("🔍 Franchise met?", franchiseMet);
    if (!franchiseMet) {
      console.log("❌ Franchise requirement NOT met for", characterId);
      return { unlocked: false }; // Franchise not watched yet
    }
  }
  
  // Check if any other unlock condition is met (referral, genre request, etc.)
  console.log("🔍 Checking other conditions for", characterId, ":", otherConditions.map(c => c.type));
  const otherConditionMet = otherConditions.some(condition => {
    const met = checkUnlockCondition(condition, userRequest, fromCharacterId, userAnimeList);
    console.log("🔍", condition.type, "met?", met, "- value:", condition.value);
    return met;
  });
  
  console.log("🔍 Any other condition met?", otherConditionMet);
  
  if (otherConditionMet) {
    console.log("✅ Character", characterId, "UNLOCKED!");
    return { 
      unlocked: true, 
      message: unlockData.unlockMessage 
    };
  }
  
  console.log("❌ No unlock conditions met for", characterId);
  return { unlocked: false };
};

// Storage key for unlocked characters
export const UNLOCKED_CHARACTERS_KEY = 'unlocked_characters';

// Initialize unlocked characters from localStorage or defaults
export const initializeUnlockedCharacters = (): string[] => {
  if (!UNLOCK_SYSTEM_ENABLED) {
    // Return all characters if system is disabled
    return CHARACTER_UNLOCKS.map(char => char.characterId);
  }
  
  const stored = localStorage.getItem(UNLOCKED_CHARACTERS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Return starting characters
  return getStartingCharacters();
};

// Save unlocked characters to localStorage
export const saveUnlockedCharacters = (unlockedCharacters: string[]): void => {
  localStorage.setItem(UNLOCKED_CHARACTERS_KEY, JSON.stringify(unlockedCharacters));
};

// Check if an anime title matches any locked character's franchise requirement
// Returns the character info if it does, undefined otherwise
export const checkPotentialUnlock = (
  animeTitle: string, 
  currentlyUnlockedCharacters: string[]
): { characterId: string; characterName: string } | undefined => {
  if (!UNLOCK_SYSTEM_ENABLED) {
    return undefined;
  }
  
  // Find all locked characters
  const lockedCharacters = CHARACTER_UNLOCKS.filter(
    char => !currentlyUnlockedCharacters.includes(char.characterId)
  );
  
  // Check each locked character's franchise condition
  for (const charData of lockedCharacters) {
    const franchiseCondition = charData.unlockConditions.find(
      c => c.type === 'franchise_seen'
    );
    
    if (franchiseCondition && Array.isArray(franchiseCondition.value)) {
      // Check if the anime title matches any of the franchise titles
      const matchesFranchise = franchiseCondition.value.some(franchiseTitle => 
        animeTitle.toLowerCase().includes(franchiseTitle.toLowerCase()) ||
        franchiseTitle.toLowerCase().includes(animeTitle.toLowerCase())
      );
      
      if (matchesFranchise) {
        // Get the character name from the ASSISTANT_CHARACTERS array
        // We need to import this or pass it as a parameter
        // For now, return a formatted version
        const characterName = formatCharacterName(charData.characterId);
        return {
          characterId: charData.characterId,
          characterName: characterName
        };
      }
    }
  }
  
  return undefined;
};

// Helper to format character ID to a display name
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
    'rudeus': 'Rudeus Greyrat',
    'king': 'King',
    'konata': 'Konata Izumi'
  };
  
  return nameMap[characterId] || characterId;
};

// System 3.0: Character Franchise Requirements
export const CHARACTER_FRANCHISES: { [characterId: string]: string[] } = {
  yuji: ['Jujutsu Kaisen'],
  marin: ['Sono Bisque Doll wa Koi wo Suru', 'My Dress-Up Darling'],
  shinpachi: ['Gintama'],
  kinta: ['16bit Sensation: Another Layer', 'Gundam: The Witch from Mercury'],
  ishigami: ['Kaguya-sama: Love is War'],
  rikka: ['Love, Chunibyo & Other Delusions', 'Chuunibyou demo Koi ga Shitai!'],
  daru: ['Steins;Gate'],
  ichikawa: ['Boku no Kokoro no Yabai Yatsu', 'The Dangers in My Heart'],
  rudeus: ['Mushoku Tensei: Jobless Reincarnation'],
  ainz: ['Overlord'],
  kanbaru: ['Bakemonogatari', 'Monogatari Series'],
  bakugo: ['Boku no Hero Academia', 'My Hero Academia'],
  veldora: ['Tensei shitara Slime Datta Ken', 'That Time I Got Reincarnated as a Slime'],
  kakashi: ['Naruto', 'Naruto Shippuden'],
  king: ['One Punch Man', 'One-Punch Man', 'Wanpanman'],
  konata: ['Lucky Star', 'Lucky☆Star'],
};

// System 3.0: Initialize discovery states from local storage or defaults
export function initializeDiscoveryStates(): CharacterDiscoveryState[] {
  const saved = localStorage.getItem('CHARACTER_DISCOVERY_STATES_V3');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse discovery states:', e);
    }
  }
  
  // Default states - Yuji starts unlocked
  return Object.keys(CHARACTER_FRANCHISES).map(characterId => ({
    characterId,
    discoveryCount: characterId === 'yuji' ? 2 : 0,
    franchises: CHARACTER_FRANCHISES[characterId],
  }));
}

// System 3.0: Save discovery states to local storage
export function saveDiscoveryStates(states: CharacterDiscoveryState[]): void {
  localStorage.setItem('CHARACTER_DISCOVERY_STATES_V3', JSON.stringify(states));
}

// System 3.0: Check if character can be unlocked (has watched franchise)
export function canUnlockCharacter(characterId: string, userWatchList: string[]): boolean {
  const franchises = CHARACTER_FRANCHISES[characterId] || [];
  return franchises.some(franchise => 
    userWatchList.some(watched => 
      watched.toLowerCase().includes(franchise.toLowerCase()) ||
      franchise.toLowerCase().includes(watched.toLowerCase())
    )
  );
}

// System 3.0: Get discovery state for character
export function getDiscoveryState(
  characterId: string,
  states: CharacterDiscoveryState[]
): CharacterDiscoveryState | undefined {
  return states.find(s => s.characterId === characterId);
}

// System 3.0: Update discovery state
export function updateDiscoveryState(
  characterId: string,
  states: CharacterDiscoveryState[],
  updates: Partial<CharacterDiscoveryState>
): CharacterDiscoveryState[] {
  return states.map(state =>
    state.characterId === characterId
      ? { ...state, ...updates }
      : state
  );
}

