import React, { useState } from 'react';
import AraLogo from '../Ara-logo-v3.svg';

interface SetupScreenProps {
  onSetupComplete: (username: string, clientId: string, apiKey: string) => void;
  initialMessage?: string;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onSetupComplete, initialMessage }) => {
  const [username, setUsername] = useState('');
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    const trimmedClientId = clientId.trim();
    const trimmedApiKey = apiKey.trim();

    if (!trimmedUsername || !trimmedClientId || !trimmedApiKey) {
      setError('All fields are required.');
      return;
    }
    setError('');
    onSetupComplete(trimmedUsername, trimmedClientId, trimmedApiKey);
  };

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
                 <h1 className="text-2xl font-bold text-white mb-1">Configuration Required</h1>
                 <p className="text-gray-400">Environment variables not found</p>
            </div>
            
            <div className="bg-yellow-900/30 border border-yellow-700/50 text-yellow-300 px-4 py-3 rounded-lg mb-6 text-sm">
                <p className="font-semibold mb-2">⚙️ Missing Environment Configuration</p>
                <p className="text-gray-300 mb-3">Please create a <code className="bg-gray-700 px-1 rounded">.env</code> file in the project root with:</p>
                <pre className="bg-gray-900/50 p-3 rounded text-xs overflow-x-auto">
GROQ_API_KEY=gsk_your_key_here{'\n'}
MAL_CLIENT_ID=your_client_id_here{'\n'}
MAL_USERNAME=your_username_here
                </pre>
                <p className="text-gray-400 text-xs mt-3">Then restart the dev server: <code className="bg-gray-700 px-1 rounded">npm run dev</code></p>
            </div>

            { (initialMessage || error) && (
                <div className="bg-red-900/50 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
                    <p className="font-semibold mb-1">Connection Problem</p>
                    <p className="whitespace-pre-wrap">{error || initialMessage}</p>
                </div>
            )}
            
            <p className="text-center text-gray-500 text-sm mb-4">Or use the fallback form below (not recommended for production):</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="mal-username" className="block text-sm font-medium text-gray-300 mb-1">MyAnimeList Username</label>
                    <input
                        id="mal-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g., YourMALUsername"
                        className="w-full bg-gray-700 text-gray-200 placeholder-gray-500 rounded-md py-2 px-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="mal-client-id" className="block text-sm font-medium text-gray-300 mb-1">MyAnimeList Client ID</label>
                    <input
                        id="mal-client-id"
                        type="password"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Paste your 32-character Client ID"
                        className="w-full bg-gray-700 text-gray-200 placeholder-gray-500 rounded-md py-2 px-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    />
                     <a href="https://myanimelist.net/apiconfig" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-cyan-400 transition-colors mt-1 block">Where do I find this?</a>
                </div>
                 <div>
                    <label htmlFor="gemini-api-key" className="block text-sm font-medium text-gray-300 mb-1">Google Gemini API Key</label>
                    <input
                        id="gemini-api-key"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste your Gemini API Key"
                        className="w-full bg-gray-700 text-gray-200 placeholder-gray-500 rounded-md py-2 px-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    />
                     <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-cyan-400 transition-colors mt-1 block">Get your free API key</a>
                </div>
                <button
                    type="submit"
                    className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-all duration-300 shadow-lg"
                >
                    Connect and Start
                </button>
                <p className="text-xs text-gray-500 text-center pt-2">
                    Your credentials will be saved in this browser for future sessions.
                </p>
            </form>
        </div>
    </div>
  );
};

export default SetupScreen;