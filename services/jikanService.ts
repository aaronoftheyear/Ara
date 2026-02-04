// Jikan API service for fetching character images and seasonal anime

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MIN_INTERVAL_MS = 500;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;

const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const LONG_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const UPCOMING_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const CHARACTER_IMAGE_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const cacheStore = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

const getCachedValue = <T>(key: string): T | undefined => {
  const entry = cacheStore.get(key);
  if (!entry) return undefined;
  if (Date.now() >= entry.expiresAt) {
    cacheStore.delete(key);
    return undefined;
  }
  return entry.value as T;
};

const setCachedValue = <T>(key: string, value: T, ttlMs: number) => {
  cacheStore.set(key, {
    expiresAt: Date.now() + ttlMs,
    value,
  });
};

const fetchWithCache = async <T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> => {
  const cached = getCachedValue<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  const pending = inFlightRequests.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  const taskPromise = (async () => {
    try {
      const result = await fetcher();
      setCachedValue(key, result, ttlMs);
      return result;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, taskPromise);
  return taskPromise;
};

let rateLimitQueue: Promise<unknown> = Promise.resolve();
let lastExecution = 0;

const enqueueWithRateLimit = <T>(task: () => Promise<T>): Promise<T> => {
  const runner = async () => {
    const now = Date.now();
    const waitTime = Math.max(0, MIN_INTERVAL_MS - (now - lastExecution));
    if (waitTime > 0) {
      await sleep(waitTime);
    }
    lastExecution = Date.now();
    return task();
  };

  rateLimitQueue = rateLimitQueue.then(runner, runner);
  return rateLimitQueue as Promise<T>;
};

const rateLimitedFetch = async (url: string, label: string, options?: RequestInit): Promise<Response> => {
  return enqueueWithRateLimit(async () => {
    let attempt = 0;
    let delayMs = RETRY_BASE_DELAY_MS;

    while (attempt < MAX_RETRIES) {
      try {
        const response = await fetch(url, options);

        if (response.status === 429) {
          attempt += 1;
          console.warn(`⚠️ Jikan rate limit hit for ${label}. Attempt ${attempt}/${MAX_RETRIES}.`);
          if (attempt >= MAX_RETRIES) {
            return response;
          }
          await sleep(delayMs);
          delayMs *= 2;
          continue;
        }

        return response;
      } catch (error) {
        attempt += 1;
        console.warn(`⚠️ Jikan request error for ${label}. Attempt ${attempt}/${MAX_RETRIES}.`, error);
        if (attempt >= MAX_RETRIES) {
          throw error;
        }
        await sleep(delayMs);
        delayMs *= 2;
      }
    }

    // Final fallback (should rarely reach here)
    return fetch(url, options);
  });
};

const fetchJikanJson = async <T>(url: string, label: string): Promise<{ ok: boolean; status: number; data: T | null }> => {
  const response = await rateLimitedFetch(url, label);
  const status = response.status;

  if (!response.ok) {
    return { ok: false, status, data: null };
  }

  try {
    const data = (await response.json()) as T;
    return { ok: true, status, data };
  } catch (error) {
    console.error(`Error parsing JSON for ${label}:`, error);
    return { ok: false, status, data: null };
  }
};

export const fetchCharacterImage = async (characterName: string): Promise<string | null> => {
    const cacheKey = `character-image:${characterName.toLowerCase()}`;

    return fetchWithCache(cacheKey, CHARACTER_IMAGE_CACHE_TTL_MS, async () => {
        try {
            console.log(`🎭 Fetching character image for: "${characterName}"`);
            
            const searchUrl = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(characterName)}&limit=1`;
            const { ok, status, data } = await fetchJikanJson<{ data?: any[] }>(searchUrl, `character image for "${characterName}"`);

            if (!ok || !data) {
                console.error(`Failed to fetch character image (${status})`);
                return null;
            }

            const character = data.data?.[0];

            if (!character) {
                console.warn(`No character found for: "${characterName}"`);
                return null;
            }

            const imageUrl = character.images?.jpg?.image_url || character.images?.webp?.image_url;

            if (imageUrl) {
                console.log(`✅ Found character image for "${characterName}"`);
            } else {
                console.warn(`⚠️ No image available for "${characterName}"`);
            }

            return imageUrl || null;
        } catch (error) {
            console.error(`Error fetching character image for "${characterName}":`, error);
            return null;
        }
    });
};

/**
 * Fetch seasonal anime from Jikan API
 * @param year - The year (e.g., 2025)
 * @param season - The season (winter, spring, summer, fall)
 * @returns Array of anime titles from that season
 */
export const fetchSeasonalAnime = async (year: number, season: string): Promise<string[]> => {
    const normalizedSeason = season.toLowerCase();
    const cacheKey = `seasonal:${year}:${normalizedSeason}`;

    return fetchWithCache(cacheKey, LONG_CACHE_TTL_MS, async () => {
        try {
            console.log(`📅 Fetching ${normalizedSeason} ${year} anime from Jikan API...`);
            
            const url = `https://api.jikan.moe/v4/seasons/${year}/${normalizedSeason}`;
            const { ok, status, data } = await fetchJikanJson<{ data?: any[] }>(url, `season ${normalizedSeason} ${year}`);

            if (!ok || !data) {
                console.error(`❌ Failed to fetch seasonal anime: ${status}`);
                return [];
            }

            const animeList = data.data || [];
            const titles = animeList
                .map((anime: any) => anime.title_english || anime.title || '')
                .filter((title: string) => title);
            
            console.log(`✅ Found ${titles.length} anime in ${normalizedSeason} ${year}`);
            return titles;
            
        } catch (error) {
            console.error(`Error fetching seasonal anime for ${normalizedSeason} ${year}:`, error);
            return [];
        }
    });
};

/**
 * Fetch upcoming/not yet aired anime from Jikan API
 * @returns Array of upcoming anime with titles and release dates
 */
export const fetchUpcomingAnime = async (): Promise<{ title: string; releaseDate?: string }[]> => {
    const cacheKey = 'seasonal:upcoming';

    return fetchWithCache(cacheKey, UPCOMING_CACHE_TTL_MS, async () => {
        try {
            console.log(`🚀 Fetching upcoming anime from Jikan API...`);
            
            const url = `https://api.jikan.moe/v4/seasons/upcoming`;
            const { ok, status, data } = await fetchJikanJson<{ data?: any[] }>(url, 'upcoming seasons');

            if (!ok || !data) {
                console.error(`❌ Failed to fetch upcoming anime: ${status}`);
                return [];
            }

            const animeList = data.data || [];
            const upcomingAnime = animeList
                .map((anime: any) => ({
                    title: anime.title_english || anime.title || '',
                    releaseDate: anime.aired?.from || anime.aired?.prop?.from?.string,
                }))
                .filter((anime: any) => anime.title);
            
            console.log(`✅ Found ${upcomingAnime.length} upcoming anime`);
            return upcomingAnime;
            
        } catch (error) {
            console.error(`Error fetching upcoming anime:`, error);
            return [];
        }
    });
};

/**
 * Fetch anime reviews from Jikan API
 * @param malId - MyAnimeList anime ID
 * @returns Array of review excerpts or empty array
 */
export const fetchAnimeReviews = async (malId: number): Promise<string[]> => {
    const cacheKey = `anime-reviews:${malId}`;

    return fetchWithCache(cacheKey, DEFAULT_CACHE_TTL_MS, async () => {
        try {
            console.log(`📝 Fetching reviews for anime ID: ${malId}`);
            
            const url = `https://api.jikan.moe/v4/anime/${malId}/reviews`;
            const { ok, status, data } = await fetchJikanJson<{ data?: any[] }>(url, `reviews for anime ${malId}`);

            if (!ok || !data) {
                console.error(`❌ Failed to fetch reviews: ${status}`);
                return [];
            }

            const reviews = data.data || [];
            const reviewExcerpts = reviews
                .slice(0, 3)
                .map((review: any) => {
                    const content = review.review || '';
                    return content.substring(0, 200) + (content.length > 200 ? '...' : '');
                })
                .filter((excerpt: string) => excerpt);
            
            console.log(`✅ Found ${reviewExcerpts.length} review excerpts`);
            return reviewExcerpts;
            
        } catch (error) {
            console.error(`Error fetching anime reviews:`, error);
            return [];
        }
    });
};

/**
 * Fetch anime recommendations from Jikan API
 * @param malId - MyAnimeList anime ID
 * @returns Array of recommended anime titles
 */
export const fetchAnimeRecommendations = async (malId: number): Promise<{ title: string; count: number }[]> => {
    const cacheKey = `anime-recommendations:${malId}`;

    return fetchWithCache(cacheKey, DEFAULT_CACHE_TTL_MS, async () => {
        try {
            console.log(`💡 Fetching recommendations for anime ID: ${malId}`);
            
            const url = `https://api.jikan.moe/v4/anime/${malId}/recommendations`;
            const { ok, status, data } = await fetchJikanJson<{ data?: any[] }>(url, `recommendations for anime ${malId}`);

            if (!ok || !data) {
                console.error(`❌ Failed to fetch recommendations: ${status}`);
                return [];
            }

            const recommendations = data.data || [];
            const recommendedTitles = recommendations
                .map((rec: any) => ({
                    title: rec.entry?.title || rec.entry?.title_english || '',
                    count: rec.votes || 0,
                }))
                .filter((rec: any) => rec.title);
            
            console.log(`✅ Found ${recommendedTitles.length} recommendations`);
            return recommendedTitles;
            
        } catch (error) {
            console.error(`Error fetching anime recommendations:`, error);
            return [];
        }
    });
};

