import React, { useState, useMemo } from 'react';

interface TransparencyPanelProps {
  excludedTitles: string[];
}

const TransparencyPanel: React.FC<TransparencyPanelProps> = ({ excludedTitles }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTitles = useMemo(() => {
    if (!searchTerm) return excludedTitles;
    return excludedTitles.filter(title =>
      title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, excludedTitles]);

  return (
    <div className="bg-gray-900/50 p-4 border-b border-gray-700/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-200 mb-3">
          Active Exclusion List ({excludedTitles.length} Titles)
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          To ensure you never get a recommendation you've already seen, I am actively filtering out every title on this list from my potential suggestions. This list is sourced directly from your MAL data for entries marked 'Completed', 'Watching', 'On Hold', or 'Dropped'.
        </p>
        <div className="relative mb-2">
            <input 
                type="text"
                placeholder="Search your exclusion list..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700/50 text-gray-200 placeholder-gray-500 rounded-md py-2 pl-4 pr-10 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
        </div>
        <div className="max-h-48 overflow-y-auto bg-gray-800/50 rounded-md p-2 border border-gray-700">
          {filteredTitles.length > 0 ? (
            <ul className="text-sm text-gray-300 space-y-1">
              {filteredTitles.map(title => (
                <li key={title} className="px-2 py-1 rounded hover:bg-gray-700 transition-colors">
                  {title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 p-4">No matching titles found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransparencyPanel;