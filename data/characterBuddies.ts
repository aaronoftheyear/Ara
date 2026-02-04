// Character Buddy System for Unlock System 3.0
// Each character has buddies they refer to for genres they're weak in

export interface BuddyPreference {
  characterId: string;
  rank: number; // 1 = first choice, 2 = second choice
  genres: string[]; // Which genres this buddy covers
  type: 'progressive' | 'back_referral' | 'special'; // Progressive = leads to new unlock, back_referral = already unlocked, special = unique condition
  note?: string; // Optional explanation for special cases
}

export interface CharacterBuddySystem {
  characterId: string;
  buddies: BuddyPreference[];
}

export const CHARACTER_BUDDIES: CharacterBuddySystem[] = [
  // TIER 1: STARTER
  {
    characterId: 'yuji',
    buddies: [
      // Based on actual weaknesses from characterExpertise.ts
      { characterId: 'marin', rank: 1, genres: ['romance', 'ecchi', 'harem', 'fanservice', 'eroge', 'adultGames', 'magicalGirl', 'shojo', 'josei', 'sliceOfLife'], type: 'progressive' },
      { characterId: 'shinpachi', rank: 1, genres: ['sliceOfLife', 'idol', 'music'], type: 'progressive' },
      { characterId: 'ishigami', rank: 1, genres: ['isekai', 'gaming'], type: 'progressive' },
      { characterId: 'kinta', rank: 1, genres: ['mecha'], type: 'progressive' },
    ],
  },

  // TIER 2: EARLY UNLOCKS
  {
    characterId: 'marin',
    buddies: [
      // Progressive referrals - Based on actual weaknesses from characterExpertise.ts
      { characterId: 'rikka', rank: 1, genres: ['supernatural', 'fantasy'], type: 'progressive' },
      { characterId: 'ichikawa', rank: 1, genres: ['horror', 'psychological'], type: 'progressive' },
      { characterId: 'ishigami', rank: 1, genres: ['isekai', 'gaming', 'virtualReality', 'seinen'], type: 'progressive' },
      { characterId: 'kinta', rank: 1, genres: ['mecha', 'military'], type: 'progressive' },
      { characterId: 'kanbaru', rank: 1, genres: ['sports'], type: 'progressive' },
      { characterId: 'king', rank: 1, genres: ['gaming', 'psychological'], type: 'progressive' },
      
      // Back referrals (deadends)
      { characterId: 'yuji', rank: 1, genres: ['action', 'shonen'], type: 'back_referral' },
      { characterId: 'shinpachi', rank: 1, genres: ['comedy', 'parody'], type: 'back_referral' },
    ],
  },
  {
    characterId: 'shinpachi',
    buddies: [
      // Progressive referrals - Based on actual weaknesses: battleShonen, fanservice, ecchi, harem, eroge, adultGames, mecha, magicalGirl
      { characterId: 'kinta', rank: 1, genres: ['mecha'], type: 'progressive' },
      { characterId: 'rudeus', rank: 1, genres: ['fanservice', 'ecchi', 'harem', 'eroge', 'adultGames'], type: 'progressive' },
      
      // Back referrals
      { characterId: 'yuji', rank: 1, genres: ['battleShonen', 'shonen', 'action'], type: 'back_referral' },
      { characterId: 'marin', rank: 1, genres: ['magicalGirl', 'romance'], type: 'back_referral' },
    ],
  },

  // TIER 3: MID-GAME
  {
    characterId: 'rikka',
    buddies: [
      // Progressive referrals - Weaknesses: battleShonen, eroge, adultGames, mecha, seinen
      { characterId: 'kinta', rank: 1, genres: ['mecha'], type: 'progressive' },
      { characterId: 'rudeus', rank: 1, genres: ['eroge', 'adultGames'], type: 'progressive' },
      { characterId: 'daru', rank: 1, genres: ['eroge', 'adultGames'], type: 'progressive', note: 'Alternative to Rudeus' },
      
      // Back referrals
      { characterId: 'yuji', rank: 1, genres: ['battleShonen', 'action'], type: 'back_referral' },
      { characterId: 'ishigami', rank: 1, genres: ['seinen'], type: 'back_referral' },
    ],
  },
  {
    characterId: 'ishigami',
    buddies: [
      // Progressive referrals - Weaknesses: ecchi, harem, mecha
      { characterId: 'rudeus', rank: 1, genres: ['ecchi', 'harem'], type: 'progressive' },
      { characterId: 'kinta', rank: 1, genres: ['mecha'], type: 'progressive' },
      
      // Back referrals
      { characterId: 'marin', rank: 1, genres: ['romance', 'fashion'], type: 'back_referral' },
      { characterId: 'shinpachi', rank: 1, genres: ['comedy', 'idol'], type: 'back_referral' },
      { characterId: 'yuji', rank: 1, genres: ['action', 'shonen'], type: 'back_referral' },
    ],
  },
  {
    characterId: 'kinta',
    buddies: [
      // Progressive referrals - Weaknesses: ecchi, harem, eroge, adultGames, idol, music
      { characterId: 'daru', rank: 1, genres: ['ecchi', 'harem', 'eroge', 'adultGames'], type: 'progressive' },
      
      // Back referrals
      { characterId: 'shinpachi', rank: 1, genres: ['idol', 'music', 'comedy'], type: 'back_referral' },
      { characterId: 'yuji', rank: 1, genres: ['action', 'shonen'], type: 'back_referral' },
      { characterId: 'marin', rank: 1, genres: ['romance', 'fashion'], type: 'back_referral' },
    ],
  },

  // TIER 4: LATE GAME
  {
    characterId: 'daru',
    buddies: [
      // Progressive referrals - Weaknesses: romance, manga, lightNovels
      { characterId: 'kakashi', rank: 1, genres: ['romance', 'manga', 'lightNovels'], type: 'progressive' },
      
      // Back referrals
      { characterId: 'kinta', rank: 1, genres: ['mecha', 'sci_fi'], type: 'back_referral' },
      { characterId: 'shinpachi', rank: 1, genres: ['otaku_culture', 'comedy', 'idol'], type: 'back_referral' },
      { characterId: 'ishigami', rank: 1, genres: ['gaming', 'internet_culture'], type: 'back_referral' },
    ],
  },
  {
    characterId: 'ichikawa',
    buddies: [
      // Progressive referrals - Weaknesses: mecha, sciFi, sports, idol, ecchi, harem, eroge, adultGames, isekai, cyberpunk
      { characterId: 'kanbaru', rank: 1, genres: ['sports'], type: 'progressive' },
      { characterId: 'rudeus', rank: 1, genres: ['ecchi', 'harem', 'eroge', 'adultGames', 'isekai'], type: 'progressive' },
      { characterId: 'daru', rank: 1, genres: ['cyberpunk'], type: 'progressive' },
      
      // Back referrals
      { characterId: 'kinta', rank: 1, genres: ['mecha', 'sciFi'], type: 'back_referral' },
      { characterId: 'shinpachi', rank: 1, genres: ['idol'], type: 'back_referral' },
      { characterId: 'ishigami', rank: 1, genres: ['romance', 'gaming'], type: 'back_referral' },
      { characterId: 'marin', rank: 1, genres: ['romance'], type: 'back_referral' },
    ],
  },
  {
    characterId: 'rudeus',
    buddies: [
      // Progressive referrals - Weaknesses: sliceOfLife, idol, horror, psychological
      { characterId: 'ainz', rank: 1, genres: ['horror', 'psychological'], type: 'progressive' },
      
      // Back referrals
      { characterId: 'shinpachi', rank: 1, genres: ['sliceOfLife', 'idol', 'comedy'], type: 'back_referral' },
      { characterId: 'yuji', rank: 1, genres: ['friendship', 'action'], type: 'back_referral' },
      { characterId: 'rikka', rank: 1, genres: ['fantasy', 'supernatural'], type: 'back_referral' },
    ],
  },
  {
    characterId: 'ainz',
    buddies: [
      // Progressive referrals - Weaknesses: sliceOfLife, idol, fanservice, ecchi, sports, josei, harem
      { characterId: 'kanbaru', rank: 1, genres: ['fanservice', 'ecchi', 'sports', 'josei'], type: 'progressive' },
      
      // Back referrals
      { characterId: 'shinpachi', rank: 1, genres: ['sliceOfLife', 'idol'], type: 'back_referral' },
      { characterId: 'rudeus', rank: 1, genres: ['harem'], type: 'back_referral' },
      { characterId: 'kinta', rank: 1, genres: ['strategy', 'mecha'], type: 'back_referral' },
      { characterId: 'rikka', rank: 1, genres: ['supernatural', 'fantasy'], type: 'back_referral' },
    ],
  },
  {
    characterId: 'kanbaru',
    buddies: [
      // Progressive referrals - Weaknesses: battleShonen, mecha, sciFi, cyberpunk, eroge, adultGames, military
      { characterId: 'bakugo', rank: 1, genres: ['battleShonen'], type: 'progressive' },
      { characterId: 'daru', rank: 1, genres: ['sciFi', 'cyberpunk', 'eroge', 'adultGames'], type: 'progressive' },
      
      // Back referrals
      { characterId: 'yuji', rank: 1, genres: ['battleShonen', 'action'], type: 'back_referral' },
      { characterId: 'kinta', rank: 1, genres: ['mecha'], type: 'back_referral' },
      { characterId: 'ainz', rank: 1, genres: ['military'], type: 'back_referral' },
      { characterId: 'ishigami', rank: 1, genres: ['gaming'], type: 'back_referral' },
    ],
  },

  // TIER 5: ENDGAME SPECIALISTS
  {
    characterId: 'bakugo',
    buddies: [
      // Progressive referrals - Weaknesses: sliceOfLife, romance, ecchi, harem, fanservice, eroge, adultGames, idol, magicalGirl, shojo, josei
      // (None - Bakugo is endgame, all his weaknesses lead to already-unlocked characters)
      
      // Back referrals
      { characterId: 'marin', rank: 1, genres: ['romance', 'ecchi', 'harem', 'fanservice', 'magicalGirl', 'shojo', 'josei'], type: 'back_referral' },
      { characterId: 'shinpachi', rank: 1, genres: ['sliceOfLife', 'idol', 'comedy'], type: 'back_referral' },
      { characterId: 'rudeus', rank: 1, genres: ['eroge', 'adultGames'], type: 'back_referral' },
      { characterId: 'yuji', rank: 1, genres: ['friendship', 'determination'], type: 'back_referral' },
    ],
  },
  {
    characterId: 'veldora',
    buddies: [
      // ANIME requests (back referrals to lower tiers)
      { characterId: 'yuji', rank: 1, genres: ['shonen', 'friendship'], type: 'back_referral', note: 'For anime only' },
      { characterId: 'marin', rank: 1, genres: ['romance', 'ecchi', 'slice_of_life'], type: 'back_referral', note: 'For anime only' },
      { characterId: 'shinpachi', rank: 1, genres: ['comedy', 'parody', 'slice_of_life'], type: 'back_referral', note: 'For anime only' },
      { characterId: 'rikka', rank: 1, genres: ['supernatural', 'fantasy'], type: 'back_referral', note: 'For anime only' },
      { characterId: 'ishigami', rank: 1, genres: ['romance', 'drama'], type: 'back_referral', note: 'For anime only' },
      { characterId: 'ichikawa', rank: 1, genres: ['psychological', 'drama'], type: 'back_referral', note: 'For anime only' },
      { characterId: 'kanbaru', rank: 1, genres: ['sports', 'mystery'], type: 'back_referral', note: 'For anime only' },
      
      // MANGA requests (progressive) - Veldora's manga weaknesses
      { characterId: 'kakashi', rank: 1, genres: ['romance_manga', 'drama_manga', 'psychological_manga', 'ecchi_manga'], type: 'progressive', note: 'For manga only - Veldora weak in these' },
      
      // SPECIAL (progressive)
      { characterId: 'ainz', rank: 1, genres: ['dark_fantasy', 'strategy'], type: 'special', note: 'Respects overwhelming power' },
      { characterId: 'kinta', rank: 1, genres: ['mecha'], type: 'special', note: 'Believes Kinta\'s exaggerated robot stories, thinks he\'s genuinely strong' },
    ],
  },
  {
    characterId: 'kakashi',
    buddies: [
      // ANIME requests (back referrals to lower tiers)
      { characterId: 'yuji', rank: 1, genres: ['action', 'shonen', 'friendship'], type: 'back_referral', note: 'For anime only' },
      { characterId: 'kinta', rank: 1, genres: ['sci_fi', 'mecha'], type: 'back_referral', note: 'For anime only' },
      { characterId: 'shinpachi', rank: 1, genres: ['comedy', 'slice_of_life'], type: 'back_referral', note: 'For anime only' },
      { characterId: 'rikka', rank: 1, genres: ['fantasy', 'supernatural'], type: 'back_referral', note: 'For anime only' },
      { characterId: 'ainz', rank: 1, genres: ['dark', 'strategy'], type: 'back_referral', note: 'For anime only' },
      { characterId: 'marin', rank: 1, genres: ['fashion', 'slice_of_life'], type: 'back_referral', note: 'For anime only, non-ecchi romance' },
      
      // MANGA requests (progressive) - Kakashi's manga weaknesses
      { characterId: 'veldora', rank: 1, genres: ['action_manga', 'adventure_manga', 'shonen_manga', 'battleShonen_manga', 'isekai_manga', 'fantasy_manga'], type: 'progressive', note: 'For manga only - Kakashi weak in these' },
      
      // SPECIAL (progressive)
      { characterId: 'bakugo', rank: 1, genres: ['superhero', 'explosive_personality'], type: 'special', note: 'Personality match - both have explosive energy' },
    ],
  },
  {
    characterId: 'king',
    buddies: [
      // Progressive referrals - Weaknesses: battleShonen, fanservice, ecchi, harem, eroge, adultGames, idol, sports, isekai, magicalGirl, shojo, josei
      { characterId: 'yuji', rank: 1, genres: ['battleShonen'], type: 'progressive' },
      { characterId: 'marin', rank: 1, genres: ['fanservice', 'ecchi', 'harem', 'magicalGirl', 'shojo', 'josei'], type: 'progressive' },
      { characterId: 'kanbaru', rank: 1, genres: ['sports'], type: 'progressive' },
      { characterId: 'rudeus', rank: 1, genres: ['eroge', 'adultGames', 'isekai'], type: 'progressive' },
      { characterId: 'shinpachi', rank: 1, genres: ['idol'], type: 'progressive' },
      
      // Back referrals
      { characterId: 'ishigami', rank: 1, genres: ['gaming', 'strategy'], type: 'back_referral', note: 'Both are gamers' },
      { characterId: 'ainz', rank: 1, genres: ['psychological', 'strategy'], type: 'back_referral', note: 'Both are strategic thinkers' },
    ],
  },
  {
    characterId: 'konata',
    buddies: [
      // Progressive referrals - Very few weaknesses: eroge, adultGames
      { characterId: 'daru', rank: 1, genres: ['eroge', 'adultGames'], type: 'progressive' },
      
      // Back referrals - She can refer to specialists for deeper knowledge
      { characterId: 'yuji', rank: 1, genres: ['battleShonen', 'action'], type: 'back_referral', note: 'For intense battle shonen' },
      { characterId: 'marin', rank: 1, genres: ['romance', 'fanservice'], type: 'back_referral', note: 'For deep romance expertise' },
      { characterId: 'ishigami', rank: 1, genres: ['gaming', 'seinen'], type: 'back_referral', note: 'For gaming expertise' },
      { characterId: 'kinta', rank: 1, genres: ['mecha'], type: 'back_referral', note: 'For mecha expertise' },
      { characterId: 'shinpachi', rank: 1, genres: ['idol', 'comedy'], type: 'back_referral', note: 'For idol expertise' },
      { characterId: 'kanbaru', rank: 1, genres: ['sports'], type: 'back_referral', note: 'For sports expertise' },
      { characterId: 'rudeus', rank: 1, genres: ['isekai'], type: 'back_referral', note: 'For isekai expertise' },
      { characterId: 'ainz', rank: 1, genres: ['horror', 'psychological'], type: 'back_referral', note: 'For dark themes' },
      { characterId: 'ichikawa', rank: 1, genres: ['horror', 'psychological'], type: 'back_referral', note: 'For horror expertise' },
    ],
  },
];

// Helper function to get buddies for a character
export function getBuddiesForCharacter(characterId: string): BuddyPreference[] {
  const characterBuddies = CHARACTER_BUDDIES.find(cb => cb.characterId === characterId);
  return characterBuddies ? characterBuddies.buddies : [];
}

// Helper function to check if a buddy is already unlocked (back referral)
export function isBackReferral(buddy: BuddyPreference): boolean {
  return buddy.type === 'back_referral';
}

// Helper function to get progressive buddies only
export function getProgressiveBuddies(characterId: string): BuddyPreference[] {
  return getBuddiesForCharacter(characterId).filter(b => b.type === 'progressive' || b.type === 'special');
}

