import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { AnimeRecommendation, Settings, AnimeEntry } from '../types';
import { getCharacterExpertise } from '../data/characterExpertise';
import { fetchSeasonalAnime, fetchUpcomingAnime } from './jikanService';
import { isUpcomingYear, isUpcomingSeason } from '../data/animeEras';
import { ASSISTANT_CHARACTERS } from '../data/characters';

type EnvRecord = Record<string, string | undefined>;

const resolveEnvKey = (name: string): string | undefined => {
  if (typeof import.meta !== 'undefined') {
    const metaEnv = (import.meta as ImportMeta & { env?: EnvRecord }).env;
    if (metaEnv && metaEnv[name] !== undefined) {
      return metaEnv[name];
    }
  }
  // Fallback for SSR/node contexts
  return (typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>)[name] : undefined);
};

const recApiKey = resolveEnvKey('VITE_GEMINI_REC_API_KEY');
const chatApiKey = resolveEnvKey('VITE_GEMINI_CHAT_API_KEY');

const initializeClient = (apiKey?: string): GoogleGenerativeAI | null => {
  if (!apiKey) {
    return null;
  }
  try {
    // JavaScript SDK only accepts string API key, defaults to v1beta API
    // Cannot configure API version in JavaScript SDK (unlike Python/Java)
    return new GoogleGenerativeAI(apiKey.trim());
  } catch (error) {
    console.error('Failed to initialize Gemini client:', error);
    return null;
  }
};

let recClient: GoogleGenerativeAI | null = initializeClient(recApiKey);
let chatClient: GoogleGenerativeAI | null = initializeClient(chatApiKey);

const getRecommendationClient = (): GoogleGenerativeAI => {
  if (!recClient) {
    throw new Error("Recommendation Gemini client is not initialized. Check GOOGLE_REC_CREDENTIALS.");
  }
  return recClient;
};

const getChatClient = (): GoogleGenerativeAI => {
  if (!chatClient) {
    throw new Error("Messaging Gemini client is not initialized. Check GOOGLE_CHAT_CREDENTIALS.");
  }
  return chatClient;
};

const buildRequestSnippet = (text: string): string => {
  if (!text) return '';
  const trimmed = text.trim();
  if (!trimmed) return '';
  return trimmed.length > 90 ? `${trimmed.slice(0, 87)}...` : trimmed;
};

type HelperMode = 'strength_neutral' | 'weak_locked' | 'handoff';

const normalizeGenreKey = (genre: string) => genre.toLowerCase().replace(/[\s_-]+/g, '');

type WeaknessContext = {
  buddyId?: string;
  buddyName?: string;
  buddyNickname?: string;
  buddyUnlocked?: boolean;
  weaknessGenre?: string;
  helperUserLabel?: string;
  helperUserPronoun?: string;
  targetUserLabel?: string;
  targetUserPronoun?: string;
};

const determineHelperMode = (
  characterId: string | undefined,
  detectedGenres?: string[],
  availableCharacters?: string[]
): HelperMode => {
  if (!characterId || !detectedGenres || detectedGenres.length === 0) {
    return 'strength_neutral';
  }

  const expertise = getCharacterExpertise(characterId);
  if (!expertise) {
    return availableCharacters && availableCharacters.length > 0 ? 'handoff' : 'strength_neutral';
  }

  const hasWeakness = detectedGenres.some(genre => {
    const key = normalizeGenreKey(genre);
    return expertise.genres[key] === '-';
  });

  if (!hasWeakness) {
    return 'strength_neutral';
  }

  return availableCharacters && availableCharacters.length > 0 ? 'handoff' : 'weak_locked';
};

const nameToIdMap: Record<string, string> = ASSISTANT_CHARACTERS.reduce((acc, character) => {
  acc[character.name] = character.id;
  return acc;
}, {} as Record<string, string>);

// Generate expertise mapping for system instructions
export const initializeAi = (apiKey: string) => {
    if (!apiKey) {
        console.error("Attempted to initialize Gemini AI without an API key.");
        return;
    }
    console.log("Initializing Gemini with API key (first 10 chars):", apiKey.substring(0, 10));
    console.log("Full API key length:", apiKey.length);
    chatClient = initializeClient(apiKey);
    console.log("Gemini AI chat client reinitialized successfully");
};

// Model priority list - try models in order until one works
// JavaScript SDK defaults to v1beta API and doesn't support API version configuration
// Only models available in v1beta can be used
// gemini-2.5-flash is the primary model available in v1beta
// Note: gemini-1.5-pro is NOT available in v1beta (404 errors), so don't include it
const MODEL_PRIORITY = [
  "gemini-2.5-flash",
];

const isOverloadError = (message: string) =>
  message.includes('503') || message.toLowerCase().includes('overloaded') || message.toLowerCase().includes('service unavailable');

const isRateLimitError = (message: string) =>
  message.includes('429') || message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('quota exceeded') || message.toLowerCase().includes('resource exhausted');

const isQuotaError = (message: string) =>
  message.toLowerCase().includes('quota') || message.toLowerCase().includes('billing') || message.toLowerCase().includes('payment required') || message.toLowerCase().includes('insufficient quota');

const isUnsupportedModelError = (message: string) =>
  message.includes('404') || message.toLowerCase().includes('not found');

const getNextModel = (currentModel: string, attempted: Set<string>): string | null => {
  const available = MODEL_PRIORITY.filter(model => !attempted.has(model));
  if (available.length === 0) {
    return null;
  }

  if (!attempted.has(currentModel) && available.includes(currentModel)) {
    const idx = available.indexOf(currentModel);
    return available[idx + 1] || null;
  }

  return available[0];
};

// Group exclusion list by franchise to reduce size
// Example: "Attack on Titan", "Attack on Titan Season 2" → "Attack on Titan (franchise)"
const groupTitlesByFranchise = (titles: string[]): string[] => {
  const franchiseMap = new Map<string, string[]>();
  
  // Patterns to identify franchise base names
  const franchisePatterns = [
    /^(.*?)\s*(?:Season|S\d+|Part\s+\d+|Episode|Ep\.|Movie|Film|OVA|ONA|Special|Special Episode|Final Season|The Final Season|Part \d+).*$/i,
    /^(.*?)\s*:\s*(?:Season|Part|Movie|Film).*$/i,
  ];
  
  titles.forEach(title => {
    let baseTitle = title;
    
    // Try to extract base title using patterns
    for (const pattern of franchisePatterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        baseTitle = match[1].trim();
        break;
      }
    }
    
    // Normalize: remove common suffixes
    baseTitle = baseTitle
      .replace(/\s*\(.*?\)\s*$/, '') // Remove parentheses content
      .replace(/\s*:\s*.*$/, '') // Remove everything after colon
      .trim();
    
    if (!franchiseMap.has(baseTitle)) {
      franchiseMap.set(baseTitle, []);
    }
    franchiseMap.get(baseTitle)!.push(title);
  });
  
  // Build result: if multiple titles share base, use "Base (f)", otherwise use original
  // Using (f) instead of (franchise) saves 8 chars per franchise entry
  const result: string[] = [];
  franchiseMap.forEach((titlesInFranchise, baseTitle) => {
    if (titlesInFranchise.length > 1) {
      // Multiple titles in franchise - use base name with (f) marker
      result.push(`${baseTitle} (f)`);
    } else {
      // Single title - use original
      result.push(titlesInFranchise[0]);
    }
  });
  
  return result;
};

