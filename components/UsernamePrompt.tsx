import React, { useState } from 'react';
import { MyAnimeListLogo, AniListLogo, ManualIcon } from './PlatformLogos';
import AraLogo from '../Ara-logo-v3.svg';

interface UsernamePromptProps {
  onUsernameSubmit: (username: string) => void;
  onAniListSubmit: (username: string) => void;
  onManualListSubmit: (username: string, animeList: string) => void;
}

const UsernamePrompt: React.FC<UsernamePromptProps> = ({ onUsernameSubmit, onAniListSubmit, onManualListSubmit }) => {
  const [mode, setMode] = useState<'choose' | 'mal' | 'anilist' | 'manual'>('choose');
  const [username, setUsername] = useState('');
  const [animeList, setAnimeList] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError('MyAnimeList username is required.');
      return;
    }
    setError('');
    onUsernameSubmit(trimmedUsername);
  };

  const handleAniListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError('AniList username is required.');
      return;
    }
    setError('');
    onAniListSubmit(trimmedUsername);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    const trimmedList = animeList.trim();

    if (!trimmedUsername) {
      setError('Your name is required.');
      return;
    }
    
    if (!trimmedList) {
      setError('Please paste your anime list.');
      return;
    }
    
    setError('');
    setIsProcessing(true);
    
    try {
      onManualListSubmit(trimmedUsername, trimmedList);
    } catch (err) {
      setError('Failed to process your anime list. Please try again.');
      setIsProcessing(false);
    }
  };

  // Mode selection screen
  if (mode === 'choose') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200 font-sans p-4"
           style={{
              backgroundImage: 'radial-gradient(circle at top, rgba(22, 78, 99, 0.3), transparent 50%), radial-gradient(circle at bottom, rgba(56, 189, 248, 0.2), transparent 60%)',
           }}
      >
          <div className="w-full max-w-md mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700/50">
              <div className="flex flex-col items-center text-center mb-6">
                   <img
                      src={AraLogo}
                      alt="Anime Recommendation Assistant logo"
                      className="w-28 h-auto mb-4 drop-shadow-lg"
                   />
                   <h1 className="text-2xl font-bold text-white mb-1">Welcome to Ara - Anime Recommendation Assistant</h1>
                   <p className="text-gray-400">Powered by Gemini AI</p>
              </div>
              
              <p className="text-gray-300 text-center mb-6">Choose your platform</p>
              
              <div className="space-y-3">
                  <button
                      onClick={() => setMode('mal')}
                      className="w-full bg-[#2E51A2] text-white font-bold py-4 px-6 rounded-lg hover:bg-[#1e3a7a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#2E51A2] transition-all duration-300 shadow-lg flex items-center gap-4"
                  >
                      <MyAnimeListLogo className="w-10 h-10 flex-shrink-0" />
                      <div className="text-left flex-grow">
                          <div className="font-bold text-lg flex items-center gap-2">
                              MyAnimeList
                              <span className="text-xs bg-cyan-400 text-gray-900 px-2 py-0.5 rounded-full font-semibold">Recommended</span>
                          </div>
                          <div className="text-sm text-blue-100">Automatic sync with full features</div>
                      </div>
                  </button>
                  
                  <button
                      onClick={() => setMode('anilist')}
                      className="w-full bg-[#02A9FF] text-white font-bold py-4 px-6 rounded-lg hover:bg-[#0288cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#02A9FF] transition-all duration-300 shadow-lg flex items-center gap-4"
                  >
                      <AniListLogo className="w-10 h-10 flex-shrink-0" />
                      <div className="text-left flex-grow">
                          <div className="font-bold text-lg">AniList</div>
                          <div className="text-sm text-blue-100">Automatic sync with full features</div>
                      </div>
                  </button>
                  
                  <button
                      onClick={() => setMode('manual')}
                      className="w-full bg-gray-700 text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-all duration-300 shadow-lg flex items-center gap-4"
                  >
                      <ManualIcon className="w-10 h-10 flex-shrink-0 text-gray-300" />
                      <div className="text-left flex-grow">
                          <div className="font-bold text-lg">Manual Input</div>
                          <div className="text-sm text-gray-300">Paste your list from notes</div>
                      </div>
                  </button>
              </div>
          </div>
      </div>
    );
  }

  // MAL mode
  if (mode === 'mal') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200 font-sans p-4"
           style={{
              backgroundImage: 'radial-gradient(circle at top, rgba(22, 78, 99, 0.3), transparent 50%), radial-gradient(circle at bottom, rgba(56, 189, 248, 0.2), transparent 60%)',
           }}
      >
          <div className="w-full max-w-md mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700/50">
              <div className="flex flex-col items-center text-center mb-6">
                   <MyAnimeListLogo className="w-16 h-16 mb-4" />
                   <h1 className="text-2xl font-bold text-white mb-1">Connect MyAnimeList</h1>
                   <button 
                      onClick={() => setMode('choose')}
                      className="text-sm text-gray-400 hover:text-cyan-300 transition-colors"
                   >
                      ← Back to options
                   </button>
              </div>
              
              <div className="bg-blue-900/30 border border-blue-700/50 text-blue-200 px-4 py-3 rounded-lg mb-6 text-sm">
                  <p className="font-semibold mb-1">✨ Best Experience</p>
                  <p className="text-gray-300">Full sync with ratings, dates, and watch status.</p>
              </div>

              { error && (
                  <div className="bg-red-900/50 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
                      <p className="font-semibold mb-1">⚠️ Error</p>
                      <p>{error}</p>
                  </div>
              )}
              
              <form onSubmit={handleMalSubmit} className="space-y-4">
                  <div>
                      <label htmlFor="mal-username" className="block text-sm font-medium text-gray-300 mb-2">MyAnimeList Username</label>
                      <input
                          id="mal-username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g., YourMALUsername"
                          autoFocus
                          className="w-full bg-gray-700 text-gray-200 placeholder-gray-500 rounded-md py-3 px-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2E51A2] transition-colors text-lg"
                      />
                      <p className="text-xs text-gray-500 mt-2">This will sync your complete anime list from MyAnimeList.</p>
                  </div>
                  <button
                      type="submit"
                      className="w-full bg-[#2E51A2] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#1e3a7a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#2E51A2] transition-all duration-300 shadow-lg"
                  >
                      Continue
                  </button>
              </form>
          </div>
      </div>
    );
  }

  // AniList mode
  if (mode === 'anilist') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200 font-sans p-4"
           style={{
              backgroundImage: 'radial-gradient(circle at top, rgba(22, 78, 99, 0.3), transparent 50%), radial-gradient(circle at bottom, rgba(56, 189, 248, 0.2), transparent 60%)',
           }}
      >
          <div className="w-full max-w-md mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700/50">
              <div className="flex flex-col items-center text-center mb-6">
                   <AniListLogo className="w-16 h-16 mb-4" />
                   <h1 className="text-2xl font-bold text-white mb-1">Connect AniList</h1>
                   <button 
                      onClick={() => setMode('choose')}
                      className="text-sm text-gray-400 hover:text-cyan-300 transition-colors"
                   >
                      ← Back to options
                   </button>
              </div>
              
              <div className="bg-blue-900/30 border border-blue-700/50 text-blue-200 px-4 py-3 rounded-lg mb-6 text-sm">
                  <p className="font-semibold mb-1">✨ Full Features</p>
                  <p className="text-gray-300">Sync your complete list with ratings and watch status.</p>
              </div>

              { error && (
                  <div className="bg-red-900/50 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
                      <p className="font-semibold mb-1">⚠️ Error</p>
                      <p>{error}</p>
                  </div>
              )}
              
              <form onSubmit={handleAniListSubmit} className="space-y-4">
                  <div>
                      <label htmlFor="anilist-username" className="block text-sm font-medium text-gray-300 mb-2">AniList Username</label>
                      <input
                          id="anilist-username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g., YourAniListUsername"
                          autoFocus
                          className="w-full bg-gray-700 text-gray-200 placeholder-gray-500 rounded-md py-3 px-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#02A9FF] transition-colors text-lg"
                      />
                      <p className="text-xs text-gray-500 mt-2">This will sync your complete anime list from AniList.</p>
                  </div>
                  <button
                      type="submit"
                      className="w-full bg-[#02A9FF] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#0288cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#02A9FF] transition-all duration-300 shadow-lg"
                  >
                      Continue
                  </button>
              </form>
          </div>
      </div>
    );
  }

  // Manual mode
  return (
    <div 
      className="manual-list-container min-h-screen w-screen flex flex-col items-center bg-gray-900 text-gray-200 font-sans p-4 pt-8 pb-32"
         style={{
            backgroundImage: 'radial-gradient(circle at top, rgba(22, 78, 99, 0.3), transparent 50%), radial-gradient(circle at bottom, rgba(56, 189, 248, 0.2), transparent 60%)',
         }}
    >
        <div className="w-full max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700/50 my-auto mb-8">
            <div className="flex flex-col items-center text-center mb-6">
                 <img
                    src={AraLogo}
                    alt="Anime Recommendation Assistant logo"
                    className="w-24 h-auto mb-4 drop-shadow-lg"
                 />
                 <h1 className="text-2xl font-bold text-white mb-1">Manual Anime List</h1>
                 <button 
                    onClick={() => setMode('choose')}
                    className="text-sm text-gray-400 hover:text-cyan-300 transition-colors"
                 >
                    ← Back to options
                 </button>
            </div>
            
            <div className="bg-purple-900/30 border border-purple-700/50 text-purple-200 px-4 py-3 rounded-lg mb-6 text-sm">
                <p className="font-semibold mb-2">📋 Keeping all your watched anime in your notes is wild, but I got you.</p>
                <p className="text-gray-300 text-xs">Copy and paste your anime list below - abbreviations, typos, and informal notes all work!</p>
            </div>

            { error && (
                <div className="bg-red-900/50 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
                    <p className="font-semibold mb-1">⚠️ Error</p>
                    <p>{error}</p>
                </div>
            )}
            
            <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g., Aaron"
                        disabled={isProcessing}
                        className="w-full bg-gray-700 text-gray-200 placeholder-gray-500 rounded-md py-3 px-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors text-lg"
                    />
                </div>
                
                <div>
                    <label htmlFor="anime-list" className="block text-sm font-medium text-gray-300 mb-2">Your Anime List</label>
                    <textarea
                        id="anime-list"
                        value={animeList}
                        onChange={(e) => setAnimeList(e.target.value)}
                        disabled={isProcessing}
                        placeholder="Paste your anime list here...&#10;&#10;You can organize with sections:&#10;&#10;Watched:&#10;naruto, HXH, one piece&#10;attack on titans (loved it!)&#10;&#10;Plan to Watch:&#10;steins gate&#10;code geass&#10;&#10;Or just paste everything - I'll figure it out!&#10;Abbreviations work (HXH, FMAB, JJK)&#10;Typos work too (peak piece → One Piece)"
                        rows={14}
                        className="w-full bg-gray-700 text-gray-200 placeholder-gray-500 rounded-md py-3 px-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors text-sm font-mono resize-y"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Don't worry about formatting - I use aggressive matching. If something could be multiple shows, I'll include all of them!
                    </p>
                </div>
                
                <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Processing your list...' : 'Continue'}
                </button>
                
                {isProcessing && (
                  <div className="text-center text-sm text-gray-400 animate-pulse">
                    Scanning for anime titles with MAL API... This may take 30-60 seconds.
                  </div>
                )}
            </form>
        </div>
    </div>
  );
};

export default UsernamePrompt;

