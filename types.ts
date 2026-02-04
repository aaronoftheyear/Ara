export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface AnimeEntry {
  title: string;
  score?: number;
  finishDate?: string; // YYYY-MM-DD
  status?: 'Completed' | 'Watching' | 'On-Hold' | 'Dropped' | 'Plan to Watch';
  genres?: string[]; // Genres from MAL API
  releaseYear?: string; // Release year from MAL API
}

export interface AnimeRecommendation {
  title: string;
  originalTitle?: string; // Original Japanese/Romaji title
  episodeCount?: string; // Number of episodes (e.g., "12 eps")
  mal_score: number;
  genres: string[];
  synopsis: string;
  reasoning: string;
  coverImage?: string;
  trailerUrl?: string;
  has_dub?: boolean;
  releaseYear?: string;
  malUrl?: string;
  community_opinion?: string;
  streamingPlatforms?: string[]; // Array of streaming platforms (e.g., ["Netflix", "Crunchyroll", "HBO Max"])
  potentialUnlock?: {
    characterName: string;
    characterId: string;
  }; // If watching this anime could unlock a character
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
  recommendations?: AnimeRecommendation[];
  isManga?: boolean; // True if recommendations are for manga
  characterImage?: string; // Store character image with message for persistence
  characterName?: string;
  referredCharacterId?: string; // Character ID being referred to
  referredCharacterName?: string; // Character name being referred to
  referralHandoff?: string; // AI-generated handoff message
  referralAcknowledgment?: string; // AI-generated acknowledgment message
  referralPitch?: string; // AI-generated specialist pitch message (separate from acknowledgment)
}

export interface Settings {
  minScore: number;
  recommendFromPTW: boolean;
  assistantCharacter?: string; // character ID
}