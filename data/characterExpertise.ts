// Character Expertise Rating System
// + = Expert (others refer to this character, character boasts when asked)
// 0 = Neutral (gives recommendations directly, no referral)
// - = Weak (refers to other characters)

export interface CharacterExpertise {
  characterId: string;
  characterName: string;
  genres: {
    // Core Genres
    mecha: '+' | '0' | '-';
    magicalGirl: '+' | '0' | '-';
    shonen: '+' | '0' | '-';
    battleShonen: '+' | '0' | '-'; // Modern/dark battle shonen (Yuji's specialty)
    shojo: '+' | '0' | '-';
    seinen: '+' | '0' | '-';
    josei: '+' | '0' | '-';
    
    // Popular Genres
    action: '+' | '0' | '-';
    adventure: '+' | '0' | '-';
    comedy: '+' | '0' | '-';
    drama: '+' | '0' | '-';
    romance: '+' | '0' | '-';
    sliceOfLife: '+' | '0' | '-';
    
    // Specialized Genres
    fanservice: '+' | '0' | '-';
    ecchi: '+' | '0' | '-';
    harem: '+' | '0' | '-';
    isekai: '+' | '0' | '-';
    fantasy: '+' | '0' | '-';
    sciFi: '+' | '0' | '-';
    supernatural: '+' | '0' | '-';
    horror: '+' | '0' | '-';
    psychological: '+' | '0' | '-';
    
    // Media Types
    idol: '+' | '0' | '-';
    sports: '+' | '0' | '-';
    music: '+' | '0' | '-';
    school: '+' | '0' | '-';
    military: '+' | '0' | '-';
    
    // Gaming/Modern
    gaming: '+' | '0' | '-';
    virtualReality: '+' | '0' | '-';
    cyberpunk: '+' | '0' | '-';
    
    // Adult Content
    eroge: '+' | '0' | '-';
    adultGames: '+' | '0' | '-';
    
    // Manga Specific
    manga: '+' | '0' | '-';
    lightNovels: '+' | '0' | '-';
    webNovels: '+' | '0' | '-';
  };
}

