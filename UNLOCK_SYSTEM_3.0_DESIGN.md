# UNLOCK SYSTEM 3.0 - DESIGN DOCUMENT

## FEEDBACK INCORPORATED (v1.1)

### ✅ 1. No Exact Keywords - AI Semantic Detection
- Keywords expanded to include variations (e.g., "cosplay" = "cosplaying", "costume play")
- "Romance books" = "Romantic manga" (AI detects semantic meaning)
- "Big robots" = "Mecha" (AI interprets intent)
- Removed Kakashi's "romance books" as specialty (handled by normal routing)

### ✅ 2. Back Referrals (Deadends)
- **NEW:** All Tier 2+ characters now have back referrals to already-unlocked characters
- Example: Marin can refer back to Yuji for action/shonen (deadend, no progression)
- Example: Rikka can refer back to Yuji or Marin (circular exploration)
- Prevents all weaknesses from being purely progressive
- Creates natural conversation flow even with unlocked characters

### ✅ 3. Veldora & Kakashi - MANGA ONLY Discovery
- **REMOVED:** All direct buddy referrals to Veldora/Kakashi from regular characters
- **NEW RULE:** Can ONLY discover them via explicit "[Genre] manga" requests
- Example: ✓ "Action manga" → Veldora | ✗ "Action anime" → Normal buddy
- This makes them true endgame specialists requiring specific discovery method

### ✅ 4. Veldora & Kakashi - Limited Anime Coverage
- **When unlocked and asked about ANIME (not manga):**
  - **Veldora:** ONLY shonen, action, adventure anime (strength)
  - **Kakashi:** ONLY romance, ecchi, fanservice anime (strength)
  - All other anime genres → Refer to buddies
- **Expanded buddy lists:** 6-8 buddies each (mostly lower tier characters)
- Creates back referrals from endgame to early game

### ✅ 5. "Ask Again" Hint - ONLY for Yuji
- **Discovery message with Yuji:** "New Unknown Contact discovered! Maybe if you ask Yuji about romance again..."
- **Discovery message with others:** "New Unknown Contact discovered!" (no hint)
- Makes Yuji feel like a tutorial character (helpful starter)
- Other characters trust users to figure it out

### ✅ 6. Bakugo - Reduced Referrals
- **OLD:** 5 characters referred to Bakugo (too easy)
- **NEW:** 1 character refers to Bakugo (Kakashi only)
- Makes Bakugo intentionally rare and endgame
- Reduced from "Most Referenced" to "Least Referenced"

---

## FEEDBACK INCORPORATED (v1.2 - Additional Changes)

### ✅ 7. Veldora & Kakashi - Mutual Manga Referrals
- **NEW:** Veldora and Kakashi are buddies for MANGA requests
- Veldora + "Romance manga" → Refers to Kakashi
- Kakashi + "Action manga" → Refers to Veldora
- Creates interconnected endgame manga specialist network