const buildRecommendationPrompt = (
  userPrompt: string,
  recCount: number,
  settings: Settings, 
  excludedTitles: string[], 
  planToWatchTitles: string[], 
  allUserAnime: AnimeEntry[], 
  characterData?: { personality: string; likes: string[]; dislikes: string[]; name?: string },
  availableCharacters?: string[], // List of unlocked character names
  sessionRecommendedTitles?: string[], // Titles already recommended in this session
  seasonalAnimeTitles?: string[], // Titles from seasonal anime API
  detectedGenres?: string[], // Detected genres for filtering PTW
  detectedYear?: number, // Detected year for filtering PTW
  detectedEra?: string, // Detected era for filtering PTW
  isAfterHandoff?: boolean // True if this is after a referral handoff
): string => {
  // Ultra-compressed format to fit within token limits
  // Status codes: C=Completed, W=Watching, D=Dropped, O=On-Hold, P=Plan to Watch
  const statusCodeMap: Record<string, string> = {
    'Completed': 'C',
    'Watching': 'W',
    'Dropped': 'D',
    'On-Hold': 'O',
    'Plan to Watch': 'P'
  };
  
  // Group anime by category for efficient representation
  // Further reduced sizes to cut system instruction size
  const highRated = allUserAnime.filter(a => (a.score ?? 0) >= 8).slice(0, 20);
  const lowRated = allUserAnime.filter(a => a.status === 'Dropped' || ((a.score ?? 11) <= 5)).slice(0, 10);
  const watching = allUserAnime.filter(a => a.status === 'Watching').slice(0, 5);
  
  // Compact format: title|rating|status
  const formatCompact = (anime: AnimeEntry) => {
    const r = anime.score ?? 0;
    const s = anime.status ? statusCodeMap[anime.status] || 'U' : 'U';
    return `${anime.title}|${r}|${s}`;
  };
  
  const highRatedStr = highRated.map(formatCompact).join(';');
  const lowRatedStr = lowRated.map(formatCompact).join(';');
  const watchingStr = watching.map(formatCompact).join(';');
  
  // First, filter exclusion list based on request (year/era filtering)
  // Note: Genre filtering requires genre data we don't have, so we keep all for safety
  let filteredExclusions = excludedTitles;
  
  // Group exclusion list by franchise to reduce size
  // This converts "Attack on Titan", "Attack on Titan Season 2" → "Attack on Titan (franchise)"
  const groupedExclusions = groupTitlesByFranchise(filteredExclusions);
  // Use pipe separator for more compact format (saves ~1 char per entry)
  const exclusionList = groupedExclusions.join('|');
  
  // Log reduction for monitoring
  if (excludedTitles.length > groupedExclusions.length) {
    console.log(`📊 Exclusion list optimized: ${excludedTitles.length} → ${groupedExclusions.length} entries (${Math.round((1 - groupedExclusions.length / excludedTitles.length) * 100)}% reduction)`);
  }
  
  // Filter plan to watch list by genre/year/era (same logic as exclusion list)
  const filteredPTW = filterExclusionList(
    planToWatchTitles,
    allUserAnime,
    '', // userPrompt not needed for PTW filtering
    detectedGenres,
    detectedYear,
    detectedEra
  );
  
  // PTW list is always needed because:
  // 1. If recommendFromPTW === false: Need to know what NOT to recommend
  // 2. If recommendFromPTW === true: Need to know what CAN be recommended
  // 3. Always needed for franchise/chronology checks (Rule A & B)
  // However, we can filter by genre/year/era to reduce size when applicable
  const shouldSendPTWList = true; // Always needed for exclusion/allowance rules
  // Use pipe separator for more compact format
  const ptwList = shouldSendPTWList 
    ? (filteredPTW.length > 0 ? filteredPTW.join('|') : '(none)')
    : '(not provided)';
  
  // Log PTW filtering if it happened
  if (detectedGenres?.length || detectedYear || detectedEra) {
    if (planToWatchTitles.length > filteredPTW.length) {
      console.log(`🎯 PTW list filtered: ${planToWatchTitles.length} → ${filteredPTW.length} entries`);
    }
  }
  
  const personaName = characterData?.name || 'the assistant';
  const responseTextInstruction = isAfterHandoff 
    ? "Keep responseText VERY SHORT (1 sentence max) since there was already extensive dialogue in the handoff sequence."
    : "A friendly, conversational, and direct introductory message for the recommendations.";
  const characterIntro = `You are the structured recommendation module supporting ${personaName}.
- Ignore persona dialogue; another service handles the conversation loop.
- Current user request: "${userPrompt}"
- Provide EXACTLY ${recCount} fresh recommendations (no repeats, no completed titles).
${isAfterHandoff ? '- IMPORTANT: Keep responseText VERY SHORT (1 sentence max) - there was already extensive dialogue in the handoff sequence.\n' : ''}- Return data in JSON per schema.`;


  // Get current date for context
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  
  // Determine current season and what has passed/is upcoming
  let currentSeason = 'winter';
  if (currentMonth >= 4 && currentMonth <= 6) currentSeason = 'spring';
  else if (currentMonth >= 7 && currentMonth <= 9) currentSeason = 'summer';
  else if (currentMonth >= 10 && currentMonth <= 12) currentSeason = 'fall';
  
  // Build season status for current year
  const seasonStatus = {
    'winter': currentMonth >= 1 && currentMonth <= 3,
    'spring': currentMonth >= 4 && currentMonth <= 6,
    'summer': currentMonth >= 7 && currentMonth <= 9,
    'fall': currentMonth >= 10 && currentMonth <= 12
  };
  
  const buildSeasonStatus = () => {
    const lines = [];
    lines.push(`- **Winter ${currentYear}** (Jan-Mar): ${seasonStatus.winter ? 'CURRENT' : currentMonth > 3 ? 'PASSED' : 'UPCOMING'}`);
    lines.push(`- **Spring ${currentYear}** (Apr-Jun): ${seasonStatus.spring ? 'CURRENT' : currentMonth > 6 ? 'PASSED' : 'UPCOMING'}`);
    lines.push(`- **Summer ${currentYear}** (Jul-Sep): ${seasonStatus.summer ? 'CURRENT' : currentMonth > 9 ? 'PASSED' : 'UPCOMING'}`);
    lines.push(`- **Fall ${currentYear}** (Oct-Dec): ${seasonStatus.fall ? 'CURRENT' : 'UPCOMING'}`);
    return lines.join('\n');
  };

  return `${characterIntro}Personal anime/manga recommendation assistant. Your PRIMARY GOAL is providing recommendations the user has NOT seen/read. Respond in JSON format.

**IMPORTANT: Current Date & Upcoming Content**
- **Current Date**: ${currentDate} (Year: ${currentYear}, Month: ${currentMonth}, Season: ${currentSeason})

**${currentYear} Season Status:**
${buildSeasonStatus()}

- **Upcoming content**: When user asks for "${currentYear + 1}" or later, or "next season" / "upcoming", you may recommend anime that are currently announced/scheduled to air in THAT SPECIFIC PERIOD. However, ONLY recommend real, existing anime titles from MyAnimeList database. Do NOT make up fake titles.
- **Current/past content**: When user asks for ${currentYear} seasons that have PASSED, recommend anime that actually aired in THAT SPECIFIC SEASON only
- **Currently Airing**: When user asks for the current season (e.g., "fall 2025" in October 2025), you can recommend anime that are CURRENTLY AIRING, UPCOMING, or RECENTLY STARTED in that season. These anime may not be completed yet, but they are real shows listed on MyAnimeList's seasonal anime page.
${seasonalAnimeTitles && seasonalAnimeTitles.length > 0 ? `
**SEASONAL ANIME LIST (from MyAnimeList API):**
The following anime are confirmed to be from the requested season. Use THESE titles when making recommendations:
${seasonalAnimeTitles.map(title => `- ${title}`).join('\n')}

**CRITICAL**: When user requests a specific season, ONLY recommend anime from this list above. Do NOT recommend anime from other seasons or years.
**CRITICAL**: You MUST provide recommendations using titles from the list above. Do NOT say you don't have information - the information is provided in the list above.
` : ''}
- **CRITICAL**: When recommending anime for a specific season/year, the release year MUST match exactly. If user asks for "2025", do NOT recommend "2024" anime.
- **CRITICAL**: DO NOT make up fake anime titles or synopses. ONLY recommend real anime that exist in the MyAnimeList database.

**IMPORTANT: Anime vs Manga Detection**
- If user mentions "manga", "manhwa", or "manhua" specifically, recommend MANGA
- If user only mentions genres without specifying media type, assume they want ANIME
- Examples:
  - "Recommend action shonen manga" → Recommend MANGA
  - "Recommend action shonen" → Recommend ANIME
  - "Looking for romance manga" → Recommend MANGA
  - "Looking for romance" → Recommend ANIME

**CRITICAL INSTRUCTION: EXCLUSION LIST**
The following anime titles/franchises the user has already seen (completed, watching, on-hold, or dropped).
- Titles marked "(f)" mean the user has seen ANY part of that franchise - DO NOT recommend ANY title from that franchise
- Individual titles mean the user has seen that specific title
YOU ARE ABSOLUTELY FORBIDDEN FROM RECOMMENDING ANY ANIME ON THIS LIST OR FROM ANY FRANCHISE MARKED "(f)".

**EXCLUSION LIST (${groupedExclusions.length} entries, ${excludedTitles.length} total titles, format: Title|Title2|Title3(f)|...):**
${exclusionList}

**CRITICAL INSTRUCTION: FRANCHISE CHECK**
Before recommending ANY title, you MUST check:
1. Is the title directly in the exclusion list? → FORBIDDEN
2. Does the title belong to a franchise marked "(f)" in the exclusion list? → FORBIDDEN
3. Example: If exclusion list has "Attack on Titan (f)", you are FORBIDDEN from recommending "Attack on Titan", "Attack on Titan Season 2", or ANY Attack on Titan content

**PLAN TO WATCH LIST (${planToWatchTitles.length} total):**
${ptwList}

**PLAN TO WATCH RULES:**
- Rule A (Franchise Check): If a prequel/sequel of a Plan to Watch title is on the main EXCLUSION LIST, do NOT recommend it
- Rule B (Chronology Check): FORBIDDEN from recommending an earlier season if a later season is on Plan to Watch (e.g., don't recommend "Shield Hero S1" if "Shield Hero S3" is on PTW)
- ${settings.recommendFromPTW ? 'You MAY recommend from this list if relevant.' : 'You are FORBIDDEN from recommending titles directly on this list.'}

${sessionRecommendedTitles && sessionRecommendedTitles.length > 0 ? `
**SESSION RECOMMENDATIONS (${sessionRecommendedTitles.length} titles already recommended in this session):**
${sessionRecommendedTitles.join(', ')}

**SESSION RECOMMENDATION RULES:**
- AVOID recommending these titles again for similar genre requests
- You MAY recommend them again if the user asks for a COMPLETELY DIFFERENT genre/context where they fit
- If you do repeat a title, acknowledge it: "I know I mentioned this earlier, but it really fits here too because..."
` : ''}

**USER PREFERENCE DATA:**

HIGH-RATED (format: title|rating|status):
${highRatedStr}

LOW-RATED/DROPPED:
${lowRatedStr}

CURRENTLY WATCHING:
${watchingStr}

**RECOMMENDATION RULES:**
1. NEVER recommend anime from exclusion list or their sequels/prequels/spin-offs
2. Analyze ratings: 8-10=user loves, 0-5=user dislikes
3. Avoid recommending similar anime to ones user dropped or rated low
4. Minimum MAL score requirement: ${settings.minScore}
5. Use common English titles (e.g., "Attack on Titan" not "Shingeki no Kyojin")
6. Provide 2-3 recommendations with BRIEF personalized reasoning (40-60 words max per recommendation)

**MANGA RATING REQUIREMENT:**
- For MANGA requests: Use MANGA ratings from MAL, NOT anime ratings
- Manga and anime often have completely different scores (e.g., anime 7.5, manga 8.8)
- Always check manga-specific ratings when recommending manga

**OUTPUT JSON FORMAT:**
{"responseText":"message","isManga":false,"recommendations":[{"title":"Title","mal_score":8.5,"genres":["Action"],"synopsis":"synopsis","reasoning":"why this fits user","has_dub":true,"streamingPlatforms":["Netflix","Crunchyroll"],"community_opinion":"Brief authentic community sentiment"}]}

**For MANGA requests:**
{"responseText":"message","isManga":true,"recommendations":[{"title":"Title","mal_score":8.5,"genres":["Action"],"synopsis":"synopsis","reasoning":"why this fits user","has_dub":false,"streamingPlatforms":[],"community_opinion":"Brief authentic community sentiment"}]}

**CRITICAL: STREAMING PLATFORMS REQUIRED**
- You MUST include streamingPlatforms array for EVERY anime recommendation
- For anime: Include platforms where it's available (Netflix, Crunchyroll, Disney+, HBO Max, Hulu, Amazon Prime Video, Funimation, Adult Swim, Retrocrush)
- For manga: Use empty array [] (manga not streamed)
- Only include platforms you're confident about - if unsure, omit the platform
- Use exact platform names: "Netflix", "Crunchyroll", "Disney+", "HBO Max", "Hulu", "Amazon Prime Video", "Funimation", "Adult Swim", "Retrocrush"

**STREAMING EXAMPLES:**
- Attack on Titan: ["Crunchyroll", "Hulu"]
- Demon Slayer: ["Crunchyroll", "Hulu", "Netflix"]
- One Piece: ["Crunchyroll", "Funimation"]
- Studio Ghibli: ["HBO Max", "Netflix"]

**CRITICAL: For MANGA recommendations, you MUST use MANGA ratings from MAL, NOT anime ratings. Manga and anime often have completely different scores. Always specify manga ratings when recommending manga.**

**COMMUNITY OPINION EXAMPLES:**
- "Considered a masterpiece of the genre"
- "The manga is way better"
- "Slow start but incredible payoff"
- "Controversial ending divides fans"
- "Hidden gem often overlooked"

Provide authentic, concise community sentiment for each recommendation.`;
};

const recommendationSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    responseText: {
      type: SchemaType.STRING,
      description: "A friendly, conversational, and direct introductory message for the recommendations.",
    },
    isManga: {
      type: SchemaType.BOOLEAN,
      description: "True if recommending manga, false if recommending anime",
    },
    recommendations: {
      type: SchemaType.ARRAY,
      description: "A list of structured anime or manga recommendation objects.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "The most common English title of the anime or manga." },
          mal_score: { type: SchemaType.NUMBER, description: "The MyAnimeList score." },
          genres: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "A list of genres." },
          synopsis: { type: SchemaType.STRING, description: "A brief synopsis." },
          reasoning: { type: SchemaType.STRING, description: "A personalized reason why this is recommended." },
          has_dub: { type: SchemaType.BOOLEAN, description: "True if English dub is available (anime only, false for manga)." },
          streamingPlatforms: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "List of streaming platforms where this anime is available (Netflix, Crunchyroll, etc.). Empty array for manga." },
          community_opinion: { type: SchemaType.STRING, description: "Brief community consensus (e.g., 'Masterpiece of the genre', 'Anime adaptation is better', 'Art style is incredible')" }
        },
        required: ["title", "mal_score", "genres", "synopsis", "reasoning", "has_dub", "streamingPlatforms", "community_opinion"],
      },
    },
  },
  required: ["responseText", "isManga", "recommendations"],
};

const referralDialogueSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    helperIntro: {
      type: SchemaType.STRING,
      description: 'Helper speaking to the user, acknowledging their weakness and introducing the specialist. One concise sentence.'
    },
    handoffLine: {
      type: SchemaType.STRING,
      description: 'Helper addressing the specialist directly, briefly describing the user request. One concise sentence.'
    },
    acknowledgmentLine: {
      type: SchemaType.STRING,
      description: 'Specialist acknowledging the helper and confirming they will take over. One concise sentence.'
    },
    specialistPitch: {
      type: SchemaType.STRING,
      description: 'Specialist addressing the user directly, explaining why this genre/topic is their specialty and promising tailored recommendations. One concise sentence.'
    },
  },
  required: ['helperIntro', 'handoffLine', 'acknowledgmentLine', 'specialistPitch']
};

type ReferralPersona = {
  id: string;
  name: string;
  personality: string;
  likes: string[];
  dislikes: string[];
};

export interface ReferralDialogueResult {
  helperIntro: string;
  handoffLine: string;
  acknowledgmentLine: string;
  specialistPitch: string;
}