export const CHARACTER_EXPERTISE: CharacterExpertise[] = [
  {
    characterId: 'kinta',
    characterName: 'Kinta Sakata',
    genres: {
      mecha: '+',
      shonen: '+',
      battleShonen: '0',
      action: '+',
      adventure: '0',
      comedy: '0',
      drama: '0',
      romance: '0',
      sliceOfLife: '0',
      fanservice: '0',
      ecchi: '-',            // → Daru (tier 8)
      harem: '-',            // → Daru (tier 8)
      isekai: '0',
      fantasy: '0',
      sciFi: '+',
      supernatural: '0',
      horror: '0',
      psychological: '0',
      idol: '-',             // → Shinpachi (tier 4)
      sports: '0',
      music: '-',            // → Shinpachi (tier 4) - CHANGED from 0 to -
      school: '0',
      military: '+',
      gaming: '0',
      virtualReality: '0',
      cyberpunk: '0',
      eroge: '-',            // → Daru (tier 8)
      adultGames: '-',       // → Daru (tier 8)
      manga: '0',
      lightNovels: '0',
      webNovels: '0',
      // Core genres
      magicalGirl: '-',
      shojo: '-',
      seinen: '0',
      josei: '-'
    }
  },
  {
    characterId: 'marin',
    characterName: 'Marin Kitagawa',
    genres: {
      magicalGirl: '+',
      shojo: '+',
      battleShonen: '0',
      romance: '+',
      sliceOfLife: '+',
      comedy: '+',
      fanservice: '+',
      ecchi: '+',
      harem: '0',
      isekai: '-',           // → Ishigami (tier 2) - CHANGED from 0 to -
      fantasy: '-',          // → Rikka (tier 3-4) - CHANGED from 0 to -
      sciFi: '0',
      supernatural: '-',     // → Rikka (tier 3-4) - CHANGED from 0 to -
      horror: '-',           // → Kyoutarou (tier 4)
      psychological: '-',    // → Kyoutarou (tier 4)
      idol: '0',
      sports: '-',           // → Kanbaru (tier 7) - CHANGED from 0 to -
      music: '0',
      school: '+',
      military: '-',         // → Kinta (tier 3)
      gaming: '-',           // → Ishigami (tier 2) - CHANGED from 0 to -
      virtualReality: '-',   // → Ishigami (tier 2) - CHANGED from 0 to -
      cyberpunk: '0',
      eroge: '+',
      adultGames: '+',
      manga: '0',
      lightNovels: '0',
      webNovels: '0',
      // Core genres
      mecha: '-',            // → Kinta (tier 3)
      shonen: '0',
      seinen: '-',           // → Ishigami (tier 2) - CHANGED from 0 to -
      josei: '+',
      action: '0',
      adventure: '0',
      drama: '0'
    }
  },
  {
    characterId: 'veldora',
    characterName: 'Veldora Tempest',
    genres: {
      // MANGA STRENGTHS - Action/Adventure/Shonen specialist
      manga: '+',          // BUT only for action/adventure/shonen genres
      lightNovels: '+',
      webNovels: '+',
      shonen: '+',         // Anime + Manga
      battleShonen: '+',   // Anime + Manga
      action: '+',         // Anime + Manga (ONLY these 3 for anime!)
      adventure: '+',      // Anime + Manga (ONLY these 3 for anime!)
      isekai: '+',         // Manga only, NOT anime
      fantasy: '+',        // Manga only, NOT anime
      
      // MANGA WEAKNESSES - Refers to Kakashi
      drama: '-',          // → Kakashi (for manga)
      romance: '-',        // → Kakashi (for manga)
      psychological: '-',  // → Kakashi (for manga)
      
      // Neutral
      comedy: '0',
      sciFi: '0',
      supernatural: '0',
      horror: '0',
      sports: '0',
      music: '0',
      school: '0',
      military: '0',
      gaming: '0',
      virtualReality: '0',
      cyberpunk: '0',
      seinen: '0',
      
      // Weaknesses (general)
      sliceOfLife: '-',
      fanservice: '-',
      ecchi: '-',
      harem: '-',
      idol: '-',
      eroge: '-',
      adultGames: '-',
      mecha: '-',          // → Kinta (special - believes his stories)
      magicalGirl: '-',
      shojo: '-',
      josei: '-'
    }
  },
  {
    characterId: 'shinpachi',
    characterName: 'Shimura Shinpachi',
    genres: {
      idol: '+',
      comedy: '+',
      battleShonen: '-',     // → Yuji (already unlocked)
      sliceOfLife: '+',
      school: '+',
      romance: '0',
      drama: '0',
      action: '0',
      adventure: '0',
      fanservice: '-',       // → Rudeus (tier 5)
      ecchi: '-',            // → Rudeus (tier 5)
      harem: '-',            // → Rudeus (tier 5)
      isekai: '0',
      fantasy: '0',
      sciFi: '0',
      supernatural: '0',
      horror: '0',
      psychological: '0',
      sports: '0',
      music: '+',
      military: '0',
      gaming: '0',
      virtualReality: '0',
      cyberpunk: '0',
      eroge: '-',            // → Rudeus (tier 5)
      adultGames: '-',       // → Rudeus (tier 5)
      manga: '0',
      lightNovels: '0',
      webNovels: '0',
      // Core genres
      mecha: '-',
      magicalGirl: '-',
      shonen: '0',
      shojo: '0',
      seinen: '0',
      josei: '0'
    }
  },
  {
    characterId: 'ishigami',
    characterName: 'Yu Ishigami',
    genres: {
      gaming: '+',
      isekai: '+',
      battleShonen: '0',
      comedy: '+',
      school: '+',
      virtualReality: '+',
      seinen: '+',
      romance: '0',
      drama: '0',
      action: '0',
      adventure: '0',
      sliceOfLife: '0',
      fanservice: '0',
      ecchi: '-',            // → Rudeus (tier 5) - CHANGED from 0 to -
      harem: '-',            // → Rudeus (tier 5) - CHANGED from 0 to -
      fantasy: '0',
      sciFi: '0',
      supernatural: '0',
      horror: '0',
      psychological: '0',
      idol: '0',
      sports: '0',
      music: '0',
      military: '0',
      cyberpunk: '0',
      eroge: '0',
      adultGames: '0',
      manga: '0',
      lightNovels: '0',
      webNovels: '0',
      mecha: '-',            // → Kinta (tier 3) - CHANGED from 0 to -
      magicalGirl: '0',
      shonen: '0',
      shojo: '0',            // Keep neutral - don't make Rikka too easy
      josei: '0'             // Keep neutral - don't make Kanbaru too easy - CHANGED from - to 0
    }
  },
  {
    characterId: 'ainz',
    characterName: 'Ainz Ooal Gown',
    genres: {
      isekai: '+',
      fantasy: '+',
      battleShonen: '0',
      seinen: '+',
      drama: '+',
      action: '+',
      adventure: '0',
      comedy: '0',
      romance: '0',
      sliceOfLife: '-',      // → Shinpachi (already unlocked)
      fanservice: '-',       // → Kanbaru (tier 7)
      ecchi: '-',            // → Kanbaru (tier 7)
      harem: '-',            // → Rudeus (already unlocked)
      sciFi: '0',
      supernatural: '+',
      horror: '+',
      psychological: '+',
      idol: '-',             // → Shinpachi (already unlocked)
      sports: '-',           // → Kanbaru (tier 7)
      music: '0',
      school: '-',
      military: '+',
      gaming: '0',
      virtualReality: '0',
      cyberpunk: '0',
      eroge: '-',
      adultGames: '-',
      manga: '0',
      lightNovels: '+',
      webNovels: '0',
      // Core genres
      mecha: '-',
      magicalGirl: '-',
      shonen: '0',
      shojo: '-',
      josei: '-',            // → Kanbaru (tier 7) - keep this
    }
  },
  {
    characterId: 'rikka',
    characterName: 'Rikka Takanashi',
    genres: {
      supernatural: '+',
      fantasy: '+',
      battleShonen: '-',
      comedy: '+',
      romance: '+',
      school: '+',
      sliceOfLife: '+',
      drama: '0',
      action: '0',
      adventure: '0',
      fanservice: '0',
      ecchi: '0',
      harem: '0',
      isekai: '0',
      sciFi: '0',
      horror: '0',
      psychological: '0',
      idol: '0',
      sports: '0',
      music: '0',
      military: '0',
      gaming: '0',
      virtualReality: '0',
      cyberpunk: '0',
      eroge: '-',
      adultGames: '-',
      manga: '0',
      lightNovels: '0',
      webNovels: '0',
      // Core genres
      mecha: '-',
      magicalGirl: '0',
      shonen: '0',
      shojo: '+',
      seinen: '-',
      josei: '0'
    }
  },
  {
    characterId: 'daru',
    characterName: 'Itaru "Daru" Hashida',
    genres: {
      fanservice: '+',
      ecchi: '+',
      battleShonen: '0',
      harem: '+',
      eroge: '+',
      adultGames: '+',
      sciFi: '+',
      cyberpunk: '+',
      comedy: '+',
      seinen: '+',
      drama: '0',
      romance: '-',          // → Kakashi (tier 9) - CHANGED from 0 to -
      action: '0',
      adventure: '0',
      sliceOfLife: '0',
      isekai: '0',
      fantasy: '0',
      supernatural: '0',
      horror: '0',
      psychological: '0',
      idol: '0',
      sports: '0',
      music: '0',
      school: '0',
      military: '0',
      gaming: '+',
      virtualReality: '+',
      manga: '-',            // → Kakashi/Veldora (tier 9) - CHANGED from 0 to -
      lightNovels: '-',      // → Kakashi (tier 9) - CHANGED from 0 to -
      webNovels: '0',
      // Core genres
      mecha: '0',
      magicalGirl: '-',
      shonen: '0',
      shojo: '-',
      josei: '-'
    }
  },
  {
    characterId: 'ichikawa',
    characterName: 'Ichikawa Kyoutarou',
    genres: {
      horror: '+',
      psychological: '+',
      battleShonen: '0',
      romance: '+',
      sliceOfLife: '+',
      school: '+',
      drama: '+',
      comedy: '0',
      action: '0',
      adventure: '0',
      fantasy: '0',
      supernatural: '0',
      seinen: '0',
      shonen: '0',
      shojo: '0',
      josei: '0',
      mecha: '-',            // → Kinta (already unlocked by this tier)
      sports: '-',           // → Kanbaru (tier 7)
      idol: '-',             // → Shinpachi (same tier, parallel)
      military: '-',
      sciFi: '-',            // → Kinta (already unlocked)
      fanservice: '0',
      ecchi: '-',            // → Rudeus (tier 5)
      harem: '-',            // → Rudeus (tier 5)
      isekai: '-',           // → Rudeus (tier 5) - for mature isekai
      gaming: '0',
      virtualReality: '-',
      cyberpunk: '-',        // → Daru (tier 8)
      eroge: '-',            // → Rudeus/Daru (tier 5/8)
      adultGames: '-',       // → Rudeus/Daru (tier 5/8)
      manga: '+',
      lightNovels: '0',
      webNovels: '0',
      music: '0',
      magicalGirl: '-'
    }
  },
  {
    characterId: 'kakashi',
    characterName: 'Kakashi Hatake',
    genres: {
      // MANGA STRENGTHS - Romance/Drama/Psychological specialist
      romance: '+',          // Anime + Manga
      manga: '+',            // BUT only for romance/drama/psychological/ecchi genres
      lightNovels: '+',
      webNovels: '+',
      drama: '+',            // Manga strength (anime neutral)
      psychological: '+',    // Manga strength (anime neutral)
      ecchi: '+',            // Anime + Manga
      fanservice: '+',       // Anime + Manga
      
      // MANGA WEAKNESSES - Refers to Veldora
      action: '-',           // → Veldora (for manga)
      adventure: '-',        // → Veldora (for manga)
      shonen: '-',           // → Veldora (for manga)
      battleShonen: '-',     // → Veldora (for manga + anime)
      isekai: '-',           // → Veldora (for manga)
      fantasy: '-',          // → Veldora (for manga)
      
      // Neutral
      harem: '0',
      comedy: '0',
      eroge: '0',
      adultGames: '0',
      supernatural: '0',
      sliceOfLife: '0',
      school: '0',
      seinen: '0',
      horror: '0',
      sports: '0',
      sciFi: '0',
      mecha: '0',
      gaming: '0',
      virtualReality: '0',
      cyberpunk: '0',
      music: '0',
      military: '0',
      shojo: '0',
      josei: '0',
      
      // Weaknesses (general)
      idol: '-',
      magicalGirl: '-'
    }
  },
  {
    characterId: 'yuji',
    characterName: 'Yuji Itadori',
    genres: {
      shonen: '+',
      battleShonen: '+', // THIS IS YUJI'S SPECIALTY!
      action: '+',
      supernatural: '+',
      horror: '+',
      psychological: '+',
      drama: '0',
      adventure: '0',
      comedy: '0',
      fantasy: '0',
      school: '0',
      sports: '0',
      seinen: '0',
      sliceOfLife: '-',      // → Marin/Shinpachi (tier 1/4)
      romance: '-',          // → Marin (tier 1)
      ecchi: '-',            // → Marin (tier 1)
      harem: '-',            // → Marin (tier 1)
      fanservice: '-',       // → Marin (tier 1)
      isekai: '-',           // → Ishigami (tier 2) - CHANGED from 0 to -
      mecha: '-',            // → Kinta (tier 3) - CHANGED from 0 to -
      sciFi: '0',
      gaming: '-',           // → Ishigami (tier 2) - CHANGED from 0 to -
      virtualReality: '0',
      cyberpunk: '0',
      eroge: '-',            // → Marin (tier 1)
      adultGames: '-',       // → Marin (tier 1)
      manga: '0',
      lightNovels: '0',
      webNovels: '0',
      music: '-',            // → Shinpachi (tier 4) - CHANGED from 0 to -
      idol: '-',             // → Shinpachi (tier 4)
      military: '0',
      magicalGirl: '-',      // → Marin (tier 1)
      shojo: '-',            // → Marin (tier 1)
      josei: '-'             // → Marin (tier 1)
    }
  },
  {
    characterId: 'bakugo',
    characterName: 'Katsuki Bakugo',
    genres: {
      shonen: '+',
      battleShonen: '+', // Expert - he's from My Hero Academia!
      action: '+',
      adventure: '+',
      sports: '+',
      school: '+',
      drama: '0',
      comedy: '0',
      supernatural: '0',
      fantasy: '0',
      seinen: '0',
      horror: '0',
      psychological: '0',
      military: '0',
      sciFi: '0',
      isekai: '0',
      mecha: '0',
      gaming: '0',
      virtualReality: '0',
      cyberpunk: '0',
      manga: '0',
      lightNovels: '0',
      webNovels: '0',
      music: '0',
      sliceOfLife: '-',
      romance: '-',
      ecchi: '-',
      harem: '-',
      fanservice: '-',
      eroge: '-',
      adultGames: '-',
      idol: '-',
      magicalGirl: '-',
      shojo: '-',
      josei: '-'
    }
  },
  {
    characterId: 'kanbaru',
    characterName: 'Suruga Kanbaru',
    genres: {
      sports: '+',
      supernatural: '+',
      battleShonen: '-',     // → Yuji (already unlocked)
      ecchi: '+',
      fanservice: '+',
      drama: '+',
      romance: '+',
      sliceOfLife: '+',
      comedy: '0',
      action: '0',
      adventure: '0',
      fantasy: '0',
      school: '0',
      seinen: '+',
      horror: '0',
      psychological: '0',
      shonen: '0',
      shojo: '0',
      josei: '+',
      isekai: '0',
      mecha: '-',            // → Kinta (already unlocked)
      sciFi: '-',            // → Daru (tier 8) - CHANGED from 0 to -
      gaming: '0',
      virtualReality: '0',
      cyberpunk: '-',        // → Daru (tier 8) - CHANGED from 0 to -
      harem: '0',
      eroge: '-',            // → Daru (tier 8) - CHANGED from 0 to -
      adultGames: '-',       // → Daru (tier 8) - CHANGED from 0 to -
      manga: '+',
      lightNovels: '0',
      webNovels: '0',
      music: '0',
      idol: '0',
      military: '-',         // → Ainz (already unlocked by this tier)
      magicalGirl: '-'
    }
  },
  {
    characterId: 'rudeus',
    characterName: 'Rudeus Greyrat',
    genres: {
      isekai: '+',
      fantasy: '+',
      battleShonen: '0',
      adventure: '+',
      ecchi: '+',
      harem: '+',
      eroge: '+',
      drama: '0',
      action: '+',
      supernatural: '0',
      romance: '0',
      comedy: '0',
      sliceOfLife: '-',      // → Shinpachi (already unlocked by this tier)
      horror: '-',           // → Ainz (tier 6) - CHANGED from 0 to -
      psychological: '-',    // → Ainz (tier 6) - CHANGED from 0 to -
      seinen: '+',
      shonen: '0',
      shojo: '-',
      josei: '-',
      sports: '0',
      mecha: '0',
      sciFi: '0',
      gaming: '0',
      virtualReality: '0',
      cyberpunk: '0',
      fanservice: '+',
      adultGames: '+',
      manga: '0',
      lightNovels: '+',
      webNovels: '0',
      music: '0',
      idol: '-',             // → Shinpachi (already unlocked)
      school: '-',
      military: '0',
      magicalGirl: '-'
    }
  },
  {
    characterId: 'king',
    characterName: 'King',
    genres: {
      // GAMING & STRATEGY EXPERTISE
      gaming: '+',              // Master gamer, wins tournaments
      virtualReality: '+',      // Gaming expert
      psychological: '+',       // Expert at bluffing and intimidation
      seinen: '+',              // Mature themes, strategic thinking
      comedy: '+',              // Parody/satire expert (One Punch Man)
      
      // NEUTRAL GENRES
      action: '0',
      adventure: '0',
      drama: '0',
      romance: '0',
      sliceOfLife: '0',
      fantasy: '0',
      sciFi: '0',
      supernatural: '0',
      horror: '0',
      school: '0',
      music: '0',
      military: '0',
      cyberpunk: '0',
      manga: '0',
      lightNovels: '0',
      webNovels: '0',
      
      // WEAKNESSES - Refers to others
      battleShonen: '-',       // → Yuji/Bakugo (tier 1)
      fanservice: '-',          // → Marin (tier 1)
      ecchi: '-',              // → Marin (tier 1)
      harem: '-',              // → Marin (tier 1)
      eroge: '-',              // → Daru (tier 8)
      adultGames: '-',         // → Daru (tier 8)
      idol: '-',               // → Shinpachi (tier 4)
      sports: '-',             // → Kanbaru (tier 7)
      isekai: '-',             // → Rudeus (tier 5)
      magicalGirl: '-',        // → Marin (tier 1)
      shojo: '-',              // → Marin (tier 1)
      josei: '-'
    }
  },
  {
    characterId: 'konata',
    characterName: 'Konata Izumi',
    genres: {
      // ULTIMATE OTAKU EXPERTISE - Knows most genres
      sliceOfLife: '+',        // Ultimate slice of life expert
      comedy: '+',              // Comedy specialist
      school: '+',              // School life expert
      manga: '+',               // Manga expert
      lightNovels: '+',         // Light novel knowledge
      webNovels: '+',           // Web novel knowledge
      gaming: '+',              // Skilled gamer, especially RPGs
      romance: '+',             // Knows romance anime
      shonen: '+',              // Knows shonen anime
      shojo: '+',               // Knows shojo anime
      seinen: '+',               // Knows seinen anime
      josei: '+',               // Knows josei anime
      action: '+',              // Knows action anime
      adventure: '+',           // Knows adventure anime
      drama: '+',               // Knows drama anime
      fantasy: '+',             // Knows fantasy anime
      sciFi: '+',              // Knows sci-fi anime
      supernatural: '+',        // Knows supernatural anime
      horror: '+',             // Knows horror anime
      psychological: '+',      // Knows psychological anime
      music: '+',              // Knows music anime
      idol: '+',               // Knows idol anime
      sports: '+',             // Knows sports anime
      isekai: '+',             // Knows isekai anime
      mecha: '+',              // Knows mecha anime
      magicalGirl: '+',        // Knows magical girl anime
      fanservice: '+',         // Knows fanservice anime
      ecchi: '+',              // Knows ecchi anime
      harem: '+',              // Knows harem anime
      military: '+',           // Knows military anime
      cyberpunk: '+',          // Knows cyberpunk anime
      virtualReality: '+',     // Knows VR anime
      
      // NEUTRAL GENRES (only a few)
      eroge: '0',              // Neutral - not her specialty
      adultGames: '0',         // Neutral - not her specialty
      
      // WEAKNESSES - Very few, only for extreme content
      // (None - she's the ultimate otaku!)
    }
  }
];

// Helper functions
export const getCharacterExpertise = (characterId: string): CharacterExpertise | undefined => {
  return CHARACTER_EXPERTISE.find(char => char.characterId === characterId);
};

export const getExpertForGenre = (genre: keyof CharacterExpertise['genres']): CharacterExpertise[] => {
  return CHARACTER_EXPERTISE.filter(char => char.genres[genre] === '+');
};

export const getWeakCharactersForGenre = (genre: keyof CharacterExpertise['genres']): CharacterExpertise[] => {
  return CHARACTER_EXPERTISE.filter(char => char.genres[genre] === '-');
};

export const isCharacterExpert = (characterId: string, genre: keyof CharacterExpertise['genres']): boolean => {
  const char = getCharacterExpertise(characterId);
  return char ? char.genres[genre] === '+' : false;
};

export const isCharacterWeak = (characterId: string, genre: keyof CharacterExpertise['genres']): boolean => {
  const char = getCharacterExpertise(characterId);
  return char ? char.genres[genre] === '-' : false;
};

export const getCharacterRating = (characterId: string, genre: keyof CharacterExpertise['genres']): '+' | '0' | '-' | undefined => {
  const char = getCharacterExpertise(characterId);
  return char ? char.genres[genre] : undefined;
};
