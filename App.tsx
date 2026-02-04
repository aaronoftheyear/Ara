import React, { useState, useCallback, useEffect, useRef } from 'react';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import SettingsPanel from './components/SettingsPanel';
import TransparencyPanel from './components/TransparencyPanel';
import SetupScreen from './components/SetupScreen';
import UsernamePrompt from './components/UsernamePrompt';
import DeveloperVisualizationScreen from './components/DeveloperVisualizationScreen';
import BugReportModal from './components/BugReportModal';
import { Toast } from './components/Toast';
import { getAnimeRecommendation, generateReferralDialogue, initializeAi, ReferralDialogueResult } from './services/geminiService';
import { fetchUserAnimeList, searchAnime } from './services/malApiService';
import { fetchAniListAnimeList, searchAniListAnime } from './services/anilistService';
import { fetchAnimeReviews, fetchAnimeRecommendations } from './services/jikanService';
import { parseAnimeList } from './services/animeListParser';
import { isUnlockQuery, getUnlockableAnimeForCharacter } from './services/unlockRecommendationService';
// System 3.0 imports
import { 
  initializeDiscoveryStates, 
  saveDiscoveryStates, 
  canUnlockCharacter, 
  getDiscoveryState, 
  updateDiscoveryState,
  CharacterDiscoveryState,
  CHARACTER_FRANCHISES,
  CHARACTER_UNLOCKS
} from './data/characterUnlockSystem';
import { selectBestBuddy, isMangaRequest as detectMangaRequest, detectEraRequest, type EraRequest } from './services/buddySelectionService';
import { getBuddiesForCharacter } from './data/characterBuddies';
import { CHARACTER_ERA_EXPERTISE } from './data/animeEras';
import { AdjustmentsIcon, ArrowPathIcon, BugIcon, MenuIcon } from './components/icons';
import { startConsoleCapture, getConsoleLogs, type ConsoleLogEntry } from './services/consoleCapture';
import { submitBugReport } from './services/bugReportService';
import { initializeErrorHandler } from './services/errorLogger';
import { startSessionTracking } from './services/sessionTracker';
import {
  loadUnlockProgress,
  registerWeaknessHit,
  clearUnlockProgressFor,
  type UnlockProgressState,
} from './services/unlockProgressService';
import AraLogo from './Ara-logo-v3.svg';

// Function to detect if user is asking for recommendations or just asking a question
const isRecommendationRequest = (userPrompt: string): boolean => {
  const recommendationKeywords = [
    'recommend', 'suggestion', 'suggest', 'what should i watch', 'what to watch',
    'find me', 'looking for', 'want to watch', 'need something', 'give me',
    'show me', 'anime like', 'similar to', 'based on', 'genre'
  ];
  
  const questionKeywords = [
    'what is', 'who is', 'when did', 'where can', 'how many', 'why did',
    'explain', 'tell me about', 'what happened', 'what does', 'meaning of'
  ];
  
  const lowerPrompt = userPrompt.toLowerCase();
  
  // Check for question patterns first (more specific)
  const hasQuestionWords = questionKeywords.some(keyword => lowerPrompt.includes(keyword));
  if (hasQuestionWords) return false;
  
  // Check for recommendation patterns
  const hasRecommendationWords = recommendationKeywords.some(keyword => lowerPrompt.includes(keyword));
  if (hasRecommendationWords) return true;
  
  // Default to recommendation if unclear
  return true;
};

// Helper function to search anime on the appropriate platform
const searchAnimeOnPlatform = async (
  title: string, 
  malClientId: string | undefined, 
  isManga: boolean
): Promise<{ 
  coverImage?: string; 
  trailerUrl?: string; 
  releaseYear?: string; 
  malUrl?: string;
  malId?: number;
  anilistUrl?: string;
  genres?: string[];
  synopsis?: string;
  score?: number;
}> => {
  const platform = localStorage.getItem('ANIME_PLATFORM');
  
  if (platform === 'anilist') {
    // Use AniList API (doesn't differentiate manga)
    return await searchAniListAnime(title);
  } else {
    // Use MAL API (default)
    if (!malClientId) return {};
    return await searchAnime(title, malClientId, isManga);
  }
};
import { getExcludedAnimeTitles, getPlanToWatchTitles, getAllUserAnimeEntries } from './data/malData';
import { getRandomCharacter, getCharacterById, ASSISTANT_CHARACTERS } from './data/characters';
import type { AssistantCharacter } from './data/characters';
import { 
  initializeUnlockedCharacters, 
  isCharacterUnlocked, 
  getStartingCharacters,
  saveUnlockedCharacters,
  tryUnlockCharacter,
  getUnlockDataForCharacter,
  checkUnlockCondition,
  checkPotentialUnlock
} from './data/characterUnlockSystem';
import { getCharacterExpertise, getExpertForGenre, isCharacterWeak } from './data/characterExpertise';
import { detectSpecialty, shouldTriggerSpecialty } from './data/characterSpecialties';
import CharacterSelector from './components/CharacterSelector';
import { MessageRole } from './types';
import type { ChatMessage, Settings, AnimeEntry, AnimeRecommendation } from './types';

const popularGenres = [ "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Thriller"];
const defaultPrompts = [ "Recommend a psychological thriller.", "Anything good from my plan to watch?", "Find me a hidden gem.", "I want something similar to Steins;Gate." ];

const characterMap = new Map(ASSISTANT_CHARACTERS.map(char => [char.id, char]));

const CHARACTER_NICKNAMES: Record<string, Record<string, string>> = {
  marin: {
    yuji: 'Itadori-kun',
  },
  yuji: {
    marin: 'Marin',
  },
  bakugo: {
    kinta: 'Nerd',
    shinpachi: 'Four-eyes',
  },
  kinta: {
    bakugo: 'Boomer',
  },
};

const getCharacterNickname = (speakerId: string, target: AssistantCharacter) => {
  return CHARACTER_NICKNAMES[speakerId]?.[target.id] || target.name.split(' ')[0];
};

type UserReferenceStyle = {
  label: string;
  pronoun: string; // objective pronoun for phrases like "help them"
};

const USER_REFERENCE_STYLES: Record<string, UserReferenceStyle> = {
  default: { label: 'our friend', pronoun: 'them' },
  yuji: { label: 'my friend', pronoun: 'them' },
  marin: { label: 'buddy', pronoun: 'them' },
  shinpachi: { label: 'our guest', pronoun: 'them' },
  ishigami: { label: 'this person', pronoun: 'them' },
  kinta: { label: 'our ally', pronoun: 'them' },
  daru: { label: 'our buddy', pronoun: 'them' },
  rikka: { label: 'this mortal', pronoun: 'them' },
  ainz: { label: 'our ally', pronoun: 'them' },
  kakashi: { label: 'our comrade', pronoun: 'them' },
  bakugo: { label: 'this extra', pronoun: 'them' },
  kanbaru: { label: 'our teammate', pronoun: 'them' },
  rudeus: { label: 'our travelling friend', pronoun: 'them' },
  veldora: { label: 'this mortal', pronoun: 'them' },
  king: { label: 'our friend', pronoun: 'them' },
  konata: { label: 'this fellow fan', pronoun: 'them' }
};

const getUserReference = (characterId: string): UserReferenceStyle => USER_REFERENCE_STYLES[characterId] || USER_REFERENCE_STYLES.default;

const getRequestSnippet = (request: string): string => {
  const trimmed = request.trim();
  if (!trimmed) return 'that';
  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}...` : trimmed;
};

const normalizeTopic = (topic?: string) => {
  if (!topic) return 'that';
  return topic.trim().length > 0 ? topic.trim().toLowerCase() : 'that';
};

const getFallbackReferralIntro = (
  helper: AssistantCharacter,
  target: AssistantCharacter,
  topic: string | undefined,
  userRequest: string
) => {
  const friendlyTopic = normalizeTopic(topic);
  const targetNickname = getCharacterNickname(helper.id, target);
  return `Okay, ${friendlyTopic} isn't exactly my battlefield, but ${targetNickname} eats that up, so I'm pinging them to give you the good stuff.`;
};

const getFallbackHandoff = (
  helper: AssistantCharacter,
  target: AssistantCharacter,
  userRequest: string,
  topic: string | undefined,
  helperUserReference: UserReferenceStyle
) => {
  const requestSnippet = getRequestSnippet(userRequest);
  const targetNickname = getCharacterNickname(helper.id, target);
  const friendlyTopic = normalizeTopic(topic);
  return `${targetNickname}, ${helperUserReference.label} is craving your signature ${friendlyTopic} flair—jump in and wow ${helperUserReference.pronoun} with "${requestSnippet}"!`;
};

const getFallbackAcknowledgment = (
  newCharacter: AssistantCharacter,
  helper: AssistantCharacter,
  userRequest: string,
  topic: string | undefined,
  targetUserReference: UserReferenceStyle
) => {
  const helperNickname = getCharacterNickname(newCharacter.id, helper);
  const requestSnippet = getRequestSnippet(userRequest);
  const friendlyTopic = normalizeTopic(topic);
  return `Appreciate it, ${helperNickname}! I'll take over and shower ${targetUserReference.pronoun} with the most electric ${friendlyTopic} picks for "${requestSnippet}".`;
};

type ReferralMetadata = {
  hasReferral: boolean;
  cleanedResponseText: string;
  referredCharacterId?: string;
  referredCharacterName?: string;
  referralHandoff?: string;
  referralAcknowledgment?: string;
  referralPitch?: string;
};

const extractReferralMetadata = (responseText: string): ReferralMetadata => {
  const referralMatch = responseText.match(/REFERRAL:(\w+):([^|]+)\|HANDOFF:([^|]+)\|ACK:([^|]+)\|PITCH:(.+)/);
  if (!referralMatch) {
    return {
      hasReferral: false,
      cleanedResponseText: responseText.trim(),
    };
  }

  return {
    hasReferral: true,
    cleanedResponseText: responseText.split('REFERRAL:')[0].trim(),
    referredCharacterId: referralMatch[1],
    referredCharacterName: referralMatch[2].trim(),
    referralHandoff: referralMatch[3].trim(),
    referralAcknowledgment: referralMatch[4].trim(),
    referralPitch: referralMatch[5].trim(),
  };
};

const isOverloadResponse = (text: string | undefined): boolean => {
  if (!text) return false;
  const normalized = text.toLowerCase();
  return normalized.includes('ai model is currently experiencing high demand');
};

const formatOverloadTopic = (topic?: string) => {
  const normalized = normalizeTopic(topic);
  if (!normalized || normalized === 'that') {
    return 'this request';
  }
  return normalized;
};

const buildOverloadFallbackMessage = (character: AssistantCharacter, topic?: string) => {
  const friendlyTopic = formatOverloadTopic(topic);
  switch (character.id) {
    case 'kinta':
      return `Tch—my data uplink jammed right when you're asking about ${friendlyTopic}. Google's servers are overloaded, so give me a sec or tap Marin while I wait for the signal to clear.`;
    case 'yuji':
      return `Dang it, the AI feed's clogged while I'm pulling hits for ${friendlyTopic}. Hang tight for a moment or tag in one of my buddies who lives for this stuff.`;
    case 'marin':
      return `Ugh, the AI queue is totally slammed right now! I can't fetch the cute picks for ${friendlyTopic} just yet—mind trying again in a minute?`;
    default:
      return `Looks like the AI service is overloaded while I dig into ${friendlyTopic}. Give me a moment and try again, or hand it off to another specialist in the meantime.`;
  }
};

const isErrorResponse = (text: string | undefined): boolean => {
  if (!text) return false;
  const normalized = text.toLowerCase();
  return normalized.includes('server') || 
         normalized.includes('database') || 
         normalized.includes('connection') || 
         normalized.includes('down') || 
         normalized.includes('unavailable') ||
         normalized.includes('error') ||
         normalized.includes('stolen') ||
         normalized.includes('sealed') ||
         normalized.includes('blocked');
};

