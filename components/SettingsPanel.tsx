import React, { useEffect, useState } from 'react';
import type { Settings, AnimeEntry } from '../types';
import { ASSISTANT_CHARACTERS } from '../data/characters';
import { 
  isCharacterUnlocked, 
  CHARACTER_UNLOCKS,
  checkUnlockCondition 
} from '../data/characterUnlockSystem';
import { EyeIcon, EyeSlashIcon } from './icons';

interface SettingsPanelProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  planToWatchCount: number;
  unlockedCharacters: string[];
  onUnlockAllCharacters: () => void;
  onSetCharacterUnlockState: (characterId: string, shouldUnlock: boolean) => void;
  userAnimeList: AnimeEntry[];
  onOpenDeveloperScreen?: () => void;
  isTransparencyPanelOpen: boolean;
  onToggleExclusionList: () => void;
  onRequestClose?: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  settings, 
  setSettings, 
  planToWatchCount,
  unlockedCharacters,
  onUnlockAllCharacters,
  onSetCharacterUnlockState,
  userAnimeList,
  onOpenDeveloperScreen,
  isTransparencyPanelOpen,
  onToggleExclusionList,
  onRequestClose
}) => {
  const [showUnlockStatus, setShowUnlockStatus] = useState(false);
  const [mockAiMode, setMockAiMode] = useState(() => localStorage.getItem('mock_ai_mode') === 'true');
  const [devAccessCode, setDevAccessCode] = useState('');
  const [devUnlocked, setDevUnlocked] = useState(() => localStorage.getItem('dev_access_granted') === 'true');
  const [devError, setDevError] = useState('');

  const handleUnlockAll = () => {
    onUnlockAllCharacters();
    alert('All characters unlocked! (Dev Mode)');
  };

  const toggleMockAiMode = () => {
    const newValue = !mockAiMode;
    setMockAiMode(newValue);
    localStorage.setItem('mock_ai_mode', String(newValue));
    alert(newValue ? '🤖 Mock AI Mode ENABLED - No API calls will be made' : '✅ Mock AI Mode DISABLED - Normal AI responses');
  };

  useEffect(() => {
    if (devUnlocked) {
      setDevError('');
    }
  }, [devUnlocked]);

  const handleDevUnlock = (event: React.FormEvent) => {
    event.preventDefault();
    if (devAccessCode.trim() === '5656') {
      setDevUnlocked(true);
      localStorage.setItem('dev_access_granted', 'true');
      setDevAccessCode('');
      setDevError('');
    } else {
      setDevError('Access denied. Please verify the code.');
    }
  };

  const handleDevLock = () => {
    setDevUnlocked(false);
    localStorage.removeItem('dev_access_granted');
    setShowUnlockStatus(false);
  };

  // Check franchise status for each character
  const getCharacterUnlockStatus = (characterId: string) => {
    const unlockData = CHARACTER_UNLOCKS.find(c => c.characterId === characterId);
    if (!unlockData) return { franchiseWatched: false, franchiseName: 'Unknown' };
    
    const franchiseCondition = unlockData.unlockConditions.find(c => c.type === 'franchise_seen');
    if (!franchiseCondition || !Array.isArray(franchiseCondition.value)) {
      return { franchiseWatched: true, franchiseName: 'Always Available' };
    }
    
    const userTitles = userAnimeList.map(a => a.title);
    const franchiseWatched = checkUnlockCondition(
      franchiseCondition, 
      '', 
      undefined, 
      userTitles
    );
    
    return { 
      franchiseWatched, 
      franchiseName: (franchiseCondition.value as string[])[0] 
    };
  };
  return (
    <div className="bg-gray-800/60 p-4 border-b border-gray-700/50 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-200">Assistant Settings</h2>
          {onRequestClose && (
            <button
              onClick={onRequestClose}
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Close
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minimum MAL Score
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5.0"
                max="10.0"
                step="0.1"
                value={settings.minScore}
                onChange={(e) => setSettings(s => ({ ...s, minScore: parseFloat(e.target.value) }))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-sm font-semibold text-cyan-300 w-12 text-right">
                {settings.minScore.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Include "Plan to Watch" list</p>
              <p className="text-xs text-gray-500">{planToWatchCount} entries available</p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                id="ptw-checkbox"
                type="checkbox"
                checked={settings.recommendFromPTW}
                onChange={(e) => setSettings(s => ({ ...s, recommendFromPTW: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-cyan-500 transition-colors"></div>
            </label>
          </div>

          <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-300 mb-3">Active Exclusion List</p>
            <button
              onClick={onToggleExclusionList}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700"
            >
              {isTransparencyPanelOpen ? <EyeSlashIcon className="w-5 h-5 text-cyan-300" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
              {isTransparencyPanelOpen ? 'Hide Active Exclusion List' : 'Show Active Exclusion List'}
            </button>
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">Developer Access</h3>
              <p className="text-xs text-gray-500">Enter access code to manage advanced diagnostics.</p>
            </div>
            {devUnlocked ? (
              <button
                onClick={handleDevLock}
                className="self-start sm:self-auto px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded hover:bg-gray-700"
              >
                Lock Developer Mode
              </button>
            ) : null}
          </div>

          {!devUnlocked ? (
            <form onSubmit={handleDevUnlock} className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={devAccessCode}
                onChange={(e) => setDevAccessCode(e.target.value)}
                placeholder="Enter developer code"
                className="w-full sm:w-auto flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Unlock
              </button>
              {devError && <p className="text-xs text-red-400 sm:self-center">{devError}</p>}
            </form>
          ) : (
            <div className="mt-4 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-4">
                  <label htmlFor="character-select" className="block text-sm font-medium text-gray-300 mb-2">
                    Assistant Character Override
                  </label>
                  <select
                    id="character-select"
                    value={settings.assistantCharacter || ''}
                    onChange={(e) => setSettings(s => ({ ...s, assistantCharacter: e.target.value || undefined }))}
                    className="w-full bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 p-2.5"
                  >
                    <option value="">Random (changes each session)</option>
                    {ASSISTANT_CHARACTERS.map(char => {
                      const locked = !isCharacterUnlocked(char.id, unlockedCharacters);
                      return (
                        <option key={char.id} value={char.id} disabled={locked}>
                          {locked ? '🔒 ' : ''}{char.name} ({char.anime})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Hard Filters (Always Active)</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-900 text-red-300 opacity-75">Completed</span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-900 text-yellow-300 opacity-75">On Hold</span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-900 text-blue-300 opacity-75">Watching</span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-700 text-gray-300 opacity-75">Dropped</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleUnlockAll}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🔓 Unlock All Characters
                </button>
                <button
                  onClick={() => setShowUnlockStatus(!showUnlockStatus)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {showUnlockStatus ? '👁️ Hide Unlock Status' : '👁️ Show Unlock Status'}
                </button>
                <button
                  onClick={toggleMockAiMode}
                  className={`px-4 py-2 ${mockAiMode ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 hover:bg-gray-500'} text-white rounded-lg text-sm font-medium transition-colors`}
                >
                  {mockAiMode ? '🤖 Mock AI: ON' : '🤖 Mock AI: OFF'}
                </button>
                {onOpenDeveloperScreen && (
                  <button
                    onClick={onOpenDeveloperScreen}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    🔧 Open Developer Visualization
                  </button>
                )}
              </div>

              {showUnlockStatus && (
                <div className="bg-gray-900/80 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-sm font-bold text-yellow-400 mb-3">Character Unlock Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ASSISTANT_CHARACTERS.map(char => {
                      const status = getCharacterUnlockStatus(char.id);
                      const unlocked = isCharacterUnlocked(char.id, unlockedCharacters);
                      return (
                        <div 
                          key={char.id}
                          className={`p-2 rounded text-xs ${
                            unlocked
                              ? 'bg-green-900/30 border border-green-700'
                              : status.franchiseWatched
                                ? 'bg-yellow-900/30 border border-yellow-700'
                                : 'bg-red-900/30 border border-red-700'
                          }`}
                        >
                          <div className="font-semibold">
                            {unlocked ? '✅' : status.franchiseWatched ? '⚠️' : '❌'} {char.name}
                          </div>
                          <div className="text-gray-400 mt-1">
                            Franchise: {status.franchiseName}
                          </div>
                          <div className={`mt-1 ${status.franchiseWatched ? 'text-green-400' : 'text-red-400'}`}>
                            {status.franchiseWatched ? '✓ Watched' : '✗ Not Watched'}
                          </div>
                          {unlocked && <div className="text-cyan-400 mt-1">🔓 UNLOCKED</div>}
                          {!unlocked && status.franchiseWatched && (
                            <div className="text-yellow-400 mt-1">⚠️ Ready to unlock (franchise watched)</div>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => onSetCharacterUnlockState(char.id, true)}
                              disabled={unlocked}
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                unlocked
                                  ? 'bg-green-900/40 text-green-200 opacity-70 cursor-not-allowed'
                                  : 'bg-green-700 text-white'
                              }`}
                            >
                              Unlock
                            </button>
                            <button
                              type="button"
                              onClick={() => onSetCharacterUnlockState(char.id, false)}
                              disabled={!unlocked}
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                !unlocked
                                  ? 'bg-gray-700 text-gray-400 opacity-70 cursor-not-allowed'
                                  : 'bg-red-700 text-white'
                              }`}
                            >
                              Relock
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;