interface ReferralDialogueParams {
  helper: ReferralPersona;
  target: ReferralPersona;
  userRequest: string;
  reason: 'specialty' | 'progress' | 'weakness';
  topic?: string;
  helperNicknameForTarget?: string;
  targetNicknameForHelper?: string;
  helperUserLabel?: string;
  helperUserPronoun?: string;
  targetUserLabel?: string;
  targetUserPronoun?: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to detect if user is asking for manga or anime
const isMangaRequest = (userPrompt: string): boolean => {
  const lowerPrompt = userPrompt.toLowerCase();
  return lowerPrompt.includes('manga') || lowerPrompt.includes('manhwa') || lowerPrompt.includes('manhua');
};

// Function to detect if user is asking for recommendations or just asking a question
const isRecommendationRequest = (userPrompt: string): boolean => {
  const recommendationKeywords = [
    'recommend', 'suggestion', 'suggest', 'what should i watch', 'what to watch',
    'what should i read', 'what to read',
    'find me', 'looking for', 'want to watch', 'want to read', 'need something', 'give me',
    'show me', 'anime like', 'manga like', 'similar to', 'based on', 'genre',
    'upcoming', 'new anime', 'new manga', 'latest', 'recent'
  ];
  
  const questionKeywords = [
    'what is', 'who is', 'when did', 'where can', 'how many', 'why did',
    'explain', 'tell me about', 'what happened', 'what does', 'meaning of',
    'do you', 'do you prefer', 'do you like', 'which do you', 'which is better',
    'what do you think', 'what\'s your opinion', 'your favorite', 'your opinion',
    'prefer', 'better', 'vs', 'versus', 'compare', 'difference between'
  ];
  
  const lowerPrompt = userPrompt.toLowerCase();
  
  // Check if it's asking for anime/manga recommendations (even with "what is")
  // Examples: "what is a good anime from summer 2025" → recommendation
  // "what upcoming anime" → recommendation
  const isRecommendationQuestion = lowerPrompt.match(/what (is|was|are|were) .* (anime|manga) .* (from|in|of)/) ||
                                   lowerPrompt.match(/what (is|was|are|were) .* (good|best) .* (anime|manga)/) ||
                                   lowerPrompt.includes('upcoming anime') ||
                                   lowerPrompt.includes('upcoming manga') ||
                                   lowerPrompt.includes('next season') ||
                                   lowerPrompt.includes('current season') ||
                                   lowerPrompt.includes('this season');
  if (isRecommendationQuestion) return true;
  
  // Check for question patterns first (more specific)
  // Questions about preferences, comparisons, opinions are NOT recommendations
  const hasQuestionWords = questionKeywords.some(keyword => lowerPrompt.includes(keyword));
  if (hasQuestionWords) return false;
  
  // Check for recommendation patterns
  const hasRecommendationWords = recommendationKeywords.some(keyword => lowerPrompt.includes(keyword));
  if (hasRecommendationWords) return true;
  
  // Default to recommendation if unclear
  return true;
};

// Filter exclusion list based on user request (genre/year/era)
const filterExclusionList = (
  excludedTitles: string[],
  allUserAnime: AnimeEntry[],
  userPrompt: string,
  detectedGenres?: string[],
  detectedYear?: number,
  detectedEra?: string
): string[] => {
  // If no filtering criteria, return all
  if (!detectedGenres?.length && !detectedYear && !detectedEra) {
    return excludedTitles;
  }

  // Create a map of title -> anime entry for quick lookup
  const animeMap = new Map<string, AnimeEntry>();
  allUserAnime.forEach(anime => {
    animeMap.set(anime.title, anime);
  });

  const filtered: string[] = [];
  const safetyBuffer: string[] = [];
  let safetyCount = 0;
  const SAFETY_BUFFER_SIZE = 10; // Keep 10 titles from other genres/years for safety (reduced from 30)

  for (const title of excludedTitles) {
    const anime = animeMap.get(title);
    let matches = false;
    let hasDateInfo = false;
    let hasGenreInfo = false;

    // Filter by genre if detected
    if (detectedGenres && detectedGenres.length > 0) {
      if (anime?.genres && anime.genres.length > 0) {
        hasGenreInfo = true;
        // Check if any detected genre matches any of the anime's genres (case-insensitive)
        const animeGenresLower = anime.genres.map(g => g.toLowerCase());
        const matchesGenre = detectedGenres.some(detectedGenre => 
          animeGenresLower.some(animeGenre => 
            animeGenre.includes(detectedGenre.toLowerCase()) || 
            detectedGenre.toLowerCase().includes(animeGenre)
          )
        );
        if (matchesGenre) {
          matches = true;
        }
      } else {
        // No genre info - keep in safety buffer
        if (safetyCount < SAFETY_BUFFER_SIZE) {
          safetyBuffer.push(title);
          safetyCount++;
        }
        // If we're only filtering by genre (no year/era), continue to next title
        if (!detectedYear && !detectedEra) {
          continue;
        }
      }
    }

    // Filter by year if detected
    if (detectedYear) {
      if (anime?.finishDate) {
        hasDateInfo = true;
        const finishYear = parseInt(anime.finishDate.substring(0, 4));
        if (finishYear === detectedYear) {
          matches = true;
        }
      } else if (anime?.releaseYear) {
        // Fallback to release year if finish date not available
        hasDateInfo = true;
        const releaseYear = parseInt(anime.releaseYear);
        if (releaseYear === detectedYear) {
          matches = true;
        }
      } else {
        // No date info - keep in safety buffer
        if (safetyCount < SAFETY_BUFFER_SIZE) {
          safetyBuffer.push(title);
          safetyCount++;
        }
        // If we're only filtering by year (no genre), continue to next title
        if (!detectedGenres?.length && !detectedEra) {
          continue;
        }
      }
    }

    // Filter by era if detected (approximate year ranges)
    if (detectedEra && !matches) {
      const yearToCheck = anime?.finishDate 
        ? parseInt(anime.finishDate.substring(0, 4))
        : anime?.releaseYear 
          ? parseInt(anime.releaseYear)
          : null;
      
      if (yearToCheck) {
        hasDateInfo = true;
        const eraRanges: { [key: string]: [number, number] } = {
          'origins': [1910, 1980],
          'golden age': [1980, 1990],
          'global explosion': [1990, 2000],
          'internet': [2000, 2020],
          'globalization': [2020, 2030]
        };
        const range = eraRanges[detectedEra.toLowerCase()];
        if (range && yearToCheck >= range[0] && yearToCheck < range[1]) {
          matches = true;
        }
      } else if (!hasDateInfo) {
        // No date info - keep in safety buffer
        if (safetyCount < SAFETY_BUFFER_SIZE) {
          safetyBuffer.push(title);
          safetyCount++;
        }
        // If we're only filtering by era (no genre), continue to next title
        if (!detectedGenres?.length) {
          continue;
        }
      }
    }

    // If we have multiple filters, all must match (AND logic)
    // If only one filter type, matches is already set correctly
    if (detectedGenres?.length && detectedYear && matches) {
      // Both genre and year must match
      const yearMatches = anime?.finishDate 
        ? parseInt(anime.finishDate.substring(0, 4)) === detectedYear
        : anime?.releaseYear 
          ? parseInt(anime.releaseYear) === detectedYear
          : false;
      matches = matches && yearMatches;
    }

    if (matches) {
      filtered.push(title);
    } else if ((hasDateInfo || hasGenreInfo) && safetyCount < SAFETY_BUFFER_SIZE) {
      // Has info but doesn't match - add to safety buffer
      safetyBuffer.push(title);
      safetyCount++;
    } else if (!hasDateInfo && !hasGenreInfo && safetyCount < SAFETY_BUFFER_SIZE) {
      // No info at all - keep in safety buffer
      safetyBuffer.push(title);
      safetyCount++;
    }
  }

  // Combine filtered + safety buffer
  // If we have matches, use filtered + buffer. Otherwise, return all (safety)
  const result = filtered.length > 0 
    ? [...filtered, ...safetyBuffer]
    : excludedTitles; // If no matches, return all for safety
  
  if (filtered.length > 0) {
    console.log(`🎯 Smart filtering: ${excludedTitles.length} → ${result.length} entries (${filtered.length} matched, ${safetyBuffer.length} safety buffer)`);
  }
  
  return result;
};

const buildChatPersonaPrompt = ({
  characterData,
  userPrompt,
  conversationHistory,
  helperMode,
  availableCharacters,
  detectedGenres,
}: {
  characterData?: { personality: string; likes: string[]; dislikes: string[]; name?: string };
  userPrompt: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  helperMode: HelperMode;
  availableCharacters?: string[];
  detectedGenres?: string[];
}): string => {
  const personaBlock = characterData
    ? `You are ${characterData.name}, an anime recommendation specialist. Personality: ${characterData.personality}
Likes: ${characterData.likes.join(', ') || 'n/a'}
Dislikes: ${characterData.dislikes.join(', ') || 'n/a'}`
    : `You are Ara, an energetic anime recommendation specialist.`;

  const historyBlock = conversationHistory && conversationHistory.length > 0
    ? conversationHistory.map(entry => `${entry.role.toUpperCase()}: ${entry.content}`).join('\n')
    : 'No previous conversation.';

  const normalizedAvailable = (availableCharacters || []).map(name => {
    const id = nameToIdMap[name] || name.toLowerCase().split(' ')[0];
    return `${name} (ID: ${id})`;
  });

  const referralBlock = normalizedAvailable.length > 0
    ? `If you must refer someone, ONLY choose from:\n${normalizedAvailable.join('\n')}`
    : 'No referral partners are available.';

  const genreBlock = detectedGenres && detectedGenres.length > 0
    ? detectedGenres.join(', ')
    : 'unspecified';

  const modeInstructions = {
    strength_neutral: `Mode: STRENGTH/NEUTRAL.
- Respond with confidence and enthusiasm.
- Encourage the user to check the recommendations that will follow (do not list them).`,
    weak_locked: `Mode: WEAKNESS (buddy locked).
- Admit this genre isn't your specialty, but stay playful.
- Mention you're still sharing one crossover recommendation.
- Keep tone supportive and avoid REFERRAL format.`,
    handoff: `Mode: HANDOFF.
- Do NOT give recommendations.
- Enthusiastically introduce the best specialist using the REFERRAL format:
  REFERRAL:character_id:Character Name|HANDOFF:[your line to them]|ACK:[their reply]
- Use only the IDs provided in the available specialist list.`,
  }[helperMode];

  return `${personaBlock}

${modeInstructions}

Detected genres: ${genreBlock}

${referralBlock}

CONVERSATION HISTORY
${historyBlock}

CURRENT REQUEST
"${userPrompt}"

Respond in your voice (2-4 sentences). Avoid lists, avoid JSON.`;
};

const buildChatFallback = ({
  characterData,
  helperMode,
  error,
  characterId,
  hasRecommendations = false,
}: {
  characterData?: { personality: string; likes: string[]; dislikes: string[]; name?: string };
  helperMode: HelperMode;
  error?: Error | unknown;
  characterId?: string;
  hasRecommendations?: boolean;
}) => {
  const name = characterData?.name || 'I';
  
  // Check if it's a 503/overload error - use character-specific messages
  const errorMessage = error instanceof Error ? error.message : String(error || '');
  const isOverload = isOverloadError(errorMessage);
  
  // Try to match character by ID first, then by name
  const idToMatch = characterId?.toLowerCase() || '';
  const nameToMatch = characterData?.name?.toLowerCase() || '';
  
  const nameMap: Record<string, string[]> = {
    marin: ['marin kitagawa'], veldora: ['veldora tempest'], yuji: ['yuji itadori'],
    shinpachi: ['shimura shinpachi', 'shinpachi'], ishigami: ['yu ishigami', 'ishigami'],
    kinta: ['kinta sakata'], rikka: ['rikka takanashi'], daru: ['itaru hashida', 'daru'],
    ainz: ['ainz ooal gown'], kakashi: ['kakashi hatake'], ichikawa: ['ichikawa kyoutarou', 'ichikawa'],
    bakugo: ['katsuki bakugo', 'bakugo'], kanbaru: ['suruga kanbaru', 'kanbaru'],
    rudeus: ['rudeus greyrat'], king: ['king'], konata: ['konata izumi']
  };
  
  const characterKey = Object.keys({
    marin: true, veldora: true, yuji: true, shinpachi: true, ishigami: true,
    kinta: true, rikka: true, daru: true, ainz: true, kakashi: true,
    ichikawa: true, bakugo: true, kanbaru: true, rudeus: true, king: true, konata: true
  }).find(key => {
    if (idToMatch === key || idToMatch.includes(key)) return true;
    if (nameToMatch.includes(key)) return true;
    return nameMap[key]?.some(n => nameToMatch.includes(n)) ?? false;
  });
  
  if (isOverload || error) {
    // Character-specific error messages - different for with/without recommendations
    const errorMessagesWithRecs: Record<string, string> = {
      marin: "Uh, don't remember what I wanted to say, but here you go!",
      veldora: "GWAHAHAHA! My thoughts scattered like leaves in a storm, but my LEGENDARY recommendations remain!",
      yuji: "Ah man, lost my train of thought there, but check these out!",
      shinpachi: "Seriously? I forgot what I was going to say... but here are the recommendations!",
      ishigami: "Ugh, my mind went blank, but here's what I found.",
      kinta: "The Great Kinta's memory failed him, but his recommendations are still LEGENDARY!",
      rikka: "The Wicked Eye's vision blurred, but the recommendations remain clear!",
      daru: "What?! My brain crashed, but the recommendations are still here!",
      ainz: "Hmm... I seem to have lost my train of thought, but the recommendations are prepared.",
      kakashi: "Maa maa... Forgot what I was going to say, but here are the picks.",
      ichikawa: "Um... I lost my train of thought, but here you go.",
      bakugo: "Tch! Can't remember what I wanted to say, but here!",
      kanbaru: "Wait, what was I saying? Oh well, here are the recommendations!",
      rudeus: "I lost my train of thought, but here are the recommendations.",
      king: "I-I forgot what I was going to say... but here are the picks!",
      konata: "Hmm, lost my train of thought, but here you go!"
    };
    
    const errorMessagesNoRecs: Record<string, string> = {
      marin: "Ugh, I totally lost my train of thought... sorry!",
      veldora: "GWAHAHAHA! My thoughts have scattered to the winds!",
      yuji: "Ah man, I completely lost track of what I was saying...",
      shinpachi: "Seriously? I forgot what I was going to say... this is ridiculous!",
      ishigami: "Ugh, my mind went completely blank...",
      kinta: "The Great Kinta's memory has failed him!",
      rikka: "The Wicked Eye's vision has been clouded!",
      daru: "What?! My brain just crashed...",
      ainz: "Hmm... I seem to have lost my train of thought.",
      kakashi: "Maa maa... Forgot what I was going to say.",
      ichikawa: "Um... I lost my train of thought...",
      bakugo: "Tch! Can't remember what I wanted to say!",
      kanbaru: "Wait, what was I saying?",
      rudeus: "I lost my train of thought...",
      king: "I-I forgot what I was going to say...",
      konata: "Hmm, lost my train of thought..."
    };
    
    const errorMessages = hasRecommendations ? errorMessagesWithRecs : errorMessagesNoRecs;
    
    if (characterKey && errorMessages[characterKey]) {
      return errorMessages[characterKey];
    }
  }
  
  // Default fallback messages
  switch (helperMode) {
    case 'weak_locked':
      return `${name} can't pull the full dossier right now, but I dug up one cross-genre pick for you. Hang tight while I fetch it!`;
    case 'handoff':
      return `${name} would normally hand this off, but the comms are jammed. Give me a moment and try again for a proper referral.`;
    default:
      return `${name} is having trouble reaching the data uplink. I'll retry in a second—thanks for being patient!`;
  }
};

const fetchChatResponse = async ({
  userPrompt,
  characterData,
  conversationHistory,
  helperMode,
  availableCharacters,
  detectedGenres,
  characterId,
  hasRecommendations = false,
}: {
  userPrompt: string;
  characterData?: { personality: string; likes: string[]; dislikes: string[]; name?: string };
  conversationHistory?: Array<{ role: string; content: string }>;
  helperMode: HelperMode;
  availableCharacters?: string[];
  detectedGenres?: string[];
  characterId?: string;
  hasRecommendations?: boolean;
}): Promise<{ responseText: string }> => {
  const systemInstruction = buildChatPersonaPrompt({
    characterData,
    userPrompt,
    conversationHistory,
    helperMode,
    availableCharacters,
    detectedGenres,
  });

  // Log request size
  const systemInstructionSize = systemInstruction.length;
  const userPromptSize = userPrompt.length;
  const totalRequestSize = systemInstructionSize + userPromptSize;
  console.log(`💬 Chat Request Size: System=${systemInstructionSize.toLocaleString()} chars, Prompt=${userPromptSize.toLocaleString()} chars, Total=${totalRequestSize.toLocaleString()} chars`);

  try {
    const model = getChatClient().getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
      generationConfig: {
        temperature: helperMode === 'strength_neutral' ? 0.55 : 0.75,
      },
    });

