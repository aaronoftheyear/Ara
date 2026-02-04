import React, { useState } from 'react';
import { ASSISTANT_CHARACTERS, AssistantCharacter } from '../data/characters';
import { AssistantIcon } from './icons';
import { isCharacterUnlocked, CharacterDiscoveryState } from '../data/characterUnlockSystem';

interface CharacterSelectorProps {
  currentCharacter: AssistantCharacter;
  onCharacterSelect: (character: AssistantCharacter) => void;
  unlockedCharacters: string[];
  discoveredCharacters?: Array<{characterId: string; discoveredGenre: string}>; // Old System 2.0
  discoveryStates?: CharacterDiscoveryState[]; // System 3.0
}

const getGenericDescription = (genre: string): string => {
  const descriptions: {[key: string]: string} = {
    'magicalGirl': 'Magical Girl Fanatic',
    'battleShonen': 'Battle Shonen Expert',
    'romance': 'Romance Expert',
    'mecha': 'Mecha Enthusiast',
    'horror': 'Horror Specialist',
    'ecchi': 'Fanservice Connoisseur',
    'sliceOfLife': 'Slice of Life Expert',
    'shojo': 'Shojo Specialist',
    'idol': 'Idol Superfan',
    'bl': 'BL Enthusiast',
    'sports': 'Sports Ace',
    'isekai': 'Isekai Expert',
    'gaming': 'Gaming Expert',
    'psychological': 'Psychological Thriller Fan'
  };
  return descriptions[genre] || 'Mystery Character';
};

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ 
  currentCharacter, 
  onCharacterSelect,
  unlockedCharacters,
  discoveredCharacters,
  discoveryStates
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // System 3.0: Get unlocked and discovered characters from discovery states
  const unlockedChars = discoveryStates 
    ? discoveryStates.filter(s => s.discoveryCount === 2).map(s => s.characterId)
    : unlockedCharacters;
  
  const discoveredChars = discoveryStates
    ? discoveryStates.filter(s => s.discoveryCount === 1)
    : (discoveredCharacters || []);

  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg overflow-hidden">
          <img 
            src={currentCharacter.imagePath} 
            alt={currentCharacter.name} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-semibold text-white">{currentCharacter.name}</div>
          <div className="text-xs text-gray-400">from {currentCharacter.anime}</div>
        </div>
        <svg 
          className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[calc(100vw-2rem)] max-w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
          <div className="p-3">
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Select Character
            </div>
            <div className="space-y-1">
              {/* Unlocked characters */}
              {ASSISTANT_CHARACTERS.filter((character) => unlockedChars.includes(character.id)).map((character) => (
                <button
                  key={character.id}
                  onClick={() => {
                    onCharacterSelect(character);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                    character.id === currentCharacter.id 
                      ? 'bg-cyan-500/20 text-cyan-300' 
                      : 'hover:bg-gray-700/50 text-gray-300'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg overflow-hidden">
                    <img 
                      src={character.imagePath} 
                      alt={character.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium">{character.name}</div>
                    <div className="text-xs text-gray-400">{character.anime}</div>
                  </div>
                  {character.id === currentCharacter.id && (
                    <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
              
              {/* Discovered but not unlocked characters (blurred, generic) */}
              {discoveredChars.map((discovered) => {
                const characterId = discoveryStates ? discovered.characterId : (discovered as any).characterId;
                const character = ASSISTANT_CHARACTERS.find(c => c.id === characterId);
                if (!character || unlockedChars.includes(character.id)) return null;
                
                return (
                  <div
                    key={character.id}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg bg-gray-700/30 border border-yellow-600/30 cursor-not-allowed opacity-75"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg overflow-hidden">
                      <img 
                        src={character.imagePath} 
                        alt="Unknown contact" 
                        className="w-full h-full object-cover blur-[1px]" 
                      />
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-sm font-medium text-yellow-400">Unknown Contact</div>
                      <div className="text-xs text-gray-500">Ask again to unlock</div>
                    </div>
                    <div className="text-yellow-600">🔒</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSelector;
