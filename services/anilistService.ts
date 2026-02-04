// AniList API Service - GraphQL-based
import { AnimeEntry } from '../types';

const ANILIST_API_URL = 'https://graphql.anilist.co';

// Map AniList status to our internal format
const mapAniListStatus = (status: string): AnimeEntry['status'] => {
  switch (status) {
    case 'CURRENT':
      return 'Watching';
    case 'COMPLETED':
      return 'Completed';
    case 'PAUSED':
      return 'On-Hold';
    case 'DROPPED':
      return 'Dropped';
    case 'PLANNING':
      return 'Plan to Watch';
    default:
      return undefined;
  }
};

/**
 * Fetch user's anime list from AniList using GraphQL
 */
export const fetchAniListAnimeList = async (username: string): Promise<AnimeEntry[]> => {
  if (!username) {
    throw new Error("AniList username is required.");
  }

  const query = `
    query ($username: String) {
      MediaListCollection(userName: $username, type: ANIME) {
        lists {
          entries {
            media {
              title {
                english
                romaji
              }
            }
            status
            score(format: POINT_10)
            completedAt {
              year
              month
              day
            }
          }
        }
      }
    }
  `;

  const variables = {
    username: username
  };

  try {
    console.log(`📡 Fetching AniList data for user: ${username}`);
    
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to fetch from AniList API: ${response.status} ${response.statusText}. Response: ${errorBody}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`AniList GraphQL error: ${JSON.stringify(result.errors)}`);
    }

    const lists = result.data?.MediaListCollection?.lists || [];
    const allEntries: AnimeEntry[] = [];

    // Process all lists (Watching, Completed, etc.)
    lists.forEach((list: any) => {
      list.entries.forEach((entry: any) => {
        const englishTitle = entry.media.title.english;
        const romajiTitle = entry.media.title.romaji;
        const title = englishTitle || romajiTitle; // Prefer English

        let finishDate: string | undefined;
        if (entry.completedAt && entry.completedAt.year) {
          const year = entry.completedAt.year;
          const month = String(entry.completedAt.month || 1).padStart(2, '0');
          const day = String(entry.completedAt.day || 1).padStart(2, '0');
          finishDate = `${year}-${month}-${day}`;
        }

        allEntries.push({
          title: title,
          score: entry.score === 0 ? undefined : entry.score,
          finishDate: finishDate,
          status: mapAniListStatus(entry.status)
        });
      });
    });

    console.log(`✅ Loaded ${allEntries.length} anime entries from AniList`);
    return allEntries.filter(entry => entry.title && entry.status);

  } catch (error) {
    console.error("Error fetching AniList data:", error);
    throw error;
  }
};

/**
 * Search for anime on AniList to get details
 */
export const searchAniListAnime = async (title: string): Promise<{ 
  coverImage?: string; 
  trailerUrl?: string; 
  releaseYear?: string; 
  anilistUrl?: string;
  genres?: string[];
  synopsis?: string;
  score?: number;
  originalTitle?: string;
  episodeCount?: string;
}> => {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title {
          english
          romaji
        }
        coverImage {
          large
          medium
        }
        trailer {
          site
          id
        }
        seasonYear
        description
        averageScore
        genres
        episodes
      }
    }
  `;

  const variables = {
    search: title
  };

  try {
    console.log(`🔍 Searching AniList for: "${title}"`);
    
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      console.error(`❌ AniList search failed: ${response.status}`);
      return {};
    }

    const result = await response.json();

    if (result.errors || !result.data?.Media) {
      console.warn(`⚠️ No AniList result for: "${title}"`);
      return {};
    }

    const media = result.data.Media;

    const coverImage = media.coverImage?.large || media.coverImage?.medium;
    
    let trailerUrl: string | undefined;
    if (media.trailer?.site === 'youtube' && media.trailer?.id) {
      trailerUrl = `https://www.youtube.com/watch?v=${media.trailer.id}`;
    }

    const releaseYear = media.seasonYear?.toString();
    const anilistUrl = media.id ? `https://anilist.co/anime/${media.id}` : undefined;
    const genres = media.genres || [];
    
    // Get original title (romaji preferred over english)
    const originalTitle = media.title?.romaji || media.title?.english;
    
    // Get episode count
    const episodeCount = media.episodes ? `${media.episodes} eps` : undefined;
    
    // Clean HTML from description
    const synopsis = media.description 
      ? media.description.replace(/<[^>]*>/g, '').substring(0, 500)
      : undefined;
    
    // Convert score from 0-100 to 0-10
    const score = media.averageScore ? media.averageScore / 10 : undefined;

    console.log(`✅ AniList result for "${title}":`, {
      hasCover: !!coverImage,
      hasTrailer: !!trailerUrl,
      year: releaseYear,
      score: score,
      genres: genres.length,
      originalTitle: originalTitle,
      episodeCount: episodeCount
    });

    return { coverImage, trailerUrl, releaseYear, anilistUrl, genres, synopsis, score, originalTitle, episodeCount };

  } catch (error) {
    console.error(`Error searching AniList for "${title}":`, error);
    return {};
  }
};