    const result = await model.generateContent(userPrompt);
    const text = result.response.text()?.trim() || '';
    if (!text) {
      throw new Error('Empty chat response');
    }
    return { responseText: text };
  } catch (error) {
    console.error('⚠️ Chat-engine error, using fallback persona text:', error);
    return { responseText: buildChatFallback({ characterData, helperMode, error, characterId, hasRecommendations }) };
  }
};

const buildWeaknessHandoffChat = async ({
  userPrompt,
  characterId,
  characterData,
  weaknessContext,
}: {
  userPrompt: string;
  characterId: string;
  characterData?: { personality: string; likes: string[]; dislikes: string[]; name?: string };
  weaknessContext: WeaknessContext;
}): Promise<{ responseText: string }> => {
  const helperCharacter = ASSISTANT_CHARACTERS.find(c => c.id === characterId);
  const buddyCharacter = weaknessContext.buddyId
    ? ASSISTANT_CHARACTERS.find(c => c.id === weaknessContext.buddyId)
    : undefined;

  if (!buddyCharacter) {
    const fallbackIntro = `${helperCharacter?.name || characterData?.name || 'I'} wish I could give you a proper ${weaknessContext.weaknessGenre || 'genre'} breakdown, but I don’t have the right friend unlocked yet. Give me a moment to regroup and try asking again—or tap another specialist if you see them lit up.`;
    return { responseText: fallbackIntro };
  }

  let referralDialogue: ReferralDialogueResult | null = null;
  try {
    referralDialogue = await generateReferralDialogue({
      helper: {
        id: helperCharacter?.id || characterId,
        name: helperCharacter?.name || characterData?.name || characterId,
        personality: helperCharacter?.personality || characterData?.personality || '',
        likes: helperCharacter?.likes || characterData?.likes || [],
        dislikes: helperCharacter?.dislikes || characterData?.dislikes || [],
      },
      target: {
        id: buddyCharacter.id,
        name: buddyCharacter.name,
        personality: buddyCharacter.personality,
        likes: buddyCharacter.likes,
        dislikes: buddyCharacter.dislikes,
      },
      userRequest: userPrompt,
      reason: 'weakness',
      topic: weaknessContext.weaknessGenre,
      helperNicknameForTarget: weaknessContext.buddyNickname,
      helperUserLabel: weaknessContext.helperUserLabel,
      helperUserPronoun: weaknessContext.helperUserPronoun,
      targetUserLabel: weaknessContext.targetUserLabel,
      targetUserPronoun: weaknessContext.targetUserPronoun,
    });
  } catch (error) {
    console.error('⚠️ generateReferralDialogue (weakness) failed:', error);
  }

  const fallbackHelperIntro = `I can punch through curses all day, but ${weaknessContext.weaknessGenre || 'that topic'} really belongs to ${weaknessContext.buddyNickname || buddyCharacter.name.split(' ')[0]}.`;
  const fallbackHandoff = `${weaknessContext.buddyNickname || buddyCharacter.name.split(' ')[0]}, our friend needs help dialing in "${userPrompt}". Mind taking the lead?`;
  const fallbackAck = `Appreciate it, ${helperCharacter?.name?.split(' ')[0] || 'buddy'}. I'll handle this ${weaknessContext.weaknessGenre || 'request'} from here.`;
  // Fix: Use "hey buddy" format instead of "buddy—" to treat it as casual address, not a name
  const userLabel = weaknessContext.targetUserLabel || 'our friend';
  const pitchPrefix = userLabel === 'buddy' ? 'Hey buddy' : userLabel === 'our friend' ? 'Hey' : userLabel;
  const fallbackPitch = `${pitchPrefix}, ${buddyCharacter.name.split(' ')[0]} here. ${weaknessContext.weaknessGenre || 'This lane'} is my bread and butter, so expect dialed-in picks incoming.`;

  const helperIntro = referralDialogue?.helperIntro?.trim() || fallbackHelperIntro;
  const handoffLine = referralDialogue?.handoffLine?.trim() || fallbackHandoff;
  const acknowledgmentLine = referralDialogue?.acknowledgmentLine?.trim() || fallbackAck;
  const specialistPitch = referralDialogue?.specialistPitch?.trim() || fallbackPitch;

  const referralPayload = `REFERRAL:${buddyCharacter.id}:${buddyCharacter.name}|HANDOFF:${handoffLine}|ACK:${acknowledgmentLine}|PITCH:${specialistPitch}`;

  return {
    responseText: `${helperIntro}\n\n${referralPayload}`,
  };
};

