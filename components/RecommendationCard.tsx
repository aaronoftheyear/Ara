import React, { useState } from 'react';
import type { AnimeRecommendation } from '../types';
import { PlayIcon, InformationCircleIcon } from './icons';

interface RecommendationCardProps {
  recommendation: AnimeRecommendation;
  isManga?: boolean;
}

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
    </svg>
);

// Platform-specific colors
const platformColors: { [key: string]: { bg: string; text: string } } = {
  'Netflix': { bg: 'bg-red-600', text: 'text-white' },
  'Crunchyroll': { bg: 'bg-orange-600', text: 'text-white' },
  'Disney+': { bg: 'bg-blue-600', text: 'text-white' },
  'HBO Max': { bg: 'bg-purple-600', text: 'text-white' },
  'Hulu': { bg: 'bg-green-600', text: 'text-white' },
  'Amazon Prime Video': { bg: 'bg-blue-700', text: 'text-white' },
  'Funimation': { bg: 'bg-pink-600', text: 'text-white' },
  'Adult Swim': { bg: 'bg-cyan-600', text: 'text-white' },
  'Retrocrush': { bg: 'bg-red-700', text: 'text-white' },
};

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, isManga = false }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-cyan-500/30 hover:ring-2 hover:ring-cyan-500/50 my-3 sm:my-4 flex flex-col sm:flex-row w-full max-w-full sm:max-w-[750px] sm:mx-auto">
      {/* Desktop cover image */}
      {recommendation.coverImage && (
        <img 
            src={recommendation.coverImage} 
            alt={`Cover for ${recommendation.title}`} 
            className="hidden sm:block w-40 sm:h-auto object-cover flex-shrink-0 bg-gray-700"
        />
      )}
      <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
        {/* Desktop Layout - Keep original */}
        <div className="hidden sm:block">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-cyan-300 pr-4">
              {recommendation.title}
              {recommendation.releaseYear && (
                <span className="text-gray-400 font-normal text-lg ml-2">({recommendation.releaseYear})</span>
              )}
            </h3>
            <div className="flex-shrink-0 flex items-center space-x-2">
              {isManga && (
                <span className="bg-purple-900 text-purple-200 px-2 py-1 rounded-full text-xs font-bold">
                  MANGA
                </span>
              )}
              {!isManga && recommendation.has_dub && (
                <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded-full text-xs font-bold">
                  DUB
                </span>
              )}
              <div className="flex items-center space-x-1 bg-gray-700 text-yellow-300 px-2 py-1 rounded-full text-sm font-semibold">
                <StarIcon className="w-4 h-4" />
                <span>{recommendation.mal_score.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {recommendation.genres.map((genre) => (
              <span key={genre} className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Mobile Layout - New design */}
        <div className="sm:hidden flex gap-3 w-full max-w-full overflow-hidden">
          {/* Cover image - 40% width on mobile with rating overlay */}
          {recommendation.coverImage && (
            <div className="w-[28%] flex-shrink-0 relative">
              <img 
                src={recommendation.coverImage} 
                alt={`Cover for ${recommendation.title}`} 
                className="w-full h-auto object-contain bg-gray-700 rounded"
              />
              {/* Rating overlay in top right */}
              <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-black/70 text-yellow-300 px-1.5 py-0.5 rounded text-xs font-semibold">
                <StarIcon className="w-3 h-3" />
                <span>{recommendation.mal_score.toFixed(2)}</span>
              </div>
            </div>
          )}
          
          {/* Content - remaining width on mobile */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Title */}
            <h3 className="text-base font-bold text-white mb-1 truncate">
              {recommendation.title}
            </h3>
            
            {/* Details row (without rating since it's on cover) */}
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <span className="text-gray-400 text-xs">📺</span>
              <span className="text-gray-400 text-xs">
                {recommendation.episodeCount && `(${recommendation.episodeCount})`}
              </span>
              <span className="text-gray-400 text-xs">
                {recommendation.releaseYear}
              </span>
              {!isManga && recommendation.has_dub && (
                <span className="bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded text-xs font-bold">
                  DUB
                </span>
              )}
            </div>
            
            {/* Scrollable genre tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 mb-2">
              <div className="flex gap-1.5 min-w-max">
                {recommendation.genres.map((genre) => (
                  <span key={genre} className="bg-gray-700 text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            
            
            {/* Description right under genres */}
            <div className="mb-3 flex-grow">
              <button 
                onClick={() => toggleSection('synopsis')}
                className="text-left w-full group"
              >
                <p className={`text-gray-400 text-xs ${expandedSection === 'synopsis' ? '' : 'line-clamp-3'}`}>
                  {recommendation.synopsis}
                </p>
                <span className="text-cyan-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  {expandedSection === 'synopsis' ? 'Click to collapse' : 'Click to expand'}
                </span>
              </button>
            </div>
          </div>
        </div>
        {/* Desktop content - Keep original */}
        <div className="hidden sm:block mb-4 flex-grow">
          <p className="text-gray-400 text-sm mb-4 flex-grow">{recommendation.synopsis}</p>
        </div>
        
        <div className="mt-auto">
          {/* Desktop content - Keep original */}
          <div className="hidden sm:block">
            {recommendation.community_opinion && (
              <div className="mb-3 bg-gray-700/50 rounded-lg p-3 border-l-2 border-yellow-500">
                <p className="text-xs text-yellow-200 font-semibold mb-1">💬 Community Consensus:</p>
                <p className="text-sm text-gray-300 italic">"{recommendation.community_opinion}"</p>
              </div>
            )}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-200 mb-1">Why you might like it:</h4>
              <p className="text-sm text-cyan-200 italic border-l-2 border-cyan-400 pl-3">
                "{recommendation.reasoning}"
              </p>
            </div>
          </div>

          {/* Mobile content - New design */}
          <div className="sm:hidden">
            {recommendation.community_opinion && (
              <div className="mb-2 bg-gray-700/50 rounded-lg p-2 border-l-2 border-yellow-500">
                <button 
                  onClick={() => toggleSection('community')}
                  className="text-left w-full group"
                >
                  <p className="text-xs text-yellow-200 font-semibold mb-1">💬 Community:</p>
                  <p className={`text-xs text-gray-300 italic ${expandedSection === 'community' ? '' : 'line-clamp-2'}`}>
                    "{recommendation.community_opinion}"
                  </p>
                  <span className="text-yellow-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {expandedSection === 'community' ? 'Click to collapse' : 'Click to expand'}
                  </span>
                </button>
              </div>
            )}
            <div className="mb-3">
              <button 
                onClick={() => toggleSection('reasoning')}
                className="text-left w-full group"
              >
                <h4 className="text-xs font-semibold text-gray-200 mb-1">Why you might like it:</h4>
                <p className={`text-xs text-cyan-200 italic border-l-2 border-cyan-400 pl-2 ${expandedSection === 'reasoning' ? '' : 'line-clamp-3'}`}>
                  "{recommendation.reasoning}"
                </p>
                <span className="text-cyan-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  {expandedSection === 'reasoning' ? 'Click to collapse' : 'Click to expand'}
                </span>
              </button>
            </div>
          </div>
          {/* Desktop buttons - Keep original */}
          <div className="hidden sm:flex flex-wrap items-center gap-3">
            {!isManga && recommendation.trailerUrl && (
              <a
                href={recommendation.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold text-sm"
              >
                <PlayIcon className="w-4 h-4" />
                Watch Trailer
              </a>
            )}
            {recommendation.malUrl && (
                <a
                href={recommendation.malUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-gray-200 transition-colors font-semibold text-sm"
              >
                <InformationCircleIcon className="w-4 h-4" />
                More Info
              </a>
            )}
            
            {/* Streaming platforms - Desktop */}
            {recommendation.streamingPlatforms && recommendation.streamingPlatforms.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-gray-400 font-semibold">Available on:</span>
                <div className="flex gap-1.5">
                  {recommendation.streamingPlatforms.map((platform) => {
                    const colors = platformColors[platform] || { bg: 'bg-gray-600', text: 'text-white' };
                    return (
                      <span 
                        key={platform} 
                        className={`${colors.bg} ${colors.text} text-xs font-bold px-2.5 py-1 rounded-full`}
                      >
                        {platform}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mobile buttons - Compact design */}
          <div className="sm:hidden flex items-center gap-2">
            {!isManga && recommendation.trailerUrl && (
              <a
                href={recommendation.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded text-xs font-semibold"
              >
                <PlayIcon className="w-3 h-3" />
                Trailer
              </a>
            )}
            {recommendation.malUrl && (
                <a
                href={recommendation.malUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 text-gray-400 rounded hover:bg-gray-700 hover:text-gray-200 transition-colors text-xs font-semibold"
              >
                <InformationCircleIcon className="w-3 h-3" />
                Info
              </a>
            )}
            
            {/* Streaming platforms - Mobile */}
            {recommendation.streamingPlatforms && recommendation.streamingPlatforms.length > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-gray-400">📺</span>
                <div className="flex gap-1">
                  {recommendation.streamingPlatforms.map((platform) => {
                    const colors = platformColors[platform] || { bg: 'bg-gray-600', text: 'text-white' };
                    return (
                      <span 
                        key={platform} 
                        className={`${colors.bg} ${colors.text} text-xs font-bold px-1.5 py-0.5 rounded-full`}
                      >
                        {platform}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Unlock hint */}
          {recommendation.potentialUnlock && (
            <div className="mt-2 sm:mt-3 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg p-2 sm:p-3 border border-purple-500/30">
              <p className="text-xs text-purple-200 font-semibold flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg">📱</span>
                <span className="text-purple-100">Watch to unlock new contact</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;