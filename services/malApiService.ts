// This service is responsible for fetching and parsing user's MAL data directly from the MyAnimeList API.
import { AnimeEntry } from '../types';

// Helper to map MAL API status strings to our internal, more readable format.
const mapMalStatus = (status: string): AnimeEntry['status'] => {
    switch (status) {
        case 'watching':
            return 'Watching';
        case 'completed':
            return 'Completed';
        case 'on_hold':
            return 'On-Hold';
        case 'dropped':
            return 'Dropped';
        case 'plan_to_watch':
            return 'Plan to Watch';
        default:
            return undefined;
    }
}

const MAL_BASE = 'https://api.myanimelist.net';

// Use proxy: 1) VITE_MAL_PROXY_URL (for static hosts like one.com), 2) same-origin /api/mal-proxy (Vercel), 3) CORS fallbacks.
// When using our proxy we send NO custom headers so the request is a "simple" GET and the browser does not send a preflight (avoids OPTIONS 500).
// The proxy uses MAL_CLIENT_ID from server env (set in Vercel). Fallbacks still send X-MAL-CLIENT-ID.
async function fetchWithMalProxy(url: string, clientId: string): Promise<Response> {
    const proxyBase =
        (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_MAL_PROXY_URL) ||
        (typeof window !== 'undefined' ? window.location.origin : '');
    const proxyUrl = `${proxyBase.replace(/\/$/, '')}/api/mal-proxy?path=${encodeURIComponent(url)}`;
    // No custom headers → simple GET → no preflight
    let res = await fetch(proxyUrl);
    if (res.ok || res.status === 400) return res;
    const headers = { 'X-MAL-CLIENT-ID': clientId };
    // Fallback 1: cors-anywhere (forwards headers; may require one-time "request access" in browser)
    try {
        res = await fetch('https://cors-anywhere.herokuapp.com/' + url, { headers });
        if (res.ok) return res;
    } catch {
        /* ignore */
    }
    // Fallback 2: corsproxy.io (sometimes returns 403; try as last resort)
    return fetch('https://corsproxy.io/?' + url, { headers });
}

export const fetchUserAnimeList = async (username: string, clientId: string): Promise<AnimeEntry[]> => {
    if (!clientId) {
        throw new Error("MyAnimeList Client ID is not configured.");
    }
    if (!username) {
        throw new Error("MyAnimeList Username is not configured.");
    }

    const apiUrl = `${MAL_BASE}/v2/users/${username}/animelist`;
    let allAnime: AnimeEntry[] = [];
    // By explicitly requesting sub-fields for list_status, we guarantee the API returns them.
    // Also request alternative_titles to get English titles, and genres/start_date for smart filtering
    let nextUrl: string | null = `${apiUrl}?fields=list_status{score,finish_date,status},alternative_titles,genres,start_date&limit=1000&nsfw=true`;

    try {
        // The MAL API uses pagination, so we need to fetch all pages.
        while (nextUrl) {
            const response = await fetchWithMalProxy(nextUrl, clientId);

            if (!response.ok) {
                 const errorBody = await response.text();
                 throw new Error(`Failed to fetch from MAL API: ${response.status} ${response.statusText}. Response: ${errorBody}`);
            }

            const pageData = await response.json();
            
            const transformedData = pageData.data.map((item: any) => {
                // Prefer English title if available, otherwise use default title
                const englishTitle = item.node.alternative_titles?.en;
                const title = englishTitle || item.node.title;
                
                // Extract genres
                const genres = item.node.genres?.map((g: any) => g.name) || [];
                
                // Extract release year from start_date
                const releaseYear = item.node.start_date?.substring(0, 4);
                
                return {
                    title: title,
                    score: item.list_status.score === 0 ? undefined : item.list_status.score,
                    finishDate: item.list_status.finish_date,
                    status: mapMalStatus(item.list_status.status),
                    genres: genres.length > 0 ? genres : undefined,
                    releaseYear: releaseYear || undefined
                };
            });
            
            allAnime = [...allAnime, ...transformedData];
            // The 'next' URL from the API will be the original URL, so the loop will automatically proxy it on the next iteration.
            nextUrl = pageData.paging?.next || null;
        }
        
        return allAnime.filter(entry => entry.title && entry.status);
    } catch (error) {
        console.error("Error fetching or parsing MAL API data:", error);
        // Re-throw the error to be caught by the UI component
        throw error;
    }
};

