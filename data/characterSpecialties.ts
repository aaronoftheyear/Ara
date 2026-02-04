// Character Specialties - Keywords that trigger instant referrals
// AI will detect semantic meaning, so variants are included

export interface Specialty {
  keywords: string[]; // Multiple keywords map to same specialty (AI detects semantic meaning)
  characterId: string;
  triggerCondition: 'always' | 'if_weakness'; // always = instant, if_weakness = only if current character weak
  specialSequence?: boolean; // Triggers special interrupt sequence
  note?: string;
}

export const SPECIALTIES: Specialty[] = [
  // Marin's Specialties
  {
    keywords: ['magical girl', 'mahou shoujo', 'magical girls', 'mahou shojo'],
    characterId: 'marin',
    triggerCondition: 'if_weakness',
    note: 'Marin loves magical girl anime',
  },
  {
    keywords: ['cosplay', 'cosplaying', 'costume play', 'cosplayer'],
    characterId: 'marin',
    triggerCondition: 'always',
    note: 'Cosplay is Marin\'s passion',
  },

  // Shinpachi's Specialty
  {
    keywords: ['idol', 'idol anime', 'idol music', 'idol performances'],
    characterId: 'shinpachi',
    triggerCondition: 'always',
    note: 'Idol and music topics always hand off to Shinpachi instantly',
  },

  // Rudeus Specialty (adult/adventure ecchi blends)
  {
    keywords: ['adventure ecchi', 'ecchi adventure', 'adult isekai', 'mature isekai'],
    characterId: 'rudeus',
    triggerCondition: 'if_weakness',
    note: 'Mature isekai or ecchi adventure requests unlock Rudeus',
  },

  // Veldora's Specialty (ONLY via manga request)
  {
    keywords: ['battle shonen manga', 'battle shounen manga', 'fighting manga', 'shonen battle manga'],
    characterId: 'veldora',
    triggerCondition: 'always',
    specialSequence: true,
    note: 'Triggers Veldora\'s special interrupt sequence',
  },

  // Kinta's Specialty
  {
    keywords: ['mecha', 'big robots', 'giant robots', 'mechs', 'mecha anime'],
    characterId: 'kinta',
    triggerCondition: 'if_weakness',
    note: 'Kinta is the mecha expert',
  },
  {
    keywords: ['gundam'],
    characterId: 'kinta',
    triggerCondition: 'always',
    note: 'Gundam always goes to Kinta',
  },

  // Additional specialty ideas (examples for future expansion)
  {
    keywords: ['hard sci-fi', 'hard science fiction'],
    characterId: 'daru',
    triggerCondition: 'if_weakness',
    note: 'Route dense sci-fi tech requests to Daru',
  },
  {
    keywords: ['martial arts classic', 'old school martial arts'],
    characterId: 'yuji',
    triggerCondition: 'if_weakness',
    note: 'Push classic martial arts buffs back to Yuji when others are weak',
  },

  // Bakugo's Specialty
  {
    keywords: ['superhero', 'superheroes', 'super hero', 'super heroes'],
    characterId: 'bakugo',
    triggerCondition: 'if_weakness',
    note: 'Bakugo for superhero anime',
  },
];

// Helper function to check if input matches any specialty
export function detectSpecialty(userInput: string): Specialty | null {
  const lowerInput = userInput.toLowerCase();
  
  for (const specialty of SPECIALTIES) {
    for (const keyword of specialty.keywords) {
      if (lowerInput.includes(keyword.toLowerCase())) {
        return specialty;
      }
    }
  }
  
  return null;
}

// Helper function to check if specialty should trigger based on current character
export function shouldTriggerSpecialty(
  specialty: Specialty,
  currentCharacterWeaknesses: string[]
): boolean {
  if (specialty.triggerCondition === 'always') {
    return true;
  }
  
  // For 'if_weakness', need to check if current character has weakness related to specialty
  // This is a simplified check - in actual implementation, AI will determine genre matching
  return currentCharacterWeaknesses.length > 0;
}


