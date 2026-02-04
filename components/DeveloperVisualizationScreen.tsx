import React, { useState, useEffect } from 'react';
import { ASSISTANT_CHARACTERS } from '../data/characters';
import { 
  initializeDiscoveryStates, 
  getDiscoveryState,
  canUnlockCharacter,
  CHARACTER_FRANCHISES
} from '../data/characterUnlockSystem';
import { getBuddiesForCharacter } from '../data/characterBuddies';
import { getCharacterExpertise, isCharacterWeak } from '../data/characterExpertise';
import { CHARACTER_ERA_EXPERTISE, AnimeEra } from '../data/animeEras';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, ArrowPathIcon } from './icons';

interface DeveloperVisualizationScreenProps {
  onBack: () => void;
  userAnimeList: Array<{ title: string; status?: string; score?: number }>;
  unlockedCharacters: string[];
  discoveryStates: Array<{ characterId: string; discoveryCount: number; discoveredVia?: string; discoveredAt?: number; franchises: string[] }>;
}

const DeveloperVisualizationScreen: React.FC<DeveloperVisualizationScreenProps> = ({
  onBack,
  userAnimeList,
  unlockedCharacters,
  discoveryStates
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'unlock-status' | 'buddy-network' | 'expertise-map' | 'eras' | 'monitoring'>('overview');
  const [activeUsers, setActiveUsers] = useState<{ count: number; sessions: Array<{ sessionId: string; lastActive: string; minutesAgo: number }> } | null>(null);
  const [errors, setErrors] = useState<Array<{ id: string; message: string; stack: string; userAgent: string; url: string; timestamp: string }>>([]);
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState(false);
  const [showFranchiseDetails, setShowFranchiseDetails] = useState(false);
  const [showBuddyDetails, setShowBuddyDetails] = useState(false);

  // Get user's watched anime titles
  const userTitles = userAnimeList.map(anime => anime.title);

  // Helper function to get character unlock status
  const getCharacterUnlockStatus = (characterId: string) => {
    const isUnlocked = unlockedCharacters.includes(characterId);
    const discoveryState = getDiscoveryState(characterId, discoveryStates);
    const canUnlock = canUnlockCharacter(characterId, userTitles);
    
    return {
      isUnlocked,
      discoveryCount: discoveryState?.discoveryCount || 0,
      discoveredVia: discoveryState?.discoveredVia,
      canUnlock,
      franchises: CHARACTER_FRANCHISES[characterId] || []
    };
  };

  // Helper function to check if franchise is watched
  const isFranchiseWatched = (franchises: string[]) => {
    return franchises.some(franchise => 
      userTitles.some(title => 
        title.toLowerCase().includes(franchise.toLowerCase()) ||
        franchise.toLowerCase().includes(title.toLowerCase())
      )
    );
  };

  // Fetch monitoring data
  const fetchMonitoringData = async () => {
    setIsLoadingMonitoring(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      
      // Fetch active users
      const usersResponse = await fetch(`${API_BASE_URL}/active-users`);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setActiveUsers(usersData);
      } else if (usersResponse.status === 404) {
        // API not deployed yet - show message
        setActiveUsers({ count: 0, sessions: [] });
      }
      
      // Fetch errors
      const errorsResponse = await fetch(`${API_BASE_URL}/errors?limit=50`);
      if (errorsResponse.ok) {
        const errorsData = await errorsResponse.json();
        setErrors(errorsData.errors || []);
      } else if (errorsResponse.status === 404) {
        // API not deployed yet
        setErrors([]);
      }
    } catch (error) {
      // API not available - silently fail
      setActiveUsers({ count: 0, sessions: [] });
      setErrors([]);
    } finally {
      setIsLoadingMonitoring(false);
    }
  };

  // Auto-refresh when monitoring tab is active
  useEffect(() => {
    if (activeTab === 'monitoring') {
      fetchMonitoringData();
      const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Monitoring Tab Component
  const MonitoringTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-900/80 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cyan-400">📊 System Monitoring</h3>
          <button
            onClick={fetchMonitoringData}
            disabled={isLoadingMonitoring}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoadingMonitoring ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Active Users */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-white mb-3">👥 Active Users</h4>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {activeUsers?.count ?? 0}
            </div>
            <div className="text-sm text-gray-400">Users active in last 5 minutes</div>
            {activeUsers && activeUsers.sessions.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-xs text-gray-500 font-semibold">Recent Sessions:</div>
                {activeUsers.sessions.slice(0, 5).map((session) => (
                  <div key={session.sessionId} className="text-xs text-gray-400">
                    {session.sessionId.substring(0, 20)}... - {session.minutesAgo} min ago
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error Logs */}
        <div>
          <h4 className="text-md font-semibold text-white mb-3">⚠️ Recent Errors ({errors.length})</h4>
          <div className="bg-gray-800/50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {errors.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-4">No errors logged</div>
            ) : (
              <div className="space-y-3">
                {errors.map((error) => (
                  <div key={error.id} className="bg-gray-900/50 rounded p-3 border border-red-800/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-semibold text-red-400 flex-1">
                        {error.message}
                      </div>
                      <div className="text-xs text-gray-500 ml-2">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    {error.stack && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                          Stack Trace
                        </summary>
                        <pre className="text-xs text-gray-600 mt-2 p-2 bg-gray-900/50 rounded overflow-x-auto">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      <div>URL: {error.url}</div>
                      <div className="truncate">UA: {error.userAgent}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Get franchise name for display
  const getFranchiseName = (characterId: string) => {
    const franchises = CHARACTER_FRANCHISES[characterId] || [];
    return franchises[0] || 'Unknown';
  };

  // Overview Tab Component
  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-900/80 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">📊 System Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{unlockedCharacters.length}</div>
            <div className="text-sm text-gray-400">Unlocked Characters</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {discoveryStates.filter(s => s.discoveryCount === 1).length}
            </div>
            <div className="text-sm text-gray-400">Discovered Characters</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">
              {ASSISTANT_CHARACTERS.length - unlockedCharacters.length - discoveryStates.filter(s => s.discoveryCount === 1).length}
            </div>
            <div className="text-sm text-gray-400">Locked Characters</div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-md font-semibold text-white mb-3">🎯 User Data</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-xl font-bold text-blue-400">{userTitles.length}</div>
              <div className="text-sm text-gray-400">Total Anime Entries</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-xl font-bold text-purple-400">
                {userAnimeList.filter(a => a.status === 'Completed').length}
              </div>
              <div className="text-sm text-gray-400">Completed Anime</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/80 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">🔓 Quick Actions</h3>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('unlock-status')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            📋 View Unlock Status
          </button>
          
          <button
            onClick={() => setActiveTab('buddy-network')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            🤝 View Buddy Network
          </button>
          
          <button
            onClick={() => setActiveTab('expertise-map')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            🎯 View Expertise Map
          </button>
        </div>
      </div>
    </div>
  );

  // Unlock Status Tab Component
  const UnlockStatusTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-900/80 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cyan-400">🔓 Character Unlock Status</h3>
          <button
            onClick={() => setShowFranchiseDetails(!showFranchiseDetails)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
          >
            {showFranchiseDetails ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            {showFranchiseDetails ? 'Hide' : 'Show'} Franchise Details
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ASSISTANT_CHARACTERS.map(char => {
            const status = getCharacterUnlockStatus(char.id);
            const franchiseWatched = isFranchiseWatched(status.franchises);
            
            return (
              <div 
                key={char.id}
                className={`p-4 rounded-lg border-2 ${
                  status.isUnlocked 
                    ? 'bg-green-900/30 border-green-500' 
                    : status.discoveryCount === 1
                      ? 'bg-yellow-900/30 border-yellow-500'
                      : franchiseWatched
                        ? 'bg-orange-900/30 border-orange-500'
                        : 'bg-red-900/30 border-red-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <img 
                    src={char.imagePath} 
                    alt={char.name}
                    className={`w-12 h-12 rounded-full object-cover ${
                      status.isUnlocked ? '' : status.discoveryCount === 1 ? 'opacity-70' : 'opacity-50'
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-white">
                      {status.isUnlocked ? '✅' : status.discoveryCount === 1 ? '🔍' : franchiseWatched ? '⚠️' : '❌'} {char.name}
                    </div>
                    <div className="text-xs text-gray-400">{char.anime}</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    status.isUnlocked 
                      ? 'bg-green-700 text-green-100' 
                      : status.discoveryCount === 1
                        ? 'bg-yellow-700 text-yellow-100'
                        : franchiseWatched
                          ? 'bg-orange-700 text-orange-100'
                          : 'bg-red-700 text-red-100'
                  }`}>
                    {status.isUnlocked ? 'UNLOCKED' : status.discoveryCount === 1 ? 'DISCOVERED' : franchiseWatched ? 'READY TO UNLOCK' : 'LOCKED'}
                  </div>
                  
                  {showFranchiseDetails && (
                    <div className="text-xs text-gray-400">
                      <div>Franchise: {getFranchiseName(char.id)}</div>
                      <div className={franchiseWatched ? 'text-green-400' : 'text-red-400'}>
                        {franchiseWatched ? '✓ Watched' : '✗ Not Watched'}
                      </div>
                      {status.discoveredVia && (
                        <div className="text-blue-400">
                          Discovered via: {status.discoveredVia}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Buddy Network Tab Component
  const BuddyNetworkTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-900/80 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cyan-400">🤝 Character Buddy Network</h3>
          <button
            onClick={() => setShowBuddyDetails(!showBuddyDetails)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
          >
            {showBuddyDetails ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            {showBuddyDetails ? 'Hide' : 'Show'} Buddy Details
          </button>
        </div>
        
        <div className="space-y-4">
          {ASSISTANT_CHARACTERS.map(char => {
            const buddies = getBuddiesForCharacter(char.id);
            const status = getCharacterUnlockStatus(char.id);
            
            return (
              <div key={char.id} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={char.imagePath} 
                    alt={char.name}
                    className={`w-10 h-10 rounded-full object-cover ${
                      status.isUnlocked ? '' : 'opacity-50'
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-white">{char.name}</div>
                    <div className="text-xs text-gray-400">{char.anime}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    status.isUnlocked ? 'bg-green-700 text-green-100' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {status.isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                  </div>
                </div>
                
                {buddies.length > 0 && (
                  <div className="ml-13">
                    <div className="text-sm text-gray-400 mb-2">Buddies ({buddies.length}):</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {buddies.map(buddy => {
                        const buddyChar = ASSISTANT_CHARACTERS.find(c => c.id === buddy.characterId);
                        const buddyStatus = getCharacterUnlockStatus(buddy.characterId);
                        
                        if (!buddyChar) return null;
                        
                        return (
                          <div 
                            key={buddy.characterId}
                            className={`p-2 rounded border ${
                              buddyStatus.isUnlocked 
                                ? 'bg-green-900/20 border-green-600' 
                                : buddyStatus.discoveryCount === 1
                                  ? 'bg-yellow-900/20 border-yellow-600'
                                  : 'bg-gray-700 border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <img 
                                src={buddyChar.imagePath} 
                                alt={buddyChar.name}
                                className={`w-6 h-6 rounded-full object-cover ${
                                  buddyStatus.isUnlocked ? '' : buddyStatus.discoveryCount === 1 ? 'opacity-70' : 'opacity-50'
                                }`}
                              />
                              <div className="text-xs">
                                <div className="font-medium text-white">{buddyChar.name}</div>
                                {showBuddyDetails && (
                                  <div className="text-gray-400">
                                    Genres: {buddy.genres.join(', ')}
                                  </div>
                                )}
                              </div>
                              <div className={`px-1 py-0.5 rounded text-xs ${
                                buddyStatus.isUnlocked 
                                  ? 'bg-green-600 text-green-100' 
                                  : buddyStatus.discoveryCount === 1
                                    ? 'bg-yellow-600 text-yellow-100'
                                    : 'bg-gray-600 text-gray-300'
                              }`}>
                                {buddyStatus.isUnlocked ? '✓' : buddyStatus.discoveryCount === 1 ? '🔍' : '✗'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Expertise Map Tab Component
  const ExpertiseMapTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-900/80 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">🎯 Character Expertise Map</h3>
        
        <div className="space-y-4">
          {ASSISTANT_CHARACTERS.map(char => {
            const expertise = getCharacterExpertise(char.id);
            const status = getCharacterUnlockStatus(char.id);
            
            if (!expertise) return null;
            
            return (
              <div key={char.id} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={char.imagePath} 
                    alt={char.name}
                    className={`w-10 h-10 rounded-full object-cover ${
                      status.isUnlocked ? '' : 'opacity-50'
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-white">{char.name}</div>
                    <div className="text-xs text-gray-400">{char.anime}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    status.isUnlocked ? 'bg-green-700 text-green-100' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {status.isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-green-400 mb-2">Strengths (+)</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(expertise.genres)
                        .filter(([_, rating]) => rating === '+')
                        .map(([genre, _]) => (
                          <span key={genre} className="px-2 py-1 bg-green-700 text-green-100 rounded text-xs">
                            {genre}
                          </span>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-red-400 mb-2">Weaknesses (-)</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(expertise.genres)
                        .filter(([_, rating]) => rating === '-')
                        .map(([genre, _]) => (
                          <span key={genre} className="px-2 py-1 bg-red-700 text-red-100 rounded text-xs">
                            {genre}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Eras Tab Component
  const ErasTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-900/80 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">📅 Character Era Expertise</h3>
        <p className="text-sm text-gray-400 mb-4">Each character's knowledge across the 5 anime eras</p>
        
        <div className="space-y-4">
          {ASSISTANT_CHARACTERS.map(char => {
            const eraExpertise = CHARACTER_ERA_EXPERTISE[char.id];
            const status = getCharacterUnlockStatus(char.id);
            
            if (!eraExpertise) return null;
            
            const eras = [
              { name: 'Origins', range: '1910s-70s', key: AnimeEra.ORIGINS },
              { name: 'Golden Age', range: '1980s', key: AnimeEra.GOLDEN_AGE },
              { name: 'Global Explosion', range: '1990s', key: AnimeEra.GLOBAL_EXPLOSION },
              { name: 'Internet', range: '2000s-2010s', key: AnimeEra.INTERNET },
              { name: 'Globalization', range: '2020s+', key: AnimeEra.GLOBALIZATION },
            ];
            
            return (
              <div key={char.id} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={char.imagePath} 
                    alt={char.name}
                    className={`w-10 h-10 rounded-full object-cover ${
                      status.isUnlocked ? '' : 'opacity-50'
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-white">{char.name}</div>
                    <div className="text-xs text-gray-400">{char.anime}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {eras.map(era => {
                    const rating = eraExpertise.eras[era.key];
                    const bgColor = rating === '+' ? 'bg-green-700' : rating === '-' ? 'bg-red-700' : 'bg-gray-700';
                    const textColor = rating === '+' ? 'text-green-100' : rating === '-' ? 'text-red-100' : 'text-gray-300';
                    const symbol = rating === '+' ? '+' : rating === '-' ? '-' : '0';
                    
                    return (
                      <div key={era.key} className={`${bgColor} rounded p-2 text-center`}>
                        <div className={`text-xs font-medium ${textColor}`}>{symbol}</div>
                        <div className={`text-xs ${textColor} mt-1`}>{era.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-900 text-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to App
            </button>
            <h1 className="text-xl font-bold text-cyan-400">🔧 Developer Visualization</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-400">
              Characters: {unlockedCharacters.length}/{ASSISTANT_CHARACTERS.length}
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 flex-shrink-0">
        <div className="flex gap-1">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'unlock-status', label: '🔓 Unlock Status', icon: '🔓' },
            { id: 'buddy-network', label: '🤝 Buddy Network', icon: '🤝' },
            { id: 'expertise-map', label: '🎯 Expertise Map', icon: '🎯' },
            { id: 'eras', label: '📅 Eras', icon: '📅' },
            { id: 'monitoring', label: '📊 Monitoring', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-cyan-400 border-b-2 border-cyan-400'
                  : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'unlock-status' && <UnlockStatusTab />}
        {activeTab === 'buddy-network' && <BuddyNetworkTab />}
        {activeTab === 'expertise-map' && <ExpertiseMapTab />}
        {activeTab === 'eras' && <ErasTab />}
        {activeTab === 'monitoring' && <MonitoringTab />}
      </div>
    </div>
  );
};

export default DeveloperVisualizationScreen;