export const searchAnime = async (title: string, clientId: string, isManga: boolean = false): Promise<{ coverImage?: string; trailerUrl?: string; releaseYear?: string; malUrl?: string; malId?: number; genres?: string[]; synopsis?: string; score?: number; originalTitle?: string; episodeCount?: string }> => {
    if (!clientId) {
        console.warn("MyAnimeList Client ID is not configured for search.");
        return {};
    }

    const mediaType = isManga ? 'manga' : 'anime';
    const fields = isManga 
        ? 'id,main_picture,start_date,genres,synopsis,mean,alternative_titles,num_volumes' 
        : 'id,main_picture,promotional_videos,start_date,genres,synopsis,mean,alternative_titles,num_episodes';
    const apiUrl = `${MAL_BASE}/v2/${mediaType}?q=${encodeURIComponent(title)}&limit=1&fields=${fields}`;

    try {
        console.log(`🔍 Searching MAL for: "${title}"`);
        const response = await fetchWithMalProxy(apiUrl, clientId);

        if (!response.ok) {
            console.error(`❌ Failed to search for anime "${title}": ${response.status}`);
            return {};
        }

        const result = await response.json();
        const node = result.data?.[0]?.node;

        if (!node) {
            console.warn(`⚠️ No search result found for ${mediaType}: "${title}"`);
            return {};
        }

        let coverImage = node.main_picture?.large || node.main_picture?.medium;
        const trailerUrl = isManga ? undefined : node.promotional_videos?.[0]?.trailer?.url;
        const releaseYear = node.start_date?.substring(0, 4);
        const malUrl = node.id ? `https://myanimelist.net/${mediaType}/${node.id}` : undefined;
        const genres = node.genres?.map((g: any) => g.name) || [];
        const synopsis = node.synopsis || '';
        const score = node.mean || 0;
        
        // Get original title (Japanese/Romaji)
        const originalTitle = node.alternative_titles?.ja || node.alternative_titles?.en || '';
        
        // Get episode count
        const episodeCount = isManga 
            ? (node.num_volumes ? `${node.num_volumes} vols` : undefined)
            : (node.num_episodes ? `${node.num_episodes} eps` : undefined);

        // If MAL didn't provide a cover image, try Jikan API as fallback
        if (!coverImage) {
            console.log(`🎨 MAL has no cover for "${title}", trying Jikan API...`);
            try {
                const jikanMediaType = isManga ? 'manga' : 'anime';
                const jikanUrl = `https://api.jikan.moe/v4/${jikanMediaType}?q=${encodeURIComponent(title)}&limit=1`;
                const jikanResponse = await fetch(jikanUrl);
                
                if (jikanResponse.ok) {
                    const jikanData = await jikanResponse.json();
                    const jikanItem = jikanData.data?.[0];
                    if (jikanItem?.images?.jpg?.large_image_url) {
                        coverImage = jikanItem.images.jpg.large_image_url;
                        console.log(`✅ Jikan provided cover for "${title}"`);
                    }
                }
            } catch (jikanError) {
                console.warn(`Jikan fallback failed for "${title}":`, jikanError);
            }
        }

        console.log(`✅ Final result for "${title}":`, { 
            hasCover: !!coverImage, 
            hasTrailer: !!trailerUrl, 
            year: releaseYear,
            malId: node.id,
            genres: genres.length,
            score: score,
            originalTitle: originalTitle,
            episodeCount: episodeCount
        });

        return { coverImage, trailerUrl, releaseYear, malUrl, malId: node.id, genres, synopsis, score, originalTitle, episodeCount };

    } catch (error) {
        console.error(`Error during anime search for "${title}":`, error);
        return {};
    }
};