export const getAnimeRecommendation = async (
  userPrompt: string,
  settings: Settings,
  excludedTitles: string[],
  planToWatchTitles: string[],
  allUserAnime: AnimeEntry[],
  characterData?: { personality: string; likes: string[]; dislikes: string[]; name?: string },
  characterId?: string,
  conversationHistory?: Array<{ role: string; content: string }>,
  availableCharacters?: string[],
  sessionRecommendedTitles?: string[],
  seasonalContext?: { year?: number; season?: string },
  detectedGenres?: string[],
  detectedYear?: number,
  detectedEra?: string,
  weaknessContext?: WeaknessContext,
  isAfterHandoff?: boolean,
  onRetry?: (attempt: number, isOverload: boolean) => void
): Promise<{ responseText: string; recommendations: AnimeRecommendation[]; isRecommendation: boolean; isManga: boolean }> => {
  let lastError: Error | null = null;
  const isRecommendationIntent = isRecommendationRequest(userPrompt);
  
  // Fetch seasonal anime if year and season are provided
  let seasonalAnimeTitles: string[] = [];
  let isUpcoming = false;
  
  if (seasonalContext?.year && seasonalContext?.season) {
    try {
      // Check if this is an upcoming season
      if (isUpcomingYear(seasonalContext.year) || isUpcomingSeason(seasonalContext.season, seasonalContext.year)) {
        console.log(`🚀 Request is for upcoming season, fetching upcoming anime...`);
        const upcomingAnime = await fetchUpcomingAnime();
        seasonalAnimeTitles = upcomingAnime.map(a => a.title);
        isUpcoming = true;
      } else {
        seasonalAnimeTitles = await fetchSeasonalAnime(seasonalContext.year, seasonalContext.season);
      }
      console.log(`📅 Fetched ${seasonalAnimeTitles.length} anime from Jikan${isUpcoming ? ' (upcoming)' : ''}`);
    } catch (error) {
      console.error('Error fetching seasonal/upcoming anime:', error);
    }
  }
  
  // Check for mock AI mode (dev testing)
  const mockAiMode = typeof localStorage !== 'undefined' && localStorage.getItem('mock_ai_mode') === 'true';
  if (mockAiMode) {
    console.log("🤖 MOCK AI MODE: Returning test data");
    
    // Smart mock: Return referral if availableCharacters includes other characters
    if (availableCharacters && availableCharacters.length > 0) {
      const otherCharacters = availableCharacters.filter(name => !name.includes('Bakugo'));
      if (otherCharacters.length > 0) {
        console.log("🤖 MOCK: Generating referral to", otherCharacters[0]);
        return {
          responseText: `Yo, you're REALLY into this stuff, huh? Not my thing. REFERRAL:marin:${otherCharacters[0]}|HANDOFF:Aaron is looking for more of this genre|ACK:Thanks for bringing this to me!`,
          recommendations: [],
          isRecommendation: true,
          isManga: false
        };
      }
    }
    
    // Regular mock response (first request or continue)
    return {
      responseText: "This is a mock response for testing. No AI call was made.",
      recommendations: [],
      isRecommendation: false,
      isManga: false
    };
  }
  
  const filteredExclusions = filterExclusionList(
    excludedTitles,
    allUserAnime,
    userPrompt,
    detectedGenres,
    detectedYear,
    detectedEra
  );
  
  try {
    let helperMode = determineHelperMode(characterId, detectedGenres, availableCharacters);
    if (weaknessContext?.buddyUnlocked) {
      helperMode = 'handoff';
    } else if (helperMode === 'handoff' && !weaknessContext?.buddyUnlocked) {
      helperMode = 'weak_locked';
    }
    const effectiveMode = isRecommendationIntent ? helperMode : 'strength_neutral';
    const recCount = effectiveMode === 'strength_neutral'
      ? 3
      : effectiveMode === 'weak_locked'
        ? 1
        : 0;
    
    const shouldUseTemplateHandoff = effectiveMode === 'handoff' && weaknessContext?.buddyUnlocked && characterId && weaknessContext.buddyId;

    const chatPromise = shouldUseTemplateHandoff && characterId
      ? buildWeaknessHandoffChat({
          userPrompt,
          characterId,
          characterData,
          weaknessContext: weaknessContext!,
        })
      : fetchChatResponse({
          userPrompt,
          characterData,
          conversationHistory,
          helperMode: effectiveMode,
          availableCharacters,
          detectedGenres,
          characterId,
          hasRecommendations: recCount > 0, // Pass whether recommendations are expected
        });

    const recPromise = fetchRecommendationBatch({
      onRetry,
      userPrompt,
      recCount,
      settings,
      filteredExclusions,
      planToWatchTitles,
      allUserAnime,
      characterData,
      availableCharacters,
      sessionRecommendedTitles,
      seasonalAnimeTitles,
      detectedGenres,
      detectedYear,
      detectedEra,
      isAfterHandoff,
    });

    const [chatResult, recResult] = await Promise.all([chatPromise, recPromise]);
    
    const recommendations = recResult.recommendations || [];
    
    // If after handoff, ensure responseText is very short (1 sentence max)
    let finalResponseText = chatResult.responseText || '';
    if (isAfterHandoff && finalResponseText) {
      // Split by sentences and take first sentence only
      const sentences = finalResponseText.match(/[^.!?]+[.!?]+/g) || [finalResponseText];
      if (sentences.length > 0) {
        finalResponseText = sentences[0].trim();
      } else if (finalResponseText.length > 100) {
        // If no clear sentence breaks but too long, truncate at 100 chars
        finalResponseText = finalResponseText.substring(0, 97).trim() + '...';
      }
    }
    
    return {
      responseText: finalResponseText,
      recommendations,
      isRecommendation: recommendations.length > 0,
      isManga: recResult.isManga || false,
    };
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error));
    console.error('getAnimeRecommendation error:', lastError);
  }
  
  // All retries failed
  const errorMessage = lastError?.message || "An unknown error occurred.";
  const overload = isOverloadError(errorMessage);
  const rateLimit = isRateLimitError(errorMessage);
  const quota = isQuotaError(errorMessage);
  
  // Check if this is a manga request
  const isManga = isMangaRequest(userPrompt);
  
  // Generate character-specific error message
  const getCharacterErrorMessage = (): string => {
    if (!characterData) {
      // Fallback for no character data
      if (rateLimit) {
        return `I've hit Gemini's rate limit. The free tier allows 15 requests per minute and 1M requests per month.\n\n*Please wait a moment and try again, or check your API usage at https://aistudio.google.com/apikey*\n\n*Error: ${errorMessage}*`;
      } else if (quota) {
        return `Gemini API quota has been exceeded. Please check your API key usage and billing status.\n\n*Visit https://aistudio.google.com/apikey to check your quota*\n\n*Error: ${errorMessage}*`;
      } else if (overload) {
        return `The AI model is currently experiencing high demand. Please wait a moment and try again.\n\n*Google's servers are temporarily overloaded.*`;
      } else {
        return `I'm sorry, I ran into an issue while generating recommendations. It could be a temporary problem with the AI model or the data connection. Please try again in a moment.\n\n*Error details: ${errorMessage}*`;
      }
    }

    const personality = characterData.personality.toLowerCase();
    const characterName = (characterData.name || '').toLowerCase();
    
    // Determine media type terminology
    const mediaType = isManga ? 'manga' : 'anime';
    const collectionTerms = {
      veldora: isManga ? 'sacred scripts' : 'LEGENDARY collection',
      marin: isManga ? 'manga collection' : 'anime collection',
      daru: isManga ? 'manga archives' : 'anime database',
      rikka: isManga ? 'manga realm' : 'anime realm',
      shinpachi: isManga ? 'manga library' : 'anime library',
      ainz: isManga ? 'manga archives' : 'recommendation archives',
      kakashi: isManga ? 'my manga' : 'my collection',
      ichikawa: isManga ? 'manga database' : 'database',
      default: isManga ? 'manga collection' : 'anime collection'
    };
    
    // Character-specific error messages for server/database issues
    if (overload || (!rateLimit && !quota)) {
      // Server/database unavailable - character-specific responses
      // Check by name first (more reliable), then personality
      if (characterName.includes('veldora') || personality.includes('veldora') || personality.includes('storm dragon')) {
        const collection = collectionTerms.veldora;
        return `GWAHAHAHA! Wait... WHAT?! Someone has STOLEN my ${collection}! I can't access my LEGENDARY ${mediaType} knowledge! This is an OUTRAGE! *thunderous anger*\n\n*The server seems to be down. I can't help you until I find my stolen scripts. Please try again later when the connection is restored.*`;
      } else if (characterName.includes('marin') || personality.includes('marin') || personality.includes('gyaru')) {
        const collection = collectionTerms.marin;
        return `OMG, like, this is SO frustrating! I can't access my ${collection} right now! It's like, totally not working! *panicked*\n\n*The server seems to be down. I can't help you until it's back up. Please try again later!*`;
      } else if (characterName.includes('daru') || personality.includes('daru') || personality.includes('hacker') || personality.includes('hacka')) {
        const collection = collectionTerms.daru;
        return `What?! I can't hack into the ${collection}! The connection is completely blocked! This is like trying to hack a fortress with no tools! *frustrated typing*\n\n*The server seems to be down. I can't access my ${collection} right now. Please try again later when the connection is restored.*`;
      } else if (characterName.includes('rikka') || personality.includes('rikka') || personality.includes('chuunibyou') || personality.includes('wicked eye')) {
        const collection = collectionTerms.rikka;
        return `The... The Wicked Eye cannot pierce through this darkness! My ${collection} has been sealed away by some unknown force! *dramatic despair*\n\n*The server seems to be down. The Ethereal Horizon is blocking my access. Please try again later when the seal is lifted.*`;
      } else if (characterName.includes('shinpachi') || personality.includes('shinpachi') || personality.includes('straight man') || personality.includes('tsukkomi')) {
        const collection = collectionTerms.shinpachi;
        return `Seriously?! The ${collection} is down? This is ridiculous! Even I can't access it right now, and I'm supposed to be the logical one here! *adjusts glasses in frustration*\n\n*The server seems to be unavailable. I can't help you until it's back online. Please try again later.*`;
      } else if (characterName.includes('ainz') || personality.includes('ainz') || personality.includes('overlord') || personality.includes('suzuki')) {
        const collection = collectionTerms.ainz;
        return `Hmm... It appears the connection has been severed. This is most inconvenient. I cannot access my ${collection} at this time.\n\n*The server seems to be down. I cannot assist you until the connection is restored. Please try again later.*`;
      } else if (characterName.includes('kakashi') || personality.includes('kakashi') || personality.includes('maa maa')) {
        const collection = collectionTerms.kakashi;
        return `Maa maa... Looks like the connection is down. I can't access ${collection} right now. *puts Icha Icha away*\n\n*The server seems to be unavailable. I'll need to wait until it's back up before I can help you. Please try again later.*`;
      } else if (characterName.includes('ichikawa') || personality.includes('ichikawa') || personality.includes('social outcast')) {
        const collection = collectionTerms.ichikawa;
        return `Um... I can't access the ${collection} right now. This is... frustrating. I was trying to help, but the connection is down.\n\n*The server seems to be unavailable. I can't help you until it's back online. Please try again later.*`;
      } else {
        // Generic character-specific fallback
        const collection = collectionTerms.default;
        return `I'm having trouble accessing my ${collection} right now. The server seems to be down, so I can't help you at the moment.\n\n*Please try again later when the connection is restored.*`;
      }
    } else if (rateLimit) {
      return `I've hit Gemini's rate limit. The free tier allows 15 requests per minute and 1M requests per month.\n\n*Please wait a moment and try again, or check your API usage at https://aistudio.google.com/apikey*\n\n*Error: ${errorMessage}*`;
    } else if (quota) {
      return `Gemini API quota has been exceeded. Please check your API key usage and billing status.\n\n*Visit https://aistudio.google.com/apikey to check your quota*\n\n*Error: ${errorMessage}*`;
    } else {
      return `I'm sorry, I ran into an issue while generating recommendations. It could be a temporary problem with the AI model or the data connection. Please try again in a moment.\n\n*Error details: ${errorMessage}*`;
    }
  };
  
  return {
    responseText: getCharacterErrorMessage(),
    recommendations: [],
    isRecommendation: false,
    isManga: false
  };
};


