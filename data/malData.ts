import type { AnimeEntry } from '../types';

// This function takes the live list and returns titles that should be excluded from recommendations.
export const getExcludedAnimeTitles = (allEntries: AnimeEntry[]): string[] => {
  const excludedStatuses = ['Completed', 'Watching', 'On-Hold', 'Dropped'];
  const excludedEntries = allEntries.filter(entry => 
    entry.status && excludedStatuses.includes(entry.status)
  );
  return Array.from(new Set(excludedEntries.map(anime => anime.title)));
};

// This function takes the live list and returns titles from the user's "Plan to Watch" list.
export const getPlanToWatchTitles = (allEntries: AnimeEntry[]): string[] => {
  const ptwEntries = allEntries.filter(entry => entry.status === 'Plan to Watch');
  return Array.from(new Set(ptwEntries.map(anime => anime.title)));
};

// This function takes the live list and returns all entries that are part of the user's collection (not PTW).
export const getAllUserAnimeEntries = (allEntries: AnimeEntry[]): AnimeEntry[] => {
    const excludedStatuses = ['Completed', 'Watching', 'On-Hold', 'Dropped'];
    return allEntries.filter(entry => 
        entry.status && excludedStatuses.includes(entry.status)
    );
};