### ✅ 8. Kinta's Buddies Rebalanced
- **OLD:** Kinta referred to Bakugo (didn't make sense)
- **NEW:** Kinta refers to Rikka, Rudeus, Kanbaru (matches his weaknesses better)
- More logical connections based on genre weaknesses

### ✅ 9. Veldora & Kakashi - Progressive Referrals Added
- **OLD:** Only back referrals (all deadends)
- **NEW:** Mix of back referrals + progressive referrals
- **Veldora progressives:**
  - → Kakashi (romance manga, ecchi manga)
  - → Ainz (respects power, dark fantasy)
  - → Kinta (believes Kinta's exaggerated robot stories, thinks he's strong)
- **Kakashi progressives:**
  - → Veldora (action manga, shonen manga)
  - → Bakugo (personality match, explosive characters)
- Makes endgame specialists more engaging, not pure deadends

---

## CORE PRINCIPLES

### 1. FRANCHISE REQUIREMENT (Unchanged)
- **Rule:** User MUST have watched the character's anime to unlock them
- **Implementation:** Check user's watch list against character's `franchises` array
- **Status:** Keep existing logic from System 2.0

---

## 2. BUDDY SYSTEM (New Core Mechanic)

### Concept
Every character has **buddies** - trusted contacts they refer users to when asked about genres they're weak in.

### Buddy Structure
```typescript
interface BuddyPreference {
  characterId: string;
  rank: number; // 1 = first choice, 2 = second choice, etc.
  genres: string[]; // Which genres this buddy covers
  condition?: string; // Optional: "if romance", "if comedy", etc.
}

interface CharacterBuddies {
  characterId: string;
  buddies: BuddyPreference[];
}
```

### Buddy Selection Logic

**Single Buddy for Genre:**
```
User asks for Genre X
→ Current character has weakness to X
→ Current character has 1 buddy with strength in X
→ Refer to that buddy
```

**Multiple Buddies for Genre (Ranked):**
```
User asks for "Slice of Life"
→ Yuji has weakness to Slice of Life
→ Yuji has 2 buddies: Shinpachi (rank 1), Marin (rank 2)
→ Default to Shinpachi (rank 1)

User asks for "Slice of Life + Romance"
→ Yuji has weakness to both
→ Shinpachi (Slice of Life, no Romance strength)
→ Marin (Slice of Life + Romance strength)
→ Marin is better match → Refer to Marin
```

**Best Buddy Selection Algorithm:**
```javascript
function selectBestBuddy(requestedGenres, characterBuddies, buddyExpertise) {
  // Filter buddies who have strengths in requested genres
  const matchingBuddies = buddies.filter(buddy => 
    requestedGenres.every(genre => 
      buddyExpertise[buddy.characterId].strengths.includes(genre)
    )
  );
  
  // Sort by:
  // 1. Number of matching genres (more = better)
  // 2. Rank (lower = better)
  return matchingBuddies.sort((a, b) => {
    const aMatches = countMatchingGenres(a, requestedGenres);
    const bMatches = countMatchingGenres(b, requestedGenres);
    
    if (aMatches !== bMatches) return bMatches - aMatches;
    return a.rank - b.rank;
  })[0];
}
```

---

## 3. UNLOCK CONDITIONS

### Discovery (New Unknown Contact)
```
Conditions:
1. User mentions Genre(s)
2. Genre is Current Character's WEAKNESS
3. Genre is Buddy's STRENGTH
4. Buddy is the BEST OPTION among current character's buddies
5. User has WATCHED buddy's franchise anime

Result:
→ Current character acknowledges weakness
→ Current character mentions they know someone better
→ Current character gives 1 recommendation (Genre + Current's Strength)
→ New Unknown Contact discovered (Buddy)
```

### Unlock (From Discovery to Unlocked)
```
Conditions:
1. Unknown Contact already discovered
2. User requests genre where this buddy is BEST OPTION again (2nd time)
3. User has WATCHED buddy's franchise anime

Result:
→ Buddy unlocked
→ Can now chat with buddy directly
```

**Example Flow:**
```
1st Romance Request → Yuji refers to Unknown Contact → Marin discovered (locked)
2nd Romance Request → Yuji refers to Marin → Marin UNLOCKED (if watched "My Dress-Up Darling")
```

---

## 4. SPECIALTIES (Instant Referral)

### Specialty System
Certain characters have **specialties** - unique domains that trigger instant referrals regardless of current character's expertise.

### Specialty List
```typescript
interface Specialty {
  keywords: string[]; // Multiple keywords map to same specialty (AI detects semantic meaning)
  characterId: string;
  triggerCondition: "always" | "if_weakness";
  specialSequence?: boolean;
}

const SPECIALTIES: Specialty[] = [
  // Marin's Specialties
  { 
    keywords: ["magical girl", "mahou shoujo", "magical girls"], 
    characterId: "marin", 
    triggerCondition: "if_weakness" 
  },
  { 
    keywords: ["cosplay", "cosplaying", "costume play"], 
    characterId: "marin", 
    triggerCondition: "always" 
  },
  
  // Veldora's Specialty (ONLY via manga request)
  { 
    keywords: ["battle shonen manga", "battle shounen manga", "fighting manga"], 
    characterId: "veldora", 
    triggerCondition: "always", 
    specialSequence: true 
  },
  
  // Kinta's Specialty
  { 
    keywords: ["mecha", "big robots", "giant robots", "mechs"], 
    characterId: "kinta", 
    triggerCondition: "if_weakness" 
  },
  { 
    keywords: ["gundam"], 
    characterId: "kinta", 
    triggerCondition: "always" 
  },
  
  // Bakugo's Specialty
  { 
    keywords: ["superhero", "superheroes", "super hero"], 
    characterId: "bakugo", 
    triggerCondition: "if_weakness" 
  },
];

// NOTE: Romance books/manga and romantic manga are NOT specialties
// They are handled via normal buddy system + manga routing to Kakashi/Veldora
```

### Specialty Trigger Logic
```javascript
function checkSpecialtyTrigger(userInput, currentCharacter) {
  for (const specialty of SPECIALTIES) {
    if (userInput.toLowerCase().includes(specialty.keyword)) {
      // Check trigger condition
      if (specialty.triggerCondition === "always") {
        return specialty; // Instant referral
      }
      
      if (specialty.triggerCondition === "if_weakness") {
        // Only trigger if current character has weakness to related genres
        const relatedGenre = mapKeywordToGenre(specialty.keyword);
        if (currentCharacter.weaknesses.includes(relatedGenre)) {
          return specialty;
        }
      }
    }
  }
  return null;
}
```

### Special Sequence (Veldora)
```
User mentions "battle shonen manga" to ANY character
→ Veldora special sequence triggers:
  1. "Unknown character has entered the chat" (if not unlocked)
  2. "Veldora kicked [previous character]"
  3. Veldora says his piece
  4. Veldora recommends 3 battle shonen manga
```

---

## 5. SPECIAL CHARACTERS (Manga Experts)

### Veldora & Kakashi - Manga Specialists

**CRITICAL: Can ONLY be discovered via MANGA requests**

### Discovery Rules
```
Access to Veldora/Kakashi:
→ User must explicitly request "[Genre] manga"
→ Genre must be current character's WEAKNESS
→ Genre must be Veldora/Kakashi's STRENGTH
→ No direct buddy referrals from regular characters

Example:
✓ "Can you recommend action manga?" (with Ishigami) → Veldora
✓ "Any good romance manga?" (with Kinta) → Kakashi
✗ "Action anime recommendations" → Normal buddy system
✗ Direct buddy referrals to Veldora/Kakashi → NOT ALLOWED
```

### When Unlocked - Behavior Changes

**Veldora - When Asked About Anime (not manga):**
```
Limited Anime Strengths: Shonen, Action, Adventure ONLY

Veldora + "Romance anime" → Weakness, refer to buddy
Veldora + "Action anime" → Strength, handles himself
Veldora + "Fantasy anime" → Weakness, refer to buddy
Veldora + "Isekai anime" → Weakness, refer to buddy

Default: Assumes MANGA unless "anime" is specified
```

**Kakashi - When Asked About Anime (not manga):**
```
Limited Anime Strengths: Romance, Ecchi, Fanservice ONLY

Kakashi + "Action anime" → Weakness, refer to buddy
Kakashi + "Romance anime" → Strength, handles himself
Kakashi + "Mystery anime" → Weakness, refer to buddy
Kakashi + "Drama anime" → Weakness, refer to buddy

Default: Assumes MANGA unless "anime" is specified
```

### Buddy System (More Diverse, Lower Tier Focus)
```
Veldora & Kakashi have MORE buddies than other characters
Buddies include both LOWER TIER (back referrals) and PROGRESSIVE referrals

Veldora Buddies:
ANIME weaknesses (back referrals):
→ Yuji (for shonen anime with friendship themes)
→ Marin (for romance anime, ecchi anime)
→ Shinpachi (for comedy anime, slice of life)
→ Rikka (for supernatural anime, fantasy anime)
→ Ishigami (for romance anime, drama)
→ Kyotaro (for psychological anime, drama)

MANGA weaknesses (progressive):
→ Kakashi (for romance manga, ecchi manga, drama manga)

SPECIAL (progressive):
→ Ainz (for dark fantasy, strategy - Veldora respects power)
→ Kinta (for mecha - Veldora thinks Kinta is strong because of how confidently Kinta talks about robots, believes his exaggerations)

Kakashi Buddies:
ANIME weaknesses (back referrals):
→ Yuji (for action anime, shonen anime)
→ Kinta (for sci-fi anime, mecha)
→ Shinpachi (for comedy anime)
→ Rikka (for fantasy anime, supernatural)
→ Ainz (for dark anime, strategy)
→ Marin (for fashion anime, slice of life)

MANGA weaknesses (progressive):
→ Veldora (for action manga, adventure manga, shonen manga)

SPECIAL (progressive):
→ Bakugo (for superhero, explosive personality match)
```

### Manga Request Routing
```javascript
function handleMangaRequest(genre, currentCharacter) {
  const isMangaRequest = userInput.includes("manga");
  
  if (isMangaRequest) {
    // Check if current character can handle it
    if (currentCharacter.strengths.includes(genre)) {
      return "current_character_handles"; // Handle themselves
    }
    
    if (currentCharacter.weaknesses.includes(genre)) {
      // Refer to manga specialist
      const mangaGenresVeldora = ["action", "adventure", "fantasy", "isekai", "shonen", "seinen"];
      const mangaGenresKakashi = ["romance", "drama", "ecchi", "mystery", "psychological"];
      
      if (mangaGenresVeldora.includes(genre)) {
        return { refer: "veldora" };
      }
      if (mangaGenresKakashi.includes(genre)) {
        return { refer: "kakashi" };
      }
    }
  }
  
  return "current_character_handles";
}
```

---

## 6. BUDDY DISTRIBUTION (Balance)

### Principles
1. **All characters have buddies** - No one is isolated
2. **Varied difficulty** - Some characters are easier to discover than others
3. **Multiple paths** - Different request patterns lead to different unlocks
4. **Balanced referrals** - Popular characters (Bakugo, Kinta, Ishigami) referenced more than niche ones

### Example Distribution

**Tier 1: Starter (Yuji)**
```typescript
yuji_buddies: [
  { characterId: "marin", rank: 1, genres: ["romance", "ecchi", "shojo", "josei"] },
  { characterId: "shinpachi", rank: 1, genres: ["slice_of_life", "idol", "comedy"] },
  { characterId: "marin", rank: 2, genres: ["slice_of_life"] }, // Secondary for slice of life
]
```

**Tier 2: Early Unlocks (Marin, Shinpachi)**
```typescript
marin_buddies: [
  // Progressive referrals
  { characterId: "rikka", rank: 1, genres: ["supernatural", "fantasy"] },
  { characterId: "kyotaro", rank: 1, genres: ["drama", "psychological"] },
  { characterId: "ishigami", rank: 1, genres: ["seinen", "mature_romance"] },
  
  // Back referrals (deadends to already unlocked)
  { characterId: "yuji", rank: 1, genres: ["action", "shonen"] },
  { characterId: "shinpachi", rank: 1, genres: ["comedy", "parody"] },
]

shinpachi_buddies: [
  // Progressive referrals
  { characterId: "kinta", rank: 1, genres: ["sci_fi", "mecha", "seinen"] },
  { characterId: "ishigami", rank: 1, genres: ["romance"] }, // More romance-focused than Shinpachi
  { characterId: "daru", rank: 1, genres: ["thriller", "time_travel", "tech"] },
  
  // Back referrals
  { characterId: "yuji", rank: 1, genres: ["shonen", "sports"] },
  { characterId: "marin", rank: 1, genres: ["cute_girls", "fashion"] },
]
```

**Tier 3: Mid-Game (Rikka, Ishigami, Kinta)**
```typescript
rikka_buddies: [
  // Progressive referrals
  { characterId: "rudeus", rank: 1, genres: ["isekai", "adventure", "magic"] },
  { characterId: "kanbaru", rank: 1, genres: ["mystery", "supernatural"] },
  { characterId: "ainz", rank: 1, genres: ["dark_fantasy", "overpowered_mc"] },
  
  // Back referrals
  { characterId: "marin", rank: 1, genres: ["slice_of_life", "romance"] },
  { characterId: "yuji", rank: 1, genres: ["action", "friendship"] },
]

ishigami_buddies: [
  // Progressive referrals
  { characterId: "kyotaro", rank: 1, genres: ["drama", "psychological", "romance"] },
  { characterId: "daru", rank: 1, genres: ["tech", "sci_fi"] },
  { characterId: "kanbaru", rank: 1, genres: ["sports", "mystery"] },
  
  // Back referrals
  { characterId: "marin", rank: 1, genres: ["fashion", "cosplay", "ecchi"] },
  { characterId: "shinpachi", rank: 1, genres: ["comedy", "parody"] },
]

kinta_buddies: [
  // Progressive referrals
  { characterId: "ainz", rank: 1, genres: ["dark_fantasy", "strategy", "overpowered_mc"] },
  { characterId: "rudeus", rank: 1, genres: ["isekai", "magic", "adventure"] },
  { characterId: "rikka", rank: 1, genres: ["supernatural", "fantasy", "chunibyo"] },
  { characterId: "kanbaru", rank: 1, genres: ["mystery", "sports", "supernatural"] },
  
  // Back referrals
  { characterId: "shinpachi", rank: 1, genres: ["comedy", "parody"] },
  { characterId: "yuji", rank: 1, genres: ["friendship", "shonen"] },
]
```

**Tier 4: Late Game (Daru, Kyotaro, Rudeus, Ainz, Kanbaru)**
```typescript
daru_buddies: [
  // Progressive referrals (NONE - Daru doesn't unlock new characters via normal means)
  
  // Back referrals
  { characterId: "kinta", rank: 1, genres: ["mecha", "sci_fi"] },
  { characterId: "shinpachi", rank: 1, genres: ["otaku_culture", "comedy"] },
  { characterId: "ishigami", rank: 1, genres: ["gaming", "internet_culture"] },
]

kyotaro_buddies: [
  // Progressive referrals
  { characterId: "kanbaru", rank: 1, genres: ["sports", "mystery"] },
  { characterId: "ainz", rank: 1, genres: ["dark", "psychological"] },
  
  // Back referrals
  { characterId: "ishigami", rank: 1, genres: ["romance", "slice_of_life"] },
  { characterId: "marin", rank: 1, genres: ["cute_romance", "wholesome"] },
  { characterId: "rikka", rank: 1, genres: ["supernatural", "fantasy"] },
]

rudeus_buddies: [
  // Progressive referrals
  { characterId: "ainz", rank: 1, genres: ["dark_fantasy", "overpowered_mc"] },
  { characterId: "kanbaru", rank: 1, genres: ["martial_arts", "action"] },
  
  // Back referrals
  { characterId: "rikka", rank: 1, genres: ["fantasy", "supernatural"] },
  { characterId: "kinta", rank: 1, genres: ["mecha", "sci_fi"] },
  { characterId: "yuji", rank: 1, genres: ["friendship", "coming_of_age"] },
]

ainz_buddies: [
  // Progressive referrals (NONE - Ainz is near endgame)
  
  // Back referrals
  { characterId: "kinta", rank: 1, genres: ["strategy", "tactical"] },
  { characterId: "rudeus", rank: 1, genres: ["isekai", "magic"] },
  { characterId: "rikka", rank: 1, genres: ["supernatural", "fantasy"] },
  { characterId: "kyotaro", rank: 1, genres: ["psychological", "dark"] },
]

kanbaru_buddies: [
  // Progressive referrals
  { characterId: "bakugo", rank: 1, genres: ["action", "shonen", "competitive"] },
  
  // Back referrals
  { characterId: "rikka", rank: 1, genres: ["supernatural", "mystery"] },
  { characterId: "ishigami", rank: 1, genres: ["sports", "comedy"] },
  { characterId: "kyotaro", rank: 1, genres: ["mystery", "psychological"] },
  { characterId: "shinpachi", rank: 1, genres: ["comedy", "slice_of_life"] },
]
```

**Tier 5: Endgame Specialists (Bakugo, Veldora, Kakashi)**
```typescript
bakugo_buddies: [
  // Progressive referrals (NONE - Bakugo is endgame)
  
  // Back referrals
  { characterId: "yuji", rank: 1, genres: ["friendship", "determination"] },
  { characterId: "kinta", rank: 1, genres: ["mecha", "tech"] },
  { characterId: "ainz", rank: 1, genres: ["dark", "overpowered_mc"] },
]

// Veldora & Kakashi have EXPANDED buddy lists (back referrals + progressive)
veldora_buddies: [
  // ANIME requests (back referrals to lower tiers)
  { characterId: "yuji", rank: 1, genres: ["shonen", "friendship"] },
  { characterId: "marin", rank: 1, genres: ["romance", "ecchi", "slice_of_life"] },
  { characterId: "shinpachi", rank: 1, genres: ["comedy", "parody", "slice_of_life"] },
  { characterId: "rikka", rank: 1, genres: ["supernatural", "fantasy"] },
  { characterId: "ishigami", rank: 1, genres: ["romance", "drama"] },
  { characterId: "kyotaro", rank: 1, genres: ["psychological", "drama"] },
  { characterId: "kanbaru", rank: 1, genres: ["sports", "mystery"] },
  
  // MANGA requests (progressive)
  { characterId: "kakashi", rank: 1, genres: ["romance_manga", "ecchi_manga", "drama_manga"] },
  
  // SPECIAL (progressive)
  { characterId: "ainz", rank: 1, genres: ["dark_fantasy", "strategy"] }, // Respects power
  { characterId: "kinta", rank: 1, genres: ["mecha"] }, // Believes Kinta's exaggerations about robots
]

kakashi_buddies: [
  // ANIME requests (back referrals to lower tiers)
  { characterId: "yuji", rank: 1, genres: ["action", "shonen", "friendship"] },
  { characterId: "kinta", rank: 1, genres: ["sci_fi", "mecha"] },
  { characterId: "shinpachi", rank: 1, genres: ["comedy", "slice_of_life"] },
  { characterId: "rikka", rank: 1, genres: ["fantasy", "supernatural"] },
  { characterId: "ainz", rank: 1, genres: ["dark", "strategy"] },
  { characterId: "marin", rank: 1, genres: ["fashion", "slice_of_life"] },
  
  // MANGA requests (progressive)
  { characterId: "veldora", rank: 1, genres: ["action_manga", "adventure_manga", "shonen_manga"] },
  
  // SPECIAL (progressive)
  { characterId: "bakugo", rank: 1, genres: ["superhero", "explosive_personality"] }, // Personality match
]
```

### Referral Frequency Balance
```
Most Referenced (Easiest to Discover):
→ Marin: 2 progressive referrals (from Yuji, Shinpachi) + back referrals
→ Shinpachi: 2 progressive referrals (from Yuji, Marin) + back referrals
→ Kinta: 2 progressive referrals (from Shinpachi, Ishigami) + back referrals
→ Ishigami: 3 progressive referrals (from Marin, Shinpachi, Rikka) + back referrals

Moderately Referenced:
→ Rikka: 3 progressive referrals (from Marin, Ishigami, Kinta) + back referrals
→ Kyotaro: 3 progressive referrals (from Marin, Ishigami, Rikka)
→ Daru: 2 progressive referrals (from Shinpachi, Ishigami)
→ Rudeus: 2 progressive referrals (from Rikka, Kinta)
→ Kanbaru: 5 progressive referrals (from Rikka, Ishigami, Kyotaro, Rudeus, Kinta)

Least Referenced (Hardest to Discover):
→ Ainz: 4 progressive referrals (from Kinta, Rikka, Kyotaro, Veldora) - late game
→ Bakugo: 2 progressive referrals (from Kakashi, Kanbaru) - intentionally rare, endgame
→ Veldora: 0 standard referrals (MANGA ONLY) - special discovery method
→ Kakashi: 0 standard referrals (MANGA ONLY) - special discovery method

Special Progressive Referrals:
→ Veldora can be unlocked via: Manga discovery OR from Kakashi (manga) OR special (Ainz/Kinta stories)
→ Kakashi can be unlocked via: Manga discovery OR from Veldora (manga) OR special (Bakugo match)
→ Kinta can be unlocked via: Normal buddies OR from Veldora (believes his robot stories)

Back Referrals (Deadends):
→ All characters from Tier 2+ have back referrals to Yuji, Marin, or Shinpachi
→ Veldora & Kakashi have MOST back referrals (7 each for anime)
→ Creates circular exploration without always progressing
→ Veldora/Kakashi also have progressive manga referrals to each other
```

---

## 7. IMPLEMENTATION STRATEGY

### New Data Structures

**characterBuddies.ts**
```typescript
export interface BuddyPreference {
  characterId: string;
  rank: number;
  genres: string[];
  condition?: string;
}

export interface CharacterBuddySystem {
  characterId: string;
  buddies: BuddyPreference[];
}

export const CHARACTER_BUDDIES: CharacterBuddySystem[] = [
  // ... full buddy mappings
];
```

**characterSpecialties.ts**
```typescript
export interface Specialty {
  keyword: string;
  characterId: string;
  triggerCondition: "always" | "if_weakness";
  specialSequence?: boolean;
}

export const SPECIALTIES: Specialty[] = [
  // ... full specialty list
];
```

### Modified Data Structures

**characterUnlockSystem.ts**
```typescript
export interface CharacterUnlock {
  characterId: string;
  franchises: string[];
  isStartingCharacter: boolean;
  
  // New fields for System 3.0
  discoveryCount: number; // 0 = locked, 1 = discovered, 2 = unlocked
  discoveredVia?: string; // Which character discovered them
}
```

### Core Functions

**Buddy Selection:**
```typescript
function selectBestBuddy(
  requestedGenres: string[],
  currentCharacterId: string,
  buddySystem: CharacterBuddySystem[],
  expertiseData: CharacterExpertise[]
): BuddyPreference | null;
```

**Specialty Check:**
```typescript
function checkSpecialtyTrigger(
  userInput: string,
  currentCharacterId: string,
  currentExpertise: CharacterExpertise
): Specialty | null;
```

**Discovery/Unlock Logic:**
```typescript
function processReferral(
  buddyId: string,
  currentCharacterId: string,
  userWatchList: string[],
  currentUnlockState: CharacterUnlock[]
): {
  action: "discover" | "unlock" | "already_unlocked";
  message: string;
  newUnlockState: CharacterUnlock[];
};
```

---

## 8. USER EXPERIENCE FLOW

### Example 1: Basic Discovery (with Yuji - Starter)
```
User (with Yuji): "Can you recommend romance anime?"

Check:
1. "romance" is Yuji's weakness ✓
2. Yuji has buddy Marin with romance strength ✓
3. Marin is best option for romance ✓
4. User has watched "My Dress-Up Darling" ✓

Response:
→ Yuji: "Yo! Romance isn't really my thing, but I know someone who LOVES that stuff! 
         Let me give you one rec that's got some action in it too..."
→ Yuji recommends: 1 anime (Romance + Action)
→ System: "New Unknown Contact discovered! Maybe if you ask Yuji about romance again..."
→ Marin: Discovery State (locked but visible)

NOTE: The "ask again" hint ONLY appears with Yuji (starter character)
```

### Example 1b: Basic Discovery (with Other Characters)
```
User (with Marin): "Can you recommend supernatural anime?"

Check:
1. "supernatural" is Marin's weakness ✓
2. Marin has buddy Rikka with supernatural strength ✓
3. Rikka is best option for supernatural ✓
4. User has watched "Love, Chunibyo & Other Delusions" ✓

Response:
→ Marin: "Ooh, supernatural stuff isn't really my genre, but I know someone who'd be perfect! 
          Here's one rec that has some cute romance in it too..."
→ Marin recommends: 1 anime (Supernatural + Romance)
→ System: "New Unknown Contact discovered!"
→ Rikka: Discovery State (locked but visible)

NOTE: No "ask again" hint for non-starter characters
```

### Example 2: Unlock
```
User (with Yuji): "More romance recommendations?"

Check:
1. "romance" is Yuji's weakness ✓
2. Marin is discovered (discoveryCount = 1) ✓
3. Marin is best option for romance ✓
4. User has watched "My Dress-Up Darling" ✓

Response:
→ Yuji: "Ha! Told you I knew someone perfect for this. Here, let me introduce you..."
→ System: "Marin Kitagawa has been unlocked!"
→ Marin: Now fully unlocked and available
```

### Example 3: Multi-Genre Selection
```
User (with Yuji): "I want slice of life with comedy"

Check:
1. "slice_of_life" and "comedy" are Yuji's weaknesses ✓
2. Yuji has 2 buddies with slice_of_life: Shinpachi (rank 1, has comedy), Marin (rank 2, no comedy)
3. Shinpachi has both slice_of_life + comedy ✓
4. Shinpachi is best match ✓

Response:
→ Yuji refers to Shinpachi (not Marin)
```

### Example 4: Specialty Trigger
```
User (with Ishigami): "Any good mecha anime?"

Check:
1. "mecha" keyword detected ✓
2. Specialty: Kinta (if_weakness) ✓
3. Ishigami has weakness to mecha ✓
4. Instant referral triggered ✓

Response:
→ Ishigami: "Mecha? Definitely not my area. But I heard there's this guy who's obsessed with that stuff..."
→ Instant referral to Kinta (if franchise watched, otherwise just hint)
```

### Example 5: Veldora Special Sequence
```
User (with anyone): "What about battle shonen manga?"

Check:
1. "battle shonen manga" keyword detected ✓
2. Veldora special sequence ✓

Response:
→ System: "Unknown character has entered the chat!"
→ Veldora: *kicks previous character out*
→ Veldora: "KUWAHAHAHA! Did someone say BATTLE SHONEN MANGA?! That's MY domain!"
→ Veldora: 3 manga recommendations
```

### Example 6: Veldora → Kakashi (Manga Referral)
```
User (with Veldora - unlocked): "Can you recommend romance manga?"

Check:
1. "romance" + "manga" detected ✓
2. "romance" is Veldora's manga weakness ✓
3. Veldora has buddy Kakashi with romance manga strength ✓
4. User has watched "Naruto" ✓

Response:
→ Veldora: "KUWAHAHA! Romance manga? That's not really my specialty... 
           But I know someone who's OBSESSED with that stuff. Trust me on this one."
→ Veldora recommends: 1 manga (Romance + Adventure)
→ System: "New Unknown Contact discovered!"
→ Kakashi: Discovery State (locked but visible)
```

### Example 7: Veldora → Kinta (Special Referral)
```
User (with Veldora - unlocked): "Any mecha anime?"

Check:
1. "mecha" + "anime" (not manga) detected ✓
2. "mecha" is Veldora's anime weakness ✓
3. Veldora has special buddy Kinta (believes his exaggerations) ✓
4. User has watched "Gundam: The Witch from Mercury" ✓

Response:
→ Veldora: "MECHA?! Oh yes, I know EXACTLY who to send you to! 
           This guy knows EVERYTHING about giant robots. He's SUPER strong too, 
           trust me - the way he talks about these machines, he must be a LEGEND!"
→ Veldora recommends: 1 anime (Mecha + Action)
→ System: "New Unknown Contact discovered!"
→ Kinta: Discovery State (locked but visible)

NOTE: Veldora genuinely believes Kinta's over-the-top descriptions of mecha power
```

### Example 8: Kakashi → Bakugo (Personality Match)
```
User (with Kakashi - unlocked): "Got any superhero anime?"

Check:
1. "superhero" + "anime" detected ✓
2. "superhero" is Kakashi's anime weakness ✓
3. Kakashi has special buddy Bakugo (personality match) ✓
4. User has watched "My Hero Academia" ✓

Response:
→ Kakashi: "Superhero anime? Hmm... not usually my genre, but I know someone perfect. 
           He's got that explosive energy you're looking for. You'll see what I mean."
→ Kakashi recommends: 1 anime (Superhero + Action)
→ System: "New Unknown Contact discovered!"
→ Bakugo: Discovery State (locked but visible)

NOTE: Kakashi recognizes Bakugo's explosive personality matches the genre
```

---

## 9. MIGRATION FROM SYSTEM 2.0

### What Changes
- ❌ **Remove:** Genre request counters (no more "ask 2x for romance")
- ❌ **Remove:** Simple weakness-based referrals
- ❌ **Remove:** Direct unlock on second referral mention
- ✅ **Keep:** Franchise requirement (must watch anime)
- ✅ **Keep:** Character expertise (+, 0, -)
- ✅ **Add:** Buddy system with rankings
- ✅ **Add:** Specialty system
- ✅ **Add:** Discovery state (locked → discovered → unlocked)
- ✅ **Add:** Best buddy selection algorithm

### Data Migration
```typescript
// Old System 2.0
localStorage.getItem('GENRE_REQUESTS') // Remove
localStorage.getItem('UNLOCKED_CHARACTERS') // Keep, but add discoveryCount field

// New System 3.0
localStorage.getItem('UNLOCKED_CHARACTERS') // Now includes discoveryCount
localStorage.getItem('CHARACTER_BUDDIES') // New
```

---

## 10. TESTING SCENARIOS

### Test 1: Single Buddy Discovery
- User: Yuji unlocked
- Action: Ask for "romance"
- Expected: Marin discovered (if franchise watched)

### Test 2: Multi-Buddy Selection (Ranked)
- User: Yuji unlocked
- Action: Ask for "slice of life"
- Expected: Shinpachi referred (rank 1), not Marin

### Test 3: Multi-Buddy Selection (Best Match)
- User: Yuji unlocked
- Action: Ask for "slice of life romance"
- Expected: Marin referred (better match than Shinpachi)

### Test 4: Unlock on Second Referral
- User: Marin discovered (discoveryCount = 1)
- Action: Ask Yuji for "romance" again
- Expected: Marin unlocked

### Test 5: Specialty Instant Referral
- User: Any character
- Action: Mention "cosplay"
- Expected: Instant referral to Marin

### Test 6: Veldora Special Sequence
- User: Any character
- Action: Mention "battle shonen manga"
- Expected: Veldora kicks in, special sequence plays

### Test 7: Manga Specialist Auto-Assumption
- User: Veldora unlocked
- Action: Ask for "romance" (without saying "manga")
- Expected: Veldora assumes manga, recommends romance manga

### Test 8: Self-Handle Manga Request
- User: Bakugo unlocked
- Action: Ask for "action manga"
- Expected: Bakugo handles it himself (strength in action)

### Test 9: Manga Weakness Referral
- User: Ishigami unlocked
- Action: Ask for "action manga"
- Expected: Ishigami refers to Veldora (weakness in action + manga request)

---

## 11. ADVANTAGES OF SYSTEM 3.0

### Compared to System 2.0

**More Natural:**
- ✅ "I know someone who's better at this" feels more organic than counting genre requests
- ✅ Buddy relationships create a sense of community among characters
- ✅ Specialties make certain characters feel unique and valuable

**More Consistent:**
- ✅ Clear unlock path: Discovery → 2nd referral → Unlock
- ✅ No confusion about "why isn't this character unlocking?"
- ✅ Franchise requirement is the only hard blocker

**More Balanced:**
- ✅ Referral frequency controls difficulty
- ✅ Multiple paths to same character (different buddies can refer)
- ✅ Best buddy selection ensures most relevant character unlocks

**More Engaging:**
- ✅ Users actively think about "who should I ask what?"
- ✅ Discovery state creates anticipation
- ✅ Specialty triggers feel like easter eggs

---

## 12. REVIEW QUESTIONS

Before implementation, please review:

1. **Buddy Assignments:** Do the buddy relationships make sense thematically?
2. **Referral Balance:** Is the difficulty progression (Tier 1-5) appropriate?
3. **Specialties:** Are there other specialties we should add?
4. **Manga Specialists:** Should Veldora/Kakashi coverage be adjusted?
5. **Discovery vs Unlock:** Is "2 referrals to unlock" the right threshold?
6. **Multi-Buddy Logic:** Does the "best match" algorithm make sense?
7. **Special Sequences:** Should other characters have special sequences?
8. **Migration:** Any concerns about moving from System 2.0?

---

## 13. NEXT STEPS

After approval:
1. Create `characterBuddies.ts` with full buddy mappings
2. Create `characterSpecialties.ts` with specialty definitions
3. Update `characterUnlockSystem.ts` with discoveryCount field
4. Implement `selectBestBuddy()` function
5. Implement `checkSpecialtyTrigger()` function
6. Update `App.tsx` referral logic
7. Update AI system instructions for buddy acknowledgment
8. Test all 9 scenarios
9. Update CHANGELOG.md
10. Deploy System 3.0

---

**DESIGN COMPLETE - READY FOR REVIEW, SIR!**