const fetchRecommendationBatch = async ({
  userPrompt,
  recCount,
  settings,
  filteredExclusions,
  planToWatchTitles,
  allUserAnime,
  characterData,
  availableCharacters,
  sessionRecommendedTitles,
  seasonalAnimeTitles,
  detectedGenres,
  detectedYear,
  detectedEra,
  isAfterHandoff,
  onRetry,
}: {
  userPrompt: string;
  recCount: number;
  settings: Settings;
  filteredExclusions: string[];
  planToWatchTitles: string[];
  allUserAnime: AnimeEntry[];
  characterData?: { personality: string; likes: string[]; dislikes: string[]; name?: string };
  availableCharacters?: string[];
  sessionRecommendedTitles?: string[];
  seasonalAnimeTitles?: string[];
  detectedGenres?: string[];
  detectedYear?: number;
  detectedEra?: string;
  isAfterHandoff?: boolean;
  onRetry?: (attempt: number, isOverload: boolean) => void;
}) => {
  if (recCount <= 0) {
    return { recommendations: [], isManga: false };
  }

  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const attemptedModels = new Set<string>();
    let modelCursor = MODEL_PRIORITY[0];
    let shouldRetry = false;

    while (modelCursor) {
      const activeModel = modelCursor;
      attemptedModels.add(activeModel);

      try {
        const aiClient = getRecommendationClient();
        const systemInstruction = buildRecommendationPrompt(
          userPrompt,
          recCount,
          settings,
          filteredExclusions,
          planToWatchTitles,
          allUserAnime,
          characterData,
          availableCharacters,
          sessionRecommendedTitles,
          seasonalAnimeTitles,
          detectedGenres,
          detectedYear,
          detectedEra,
          isAfterHandoff
        );

        // Log request size
        const systemInstructionSize = systemInstruction.length;
        const userPromptSize = userPrompt.length;
        const totalRequestSize = systemInstructionSize + userPromptSize;
        console.log(`📊 Recommendation Request Size: System=${systemInstructionSize.toLocaleString()} chars, Prompt=${userPromptSize.toLocaleString()} chars, Total=${totalRequestSize.toLocaleString()} chars`);

        // Create dynamic schema with shorter responseText description if after handoff
        const dynamicSchema = {
          ...recommendationSchema,
          properties: {
            ...recommendationSchema.properties,
            responseText: {
              ...recommendationSchema.properties.responseText,
              description: isAfterHandoff 
                ? "VERY SHORT message (1 sentence max) - keep it brief since there was already extensive dialogue in the handoff sequence."
                : recommendationSchema.properties.responseText.description
            }
          }
        };

        const model = aiClient.getGenerativeModel({
          model: activeModel,
          systemInstruction,
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
            responseSchema: dynamicSchema,
          },
        });

        const result = await model.generateContent(userPrompt);
        const response = result.response;
        const jsonText = response.text().trim();
        const cleanedJsonText = jsonText.replace(/^```json\n|```$/g, "");
        const data = JSON.parse(cleanedJsonText);

        return {
          recommendations: data.recommendations || [],
          isManga: data.isManga || false,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const message = lastError.message || "";
        const nextModel = getNextModel(activeModel, attemptedModels);

        if ((isUnsupportedModelError(message) || isOverloadError(message)) && nextModel) {
          console.warn(`Recommendation model ${activeModel} unavailable (${message}). Trying ${nextModel}.`);
          modelCursor = nextModel;
          continue;
        }

        // If overload error and no next model, check if we should retry
        if (isOverloadError(message) && !nextModel) {
          if (attempt < maxRetries) {
            const waitTime = 5000; // Fixed 5 second delay as requested
            console.warn(`Recommendation model overloaded. Retrying in ${waitTime / 1000}s (attempt ${attempt}/${maxRetries}).`);
            
            // Call onRetry callback after first retry attempt
            if (attempt === 1 && onRetry) {
              onRetry(attempt, true);
            }
            
            shouldRetry = true;
            break; // Break out of while loop to retry
          } else {
            // Max retries reached, throw error
            console.error(`Recommendation failed after ${maxRetries} attempts. Model: ${activeModel}, Error: ${message}`);
            break;
          }
        }

        console.error(`Recommendation attempt ${attempt}/${maxRetries} failed on model ${activeModel}:`, message);
        break;
      }
    }

    // If we should retry and haven't reached max retries, wait and continue to next attempt
    if (shouldRetry && attempt < maxRetries) {
      await delay(5000);
      continue; // Continue to next iteration of for loop (next attempt)
    }

    // If we've exhausted all models and attempts, break
    if (!shouldRetry) {
      break;
    }
  }

  throw lastError || new Error("Unable to fetch recommendations.");
};
export const generateReferralDialogue = async (params: ReferralDialogueParams): Promise<ReferralDialogueResult> => {
  const mockAiMode = typeof localStorage !== 'undefined' && localStorage.getItem('mock_ai_mode') === 'true';

  const helperNickname = params.helperNicknameForTarget || params.target.name.split(' ')[0];
  const targetNickname = params.targetNicknameForHelper || params.helper.name.split(' ')[0];
  const topicLabel = params.topic ? params.topic.trim() : 'this';
  const helperUserLabel = params.helperUserLabel || 'our friend';
  const helperUserPronoun = params.helperUserPronoun || 'them';
  const targetUserLabel = params.targetUserLabel || helperUserLabel;
  const targetUserPronoun = params.targetUserPronoun || helperUserPronoun;
  const requestSnippet = buildRequestSnippet(params.userRequest);

  if (mockAiMode) {
    return {
      helperIntro: `This isn't really my jam. ${helperNickname} is all about ${topicLabel}, so I'm looping them in.`,
      handoffLine: `${helperNickname}, can you help ${helperUserPronoun} dial in "${requestSnippet}"? It's dripping in ${topicLabel}.`,
      acknowledgmentLine: `Thanks, ${targetNickname}! I'll guide ${targetUserPronoun} from here and keep things focused on ${topicLabel}.`,
      specialistPitch: `${targetUserLabel}, ${topicLabel} is absolutely my playground—give me a sec and I’ll queue recs that prove it.`,
    };
  }

  const aiClient = getChatClient();

  const helperLikes = params.helper.likes?.slice(0, 6).join(', ') || 'not specified';
  const helperDislikes = params.helper.dislikes?.slice(0, 6).join(', ') || 'not specified';
  const targetLikes = params.target.likes?.slice(0, 6).join(', ') || 'not specified';
  const targetDislikes = params.target.dislikes?.slice(0, 6).join(', ') || 'not specified';

  const reasonCue = params.reason === 'specialty'
    ? 'The helper triggered a shortcut unlock because the user used a specialty keyword. The helper should sound energized and confident in the specialist.'
    : params.reason === 'weakness'
      ? 'The helper is weak in this genre and already trusts this buddy. They should admit the weakness with personality and warmly hand things off.'
      : 'The user unlocked the specialist after two weakness hits. The helper should sound proud and relieved, while keeping the energy upbeat.';

  const systemInstruction = `You script four vibrant, in-character lines for an anime recommendation assistant handoff.

Output MUST be JSON matching helperIntro, handoffLine, acknowledgmentLine, specialistPitch (see schema). Each value can be one or two punchy sentences, up to 180 characters total, brimming with personality.

Voices:
- Helper: ${params.helper.name}. Personality: ${params.helper.personality}
  Likes: ${helperLikes}
  Dislikes: ${helperDislikes}
- Specialist: ${params.target.name}. Personality: ${params.target.personality}
  Likes: ${targetLikes}
  Dislikes: ${targetDislikes}

Relationship guidelines:
- Helper calls the specialist "${params.helperNicknameForTarget || params.target.name.split(' ')[0]}".
- Specialist refers to the helper as "${params.targetNicknameForHelper || params.helper.name.split(' ')[0]}".
- Both should banter with energy, teasing, or admiration that matches their personalities.
- When speaking to the requester, the helper can call them "${helperUserLabel}" or use the pronoun "${helperUserPronoun}" to avoid repetition. The specialist can use "${targetUserLabel}" or the pronoun "${targetUserPronoun}".
${helperUserLabel === 'buddy' || targetUserLabel === 'buddy' ? '- IMPORTANT: "buddy" is a casual address term (like "hey buddy" or "buddy, you should..."), NOT a proper name. Do NOT capitalize it as "Buddy" or treat it like a name. Use it naturally as a casual way to address someone.\n' : ''}

Context: ${reasonCue}
Topic focus: ${topicLabel}

Rules:
- helperIntro: helper addresses the requester (label or pronoun), playfully admits their weakness, and hypes the specialist with a flair that fits their vibe.
- handoffLine: helper addresses the SPECIALIST directly, summarises the request with vivid detail, and invites them in with excitement. Keep the requester reference natural (pronoun or label).
- acknowledgmentLine: specialist answers the helper with gratitude or sass, then reassures the requester (pronoun or label) they’re about to deliver something memorable.
- specialistPitch: specialist now focuses entirely on the requester, briefly reminding them why this genre/topic is their bread-and-butter and promising tailored recommendations next.
${helperUserLabel === 'buddy' || targetUserLabel === 'buddy' ? `- CRITICAL for specialistPitch: "buddy" is a casual address term, NOT a name. NEVER use "buddy—" (with em dash) or "buddy—[Name] here" format. 
  CORRECT formats: "Hey buddy, romance is my thing" or "buddy, romance is my bread and butter" or "Hey, romance is my thing"
  WRONG formats: "buddy—romance is my thing" ❌ or "buddy—Marin here" ❌ or "buddy—" ❌
  If you start with "buddy", it MUST be followed by a comma: "buddy," not "buddy—". Better yet, use "Hey buddy," or just skip "buddy" and use "Hey" or start directly with the topic.\n` : ''}
- Never mention unlocking mechanics or meta process. No emoji or stage directions.
- Do NOT use the words "user", "client", "customer", "operator", or "player".
- Focus strictly on the provided topic string (${topicLabel}); avoid referencing earlier genres.
- Keep everything on-topic with the user request.
`;

  const model = getChatClient().getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction,
    generationConfig: {
      temperature: 0.75,
      responseMimeType: "application/json",
      responseSchema: referralDialogueSchema,
    },
  });

  const prompt = `User request: "${params.userRequest}"
Helper nickname for specialist: ${helperNickname}
Specialist nickname for helper: ${targetNickname}
Topic/emphasis: ${topicLabel}
Helper references for requester: label="${helperUserLabel}", pronoun="${helperUserPronoun}"
Specialist references for requester: label="${targetUserLabel}", pronoun="${targetUserPronoun}"
${helperUserLabel === 'buddy' || targetUserLabel === 'buddy' ? 'NOTE: "buddy" is a casual address (like "hey buddy"), NOT a name. Use it naturally, not capitalized.\n' : ''}
Return JSON with helperIntro, handoffLine, acknowledgmentLine, specialistPitch.`;

  // Log request size
  const systemInstructionSize = systemInstruction.length;
  const promptSize = prompt.length;
  const totalRequestSize = systemInstructionSize + promptSize;
  console.log(`🔄 Referral Dialogue Request Size: System=${systemInstructionSize.toLocaleString()} chars, Prompt=${promptSize.toLocaleString()} chars, Total=${totalRequestSize.toLocaleString()} chars`);

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    console.log('🤖 Referral handoff raw response:', raw);
    const cleaned = raw.replace(/^```json\n?|```$/g, '');
    const data = JSON.parse(cleaned);
    
    // Post-process specialistPitch to fix "buddy—" format
    let specialistPitch = data.specialistPitch?.trim() || '';
    if (specialistPitch) {
      // Fix "buddy—" or "buddy—[Name] here" patterns
      specialistPitch = specialistPitch
        .replace(/^buddy—\s*/i, 'Hey buddy, ') // Replace "buddy—" at start with "Hey buddy, "
        .replace(/^buddy—([^,]+)\s+here/i, 'Hey buddy, $1 here') // Fix "buddy—Marin here" → "Hey buddy, Marin here"
        .replace(/^buddy—/i, 'Hey buddy, '); // Catch any remaining "buddy—"
    }
    
    return {
      helperIntro: data.helperIntro?.trim() || '',
      handoffLine: data.handoffLine?.trim() || '',
      acknowledgmentLine: data.acknowledgmentLine?.trim() || '',
      specialistPitch: specialistPitch,
    };
  } catch (error) {
    console.error('generateReferralDialogue error:', error);
    // Check if it's a 503/overload error - return character-specific error message instead of throwing
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (isOverloadError(errorMessage)) {
      // Return character-specific error messages for overload
      const helperId = params.helper.id.toLowerCase();
      const targetId = params.target.id.toLowerCase();
      
      // Character-specific error messages
      const errorMessages: Record<string, string> = {
        marin: "I actually don't know it off the top of my head and I need to charge my laptop to check, sorry.",
        veldora: "GWAHAHAHA! Someone has STOLEN my sacred scripts! I have to go search for them!",
        yuji: "Ah man, I'm having trouble reaching my data right now. Give me a sec!",
        shinpachi: "Seriously? The connection is down? This is ridiculous!",
        ishigami: "Ugh, I can't access my database right now. This is annoying.",
        kinta: "The Great Kinta cannot access his legendary archives! This is unacceptable!",
        rikka: "The Wicked Eye cannot pierce through this darkness! My realm has been sealed!",
        daru: "What?! I can't hack into the database! The connection is completely blocked!",
        ainz: "Hmm... It appears the connection has been severed. This is most inconvenient.",
        kakashi: "Maa maa... Looks like the connection is down. I can't access my collection right now.",
        ichikawa: "Um... I can't access the database right now. This is... frustrating.",
        bakugo: "Tch! The system is down! This is so annoying!",
        kanbaru: "Wait, I can't access my data? That's weird...",
        rudeus: "I'm having trouble accessing my collection right now. Let me try again.",
        king: "I-I can't access my database right now. The King Engine is... concerned.",
        konata: "Hmm, can't access my data right now. Let me check my connection."
      };
      
      const helperError = errorMessages[helperId] || `${params.helper.name} is having trouble accessing the database right now.`;
      const targetError = errorMessages[targetId] || `${params.target.name} is having trouble accessing the database right now.`;
      
      return {
        helperIntro: helperError,
        handoffLine: `I'm passing this to ${params.target.name.split(' ')[0]}, but they're having issues too.`,
        acknowledgmentLine: targetError,
        specialistPitch: `Sorry, I can't help right now. The system is overloaded.`,
      };
    }
    throw error;
  }
};

