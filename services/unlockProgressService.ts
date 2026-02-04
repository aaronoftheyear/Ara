export interface CharacterUnlockProgress {
  helperGenres: Record<string, string[]>;
  genreHelpers: Record<string, string[]>;
}

export type UnlockProgressState = Record<string, CharacterUnlockProgress>;

const STORAGE_KEY = 'unlock_progress_state_v1';

const ensureRecordEntry = (record: Record<string, string[]>, key: string) => {
  if (!record[key]) {
    record[key] = [];
  }
  return record[key];
};

const addUniqueValue = (arr: string[], value: string): boolean => {
  if (arr.includes(value)) {
    return false;
  }
  arr.push(value);
  return true;
};

export const loadUnlockProgress = (): UnlockProgressState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as UnlockProgressState;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('Failed to load unlock progress state:', error);
    return {};
  }
};

export const saveUnlockProgress = (state: UnlockProgressState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save unlock progress state:', error);
  }
};

export const clearUnlockProgressFor = (state: UnlockProgressState, characterId: string): UnlockProgressState => {
  if (state[characterId]) {
    const newState = { ...state };
    delete newState[characterId];
    saveUnlockProgress(newState);
    return newState;
  }
  return state;
};

export type WeaknessHitResult = 'none' | 'discover' | 'unlock';

export const registerWeaknessHit = (
  state: UnlockProgressState,
  targetCharacterId: string,
  helperCharacterId: string,
  genre: string
): { state: UnlockProgressState; result: WeaknessHitResult } => {
  if (!genre) {
    return { state, result: 'none' };
  }

  const normalizedGenre = genre.toLowerCase();
  const progress = state[targetCharacterId] ?? { helperGenres: {}, genreHelpers: {} };

  const helperGenres = ensureRecordEntry(progress.helperGenres, helperCharacterId);
  const genreHelpers = ensureRecordEntry(progress.genreHelpers, normalizedGenre);

  const prevHelperGenreCount = helperGenres.length;
  const prevGenreHelperCount = genreHelpers.length;

  const addedToHelper = addUniqueValue(helperGenres, normalizedGenre);
  const addedToGenre = addUniqueValue(genreHelpers, helperCharacterId);

  if (!addedToHelper && !addedToGenre) {
    return { state, result: 'none' };
  }

  const newState: UnlockProgressState = {
    ...state,
    [targetCharacterId]: {
      helperGenres: { ...progress.helperGenres, [helperCharacterId]: helperGenres },
      genreHelpers: { ...progress.genreHelpers, [normalizedGenre]: genreHelpers }
    },
  };

  saveUnlockProgress(newState);

  const newHelperGenreCount = helperGenres.length;
  const newGenreHelperCount = genreHelpers.length;

  if (newHelperGenreCount === 1 && newGenreHelperCount === 1) {
    return { state: newState, result: 'discover' };
  }

  if (newHelperGenreCount >= 2 || newGenreHelperCount >= 2) {
    return { state: newState, result: 'unlock' };
  }

  return { state: newState, result: 'none' };
};