const buildNoRecommendationsMessage = (character: AssistantCharacter, responseText?: string, userMessage?: string): string => {
  // If responseText already contains an error message, use it
  if (responseText && isErrorResponse(responseText)) {
    return responseText;
  }
  
  // Otherwise, generate character-specific "no recommendations" message
  const isManga = userMessage?.toLowerCase().includes('manga') || userMessage?.toLowerCase().includes('manhwa') || userMessage?.toLowerCase().includes('manhua');
  const mediaType = isManga ? 'manga' : 'anime';
  
  switch (character.id) {
    case 'veldora':
      return `GWAHAHAHA! Hmm... I can't seem to find any ${mediaType} that matches what you're looking for in my LEGENDARY collection right now. The connection might be having issues, or maybe I need to search deeper! *thunderous thinking*\n\n*Please try again in a moment, or rephrase your request.*`;
    case 'yuji':
      return `Hmm... I'm not finding anything in my ${mediaType} collection that matches right now. Something might be wrong with the connection. *scratches head*\n\n*The server might be having issues. Please try again in a moment.*`;
    case 'marin':
      return `OMG, like, I can't find anything in my ${mediaType} collection right now! This is so weird! *panicked*\n\n*The connection might be down. Please try again in a moment!*`;
    case 'daru':
      return `What?! I can't access my ${mediaType} archives right now! The connection seems blocked! *frustrated typing*\n\n*The server might be down. Please try again later when the connection is restored.*`;
    case 'rikka':
      return `The... The Wicked Eye cannot find anything in my ${mediaType} realm right now! Something is blocking my access! *dramatic despair*\n\n*The connection seems to be sealed. Please try again later when the seal is lifted.*`;
    case 'shinpachi':
      return `Seriously?! I can't access my ${mediaType} library right now! This is ridiculous! *adjusts glasses in frustration*\n\n*The server seems to be unavailable. Please try again later.*`;
    case 'ainz':
      return `Hmm... It appears I cannot access my ${mediaType} archives at this time. This is most inconvenient.\n\n*The server seems to be down. Please try again later when the connection is restored.*`;
    case 'kakashi':
      return `Maa maa... I can't access my ${mediaType} collection right now. The connection seems down. *puts Icha Icha away*\n\n*The server seems to be unavailable. Please try again later.*`;
    case 'ichikawa':
      return `Um... I can't access my ${mediaType} database right now. This is... frustrating. The connection is down.\n\n*The server seems to be unavailable. Please try again later.*`;
    default:
      return `I'm having trouble accessing my ${mediaType} collection right now. The server seems to be down, so I can't help you at the moment.\n\n*Please try again later when the connection is restored.*`;
  }
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [malUsername, setMalUsername] = useState<string>('');
  const [isClientIdConfigured, setIsClientIdConfigured] = useState(false);
  
  // Developer visualization screen routing
  const [currentView, setCurrentView] = useState<'main' | 'developer'>('main');
  
  // System 3.0: Discovery State Management
  const [discoveryStates, setDiscoveryStates] = useState<CharacterDiscoveryState[]>(() => {
    return initializeDiscoveryStates();
  });
  
  // Save discovery states whenever they change
  useEffect(() => {
    saveDiscoveryStates(discoveryStates);
  }, [discoveryStates]);
  
  // Derive unlocked characters from discovery states (discoveryCount === 2)
  const unlockedCharacterIds = discoveryStates
    .filter(s => s.discoveryCount === 2)
    .map(s => s.characterId);
  
  // OLD System 2.0 state (kept for backward compatibility during migration)
  const [unlockedCharacters, setUnlockedCharacters] = useState<string[]>(() => initializeUnlockedCharacters());
  
  // Debug: Log unlocked characters whenever they change
  useEffect(() => {
    console.log('🔓 Unlocked Character IDs:', unlockedCharacterIds);
    console.log('🔍 Old Unlocked Characters:', unlockedCharacters);
    console.log('📊 Discovery States:', discoveryStates);
    console.log('✅ Filtered unlocked (count === 2):', discoveryStates.filter(s => s.discoveryCount === 2).map(s => s.characterId));
  }, [unlockedCharacterIds, unlockedCharacters, discoveryStates]);
  
  // Two-stage unlock: discovered characters (visible but not unlocked)
  const [discoveredCharacters, setDiscoveredCharacters] = useState<Array<{characterId: string; discoveredGenre: string}>>(() => {
    const stored = localStorage.getItem('discovered_characters');
    return stored ? JSON.parse(stored) : [];
  });
  
  const addDiscoveredCharacter = useCallback((characterId: string, genre: string) => {
    setDiscoveredCharacters(prev => {
      if (prev.some(entry => entry.characterId === characterId)) {
        return prev;
      }
      const updated = [...prev, { characterId, discoveredGenre: genre }];
      localStorage.setItem('discovered_characters', JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  const removeDiscoveredCharacter = useCallback((characterId: string) => {
    setDiscoveredCharacters(prev => {
      if (!prev.some(entry => entry.characterId === characterId)) {
        return prev;
      }
      const updated = prev.filter(entry => entry.characterId !== characterId);
      localStorage.setItem('discovered_characters', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleForceUnlockAllCharacters = useCallback(() => {
    const allCharacterIds = ASSISTANT_CHARACTERS.map(char => char.id);
    const timestamp = Date.now();
    setDiscoveryStates(prev =>
      prev.map(state => ({
        ...state,
        discoveryCount: 2,
        discoveredVia: state.discoveredVia || 'dev-override',
        discoveredAt: state.discoveredAt || timestamp,
      }))
    );
    setUnlockedCharacters(allCharacterIds);
    saveUnlockedCharacters(allCharacterIds);
  }, [setDiscoveryStates, setUnlockedCharacters]);

  const handleCharacterUnlockStateChange = useCallback((characterId: string, shouldUnlock: boolean) => {
    setDiscoveryStates(prev =>
      prev.map(state => {
        if (state.characterId !== characterId) {
          return state;
        }
        if (shouldUnlock) {
          return {
            ...state,
            discoveryCount: 2,
            discoveredVia: state.discoveredVia || 'dev-override',
            discoveredAt: state.discoveredAt || Date.now(),
          };
        }
        return {
          ...state,
          discoveryCount: 0,
          discoveredVia: undefined,
          discoveredAt: undefined,
        };
      })
    );
    setUnlockedCharacters(prev => {
      const updated = shouldUnlock
        ? Array.from(new Set([...prev, characterId]))
        : prev.filter(id => id !== characterId);
      saveUnlockedCharacters(updated);
      return updated;
    });
  }, [setDiscoveryStates, setUnlockedCharacters]);
  
  // Genre request counter for two-stage unlock (use ref to avoid re-render issues)
  const genreRequestCountsRef = useRef<{[key: string]: number}>({});
  const skipProcessSystemMessageRef = useRef(false);

  // Initialize error logging and session tracking
  useEffect(() => {
    initializeErrorHandler();
    startSessionTracking();
  }, []);
  
  // Helper to get current counts
  const getGenreRequestCounts = () => {
    const stored = localStorage.getItem('genre_request_counts');
    return stored ? JSON.parse(stored) : {};
  };
  
  // Get a random unlocked character for initial selection
  const getRandomUnlockedCharacter = (): AssistantCharacter => {
    const startingCharacterIds = getStartingCharacters();
    const startingChar = ASSISTANT_CHARACTERS.find(char => startingCharacterIds.includes(char.id));
    return startingChar || ASSISTANT_CHARACTERS[0]; // Fallback to first character
  };
  
  // Map MAL API genres to our internal genre system
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
      'Isekai': 'isekai',
      'Gourmet': 'sliceOfLife',
      'Boys Love': 'bl',
      'Girls Love': 'romance'
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

  // Detect genres from user request
  const detectGenresFromRequest = (request: string): string[] => {
    const lowerRequest = request.toLowerCase();
    const matches: { genre: string; index: number }[] = [];
 
    const genreKeywords: {[key: string]: string[]} = {
      'magicalGirl': ['magical girl', 'magic girl', 'mahou shoujo', 'magical'],
      'battleShonen': ['battle shonen', 'battle shounen', 'dark shonen', 'modern shonen', 'new gen shonen'],
      'romance': ['romance', 'romantic', 'love'],
      'ecchi': ['ecchi', 'fanservice'],
      'mecha': ['mecha', 'robot', 'gundam'],
      'horror': ['horror', 'scary'],
      'sliceOfLife': ['slice of life', 'sol'],
      'shojo': ['shojo', 'shoujo'],
      'shonen': ['shonen', 'shounen'],
      'isekai': ['isekai'],
      'idol': ['idol'],
      'sports': ['sports'],
      'bl': ['bl', 'yaoi', 'boys love']
    };
    
    Object.entries(genreKeywords).forEach(([genre, keywords]) => {
      let bestIndex = Infinity;
      keywords.forEach(keyword => {
        const idx = lowerRequest.indexOf(keyword);
        if (idx >= 0 && idx < bestIndex) {
          bestIndex = idx;
        }
      });
      if (bestIndex !== Infinity) {
        matches.push({ genre, index: bestIndex });
      }
    });
    
    matches.sort((a, b) => a.index - b.index);
    return matches.map(match => match.genre);
  };
  
  // Detect anime titles in user request and fetch their genres from MAL
  const detectAnimeTitlesAndGenres = async (request: string, clientId: string): Promise<string[]> => {
    // Look for patterns like "like X" or "similar to X" or "more like X"
    const patterns = [
      /(?:like|similar to|more like|same as|such as)\s+([^,.\n]+?)(?:\s+and|\s+or|,|\.|\n|$)/gi,
      /(?:anime|show|series)\s+(?:called|named)\s+([^,.\n]+?)(?:\s+and|\s+or|,|\.|\n|$)/gi
    ];
    
    const detectedTitles: string[] = [];
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(request)) !== null) {
        if (match[1]) {
          detectedTitles.push(match[1].trim());
        }
      }
    });
    
    if (detectedTitles.length === 0) {
      return [];
    }
    
    console.log(`🎬 Detected anime titles in request:`, detectedTitles);
    
    // Fetch genres for each detected title
    const allGenres: string[] = [];
    for (const title of detectedTitles) {
      const result = await searchAnimeOnPlatform(title, clientId, false);
      if (result.genres && result.genres.length > 0) {
        console.log(`📊 Genres for "${title}":`, result.genres);
        const mappedGenres = mapMalGenresToInternal(result.genres);
        allGenres.push(...mappedGenres);
      }
    }
    
    // Return unique genres
    return [...new Set(allGenres)];
  };
  
  const [currentCharacter, setCurrentCharacter] = useState<AssistantCharacter>(getRandomUnlockedCharacter());
  const [characterImage, setCharacterImage] = useState<string>('');
  
  const [settings, setSettings] = useState<Settings>(() => {
    return {
      minScore: 5.0,
      recommendFromPTW: true,
      assistantCharacter: undefined,
    };
  });
  
  const excludedTitlesRef = useRef<string[]>([]);
  const planToWatchTitlesRef = useRef<string[]>([]);
  const allUserAnimeRef = useRef<AnimeEntry[]>([]);
  const isReferralSwitchRef = useRef<boolean>(false);
  const sessionRecommendedTitles = useRef<string[]>([]); // Track recommendations in current session
  const unlockProgressRef = useRef<UnlockProgressState | null>(null);

  // Helper function to check if a recommendation title matches any excluded title
  const isTitleExcluded = (recommendationTitle: string, excludedTitles: string[]): boolean => {
    const recLower = recommendationTitle.toLowerCase().trim();
    
    // Check for exact or partial matches
    for (const excludedTitle of excludedTitles) {
      const excludedLower = excludedTitle.toLowerCase().trim();
      
      // Exact match
      if (recLower === excludedLower) {
        return true;
      }
      
      // Partial match (one contains the other)
      if (recLower.includes(excludedLower) || excludedLower.includes(recLower)) {
        // Additional check: ensure it's not just a common word match
        // Only consider it a match if the shorter string is at least 5 characters
        const shorter = recLower.length < excludedLower.length ? recLower : excludedLower;
        if (shorter.length >= 5) {
          return true;
        }
      }
    }
    
    // Check for franchise matches (same base title)
    const getBaseTitle = (title: string): string => {
      let base = title.toLowerCase().trim();
      // Remove common suffixes
      base = base
        .replace(/\s*(?:season|s\d+|part\s+\d+|episode|ep\.|movie|film|ova|ona|special|special episode|final season|the final season|part \d+).*$/i, '')
        .replace(/\s*\(.*?\)\s*$/, '') // Remove parentheses content
        .replace(/\s*:\s*.*$/, '') // Remove everything after colon
        .trim();
      return base;
    };
    
    const recBase = getBaseTitle(recommendationTitle);
    if (recBase.length >= 3) { // Only check if base title is meaningful
      for (const excludedTitle of excludedTitles) {
        const excludedBase = getBaseTitle(excludedTitle);
        if (excludedBase.length >= 3 && recBase === excludedBase) {
          return true;
        }
      }
    }
    
    return false;
  };

  const getUnlockProgressState = () => {
    if (!unlockProgressRef.current) {
      unlockProgressRef.current = loadUnlockProgress();
    }
    return unlockProgressRef.current;
  };

  const [isTransparencyPanelOpen, setIsTransparencyPanelOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [bugReportLogs, setBugReportLogs] = useState<ConsoleLogEntry[]>([]);
  const [isBugReportSubmitting, setIsBugReportSubmitting] = useState(false);
  const [bugReportStatus, setBugReportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [bugReportError, setBugReportError] = useState<string | undefined>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState<string[]>(defaultPrompts);

  const generateQuickPrompts = useCallback((userAnime: AnimeEntry[]) => {
    const randomGenre = popularGenres[Math.floor(Math.random() * popularGenres.length)];
    const highRatedCompleted = userAnime.filter(
        anime => anime.status === 'Completed' && (anime.score ?? 0) >= 8
    );
    
    let randomAnimeTitle = "Steins;Gate"; // Fallback
    if (highRatedCompleted.length > 0) {
        const randomAnime = highRatedCompleted[Math.floor(Math.random() * highRatedCompleted.length)];
        randomAnimeTitle = randomAnime.title;
    }

    const newPrompts = [
        `Recommend a ${randomGenre.toLowerCase()} anime.`,
        "Anything good from my plan to watch?",
        "Find me a hidden gem.",
        `I want something similar to ${randomAnimeTitle}.`
    ];
    setQuickPrompts(newPrompts);
  }, []);

  const loadData = useCallback(async (username: string, clientId: string) => {
    setIsDataLoading(true);
    setMessages([]);

    if (!username || !clientId) {
        setShowUsernamePrompt(true);
        setIsDataLoading(false);
        return;
    }
    
    setShowSetup(false);
    setShowUsernamePrompt(false);
    setMalUsername(username);
    setIsClientIdConfigured(!!clientId);

    try {
      const allEntries = await fetchUserAnimeList(username, clientId);
      if (allEntries.length === 0) {
          throw new Error("No anime entries loaded. Your list might be empty, private, or credentials invalid.");
      }
      excludedTitlesRef.current = getExcludedAnimeTitles(allEntries);
      planToWatchTitlesRef.current = getPlanToWatchTitles(allEntries);
      allUserAnimeRef.current = getAllUserAnimeEntries(allEntries);
      generateQuickPrompts(allUserAnimeRef.current);

      // System notification for connection
      const systemNotification: ChatMessage = {
        role: MessageRole.SYSTEM,
        content: `Successfully connected to MAL: ${username}\nData synced\nPowered by Gemini AI`
      };

      // Use static character image
      const currentCharacterImage = currentCharacter.imagePath;
      setCharacterImage(currentCharacterImage);

      // Character greeting with static image
      const randomGreeting = currentCharacter.greetings[Math.floor(Math.random() * currentCharacter.greetings.length)];
      const characterGreeting: ChatMessage = {
        role: MessageRole.ASSISTANT,
        content: randomGreeting,
        characterImage: currentCharacterImage,
        characterName: currentCharacter.name
      };

      setMessages([systemNotification, characterGreeting]);
    } catch (error) {
      console.error("Failed to load anime data from MAL API:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setShowUsernamePrompt(true); // Show username prompt again on error
      setMessages([{
        role: MessageRole.ASSISTANT,
        content: `I'm sorry, but I failed to connect to the MyAnimeList API. Please check your username and try again.\n\n*Error details: ${errorMessage}*`
      }]);
    } finally {
      setIsDataLoading(false);
    }
  }, [generateQuickPrompts]);

  const loadAniListData = useCallback(async (username: string) => {
    setIsDataLoading(true);
    setMessages([]);

    if (!username) {
        setShowUsernamePrompt(true);
        setIsDataLoading(false);
        return;
    }
    
    setShowSetup(false);
    setShowUsernamePrompt(false);
    setMalUsername(username);

    try {
      const allEntries = await fetchAniListAnimeList(username);
      if (allEntries.length === 0) {
          throw new Error("No anime entries loaded. Your list might be empty, private, or username invalid.");
      }
      excludedTitlesRef.current = getExcludedAnimeTitles(allEntries);
      planToWatchTitlesRef.current = getPlanToWatchTitles(allEntries);
      allUserAnimeRef.current = getAllUserAnimeEntries(allEntries);
      generateQuickPrompts(allUserAnimeRef.current);

      // System notification for connection
      const systemNotification: ChatMessage = {
        role: MessageRole.SYSTEM,
        content: `Successfully connected to AniList: ${username}\nData synced\nPowered by Gemini AI`
      };

      // Use static character image
      const currentCharacterImage = currentCharacter.imagePath;
      setCharacterImage(currentCharacterImage);

      // Character greeting with static image
      const randomGreeting = currentCharacter.greetings[Math.floor(Math.random() * currentCharacter.greetings.length)];
      const characterGreeting: ChatMessage = {
        role: MessageRole.ASSISTANT,
        content: randomGreeting,
        characterImage: currentCharacterImage,
        characterName: currentCharacter.name
      };

      setMessages([systemNotification, characterGreeting]);
    } catch (error) {
      console.error("Failed to load anime data from AniList API:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setShowUsernamePrompt(true); // Show username prompt again on error
      setMessages([{
        role: MessageRole.ASSISTANT,
        content: `I'm sorry, but I failed to connect to the AniList API. Please check your username and try again.\n\n*Error details: ${errorMessage}*`
      }]);
    } finally {
      setIsDataLoading(false);
    }
  }, [generateQuickPrompts]);
  
  // Check for credentials on initial load
  useEffect(() => {
    const chatApiKey = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_GEMINI_CHAT_API_KEY ?? process.env.VITE_GEMINI_CHAT_API_KEY ?? "UNDEFINED";
    const malClientIdEnv = process.env.MAL_CLIENT_ID ?? "UNDEFINED";

    console.log("=== ENVIRONMENT VARIABLE CHECK ===");
    console.log("VITE_GEMINI_CHAT_API_KEY:", chatApiKey ? `${chatApiKey.substring(0, 8)}...` : "UNDEFINED");
    console.log("MAL_CLIENT_ID from process.env:", malClientIdEnv);

    if (chatApiKey === "UNDEFINED" || malClientIdEnv === "UNDEFINED") {
      console.error("Missing environment variables. Please configure .env file with VITE_GEMINI_CHAT_API_KEY and MAL_CLIENT_ID");
      // Don't return early - show setup screen instead
      setShowSetup(true);
      setIsDataLoading(false);
      return;
    }

    initializeAi(chatApiKey);
    
    // Check for username in localStorage
    const savedUsername = localStorage.getItem('MAL_USERNAME');
    const savedPlatform = localStorage.getItem('ANIME_PLATFORM');
    const isManualMode = localStorage.getItem('MANUAL_MODE') === 'true';
    
    if (!savedUsername) {
      setShowUsernamePrompt(true);
      setIsDataLoading(false);
      return;
    }
    
    // Load data based on saved platform
    if (isManualMode) {
      // Manual mode - data already loaded from local storage, just show prompt to re-enter
      setShowUsernamePrompt(true);
      setIsDataLoading(false);
    } else if (savedPlatform === 'anilist') {
      loadAniListData(savedUsername);
    } else {
      // Default to MAL
      loadData(savedUsername, malClientIdEnv);
    }
  }, [loadData, loadAniListData]);

  // Set character image when character changes (using static local path)
  useEffect(() => {
    setCharacterImage(currentCharacter.imagePath);
  }, [currentCharacter]);

  // Update character when settings change
  useEffect(() => {
    if (settings.assistantCharacter) {
      const character = getCharacterById(settings.assistantCharacter);
      if (character && character.id !== currentCharacter.id) {
        const oldCharacterName = currentCharacter.name.split(' (')[0]; // Remove anime title
        const newCharacterName = character.name.split(' (')[0];
        
        // Skip default messages if this is a referral switch
        if (isReferralSwitchRef.current) {
          console.log("🔄 Referral switch detected, switching to:", character.id);
          
          // Just update the character and image silently
          setCurrentCharacter(character);
          setCharacterImage(character.imagePath);
          isReferralSwitchRef.current = false; // Reset the flag
          
          // Check if there's a pending referral request to process
          setTimeout(() => {
            const pendingRequest = (window as any).pendingReferralRequest;
            console.log("🔄 Checking for pending request:", pendingRequest);
            if (pendingRequest && pendingRequest.trim() && pendingRequest !== 'placeholder') {
              (window as any).pendingReferralRequest = null; // Clear it
              // Force a fresh character lookup and send the request
              const freshCharacter = getCharacterById(settings.assistantCharacter);
              console.log("🔄 Processing pending request with fresh character:", freshCharacter?.id, "request:", pendingRequest);
              if (freshCharacter) {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                handleSendWithCharacter(pendingRequest, freshCharacter, true); // Skip user message for referral
              }
            } else {
              console.warn("⚠️ Invalid pending request, skipping:", pendingRequest);
            }
          }, 1000); // Increased delay to ensure character switch completes
          
          return;
        }
        
        // Normal character switch (not referral)
        // Add leave message for old character
        setMessages(prev => [...prev, {
          role: MessageRole.SYSTEM,
          content: `${oldCharacterName} has left the chat`
        }]);
        
        // Update character
        setCurrentCharacter(character);
        
        // Use static image path
        const newImageUrl = character.imagePath;
        setCharacterImage(newImageUrl);
        
        // Add join message and greeting with the correct image
        const randomGreeting = character.greetings[Math.floor(Math.random() * character.greetings.length)];
        setMessages(prev => [...prev, 
          {
            role: MessageRole.SYSTEM,
            content: `${newCharacterName} has entered the chat`
          },
          {
            role: MessageRole.ASSISTANT,
            content: randomGreeting,
            characterImage: newImageUrl,
            characterName: character.name
          }
        ]);
      }
    }
  }, [settings.assistantCharacter, currentCharacter.id, currentCharacter.name]); // handleSend added via setTimeout

  // Developer mode keyboard shortcut (Ctrl/Cmd + Shift + V for Visualization)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        setCurrentView(prev => prev === 'main' ? 'developer' : 'main');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle iOS Safari keyboard viewport issues (iOS 17+ specific fixes)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 640) {
      // Detect iOS 17+ (which has specific keyboard issues)
      const isIOS17Plus = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
        (navigator.userAgent.includes('Version/17') || 
         navigator.userAgent.includes('Version/18') || 
         navigator.userAgent.includes('Version/19') ||
         navigator.userAgent.includes('OS 17') ||
         navigator.userAgent.includes('OS 18') ||
         navigator.userAgent.includes('OS 19'));

      const header = document.querySelector('.mobile-fixed-header') as HTMLElement;
      const inputs = document.querySelectorAll('input, textarea');

      if (isIOS17Plus) {
        // iOS 17+ specific solution: Less aggressive approach
        const handleInputFocus = () => {
          // Add keyboard-open class for CSS targeting
          document.body.classList.add('keyboard-open');
          
          if (header) {
            header.style.position = 'absolute';
            header.style.top = '0px';
            header.style.left = '0px';
            header.style.right = '0px';
            header.style.zIndex = '99999';
          }
          
          // Only prevent overflow, don't lock body position
          document.body.style.overflow = 'hidden';
        };

        const handleInputBlur = () => {
          // Remove keyboard-open class
          document.body.classList.remove('keyboard-open');
          
          if (header) {
            header.style.position = 'fixed';
            header.style.top = '0px';
            header.style.left = '0px';
            header.style.right = '0px';
            header.style.zIndex = '99999';
          }
          
          // Restore overflow
          document.body.style.overflow = '';
        };

        inputs.forEach(input => {
          input.addEventListener('focus', handleInputFocus);
          input.addEventListener('blur', handleInputBlur);
        });

        return () => {
          inputs.forEach(input => {
            input.removeEventListener('focus', handleInputFocus);
            input.removeEventListener('blur', handleInputBlur);
          });
        };
      } else {
        // Standard solution for other devices
        const preventBodyScroll = () => {
          document.body.style.overflow = 'hidden';
          document.body.style.position = 'fixed';
          document.body.style.width = '100%';
          document.body.style.height = '100%';
        };

        const enableBodyScroll = () => {
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.width = '';
          document.body.style.height = '';
        };

        // Modern approach using visualViewport API
        if (window.visualViewport) {
          const adjustHeaderPosition = () => {
            if (header) {
              const viewportOffsetTop = window.visualViewport?.offsetTop || 0;
              header.style.top = `${viewportOffsetTop}px`;
              header.style.transform = `translateZ(0) translateY(${viewportOffsetTop}px)`;
            }
          };

          const handleInputFocus = () => {
            preventBodyScroll();
            adjustHeaderPosition();
          };

          const handleInputBlur = () => {
            enableBodyScroll();
            if (header) {
              header.style.top = '0px';
              header.style.transform = 'translateZ(0) translateY(0px)';
            }
          };

          window.visualViewport.addEventListener('resize', adjustHeaderPosition);
          window.visualViewport.addEventListener('scroll', adjustHeaderPosition);

          inputs.forEach(input => {
            input.addEventListener('focus', handleInputFocus);
            input.addEventListener('blur', handleInputBlur);
          });

          return () => {
            if (window.visualViewport) {
              window.visualViewport.removeEventListener('resize', adjustHeaderPosition);
              window.visualViewport.removeEventListener('scroll', adjustHeaderPosition);
            }
            inputs.forEach(input => {
              input.removeEventListener('focus', handleInputFocus);
              input.removeEventListener('blur', handleInputBlur);
            });
          };
        }
      }
    }
  }, []);

  const handleUsernameSubmit = (username: string) => {
      localStorage.setItem('MAL_USERNAME', username);
      localStorage.setItem('ANIME_PLATFORM', 'mal');
      
      // Get MAL_CLIENT_ID from the same source as initialization
      const malClientId = process.env.MAL_CLIENT_ID;
      console.log("handleUsernameSubmit - MAL_CLIENT_ID:", malClientId ? `${malClientId.substring(0, 8)}...` : "UNDEFINED");
      
      if (!malClientId || malClientId === 'UNDEFINED' || malClientId.trim() === '' || malClientId === 'null' || malClientId === 'undefined') {
        console.error("MAL_CLIENT_ID is missing or invalid:", malClientId);
        // Show setup screen if MAL_CLIENT_ID is missing
        setShowUsernamePrompt(false);
        setShowSetup(true);
        setMessages([{
          role: MessageRole.ASSISTANT,
          content: `MyAnimeList Client ID is not configured. Please enter your credentials in the setup screen below.\n\nIf you have already configured MAL_CLIENT_ID in your .env file, please restart the dev server (npm run dev) for the changes to take effect.`
        }]);
        return;
      }
      
      console.log("Calling loadData with username:", username, "and clientId:", malClientId.substring(0, 8) + "...");
      loadData(username, malClientId);
  };

  const handleAniListSubmit = (username: string) => {
      localStorage.setItem('MAL_USERNAME', username); // Reuse same storage key for simplicity
      localStorage.setItem('ANIME_PLATFORM', 'anilist');
      loadAniListData(username);
  };

  const handleManualListSubmit = async (username: string, rawAnimeList: string) => {
      setIsDataLoading(true);
      setMessages([]);
      setShowUsernamePrompt(false);
      setMalUsername(username);
      localStorage.setItem('MAL_USERNAME', username);
      localStorage.setItem('MANUAL_MODE', 'true'); // Flag to indicate manual mode

      try {
        const malClientId = process.env.MAL_CLIENT_ID;
        if (!malClientId) {
          throw new Error("MAL Client ID not configured");
        }

        // Parse the anime list
        console.log("📝 Parsing manual anime list...");
        const { excludedTitles, planToWatchTitles, totalMatches, unrecognized } = await parseAnimeList(rawAnimeList, malClientId);
        
        console.log(`✅ Parsed ${excludedTitles.length} watched titles`);
        console.log(`✅ Parsed ${planToWatchTitles.length} plan-to-watch titles`);
        if (unrecognized.length > 0) {
          console.log(`⚠️ Could not recognize: ${unrecognized.join(', ')}`);
        }

        // Store the parsed lists
        excludedTitlesRef.current = excludedTitles;
        planToWatchTitlesRef.current = planToWatchTitles;
        allUserAnimeRef.current = excludedTitles.map(title => ({ 
          title, 
          status: 'Completed' as const 
        })); // Treat all as completed for franchise checking

        generateQuickPrompts(allUserAnimeRef.current);

        // System notification for connection
        const ptwInfo = planToWatchTitles.length > 0 ? `\n${planToWatchTitles.length} plan-to-watch titles` : '';
        const systemNotification: ChatMessage = {
          role: MessageRole.SYSTEM,
          content: `Manual mode activated: ${username}\n${excludedTitles.length} watched titles loaded${ptwInfo}${unrecognized.length > 0 ? `\n⚠️ ${unrecognized.length} entries unrecognized` : ''}\nPowered by Gemini AI`
        };

        // Character greeting
        const currentCharacterImage = currentCharacter.imagePath;
        setCharacterImage(currentCharacterImage);

        const randomGreeting = currentCharacter.greetings[Math.floor(Math.random() * currentCharacter.greetings.length)];
        const characterGreeting: ChatMessage = {
          role: MessageRole.ASSISTANT,
          content: randomGreeting,
          characterImage: currentCharacterImage,
          characterName: currentCharacter.name
        };

        setMessages([systemNotification, characterGreeting]);
      } catch (error) {
        console.error("Failed to parse manual anime list:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        setShowUsernamePrompt(true);
        setMessages([{
          role: MessageRole.ASSISTANT,
          content: `I'm sorry, but I failed to process your anime list. Please check the format and try again.\n\n*Error details: ${errorMessage}*`
        }]);
      } finally {
        setIsDataLoading(false);
      }
  };

  const handleSetupComplete = (username: string, clientId: string, apiKey: string) => {
      // This function is now only for fallback when .env is not configured
      console.log("Setup complete - but you should use .env file for production");
      localStorage.setItem('MAL_USERNAME', username);
      initializeAi(apiKey);
      loadData(username, clientId);
  };

  const handleReset = () => {
    // Clear username and reload
    localStorage.removeItem('MAL_USERNAME');
    window.location.reload();
  };

  const handleAcceptReferral = useCallback(async (
    characterId: string, 
    originalUserMessage: string, 
    aiHandoffMessage?: string, 
    aiAcknowledgmentMessage?: string,
    aiPitchMessage?: string,
    handoffCharacterImage?: string,
    fallbackTopic?: string,
    helperUserReference?: UserReferenceStyle,
    targetUserReference?: UserReferenceStyle,
    forceUnlocked: boolean = false
  ) => {
    console.log("🔄 Accepting referral to character:", characterId);
    
    // Get the last user message from the messages array
    const normalizedOriginal = (originalUserMessage || '').trim();
    const lastUserMessage = messages.filter(m => m.role === MessageRole.USER).pop();
    const fallbackRequest = lastUserMessage?.content?.trim() || '';
    let userRequest = normalizedOriginal.length > 0 ? normalizedOriginal : fallbackRequest;
    
    // Final fallback: if still empty, try to get from the most recent message that might contain the request
    if (!userRequest || userRequest.length === 0) {
      const allMessages = messages.filter(m => m.role === MessageRole.USER || m.role === MessageRole.ASSISTANT);
      const recentMessage = allMessages[allMessages.length - 1];
      if (recentMessage && recentMessage.content) {
        // Try to extract the original request from assistant's response (if it mentions it)
        const content = recentMessage.content;
        const requestMatch = content.match(/["']([^"']+)["']/);
        if (requestMatch && requestMatch[1]) {
          userRequest = requestMatch[1];
        }
      }
    }
    
    console.log("🔄 handleAcceptReferral - originalUserMessage:", originalUserMessage, "fallbackRequest:", fallbackRequest, "final userRequest:", userRequest);
    
    // System 3.0: Check discovery state and unlock if needed
    let isStillLocked = false;
    if (!forceUnlocked) {
      // Check if character is already unlocked BEFORE processing referral
      const currentState = getDiscoveryState(characterId, discoveryStates);
      const isAlreadyUnlocked = currentState ? currentState.discoveryCount === 2 : false;
      
      const userTitles = allUserAnimeRef.current.map(a => a.title);
      const discoveryResult = processBuddyReferral(characterId, currentCharacter.id, userTitles);

      // Only show discovery/unlock message if character is NOT already unlocked
      if (discoveryResult.systemMessage && !skipProcessSystemMessageRef.current && !isAlreadyUnlocked) {
        const systemMessage: ChatMessage = {
          role: MessageRole.SYSTEM,
          content: discoveryResult.systemMessage
        };
        setMessages(prev => [...prev, systemMessage]);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const updatedState = getDiscoveryState(characterId, discoveryStates);
      isStillLocked = updatedState ? updatedState.discoveryCount < 2 : true;

      if (!isStillLocked) {
        const existingProgress = unlockProgressRef.current ?? loadUnlockProgress();
        unlockProgressRef.current = clearUnlockProgressFor(existingProgress, characterId);
      }
    }
    
    // Get the current and new characters
    const oldCharacter = currentCharacter;
    const newCharacter = getCharacterById(characterId);
    
    console.log("🔄 Old character:", oldCharacter.id, "New character:", newCharacter?.id);
    
    if (!newCharacter) {
      console.error("❌ New character not found:", characterId);
      return;
    }
    
    const oldCharacterFirstName = oldCharacter.name.split(' ')[0];
    const newCharacterFirstName = newCharacter.name.split(' ')[0];
    
    // Step 1: Add system message with delay
    const addMessage: ChatMessage = {
      role: MessageRole.SYSTEM,
      content: `${oldCharacterFirstName} added ${newCharacterFirstName} to the chat`
    };
    setMessages(prev => [...prev, addMessage]);
    
    // Show loading spinner with helper's image before handoff message
    const handoffLoadingMessage: ChatMessage = {
      role: MessageRole.ASSISTANT,
      content: '',
      characterImage: handoffCharacterImage || characterImage,
      characterName: oldCharacter.name
    };
    setMessages(prev => [...prev, handoffLoadingMessage]);
    await new Promise(resolve => setTimeout(resolve, 4000));
    // Remove loading message and add actual handoff message
    setMessages(prev => {
      const withoutLoading = prev.slice(0, -1);
      return [...withoutLoading, {
        role: MessageRole.ASSISTANT,
        content: aiHandoffMessage || getFallbackHandoff(oldCharacter, newCharacter, userRequest, fallbackTopic, helperUserReference || getUserReference(oldCharacter.id)),
        characterImage: handoffCharacterImage || characterImage,
        characterName: oldCharacter.name
      }];
    });
    
    // Step 3: New character acknowledgment with loading
    const ackLoadingMessage: ChatMessage = {
      role: MessageRole.ASSISTANT,
      content: '',
      characterImage: newCharacter.imagePath,
      characterName: newCharacter.name
    };
    setMessages(prev => [...prev, ackLoadingMessage]);
    await new Promise(resolve => setTimeout(resolve, 4000));
    // Remove loading message and add actual acknowledgment
    setMessages(prev => {
      const withoutLoading = prev.slice(0, -1);
      return [...withoutLoading, {
        role: MessageRole.ASSISTANT,
        content: aiAcknowledgmentMessage || getFallbackAcknowledgment(newCharacter, oldCharacter, userRequest, fallbackTopic, targetUserReference || getUserReference(newCharacter.id)),
        characterImage: newCharacter.imagePath,
        characterName: newCharacter.name
      }];
    });
    
    // Step 3.5: Add specialist pitch as separate message if provided
    if (aiPitchMessage && aiPitchMessage.trim()) {
      await new Promise(resolve => setTimeout(resolve, 4000));
      const pitchMessage: ChatMessage = {
        role: MessageRole.ASSISTANT,
        content: aiPitchMessage.trim(),
        characterImage: newCharacter.imagePath,
        characterName: newCharacter.name
      };
      setMessages(prev => [...prev, pitchMessage]);
    }
    
    // Step 4: System message - current character left with delay
    const leaveMessage: ChatMessage = {
      role: MessageRole.SYSTEM,
      content: `${oldCharacterFirstName} has left the chat`
    };
    setMessages(prev => [...prev, leaveMessage]);
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Step 5: Mark this as a referral switch to skip default greeting
    isReferralSwitchRef.current = true;
    
    // Switch to new character
    setSettings(s => ({ ...s, assistantCharacter: characterId }));
    
    // Step 6: Store the request to be sent after character loads
    console.log("🔄 Storing pendingReferralRequest:", userRequest);
    (window as any).pendingReferralRequest = userRequest;
  }, [currentCharacter, characterImage, messages, setSettings, unlockedCharacters, setUnlockedCharacters]);

  const handleDeclineReferral = useCallback(() => {
    // Do nothing - user already has the recommendations from current character
  }, []);

  const triggerImmediateReferral = useCallback(async (
    targetCharacterId: string,
    userRequest: string,
    reason: 'specialty' | 'progress',
    helperCharacterId?: string,
    dialogue?: ReferralDialogueResult,
    topic?: string,
    helperUserReference?: UserReferenceStyle,
    targetUserReference?: UserReferenceStyle
  ) => {
    console.log("🔄 triggerImmediateReferral called with userRequest:", userRequest, "targetCharacterId:", targetCharacterId);
    // Turn off loading during handoff sequence - we only want loading for actual AI generation
    setIsLoading(false);
    const helperCharacter = getCharacterById(helperCharacterId || currentCharacter.id);
    const targetCharacter = getCharacterById(targetCharacterId);

    if (!targetCharacter) {
      console.error('❌ triggerImmediateReferral: target character not found', targetCharacterId);
      setIsLoading(false);
      return;
    }

    const helperName = helperCharacter ? helperCharacter.name.split(' ')[0] : currentCharacter.name.split(' ')[0];
    const targetName = targetCharacter.name.split(' ')[0];

    const handoffMessage =
      reason === 'specialty'
        ? `Hold on—${targetName} lives and breathes this topic. Let me patch them in immediately!`
        : `Alright, you've hit enough of my weak spots. ${targetName}, take it from here!`;

    const acknowledgmentMessage =
      reason === 'specialty'
        ? `${targetName} here! I've got the perfect picks ready.`
        : `Thanks, ${helperName}. I'll guide this from here.`;

    let unlockNotification: string | null = null;

    const userTitles = allUserAnimeRef.current.map(a => a.title);
    const forceUnlock = reason === 'specialty' || reason === 'progress';
    const unlockOutcome = forceUnlock
      ? { unlocked: true as const, message: undefined as string | undefined }
      : tryUnlockCharacter(
          targetCharacterId,
          userRequest,
          helperCharacterId || currentCharacter.id,
          unlockedCharacters,
          userTitles
        );

    const canUnlockNow = forceUnlock || unlockOutcome.unlocked;

    if (canUnlockNow && !unlockedCharacters.includes(targetCharacterId)) {
      const newUnlocked = [...unlockedCharacters, targetCharacterId];
      setUnlockedCharacters(newUnlocked);
      saveUnlockedCharacters(newUnlocked);

      setDiscoveryStates(prev => {
        const updated = updateDiscoveryState(targetCharacterId, prev, {
          discoveryCount: 2,
          discoveredVia: helperCharacterId || currentCharacter.id,
          discoveredAt: Date.now(),
        });
        saveDiscoveryStates(updated);
        return updated;
      });
      removeDiscoveredCharacter(targetCharacterId);

      const unlockEntry = CHARACTER_UNLOCKS.find(entry => entry.characterId === targetCharacterId);
      unlockNotification = (!forceUnlock && unlockOutcome.message) || unlockEntry?.unlockMessage || `✨ ${targetName} has been unlocked! You can now chat with them directly!`;
    }

    if (unlockNotification) {
      setMessages(prev => [
        ...prev,
        {
          role: MessageRole.SYSTEM,
          content: unlockNotification!,
        },
      ]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const existingProgress = unlockProgressRef.current ?? loadUnlockProgress();
    unlockProgressRef.current = clearUnlockProgressFor(existingProgress, targetCharacterId);

    skipProcessSystemMessageRef.current = true;
    try {
      await handleAcceptReferral(
        targetCharacterId,
        userRequest,
        dialogue?.handoffLine,
        dialogue?.acknowledgmentLine,
        dialogue?.specialistPitch,
        helperCharacter?.imagePath || characterImage,
        topic,
        helperUserReference || (helperCharacter ? getUserReference(helperCharacter.id) : getUserReference('default')),
        targetUserReference || getUserReference(targetCharacter.id),
        forceUnlock
      );
    } catch (error) {
      console.error('❌ Failed to process immediate referral:', error);
    } finally {
      skipProcessSystemMessageRef.current = false;
      setIsLoading(false);
    }
  }, [currentCharacter, discoveryStates, handleAcceptReferral, removeDiscoveredCharacter, setDiscoveryStates, setMessages, setUnlockedCharacters, unlockedCharacters]);

  const handleSendWithCharacter = useCallback(async (userMessage: string, character: any, skipUserMessage = false) => {
    if (!userMessage.trim()) return;

    // Veldora/Kakashi default to MANGA unless user explicitly says "anime"
    let processedMessage = userMessage;
    const lowerMessage = userMessage.toLowerCase();
    const isExplicitAnime = lowerMessage.includes('anime');
    const isExplicitManga = lowerMessage.includes('manga') || lowerMessage.includes('manhwa') || lowerMessage.includes('manhua');
    
    if ((character.id === 'veldora' || character.id === 'kakashi') && !isExplicitAnime && !isExplicitManga) {
      // Default to manga for Veldora/Kakashi if no media type specified
      processedMessage = `${userMessage} manga`;
      console.log(`📚 Veldora/Kakashi default: "${userMessage}" → "${processedMessage}"`);
    }

    // Skip adding user message if this is a referral (to avoid duplicate)
    if (!skipUserMessage) {
      const newUserMessage: ChatMessage = {
        role: MessageRole.USER,
        content: userMessage,
      };
      setMessages(prev => [...prev, newUserMessage]);
    }
    setIsLoading(true);

    try {
      // Build conversation history from recent messages (last 6 messages for context)
      // Include character name for assistant messages so AI knows who said what
      const conversationHistory = messages
        .filter(msg => msg.role !== MessageRole.SYSTEM)
        .slice(-6)
        .map(msg => ({
          role: msg.role === MessageRole.USER ? 'user' : 'assistant',
          content: msg.role === MessageRole.ASSISTANT && msg.characterName
            ? `[${msg.characterName}]: ${msg.content}`
            : msg.content
        }));

      const { responseText, recommendations = [], isRecommendation, isManga } = await getAnimeRecommendation(
        processedMessage, 
        settings, 
        excludedTitlesRef.current, 
        planToWatchTitlesRef.current, 
        allUserAnimeRef.current,
        {
          personality: character.personality,
          likes: character.likes,
          dislikes: character.dislikes,
          name: character.name
        },
        character.id,
        conversationHistory,
        ASSISTANT_CHARACTERS.filter(char => isCharacterUnlocked(char.id, unlockedCharacters)).map(char => char.name),
        sessionRecommendedTitles.current,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        skipUserMessage, // Pass skipUserMessage as isAfterHandoff flag (true when after referral)
        (attempt, isOverload) => {
          if (isOverload && attempt === 1) {
            setToastMessage('Gemini Services are busy or overloaded right now, retrying request.');
          }
        }
      );
      
      // Store new recommendations in session history
      if (isRecommendation && recommendations.length > 0) {
        const newTitles = recommendations.map(rec => rec.title);
        sessionRecommendedTitles.current = [...sessionRecommendedTitles.current, ...newTitles];
        console.log("📝 Session recommendations updated (handleSendWithCharacter):", sessionRecommendedTitles.current.length, "total");
      }

      const referralMetadata = extractReferralMetadata(responseText);
      const forceManga = (character.id === 'veldora' || character.id === 'kakashi') && processedMessage !== userMessage;
      const finalIsManga = forceManga ? true : isManga;
      let finalRecommendations: AnimeRecommendation[] = [];

      if (recommendations && recommendations.length > 0) {
        const malClientId = process.env.MAL_CLIENT_ID;
        finalRecommendations = await Promise.all(
          recommendations.map(async (rec) => {
            const details = await searchAnimeOnPlatform(rec.title, malClientId, finalIsManga);
            const potentialUnlock = checkPotentialUnlock(rec.title, unlockedCharacters);
            return {
              ...rec,
              coverImage: details.coverImage,
              trailerUrl: details.trailerUrl,
              releaseYear: details.releaseYear,
              malUrl: details.malUrl,
              originalTitle: (details as any).originalTitle,
              episodeCount: (details as any).episodeCount,
              community_opinion: rec.community_opinion,
              potentialUnlock: potentialUnlock
            };
          })
        );

        console.log("Final recommendations with covers:", finalRecommendations.map(r => ({ title: r.title, hasCover: !!r.coverImage })));
      }

      // Filter out any recommendations that match excluded titles (safety net)
      const filteredRecommendations = finalRecommendations.filter(rec => {
        const isExcluded = isTitleExcluded(rec.title, excludedTitlesRef.current);
        if (isExcluded) {
          console.warn(`⚠️ Filtered out excluded recommendation: "${rec.title}"`);
        }
        return !isExcluded;
      });

      if (filteredRecommendations.length < finalRecommendations.length) {
        console.log(`🛡️ Exclusion filter: Removed ${finalRecommendations.length - filteredRecommendations.length} recommendation(s) that matched excluded titles`);
      }

      const assistantMessage: ChatMessage = {
        role: MessageRole.ASSISTANT,
        content: referralMetadata.cleanedResponseText,
        recommendations: filteredRecommendations.length > 0 ? filteredRecommendations : undefined,
        isManga: finalIsManga,
        characterImage: character.imagePath,
        characterName: character.name,
        referredCharacterId: referralMetadata.referredCharacterId,
        referredCharacterName: referralMetadata.referredCharacterName,
        referralHandoff: referralMetadata.referralHandoff,
        referralAcknowledgment: referralMetadata.referralAcknowledgment,
        referralPitch: referralMetadata.referralPitch
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        role: MessageRole.ASSISTANT,
        content: `I'm sorry, I ran into an issue while generating recommendations. It could be a temporary problem with the AI model or the data connection. Please try again in a moment. *Error details: ${error}*`,
        characterImage: character.imagePath,
        characterName: character.name
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, settings, setMessages, setIsLoading]);

  // System 3.0: Process buddy referral and update discovery state
  const processBuddyReferral = useCallback((
    referredCharacterId: string,
    currentCharacterId: string,
    userWatchList: string[]
  ): { systemMessage: string | null; shouldShowHint: boolean } => {
    const state = getDiscoveryState(referredCharacterId, discoveryStates);
    
    if (!state) {
      return { systemMessage: null, shouldShowHint: false };
    }
    
    // Check if user has watched the franchise
    const hasWatchedFranchise = canUnlockCharacter(referredCharacterId, userWatchList);
    
    if (!hasWatchedFranchise) {
      return { 
        systemMessage: `📺 This character is from an anime you haven't watched yet. Add it to your list to discover more!`,
        shouldShowHint: false
      };
    }
    
    // Discovery flow: 0 → 1 → 2
    // NOTE: On 2nd request, discovery happens in the FIRST request handler (internal discovery)
    // This function is only called when REFERRAL button is clicked
    
    if (state.discoveryCount === 1) {
      // User clicked referral button for discovered character: Unlock them
      setDiscoveryStates(prev => updateDiscoveryState(
        referredCharacterId,
        prev,
        { discoveryCount: 2 }
      ));
      
      // Get character name from ASSISTANT_CHARACTERS
      const character = ASSISTANT_CHARACTERS.find(c => c.id === referredCharacterId);
      const characterName = character ? character.name.split(' ')[0] : referredCharacterId;
      
      return {
        systemMessage: `✨ ${characterName} has been unlocked! You can now chat with them directly!`,
        shouldShowHint: false
      };
    }
    
    // Already unlocked or not discovered yet
    return { systemMessage: null, shouldShowHint: false };
  }, [discoveryStates, setDiscoveryStates]);

  const handleSend = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const newUserMessage: ChatMessage = {
      role: MessageRole.USER,
      content: userMessage,
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    const currentExpertise = getCharacterExpertise(currentCharacter.id);
    const weaknessKeys = currentExpertise
      ? Object.entries(currentExpertise.genres)
          .filter(([, rating]) => rating === '-')
          .map(([key]) => key)
      : [];

    const specialty = detectSpecialty(userMessage);
    if (specialty) {
      const shouldTrigger =
        specialty.triggerCondition === 'always' || shouldTriggerSpecialty(specialty, weaknessKeys);

      if (shouldTrigger) {
        const specialtyCharacter = getCharacterById(specialty.characterId);
        if (specialtyCharacter && specialtyCharacter.id !== currentCharacter.id) {
          const matchedKeyword = specialty.keywords.find(keyword => userMessage.toLowerCase().includes(keyword.toLowerCase()));
          const topic = matchedKeyword || specialty.keywords[0];
          const helperNicknameForTarget = getCharacterNickname(currentCharacter.id, specialtyCharacter);
          const targetNicknameForHelper = getCharacterNickname(specialtyCharacter.id, currentCharacter);
          const helperUserReference = getUserReference(currentCharacter.id);
          const targetUserReference = getUserReference(specialtyCharacter.id);

          let referralDialogue: ReferralDialogueResult | undefined;
          try {
            referralDialogue = await generateReferralDialogue({
              helper: {
                id: currentCharacter.id,
                name: currentCharacter.name,
                personality: currentCharacter.personality,
                likes: currentCharacter.likes,
                dislikes: currentCharacter.dislikes,
              },
              target: {
                id: specialtyCharacter.id,
                name: specialtyCharacter.name,
                personality: specialtyCharacter.personality,
                likes: specialtyCharacter.likes,
                dislikes: specialtyCharacter.dislikes,
              },
              userRequest: userMessage,
              topic,
              reason: 'specialty',
              helperNicknameForTarget,
              targetNicknameForHelper,
              helperUserLabel: helperUserReference.label,
              helperUserPronoun: helperUserReference.pronoun,
              targetUserLabel: targetUserReference.label,
              targetUserPronoun: targetUserReference.pronoun,
            });
          } catch (error) {
            console.error('⚠️ generateReferralDialogue (specialty) failed:', error);
          }

          const introMessage = referralDialogue?.helperIntro || getFallbackReferralIntro(currentCharacter, specialtyCharacter, topic, userMessage);
          setMessages(prev => [
            ...prev,
            {
              role: MessageRole.ASSISTANT,
              content: introMessage,
              characterImage: currentCharacter.imagePath,
              characterName: currentCharacter.name,
            },
          ]);
          await new Promise(resolve => setTimeout(resolve, 600));

          await triggerImmediateReferral(
            specialty.characterId,
            userMessage,
            'specialty',
            currentCharacter.id,
            referralDialogue,
            topic,
            helperUserReference,
            targetUserReference
          );
          return;
        }
      }
    }

    // UNLOCK QUERY: Check if user is asking about unlocking characters
    if (isUnlockQuery(userMessage)) {
      console.log("🔓 Unlock query detected!");
      
      try {
        const malClientId = process.env.MAL_CLIENT_ID;
        if (!malClientId) {
          throw new Error("MAL Client ID not configured");
        }

        const userTitles = allUserAnimeRef.current.map(a => a.title);
        const { canRecommend, cannotRecommend } = await getUnlockableAnimeForCharacter(
          currentCharacter.id,
          unlockedCharacters,
          userTitles,
          malClientId
        );

        let responseContent = '';

        // Build response based on what character can recommend
        if (canRecommend.length > 0) {
          // Character-specific intro
          const intros: {[key: string]: string} = {
            'yuji': "Yo! So you wanna unlock more people? That's cool! Here are some shows I can recommend:",
            'marin': "OMG! You want to unlock more contacts? That's so exciting! Here are some shows I know about:",
            'ishigami': "...You want to unlock more characters? I guess I can tell you what to watch...",
            'kinta': "Yo! You want to expand your roster? I got you! Watch these:",
            'shinpachi': "Ah! You want to unlock more characters? I can help with these:",
            'veldora': "GWAHAHAHA! You seek to expand your circle of allies?! I shall guide you to the sacred texts!",
            'ainz': "You wish to unlock additional contacts? I shall provide the optimal recommendations:",
            'rikka': "The Wicked Eye reveals the path to new allies! Watch these mystical shows:",
            'daru': "Yo! Looking to unlock more contacts? Here's what I recommend:",
            'ichikawa': "Um... you want to unlock more characters? I guess I can suggest these...",
            'kakashi': "Maa maa, you want to unlock more people? Here are some I can recommend:",
            'bakugo': "Tch! You wanna unlock more characters?! Fine! Watch these:",
            'kanbaru': "You want to unlock more contacts, senpai? I can help with these:",
            'rudeus': "You want to unlock more characters? Based on my knowledge, watch these:"
          };

          responseContent = intros[currentCharacter.id] || "Here are some anime you should watch to unlock new characters:";
          
          // Add disclaimer about weak genres
          if (cannotRecommend.length > 0) {
            responseContent += "\n\nThere are some other shows that unlock characters, but they're not really my thing. Maybe try asking someone else about those?";
          }
          
          // Fetch full details for each franchise anime as recommendations
          const unlockRecommendations = await Promise.all(
            canRecommend.map(async (rec) => {
              const details = await searchAnimeOnPlatform(rec.animeTitle, malClientId, false);
              
              // Check if this anime can unlock a character (for the purple hint)
              const potentialUnlock = checkPotentialUnlock(rec.animeTitle, unlockedCharacters);
              
              return {
                title: rec.animeTitle,
                mal_score: details.score || 0,
                genres: rec.genres || [],
                synopsis: details.synopsis || 'Watch this anime to expand your contact roster!',
                reasoning: `${currentCharacter.name.split(' ')[0]} recommends this based on your unlock quest!`,
                coverImage: details.coverImage,
                trailerUrl: details.trailerUrl,
                releaseYear: details.releaseYear,
                malUrl: details.malUrl,
                originalTitle: (details as any).originalTitle,
                episodeCount: (details as any).episodeCount,
                potentialUnlock: potentialUnlock // Shows purple hint (no character name revealed)
              };
            })
          );

          const assistantMessage: ChatMessage = {
            role: MessageRole.ASSISTANT,
            content: responseContent,
            recommendations: unlockRecommendations,
            characterImage: currentCharacter.imagePath,
            characterName: currentCharacter.name
          };

          setMessages(prev => [...prev, assistantMessage]);
        } else {
          // Character can't recommend any unlock anime
          responseContent = "Hmm, I don't really know much about the anime you'd need to watch to unlock new characters... Maybe try asking someone else?";
          
          const assistantMessage: ChatMessage = {
            role: MessageRole.ASSISTANT,
            content: responseContent,
            characterImage: currentCharacter.imagePath,
            characterName: currentCharacter.name
          };

          setMessages(prev => [...prev, assistantMessage]);
        }
      } catch (error) {
        console.error("Error processing unlock query:", error);
        const errorMessage: ChatMessage = {
          role: MessageRole.ASSISTANT,
          content: "Sorry, I had trouble figuring out what you need to watch. Try asking me again!",
          characterImage: currentCharacter.imagePath,
          characterName: currentCharacter.name
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
      
      return; // Exit early - don't process as normal recommendation
    }

    // VELDORA SPECIAL INTERRUPT: Check for "battle shonen manga" mention
    const lowerMessage = userMessage.toLowerCase();
    const battleShonenTriggers = ['battle shonen manga', 'battle shounen manga', 'battle shōnen manga'];
    const isBattleShonenMention = battleShonenTriggers.some(trigger => lowerMessage.includes(trigger));
    
    if (isBattleShonenMention && currentCharacter.id !== 'veldora') {
      console.log("🐉 VELDORA INTERRUPT TRIGGERED!");
      
      // Check if Veldora is unlocked
      const veldoraUnlocked = isCharacterUnlocked('veldora', unlockedCharacters);
      
      // Step 1: Show entrance message (Unknown or Veldora)
      const entranceMessage: ChatMessage = {
        role: MessageRole.SYSTEM,
        content: veldoraUnlocked ? "Veldora Tempest has entered the chat" : "Unknown character has entered the chat"
      };
      setMessages(prev => [...prev, entranceMessage]);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 2: Veldora kicks the current character
      const oldCharacterFirstName = currentCharacter.name.split(' ')[0];
      const kickMessage: ChatMessage = {
        role: MessageRole.SYSTEM,
        content: veldoraUnlocked 
          ? `Veldora kicked ${oldCharacterFirstName}` 
          : `Unknown character kicked ${oldCharacterFirstName}`
      };
      setMessages(prev => [...prev, kickMessage]);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 3: Veldora's dramatic entrance speech
      const veldoraCharacter = getCharacterById('veldora');
      if (!veldoraCharacter) {
        console.error("❌ Veldora character not found!");
        setIsLoading(false);
        return;
      }
      
      const veldoraEntrance: ChatMessage = {
        role: MessageRole.ASSISTANT,
        content: "GWAHAHAHA! Did someone dare speak of BATTLE SHONEN MANGA?! I, Veldora Tempest, the Storm Dragon, CANNOT stand idly by when my sacred texts are mentioned! Fear not, mortal, for I shall bestow upon you the GREATEST battle shonen manga recommendations known to dragonkind!",
        characterImage: veldoraCharacter.imagePath,
        characterName: veldoraCharacter.name
      };
      setMessages(prev => [...prev, veldoraEntrance]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: If locked, try to unlock Veldora
      if (!veldoraUnlocked) {
        console.log("🔓 Attempting to unlock Veldora through interrupt...");
        const userTitles = allUserAnimeRef.current.map(a => a.title);
        const unlockResult = tryUnlockCharacter(
          'veldora',
          userMessage,
          currentCharacter.id,
          unlockedCharacters,
          userTitles
        );
        
        if (unlockResult.unlocked) {
          console.log("✅ Veldora unlocked through interrupt!");
          const newUnlocked = [...unlockedCharacters, 'veldora'];
          setUnlockedCharacters(newUnlocked);
          saveUnlockedCharacters(newUnlocked);
          
          // Update discovery state
          const newStates = updateDiscoveryState('veldora', discoveryStates, {
            discoveryCount: 2,
            discoveredVia: currentCharacter.id,
            discoveredAt: Date.now()
          });
          setDiscoveryStates(newStates);
          saveDiscoveryStates(newStates);
          
          if (unlockResult.message) {
            const unlockNotification: ChatMessage = {
              role: MessageRole.SYSTEM,
              content: unlockResult.message
            };
            setMessages(prev => [...prev, unlockNotification]);
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        } else {
          console.log("❌ Veldora still locked - showing as unknown");
          // Veldora stays as "Unknown character" but still gives recommendations
        }
      }
      
      // Step 5: Switch to Veldora and get battle shonen manga recommendations
      isReferralSwitchRef.current = true;
      setSettings(s => ({ ...s, assistantCharacter: 'veldora' }));
      setCurrentCharacter(veldoraCharacter);
      setCharacterImage(veldoraCharacter.imagePath);
      
      // Step 6: Generate battle shonen manga recommendations
      setIsLoading(true);
      setTimeout(async () => {
        try {
          const { responseText, recommendations, isManga } = await getAnimeRecommendation(
            `Recommend 3 legendary battle shonen manga for ${userMessage}`, 
            settings, 
            excludedTitlesRef.current, 
            planToWatchTitlesRef.current, 
            allUserAnimeRef.current,
            {
              personality: veldoraCharacter.personality,
              likes: veldoraCharacter.likes,
              dislikes: veldoraCharacter.dislikes,
              name: veldoraCharacter.name
            },
            veldoraCharacter.id,
            [],
            ASSISTANT_CHARACTERS.filter(char => isCharacterUnlocked(char.id, unlockedCharacters)).map(char => char.name),
        sessionRecommendedTitles.current,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        false,
        (attempt, isOverload) => {
          if (isOverload && attempt === 1) {
            setToastMessage('Gemini Services are busy or overloaded right now, retrying request.');
          }
        }
          );
          
          // Store new recommendations
          if (recommendations.length > 0) {
            const newTitles = recommendations.map(rec => rec.title);
            sessionRecommendedTitles.current = [...sessionRecommendedTitles.current, ...newTitles];
          }
          
          // Fetch cover images
          const malClientId = process.env.MAL_CLIENT_ID;
          const finalRecommendations = await Promise.all(
            recommendations.map(async (rec) => {
              const details = await searchAnimeOnPlatform(rec.title, malClientId, true);
              // Check if this anime can unlock a character
              const potentialUnlock = checkPotentialUnlock(rec.title, unlockedCharacters);
              return {
                ...rec,
                coverImage: details.coverImage,
                trailerUrl: details.trailerUrl,
                releaseYear: details.releaseYear,
                malUrl: details.malUrl,
                originalTitle: (details as any).originalTitle,
                episodeCount: (details as any).episodeCount,
                potentialUnlock: potentialUnlock
              };
            })
          );
          
          // Filter out any recommendations that match excluded titles (safety net)
          const filteredRecommendations = finalRecommendations.filter(rec => {
            const isExcluded = isTitleExcluded(rec.title, excludedTitlesRef.current);
            if (isExcluded) {
              console.warn(`⚠️ Filtered out excluded recommendation: "${rec.title}"`);
            }
            return !isExcluded;
          });

          if (filteredRecommendations.length < finalRecommendations.length) {
            console.log(`🛡️ Exclusion filter: Removed ${finalRecommendations.length - filteredRecommendations.length} recommendation(s) that matched excluded titles`);
          }
          
          const veldoraRecommendation: ChatMessage = {
            role: MessageRole.ASSISTANT,
            content: responseText,
            recommendations: filteredRecommendations.length > 0 ? filteredRecommendations : undefined,
            isManga: true,
            characterImage: veldoraCharacter.imagePath,
            characterName: veldoraCharacter.name
          };
          setMessages(prev => [...prev, veldoraRecommendation]);
        } catch (error) {
          console.error("❌ Veldora interrupt error:", error);
          const errorMessage: ChatMessage = {
            role: MessageRole.ASSISTANT,
            content: "GWAHAHAHA! It seems... my powers are momentarily weakened! *ahem* Try asking me again, mortal!",
            characterImage: veldoraCharacter.imagePath,
            characterName: veldoraCharacter.name
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      }, 1000);
      
      return; // Exit early - don't process normal flow
    }

    try {
      // Build conversation history from recent messages (last 6 messages for context)
      // Include character name for assistant messages so AI knows who said what
      const conversationHistory = messages
        .filter(msg => msg.role !== MessageRole.SYSTEM)
        .slice(-6)
        .map(msg => ({
          role: msg.role === MessageRole.USER ? 'user' : 'assistant',
          content: msg.role === MessageRole.ASSISTANT && msg.characterName
            ? `[${msg.characterName}]: ${msg.content}`
            : msg.content
        }));

      // Detect genres from request and increment counter
      const keywordGenres = detectGenresFromRequest(userMessage);
      
      // Also detect anime titles and fetch their genres from MAL
      const malClientId = process.env.MAL_CLIENT_ID;
      const titleGenres = malClientId ? await detectAnimeTitlesAndGenres(userMessage, malClientId) : [];
      
      // Merge both detection methods
      const detectedGenres = [...new Set([...keywordGenres, ...titleGenres])];
      
      // Detect era/year request
      const eraRequest = detectEraRequest(userMessage);
      if (eraRequest.era) {
        console.log(`📅 Era request detected: ${eraRequest.era}${eraRequest.year ? ` (${eraRequest.year})` : ''}${eraRequest.season ? ` ${eraRequest.season}` : ''}`);
      }
      
      const isMangaQuery = detectMangaRequest(userMessage);
      const postRecommendationMessages: ChatMessage[] = [];

      let weaknessBuddy: ReturnType<typeof selectBestBuddy> = null;
      let weaknessGenreKey: string | null = null;
      let weaknessContextForService:
        | {
            buddyId: string;
            buddyName?: string;
            buddyNickname?: string;
            buddyUnlocked: boolean;
            weaknessGenre: string;
            helperUserLabel: string;
            helperUserPronoun: string;
            targetUserLabel?: string;
            targetUserPronoun?: string;
          }
        | undefined;

      const expertiseSnapshot = currentExpertise;

      if (expertiseSnapshot && detectedGenres.length > 0) {
        for (const genre of detectedGenres) {
          const key = genre as keyof typeof expertiseSnapshot.genres;
          const normalizedKey = (typeof key === 'string' ? key : '') as keyof typeof expertiseSnapshot.genres;
          const rating = expertiseSnapshot.genres[normalizedKey];

          if (rating === '-') {
            const buddy = selectBestBuddy([genre], currentCharacter.id, isMangaQuery);
            if (buddy) {
              weaknessBuddy = buddy;
              weaknessGenreKey = genre;
              break;
            }
          }
        }
      }
      if (weaknessBuddy && weaknessGenreKey) {
        const buddyCharacter = getCharacterById(weaknessBuddy.characterId);
        const helperReferenceForWeakness = getUserReference(currentCharacter.id);
        const targetReferenceForWeakness = buddyCharacter ? getUserReference(buddyCharacter.id) : undefined;
        const buddyUnlocked = isCharacterUnlocked(weaknessBuddy.characterId, unlockedCharacters);
        const buddyNicknameForWeakness = buddyCharacter
          ? getCharacterNickname(currentCharacter.id, buddyCharacter)
          : buddyCharacter?.name?.split(' ')[0];
        weaknessContextForService = {
          buddyId: weaknessBuddy.characterId,
          buddyName: buddyCharacter?.name,
          buddyNickname: buddyNicknameForWeakness,
          buddyUnlocked,
          weaknessGenre: weaknessGenreKey,
          helperUserLabel: helperReferenceForWeakness.label,
          helperUserPronoun: helperReferenceForWeakness.pronoun,
          targetUserLabel: targetReferenceForWeakness?.label,
          targetUserPronoun: targetReferenceForWeakness?.pronoun,
        };
      }

      const currentCounts = getGenreRequestCounts(); // Always read from localStorage
      console.log("🎯 Current counts from localStorage:", currentCounts);
      
      const updatedCounts = { ...currentCounts };
      detectedGenres.forEach(genre => {
        updatedCounts[genre] = (updatedCounts[genre] || 0) + 1;
      });
      localStorage.setItem('genre_request_counts', JSON.stringify(updatedCounts));
      genreRequestCountsRef.current = updatedCounts; // Update ref too
      
      console.log("🎯 Detected genres (keywords):", keywordGenres);
      console.log("🎯 Detected genres (from titles):", titleGenres);
      console.log("🎯 Combined detected genres:", detectedGenres);
      console.log("🎯 Updated counts:", updatedCounts);
      
      if (weaknessBuddy && weaknessGenreKey) {
        const progressState = unlockProgressRef.current ?? loadUnlockProgress();
        unlockProgressRef.current = progressState;
        console.log('🎯 System 3.0: Tracking weakness hit', {
          target: weaknessBuddy.characterId,
          helper: currentCharacter.id,
          genre: weaknessGenreKey,
          existingHelperGenres: progressState[weaknessBuddy.characterId]?.helperGenres?.[currentCharacter.id] ?? [],
          existingGenreHelpers: progressState[weaknessBuddy.characterId]?.genreHelpers?.[weaknessGenreKey.toLowerCase()] ?? [],
        });
        const { state: updatedState, result } = registerWeaknessHit(
          progressState,
          weaknessBuddy.characterId,
          currentCharacter.id,
          weaknessGenreKey
        );
        unlockProgressRef.current = updatedState;

        if (result === 'discover') {
          const buddyCharacter = getCharacterById(weaknessBuddy.characterId);
          if (buddyCharacter) {
            setDiscoveryStates(prev => {
              const existing = prev.find(s => s.characterId === weaknessBuddy.characterId);
              if (existing && existing.discoveryCount >= 1) {
                return prev;
              }
              const updated = updateDiscoveryState(
                weaknessBuddy.characterId,
                prev,
                {
                  discoveryCount: 1,
                  discoveredVia: currentCharacter.id,
                  discoveredAt: Date.now(),
                }
              );
              saveDiscoveryStates(updated);
              return updated;
            });
            // Check if character is already unlocked before showing discovery message
            const buddyDiscoveryState = getDiscoveryState(weaknessBuddy.characterId, discoveryStates);
            const isBuddyAlreadyUnlocked = buddyDiscoveryState ? buddyDiscoveryState.discoveryCount === 2 : false;
            const isBuddyInUnlockedList = isCharacterUnlocked(weaknessBuddy.characterId, unlockedCharacters);
            
            if (!isBuddyAlreadyUnlocked && !isBuddyInUnlockedList) {
              addDiscoveredCharacter(weaknessBuddy.characterId, weaknessGenreKey);
              const discoveryMessage = '🔓 New contact discoverable! Try different genres to unlock new contacts.';
              postRecommendationMessages.push({
                role: MessageRole.SYSTEM,
                content: discoveryMessage,
              });
            }
          }
        } else if (result === 'unlock') {
          unlockProgressRef.current = clearUnlockProgressFor(updatedState, weaknessBuddy.characterId);
          const buddyCharacter = getCharacterById(weaknessBuddy.characterId);
          let referralDialogue: ReferralDialogueResult | undefined;
          let formattedGenre: string | undefined;
          const helperUserReference = getUserReference(currentCharacter.id);
          let targetUserReference = helperUserReference;
          let topicForDialogue = (weaknessGenreKey || '').toLowerCase() || 'this';
          let fallbackTopicLabel: string | undefined = formattedGenre;
          if (buddyCharacter) {
            const readableGenre = weaknessGenreKey
              .replace(/([A-Z])/g, ' $1')
              .replace(/_/g, ' ')
              .trim()
              .toLowerCase();
            formattedGenre = readableGenre.charAt(0).toUpperCase() + readableGenre.slice(1);
            const helperNicknameForTarget = getCharacterNickname(currentCharacter.id, buddyCharacter);
            const targetNicknameForHelper = getCharacterNickname(buddyCharacter.id, currentCharacter);
            const lastMentionedGenreKey = keywordGenres.length > 0 ? keywordGenres[keywordGenres.length - 1] : weaknessGenreKey;
            const displayTopic = (lastMentionedGenreKey || formattedGenre || weaknessGenreKey || '').toLowerCase();
            topicForDialogue = displayTopic || 'this';
            fallbackTopicLabel = formattedGenre || (lastMentionedGenreKey ? lastMentionedGenreKey.charAt(0).toUpperCase() + lastMentionedGenreKey.slice(1) : undefined);
            targetUserReference = getUserReference(buddyCharacter.id);
            
            try {
              referralDialogue = await generateReferralDialogue({
                helper: {
                  id: currentCharacter.id,
                  name: currentCharacter.name,
                  personality: currentCharacter.personality,
                  likes: currentCharacter.likes,
                  dislikes: currentCharacter.dislikes,
                },
                target: {
                  id: buddyCharacter.id,
                  name: buddyCharacter.name,
                  personality: buddyCharacter.personality,
                  likes: buddyCharacter.likes,
                  dislikes: buddyCharacter.dislikes,
                },
                userRequest: userMessage,
                topic: topicForDialogue,
                reason: 'progress',
                helperNicknameForTarget,
                targetNicknameForHelper,
                helperUserLabel: helperUserReference.label,
                helperUserPronoun: helperUserReference.pronoun,
                targetUserLabel: targetUserReference.label,
                targetUserPronoun: targetUserReference.pronoun,
              });
            } catch (error) {
              console.error('⚠️ generateReferralDialogue (progress) failed:', error);
            }
          }
          
          const introMessage = referralDialogue?.helperIntro || getFallbackReferralIntro(currentCharacter, buddyCharacter, fallbackTopicLabel, userMessage);
          setMessages(prev => [
            ...prev,
            {
              role: MessageRole.ASSISTANT,
              content: introMessage,
              characterImage: currentCharacter.imagePath,
              characterName: currentCharacter.name,
            },
          ]);
          await new Promise(resolve => setTimeout(resolve, 600));

          const handoffTopic = formattedGenre || weaknessGenreKey;
          const topicForHandoff = topicForDialogue || handoffTopic || weaknessGenreKey;
          console.log("🎯 System 3.0: Two-step unlock achieved for", weaknessBuddy.characterId, "via", currentCharacter.id, "on", weaknessGenreKey);
          await triggerImmediateReferral(
            weaknessBuddy.characterId,
            userMessage,
            'progress',
            currentCharacter.id,
            referralDialogue,
            topicForHandoff,
            helperUserReference,
            targetUserReference
          );
          return;
        }
      }
      
      // Check if this is first or second+ request for detected genres
      const isFirstRequest = detectedGenres.some(genre => updatedCounts[genre] === 1);
      const isSecondPlusRequest = detectedGenres.some(genre => updatedCounts[genre] >= 2);
      
      console.log("🎯 Is first request?", isFirstRequest);
      console.log("🎯 Is second+ request?", isSecondPlusRequest);
      
      // System 3.0: Only pass buddies to AI on SECOND+ request for weak genres
      // On first request, AI gives 1 rec with no referral
      // On second+ request, AI can use REFERRAL format
      let availableCharacterNames: string[] = [];
      
      if (isSecondPlusRequest) {
        // On second+ request, show buddies for the detected genres
        const currentBuddies = getBuddiesForCharacter(currentCharacter.id);
        availableCharacterNames = currentBuddies
          .map(buddy => {
            const char = ASSISTANT_CHARACTERS.find(c => c.id === buddy.characterId);
            return char ? char.name : null;
          })
          .filter((name): name is string => name !== null);
        
        console.log("🎯 System 3.0: Second+ request - Available buddies for referral:", availableCharacterNames);
      } else if (eraRequest.era) {
        // Era-specific request with genre interaction logic:
        // Rule 1: If user requested specific GENRES, check if character can handle them in THIS era
        // Rule 2: Era strength/weakness determines IF character can speak knowledgeably about genres in that era
        // 
        // Logic breakdown:
        // - Genre +, Era any: Handle directly (strength overrides era)
        // - Genre 0, Era +: Handle directly (neutral genre but knows era well)
        // - Genre 0, Era 0: Handle directly (neutral in both, can manage)
        // - Genre 0, Era -: Refer out (not expert in weak era for this genre)
        // - Genre -, Era any: Refer out (weakness always refers)
        
        const eraRating = CHARACTER_ERA_EXPERTISE[currentCharacter.id]?.eras[eraRequest.era];
        
        // Check if character should refer out based on era + genre combination
        let shouldReferOut = false;
        
        if (detectedGenres.length > 0 && eraRating !== undefined) {
          // Check each detected genre
          const { getCharacterExpertise } = require('./data/characterExpertise');
          const expertise = getCharacterExpertise(currentCharacter.id);
          
          for (const genre of detectedGenres) {
            const genreKey = genre.toLowerCase().replace(/[\s_-]+/g, '');
            const genreRating = expertise?.genres[genreKey];
            
            console.log(`📅 Genre-Era Check: genre='${genre}' (${genreRating}), era='${eraRequest.era}' (${eraRating})`);
            
            // Rule: If genre is weakness, always refer out
            if (genreRating === '-') {
              shouldReferOut = true;
              console.log(`📅 Refer reason: Genre '${genre}' is weakness (-)`);
              break;
            }
            
            // Rule: If genre is neutral (0) AND era is weak (-), refer out
            if (genreRating === '0' && eraRating === '-') {
              shouldReferOut = true;
              console.log(`📅 Refer reason: Genre '${genre}' is neutral (0) in weak era '${eraRequest.era}' (${eraRating})`);
              break;
            }
          }
        }
        
        if (shouldReferOut && eraRating !== undefined) {
          console.log(`📅 Era+Genre weakness detected: ${currentCharacter.name} should refer for this era/genre combo`);
          // Find buddies who have strength in this era
          const eraBuddies = ASSISTANT_CHARACTERS
            .filter(char => CHARACTER_ERA_EXPERTISE[char.id]?.eras[eraRequest.era] === '+')
            .map(char => char.name);
          
          if (eraBuddies.length > 0) {
            availableCharacterNames = eraBuddies;
            console.log(`📅 Era-based buddies available:`, eraBuddies);
          }
        } else if (eraRating === '-') {
          // If no specific genres detected but era is weakness, still refer
          console.log(`📅 Era weakness: ${currentCharacter.name} has weakness in ${eraRequest.era}`);
          const eraBuddies = ASSISTANT_CHARACTERS
            .filter(char => CHARACTER_ERA_EXPERTISE[char.id]?.eras[eraRequest.era] === '+')
            .map(char => char.name);
          
          if (eraBuddies.length > 0) {
            availableCharacterNames = eraBuddies;
            console.log(`📅 Era-based buddies available:`, eraBuddies);
          }
        }
      }
      
      if (!availableCharacterNames.length) {
        console.log("🎯 System 3.0: First request or no buddies - No buddies shown to AI (will give 1 rec)");
        console.log("🎯 System 3.0: First request - No buddies shown to AI (will give 1 rec)");
      }
      
      // Veldora/Kakashi default to MANGA unless user explicitly says "anime"
      let processedUserMessage = userMessage;
      const lowerUserMessage = userMessage.toLowerCase();
      const isExplicitAnime = lowerUserMessage.includes('anime');
      const isExplicitManga = lowerUserMessage.includes('manga') || lowerUserMessage.includes('manhwa') || lowerUserMessage.includes('manhua');
      
      if ((currentCharacter.id === 'veldora' || currentCharacter.id === 'kakashi') && !isExplicitAnime && !isExplicitManga) {
        // Default to manga for Veldora/Kakashi if no media type specified
        processedUserMessage = `${userMessage} manga`;
        console.log(`📚 Veldora/Kakashi default (handleSend): "${userMessage}" → "${processedUserMessage}"`);
      }
      
      const { responseText, recommendations = [], isRecommendation, isManga } = await getAnimeRecommendation(
        processedUserMessage, 
        settings, 
        excludedTitlesRef.current, 
        planToWatchTitlesRef.current, 
        allUserAnimeRef.current,
        {
          personality: currentCharacter.personality,
          likes: currentCharacter.likes,
          dislikes: currentCharacter.dislikes,
          name: currentCharacter.name
        },
        currentCharacter.id,
        conversationHistory,
        availableCharacterNames, // Pass discovered + unlocked characters on 2nd+ request
        sessionRecommendedTitles.current, // Pass session recommendations to avoid repeats
        eraRequest.season && eraRequest.year ? { season: eraRequest.season, year: eraRequest.year } : undefined, // Pass seasonal context
        detectedGenres, // Pass detected genres for smart filtering
        eraRequest.year, // Pass detected year for smart filtering
        eraRequest.era, // Pass detected era for smart filtering
        weaknessContextForService,
        undefined, // isAfterHandoff
        (attempt, isOverload) => {
          if (isOverload && attempt === 1) {
            setToastMessage('Gemini Services are busy or overloaded right now, retrying request.');
          }
        }
      );

      // MANGA ROUTING SYSTEM - Route manga requests to Veldora/Kakashi
      // Note: If Kakashi/Veldora is already current character, they default to manga (already handled above)
      // This routing only applies when OTHER characters need to route TO Kakashi/Veldora
      
      // Use processedUserMessage for detection since it may have "manga" appended
      const lowerProcessedMessage = processedUserMessage.toLowerCase();
      const lowerOriginalMessage = userMessage.toLowerCase();
      const isExplicitAnimeInOriginal = lowerOriginalMessage.includes('anime');
      
      // Only route if it's manga AND current character is NOT already Veldora/Kakashi
      // (If they're already current, they default to manga, no routing needed)
      if ((isManga || (!isExplicitAnimeInOriginal && processedUserMessage !== userMessage)) && isRecommendation && currentCharacter.id !== 'veldora' && currentCharacter.id !== 'kakashi') {
        console.log("📚 MANGA REQUEST DETECTED:", userMessage);
        
        // Check for romance/ecchi/drama manga → Route to Kakashi
        const romanceMangaGenres = ['romance', 'ecchi', 'drama', 'psychological', 'mystery'];
        const isRomanceManga = romanceMangaGenres.some(genre => lowerOriginalMessage.includes(genre));
        
        // Check for action/adventure/shonen manga → Route to Veldora  
        const actionMangaGenres = ['action', 'adventure', 'shonen', 'battle shonen', 'isekai', 'fantasy'];
        const isActionManga = actionMangaGenres.some(genre => lowerOriginalMessage.includes(genre));
        
        if (isRomanceManga && currentCharacter.id !== 'kakashi') {
          console.log("💕 ROMANCE MANGA → ROUTING TO KAKASHI");
          
          // Set flag to prevent duplicate routing
          isReferralSwitchRef.current = true;
          
          // Check if Kakashi is unlocked
          const kakashiUnlocked = isCharacterUnlocked('kakashi', unlockedCharacters);
          
          if (kakashiUnlocked) {
            // Switch to Kakashi
            const kakashiCharacter = getCharacterById('kakashi');
            if (kakashiCharacter) {
              // Step 1: Add introduction message from current character
              const introMessages: {[key: string]: string} = {
                'yuji': "Hmm, romance manga? Not really my thing... But I know someone who can help!",
                'marin': "Ooh, romance manga! I love romance, but for manga specifically... Let me add someone who knows better!",
                'ishigami': "...Romance manga? That's not really my area. Let me call someone who can help.",
                'kinta': "Romance manga? Nah, that's not really my jam. I know someone perfect for this!",
                'shinpachi': "Romance manga? Hmm, not really my specialty! Let me add someone who can help!",
                'veldora': "GWAHAHAHA! Romance manga? That's not my domain, mortal! Let me bring in an expert!",
                'ainz': "Romance manga? That is beyond my expertise. I shall call upon a specialist.",
                'daru': "Romance manga? Not really my thing... Let me add someone who can help!",
                'ichikawa': "Um... romance manga? I don't really read that... Let me get someone who knows about it.",
                'bakugo': "Tch! Romance manga?! That's not what I do! Let me get someone else!",
                'kanbaru': "Romance manga? Hmm, that's not my thing... Let me add someone who can help!",
                'rudeus': "Romance manga? While I appreciate the genre, I know someone better suited for this."
              };
              
              const introMessage = introMessages[currentCharacter.id] || "Hmm, that's not really my thing... Let me add someone who can help!";
              const currentCharMessage: ChatMessage = {
                role: MessageRole.ASSISTANT,
                content: introMessage,
                characterImage: currentCharacter.imagePath,
                characterName: currentCharacter.name
              };
              setMessages(prev => [...prev, currentCharMessage]);
              await new Promise(resolve => setTimeout(resolve, 800));
              
              // Step 2: Add system message (character added)
              const switchMessage: ChatMessage = {
                role: MessageRole.SYSTEM,
                content: `${currentCharacter.name.split(' ')[0]} added Kakashi Hatake to the chat`
              };
              setMessages(prev => [...prev, switchMessage]);
              await new Promise(resolve => setTimeout(resolve, 800));
              
              // Step 3: Add message from current character to Kakashi
              const handoffMessage: ChatMessage = {
                role: MessageRole.ASSISTANT,
                  content: `Hey Kakashi, ${malUsername} is looking for ${userMessage.toLowerCase()}. Can you help them out?`,
                characterImage: currentCharacter.imagePath,
                characterName: currentCharacter.name
              };
              setMessages(prev => [...prev, handoffMessage]);
              await new Promise(resolve => setTimeout(resolve, 800));
              
              // Step 4: Switch to Kakashi
              setCurrentCharacter(kakashiCharacter);
              
              // Step 5: Add Kakashi's entrance message
              const kakashiEntrance: ChatMessage = {
                role: MessageRole.ASSISTANT,
                content: "Maa maa, thanks for bringing this to me! I'll handle this.",
                characterImage: kakashiCharacter.imagePath,
                characterName: kakashiCharacter.name
              };
              setMessages(prev => [...prev, kakashiEntrance]);
              await new Promise(resolve => setTimeout(resolve, 800));
              
              // Step 6: Let Kakashi handle the request
              await handleSendWithCharacter(userMessage, kakashiCharacter, true);
              setIsLoading(false);
              return;
            }
          } else {
            // Try to unlock Kakashi
            const unlockResult = await tryUnlockCharacter('kakashi', userMessage, currentCharacter.id, unlockedCharacters, allUserAnimeRef.current.map(a => a.title));
            if (unlockResult.unlocked) {
              console.log("🎉 KAKASHI UNLOCKED!");
              setUnlockedCharacters(prev => [...prev, 'kakashi']);
              
              // Update discovery state
              const newStates = updateDiscoveryState('kakashi', discoveryStates, {
                discoveryCount: 2,
                discoveredVia: currentCharacter.id,
                discoveredAt: Date.now()
              });
              setDiscoveryStates(newStates);
              saveDiscoveryStates(newStates);
              
              // Switch to Kakashi
              const kakashiCharacter = getCharacterById('kakashi');
              if (kakashiCharacter) {
                // Step 1: Add introduction message from current character
                const introMessages: {[key: string]: string} = {
                  'yuji': "Hmm, romance manga? Not really my thing... But I know someone who can help!",
                  'marin': "Ooh, romance manga! I love romance, but for manga specifically... Let me add someone who knows better!",
                  'ishigami': "...Romance manga? That's not really my area. Let me call someone who can help.",
                  'kinta': "Romance manga? Nah, that's not really my jam. I know someone perfect for this!",
                  'shinpachi': "Romance manga? Hmm, not really my specialty! Let me add someone who can help!",
                  'veldora': "GWAHAHAHA! Romance manga? That's not my domain, mortal! Let me bring in an expert!",
                  'ainz': "Romance manga? That is beyond my expertise. I shall call upon a specialist.",
                  'daru': "Romance manga? Not really my thing... Let me add someone who can help!",
                  'ichikawa': "Um... romance manga? I don't really read that... Let me get someone who knows about it.",
                  'bakugo': "Tch! Romance manga?! That's not what I do! Let me get someone else!",
                  'kanbaru': "Romance manga? Hmm, that's not my thing... Let me add someone who can help!",
                  'rudeus': "Romance manga? While I appreciate the genre, I know someone better suited for this."
                };
                
                const introMessage = introMessages[currentCharacter.id] || "Hmm, that's not really my thing... Let me add someone who can help!";
                const currentCharMessage: ChatMessage = {
                  role: MessageRole.ASSISTANT,
                  content: introMessage,
                  characterImage: currentCharacter.imagePath,
                  characterName: currentCharacter.name
                };
                setMessages(prev => [...prev, currentCharMessage]);
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Step 2: Add unlock message
                const unlockMessage: ChatMessage = {
                  role: MessageRole.SYSTEM,
                  content: unlockResult.message || "🎉 Kakashi Hatake has been unlocked!"
                };
                setMessages(prev => [...prev, unlockMessage]);
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Step 3: Add system message (character added)
                const switchMessage: ChatMessage = {
                  role: MessageRole.SYSTEM,
                  content: `${currentCharacter.name.split(' ')[0]} added Kakashi Hatake to the chat`
                };
                setMessages(prev => [...prev, switchMessage]);
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Step 4: Add message from current character to Kakashi
                const handoffMessage: ChatMessage = {
                  role: MessageRole.ASSISTANT,
                  content: `Hey Kakashi, ${malUsername} is looking for ${userMessage.toLowerCase()}. Can you help them out?`,
                  characterImage: currentCharacter.imagePath,
                  characterName: currentCharacter.name
                };
                setMessages(prev => [...prev, handoffMessage]);
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Step 5: Switch to Kakashi
                setCurrentCharacter(kakashiCharacter);
                
                // Step 6: Add Kakashi's entrance message
                const kakashiEntrance: ChatMessage = {
                  role: MessageRole.ASSISTANT,
                  content: "Maa maa, thanks for bringing this to me! I'll handle this.",
                  characterImage: kakashiCharacter.imagePath,
                  characterName: kakashiCharacter.name
                };
                setMessages(prev => [...prev, kakashiEntrance]);
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Step 7: Let Kakashi handle the request
                await handleSendWithCharacter(userMessage, kakashiCharacter, true);
                setIsLoading(false);
                return;
              }
            }
          }
        }
        
        if (isActionManga && currentCharacter.id !== 'veldora') {
          console.log("⚔️ ACTION MANGA → ROUTING TO VELDORA");
          
          // Set flag to prevent duplicate routing
          isReferralSwitchRef.current = true;
          
          // Check if Veldora is unlocked
          const veldoraUnlocked = isCharacterUnlocked('veldora', unlockedCharacters);
          
          if (veldoraUnlocked) {
            // Switch to Veldora
            const veldoraCharacter = getCharacterById('veldora');
            if (veldoraCharacter) {
              // Step 1: Add introduction message from current character
              const introMessages: {[key: string]: string} = {
                'yuji': "Hmm, action manga? I'm more of an action anime guy... Let me add someone who knows manga better!",
                'marin': "Action manga? That's not really my thing... Let me add someone who knows about that!",
                'ishigami': "...Action manga? That's not really my area. Let me call someone who can help.",
                'kinta': "Action manga? I'm more into robots! Let me get someone who knows about this!",
                'shinpachi': "Action manga? Hmm, not really my specialty! Let me add someone who can help!",
                'kakashi': "Maa maa, action manga? That's not really my expertise. Let me call in a specialist.",
                'ainz': "Action manga? That is beyond my expertise. I shall call upon a specialist.",
                'daru': "Action manga? Not really my thing... Let me add someone who can help!",
                'ichikawa': "Um... action manga? I don't really read that... Let me get someone who knows about it.",
                'bakugo': "Tch! Action manga?! I'm more into anime! Let me get someone else!",
                'kanbaru': "Action manga? Hmm, that's not my thing... Let me add someone who can help!",
                'rudeus': "Action manga? While I appreciate the genre, I know someone better suited for this."
              };
              
              const introMessage = introMessages[currentCharacter.id] || "Hmm, that's not really my thing... Let me add someone who can help!";
              const currentCharMessage: ChatMessage = {
                role: MessageRole.ASSISTANT,
                content: introMessage,
                characterImage: currentCharacter.imagePath,
                characterName: currentCharacter.name
              };
              setMessages(prev => [...prev, currentCharMessage]);
              await new Promise(resolve => setTimeout(resolve, 800));
              
              // Step 2: Add system message (character added)
              const switchMessage: ChatMessage = {
                role: MessageRole.SYSTEM,
                content: `${currentCharacter.name.split(' ')[0]} added Veldora Tempest to the chat`
              };
              setMessages(prev => [...prev, switchMessage]);
              await new Promise(resolve => setTimeout(resolve, 800));
              
              // Step 3: Add message from current character to Veldora
              const handoffMessage: ChatMessage = {
                role: MessageRole.ASSISTANT,
                  content: `Hey Veldora, ${malUsername} is looking for ${userMessage.toLowerCase()}. Can you help them out?`,
                characterImage: currentCharacter.imagePath,
                characterName: currentCharacter.name
              };
              setMessages(prev => [...prev, handoffMessage]);
              await new Promise(resolve => setTimeout(resolve, 800));
              
              // Step 4: Switch to Veldora
              setCurrentCharacter(veldoraCharacter);
              
              // Step 5: Add Veldora's entrance message
              const veldoraEntrance: ChatMessage = {
                role: MessageRole.ASSISTANT,
                content: "GWAHAHAHA! Someone seeks my expertise in action manga?! Fear not, mortal! I shall provide the FINEST recommendations!",
                characterImage: veldoraCharacter.imagePath,
                characterName: veldoraCharacter.name
              };
              setMessages(prev => [...prev, veldoraEntrance]);
              await new Promise(resolve => setTimeout(resolve, 800));
              
              // Step 6: Let Veldora handle the request
              await handleSendWithCharacter(`${userMessage} manga`, veldoraCharacter, true);
              setIsLoading(false);
              return;
            }
          } else {
            // Try to unlock Veldora
            const unlockResult = await tryUnlockCharacter('veldora', userMessage, currentCharacter.id, unlockedCharacters, allUserAnimeRef.current.map(a => a.title));
            if (unlockResult.unlocked) {
              console.log("🎉 VELDORA UNLOCKED!");
              // Only update if not already unlocked
              if (!unlockedCharacters.includes('veldora')) {
                setUnlockedCharacters(prev => [...prev, 'veldora']);
                
                // Update discovery state
                const newStates = updateDiscoveryState('veldora', discoveryStates, {
                  discoveryCount: 2,
                  discoveredVia: currentCharacter.id,
                  discoveredAt: Date.now()
                });
                setDiscoveryStates(newStates);
                saveDiscoveryStates(newStates);
              }
              
              // Switch to Veldora
              const veldoraCharacter = getCharacterById('veldora');
              if (veldoraCharacter) {
                // Step 1: Add introduction message from current character
                const introMessages: {[key: string]: string} = {
                  'yuji': "Hmm, action manga? I'm more of an action anime guy... Let me add someone who knows manga better!",
                  'marin': "Action manga? That's not really my thing... Let me add someone who knows about that!",
                  'ishigami': "...Action manga? That's not really my area. Let me call someone who can help.",
                  'kinta': "Action manga? I'm more into robots! Let me get someone who knows about this!",
                  'shinpachi': "Action manga? Hmm, not really my specialty! Let me add someone who can help!",
                  'kakashi': "Maa maa, action manga? That's not really my expertise. Let me call in a specialist.",
                  'ainz': "Action manga? That is beyond my expertise. I shall call upon a specialist.",
                  'daru': "Action manga? Not really my thing... Let me add someone who can help!",
                  'ichikawa': "Um... action manga? I don't really read that... Let me get someone who knows about it.",
                  'bakugo': "Tch! Action manga?! I'm more into anime! Let me get someone else!",
                  'kanbaru': "Action manga? Hmm, that's not my thing... Let me add someone who can help!",
                  'rudeus': "Action manga? While I appreciate the genre, I know someone better suited for this."
                };
                
                const introMessage = introMessages[currentCharacter.id] || "Hmm, that's not really my thing... Let me add someone who can help!";
                const currentCharMessage: ChatMessage = {
                  role: MessageRole.ASSISTANT,
                  content: introMessage,
                  characterImage: currentCharacter.imagePath,
                  characterName: currentCharacter.name
                };
                setMessages(prev => [...prev, currentCharMessage]);
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Step 2: Add unlock message only if character was just unlocked
                if (!unlockedCharacters.includes('veldora')) {
                  const unlockMessage: ChatMessage = {
                    role: MessageRole.SYSTEM,
                    content: unlockResult.message || "🎉 Veldora Tempest has been unlocked!"
                  };
                  setMessages(prev => [...prev, unlockMessage]);
                  await new Promise(resolve => setTimeout(resolve, 800));
                }
                
                // Step 3: Add system message (character added)
                const switchMessage: ChatMessage = {
                  role: MessageRole.SYSTEM,
                  content: `${currentCharacter.name.split(' ')[0]} added Veldora Tempest to the chat`
                };
                setMessages(prev => [...prev, switchMessage]);
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Step 4: Add message from current character to Veldora
                const handoffMessage: ChatMessage = {
                  role: MessageRole.ASSISTANT,
                  content: `Hey Veldora, ${malUsername} is looking for ${userMessage.toLowerCase()}. Can you help them out?`,
                  characterImage: currentCharacter.imagePath,
                  characterName: currentCharacter.name
                };
                setMessages(prev => [...prev, handoffMessage]);
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Step 5: Switch to Veldora
                setCurrentCharacter(veldoraCharacter);
                
                // Step 6: Add Veldora's entrance message
                const veldoraEntrance: ChatMessage = {
                  role: MessageRole.ASSISTANT,
                  content: "GWAHAHAHA! Someone seeks my expertise in action manga?! Fear not, mortal! I shall provide the FINEST recommendations!",
                  characterImage: veldoraCharacter.imagePath,
                  characterName: veldoraCharacter.name
                };
                setMessages(prev => [...prev, veldoraEntrance]);
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Step 7: Let Veldora handle the request
                await handleSendWithCharacter(userMessage, veldoraCharacter, true);
                setIsLoading(false);
                return;
              }
            }
          }
        }
      }
      
      // Store new recommendations in session history
      if (isRecommendation && recommendations.length > 0) {
        const newTitles = recommendations.map(rec => rec.title);
        sessionRecommendedTitles.current = [...sessionRecommendedTitles.current, ...newTitles];
        console.log("📝 Session recommendations updated:", sessionRecommendedTitles.current.length, "total");
      }
      
      let finalRecommendations: AnimeRecommendation[] = [];

      const forceManga = (currentCharacter.id === 'veldora' || currentCharacter.id === 'kakashi') && processedUserMessage !== userMessage;
      const finalIsManga = forceManga ? true : isManga;

      if (recommendations.length > 0) {
        if (malClientId) {
          const mediaType = finalIsManga ? "manga" : "anime";
          console.log(`🎨 Fetching cover images for ${recommendations.length} ${mediaType}...`);
          finalRecommendations = await Promise.all(
            recommendations.map(async (rec) => {
              const details = await searchAnimeOnPlatform(rec.title, malClientId, finalIsManga);
              console.log(`Cover for "${rec.title}":`, details.coverImage ? "✅ Found" : "❌ Not found");
              
              let enrichedCommunityOpinion = rec.community_opinion;
              if (!finalIsManga && details.malId) {
                try {
                  const reviews = await fetchAnimeReviews(details.malId);
                  if (reviews.length > 0) {
                    const firstReview = reviews[0].substring(0, 100) + '...';
                    enrichedCommunityOpinion = rec.community_opinion 
                      ? `${rec.community_opinion} (Review excerpt: "${firstReview}")`
                      : `Review excerpt: "${firstReview}"`;
                  }
                  
                  const jikanRecs = await fetchAnimeRecommendations(details.malId);
                  if (jikanRecs.length > 0) {
                    const topRecs = jikanRecs.slice(0, 3).map(r => r.title).join(', ');
                    console.log(`💡 Jikan recommendations for ${rec.title}:`, topRecs);
                  }
                } catch (error) {
                  console.error(`Error fetching reviews/recommendations for ${rec.title}:`, error);
                }
              }
              
              const potentialUnlock = checkPotentialUnlock(rec.title, unlockedCharacters);
              if (potentialUnlock) {
                console.log(`🔓 Potential unlock detected: "${rec.title}" can unlock ${potentialUnlock.characterName}`);
              }
              return {
                ...rec,
                coverImage: details.coverImage,
                trailerUrl: details.trailerUrl,
                releaseYear: details.releaseYear,
                malUrl: details.malUrl,
                originalTitle: (details as any).originalTitle,
                episodeCount: (details as any).episodeCount,
                community_opinion: enrichedCommunityOpinion,
                potentialUnlock: potentialUnlock
              };
            })
          );
        } else {
          finalRecommendations = recommendations;
        }
      }

      // Filter out any recommendations that match excluded titles (safety net)
      const filteredRecommendations = finalRecommendations.filter(rec => {
        const isExcluded = isTitleExcluded(rec.title, excludedTitlesRef.current);
        if (isExcluded) {
          console.warn(`⚠️ Filtered out excluded recommendation: "${rec.title}"`);
        }
        return !isExcluded;
      });

      if (filteredRecommendations.length < finalRecommendations.length) {
        console.log(`🛡️ Exclusion filter: Removed ${finalRecommendations.length - filteredRecommendations.length} recommendation(s) that matched excluded titles`);
      }

      const referralMetadata = extractReferralMetadata(responseText);

      const assistantMessage: ChatMessage = {
        role: MessageRole.ASSISTANT,
        content: referralMetadata.cleanedResponseText,
        recommendations: filteredRecommendations.length > 0 ? filteredRecommendations : undefined,
        isManga: finalIsManga,
        characterImage: currentCharacter.imagePath,
        characterName: currentCharacter.name,
        referredCharacterId: referralMetadata.referredCharacterId,
        referredCharacterName: referralMetadata.referredCharacterName,
        referralHandoff: referralMetadata.referralHandoff,
        referralAcknowledgment: referralMetadata.referralAcknowledgment,
        referralPitch: referralMetadata.referralPitch
      };

      if (filteredRecommendations.length > 0) {
        console.log("Final recommendations with covers:", filteredRecommendations.map(r => ({ title: r.title, hasCover: !!r.coverImage })));
      }

      // Only show "no recommendations" error if it was actually a recommendation request
      // If it's a question (isRecommendation = false), just show the response text
      if (filteredRecommendations.length === 0 && isRecommendation) {
        // It was a recommendation request but got no recommendations - show error
        const noRecMessage: ChatMessage = {
          role: MessageRole.ASSISTANT,
          content: isOverloadResponse(responseText)
            ? buildOverloadFallbackMessage(currentCharacter, detectedGenres[detectedGenres.length - 1] || userMessage)
            : buildNoRecommendationsMessage(currentCharacter, responseText, userMessage),
          characterImage: currentCharacter.imagePath,
          characterName: currentCharacter.name
        };
        setMessages(prev => [...prev, noRecMessage, ...postRecommendationMessages]);
      } else {
        // Either has recommendations OR it's a question (not a recommendation request)
        // Just show the assistant's response
        setMessages(prev => [...prev, assistantMessage, ...postRecommendationMessages]);
      }
      
      // System 3.0: Process buddy referral for discovery/unlock (on 2nd+ request with REFERRAL)
      if (referralMetadata.hasReferral && referralMetadata.referredCharacterId) {
        console.log("🎯 System 3.0: Processing buddy referral (2nd+ request) to", referralMetadata.referredCharacterId);
        const watchListTitles = allUserAnimeRef.current.map(a => a.title);
        const discoveryResult = processBuddyReferral(
          referralMetadata.referredCharacterId,
          currentCharacter.id,
          watchListTitles
        );
        
        const referralUnlocked = discoveryResult.systemMessage?.includes('has been unlocked');

        if (discoveryResult.systemMessage && !referralUnlocked) {
          console.log("🎯 System 3.0: Adding discovery/unlock message:", discoveryResult.systemMessage);
          const systemMessage: ChatMessage = {
            role: MessageRole.SYSTEM,
            content: discoveryResult.systemMessage
          };
          setMessages(prev => [...prev, systemMessage]);
        }

        if (referralUnlocked) {
          const helperReference = getUserReference(currentCharacter.id);
          const targetCharacter = getCharacterById(referralMetadata.referredCharacterId);
          const targetReference = targetCharacter ? getUserReference(targetCharacter.id) : helperReference;
          const referralDialogueFromResponse = (referralMetadata.referralHandoff || referralMetadata.referralAcknowledgment)
            ? {
                helperIntro: '',
                handoffLine: referralMetadata.referralHandoff || '',
                acknowledgmentLine: referralMetadata.referralAcknowledgment || '',
                specialistPitch: referralMetadata.referralPitch || ''
              }
            : undefined;
          const fallbackTopic = detectedGenres[detectedGenres.length - 1];

          await triggerImmediateReferral(
            referralMetadata.referredCharacterId,
            processedUserMessage,
            'progress',
            currentCharacter.id,
            referralDialogueFromResponse,
            fallbackTopic,
            helperReference,
            targetReference
          );
          // Loading state is managed by triggerImmediateReferral and handleSendWithCharacter
          return;
        }
      }
      
      // System 3.0: On FIRST request for weak genre (no referral yet), discover the buddy internally
      if (isFirstRequest && !referralMetadata.hasReferral && detectedGenres.length > 0) {
        // Legacy discover-only flow removed in System 3.1
      }

    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        role: MessageRole.ASSISTANT,
        content: "I'm having trouble retrieving recommendations right now. This might be a temporary issue with the AI model. Please try your request again in a few moments.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [settings, currentCharacter, addDiscoveredCharacter, triggerImmediateReferral]);

  const getDataStatus = () => {
    if (isDataLoading) {
        return { text: 'Syncing with MyAnimeList API...', color: 'text-yellow-300' };
    }
    if (allUserAnimeRef.current.length > 0) {
        return { text: `MAL API Synced (${allUserAnimeRef.current.length + planToWatchTitlesRef.current.length} entries)`, color: 'text-green-300' };
    }
    return { text: 'MAL API: Connection Failed', color: 'text-red-400' };
  };

  useEffect(() => {
    startConsoleCapture();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  if (showSetup) {
      return <SetupScreen onSetupComplete={handleSetupComplete} initialMessage={messages[0]?.content} />;
  }

  if (showUsernamePrompt) {
      return <UsernamePrompt onUsernameSubmit={handleUsernameSubmit} onAniListSubmit={handleAniListSubmit} onManualListSubmit={handleManualListSubmit} />;
  }

  // Developer visualization screen
  if (currentView === 'developer') {
    return (
      <DeveloperVisualizationScreen
        onBack={() => setCurrentView('main')}
        userAnimeList={allUserAnimeRef.current}
        unlockedCharacters={unlockedCharacterIds}
        discoveryStates={discoveryStates}
      />
    );
  }

  const dataStatus = getDataStatus();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleToggleSettings = () => {
    setIsSettingsPanelOpen(prev => !prev);
    closeMobileMenu();
  };

  const handleOpenBugReport = () => {
    setBugReportLogs(getConsoleLogs());
    setBugReportStatus('idle');
    setBugReportError(undefined);
    setIsBugReportOpen(true);
    closeMobileMenu();
  };

  const handleMobileReset = () => {
    closeMobileMenu();
    handleReset();
  };

  return (
    <div
      className="h-screen w-screen flex flex-col bg-gray-900 text-gray-200 font-sans relative"
      style={{
        backgroundImage: 'radial-gradient(circle at top right, rgba(22, 78, 99, 0.3), transparent 40%), radial-gradient(circle at bottom left, rgba(56, 189, 248, 0.2), transparent 50%)',
      }}
    >
      <header className="mobile-fixed-header fixed top-0 left-0 right-0 sm:relative sm:top-auto sm:left-auto sm:right-auto flex items-center justify-between p-3 sm:p-4 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm shadow-sm z-50 sm:z-30">
        {/* Left side - Character selector */}
        <div className="flex-1 min-w-0 flex items-center">
          <div className="flex-shrink-0">
            <CharacterSelector 
              currentCharacter={{...currentCharacter, characterImage: characterImage}} 
              onCharacterSelect={(character) => {
                setSettings(s => ({ ...s, assistantCharacter: character.id }));
              }}
              unlockedCharacters={unlockedCharacterIds}
              discoveredCharacters={discoveredCharacters}
              discoveryStates={discoveryStates}
            />
          </div>
        </div>

        {/* Center logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
          <img
            src={AraLogo}
            alt="Anime Recommendation Assistant logo"
            className="h-8 sm:h-9 md:h-10 drop-shadow-md"
          />
        </div>
        
        {/* Right side - Status and controls */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 sm:gap-4">
            {/* Username and status */}
            <div className="hidden md:block text-right">
              <p className="text-xs sm:text-sm font-semibold text-cyan-300">{malUsername}</p>
              <p className={`text-xs font-medium ${isClientIdConfigured ? 'text-green-300' : 'text-red-400'}`}>
                Client ID: {isClientIdConfigured ? 'Loaded' : 'Missing'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`w-2 h-2 rounded-full ${isDataLoading ? 'bg-yellow-400 animate-pulse' : allUserAnimeRef.current.length > 0 ? 'bg-green-400' : 'bg-red-500'}`}></div>
              <span className={`text-xs font-medium ${dataStatus.color}`}>{dataStatus.text}</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleToggleSettings}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label={isSettingsPanelOpen ? "Hide settings" : "Show settings"}
              >
                <AdjustmentsIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isSettingsPanelOpen ? 'text-cyan-300' : 'text-gray-400'}`} />
              </button>
              <button 
                onClick={handleReset}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Reset credentials"
              >
                <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-cyan-300" />
              </button>
              <button
                onClick={handleOpenBugReport}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Report a bug"
              >
                <BugIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-cyan-300" />
              </button>
            </div>
          </div>
          <button
            className="sm:hidden p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => {
              if (isSettingsPanelOpen) {
                setIsSettingsPanelOpen(false);
              }
              setIsMobileMenuOpen(prev => !prev);
            }}
          >
            <MenuIcon className={`w-6 h-6 ${isMobileMenuOpen ? 'text-cyan-300' : 'text-gray-300'}`} />
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <>
          <div
            className="sm:hidden fixed bg-black/40"
            onClick={closeMobileMenu}
            style={{ top: '4rem', left: 0, right: 0, bottom: 0, zIndex: 35 }}
          />
          <div className="sm:hidden fixed left-0 right-0 px-3" style={{ top: '4rem', zIndex: 40 }}>
            <div className="bg-gray-900/95 border border-gray-700 rounded-2xl shadow-xl p-4 space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-cyan-300">{malUsername || 'MAL not connected'}</p>
                <p className={`text-xs font-medium ${isClientIdConfigured ? 'text-green-300' : 'text-red-400'}`}>
                  Client ID: {isClientIdConfigured ? 'Loaded' : 'Missing'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isDataLoading ? 'bg-yellow-400 animate-pulse' : allUserAnimeRef.current.length > 0 ? 'bg-green-400' : 'bg-red-500'}`}></div>
                <span className={`text-xs font-medium ${dataStatus.color}`}>{dataStatus.text}</span>
                <span className="text-xs text-gray-400">
                  {allUserAnimeRef.current.length > 0 ? `${allUserAnimeRef.current.length + planToWatchTitlesRef.current.length} entries` : 'Offline'}
                </span>
              </div>
              <div className="grid gap-2">
                <button
                  onClick={handleToggleSettings}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-semibold text-gray-200"
                >
                  <AdjustmentsIcon className="w-4 h-4 text-cyan-300" />
                  {isSettingsPanelOpen ? 'Close Settings' : 'Open Settings'}
                </button>
                <button
                  onClick={handleMobileReset}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-semibold text-gray-200"
                >
                  <ArrowPathIcon className="w-4 h-4 text-gray-300" />
                  Reset Credentials
                </button>
                <button
                  onClick={handleOpenBugReport}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-semibold text-gray-200"
                >
                  <BugIcon className="w-4 h-4 text-red-300" />
                  Report a Bug
                </button>
              </div>
              <button
                onClick={closeMobileMenu}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                Close Menu
              </button>
            </div>
          </div>
        </>
      )}
      
      {isTransparencyPanelOpen && <TransparencyPanel excludedTitles={excludedTitlesRef.current} />}
      {isSettingsPanelOpen && (
        <SettingsPanel 
          settings={settings} 
          setSettings={setSettings} 
          planToWatchCount={planToWatchTitlesRef.current.length}
          unlockedCharacters={unlockedCharacterIds}
          onUnlockAllCharacters={handleForceUnlockAllCharacters}
          onSetCharacterUnlockState={handleCharacterUnlockStateChange}
          userAnimeList={allUserAnimeRef.current}
          onOpenDeveloperScreen={() => setCurrentView('developer')}
          isTransparencyPanelOpen={isTransparencyPanelOpen}
          onToggleExclusionList={() => setIsTransparencyPanelOpen(prev => !prev)}
          onRequestClose={handleToggleSettings}
        />
      )}
      
      <div className="mobile-content-area flex-1 flex flex-col overflow-hidden pt-16 sm:pt-0">
        <ChatWindow 
          messages={messages} 
          isLoading={isLoading} 
          characterImage={characterImage} 
          characterName={currentCharacter.name} 
          characterLoadingMessages={currentCharacter.loadingMessages}
          isRecommendationRequest={isLoading ? isRecommendationRequest(messages[messages.length - 1]?.content || '') : false}
          onAcceptReferral={handleAcceptReferral}
          onDeclineReferral={handleDeclineReferral}
          unlockedCharacters={unlockedCharacterIds}
        />
      </div>
      <MessageInput onSend={handleSend} isLoading={isLoading || isDataLoading} quickPrompts={quickPrompts} />
      {toastMessage && (
        <Toast
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
          duration={6000}
        />
      )}
      <BugReportModal
        isOpen={isBugReportOpen}
        onClose={() => {
          setIsBugReportOpen(false);
          setBugReportStatus('idle');
          setBugReportError(undefined);
        }}
        logs={bugReportLogs}
        onSubmit={async ({ description, contactEmail, includeConsoleLogs }) => {
          setIsBugReportSubmitting(true);
          setBugReportStatus('idle');
          setBugReportError(undefined);
          try {
            await submitBugReport({
              description,
              contactEmail,
              includeConsoleLogs,
              consoleLogs: includeConsoleLogs ? bugReportLogs : [],
            });
            setBugReportStatus('success');
          } catch (error) {
            setBugReportStatus('error');
            setBugReportError(error instanceof Error ? error.message : 'Something went wrong while sending the report.');
          } finally {
            setIsBugReportSubmitting(false);
          }
        }}
        isSubmitting={isBugReportSubmitting}
        status={bugReportStatus}
        errorMessage={bugReportError}
      />
    </div>
  );
};

export default App;

