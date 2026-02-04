import React, { useEffect, useState } from 'react';
import type { AssistantCharacter } from '../data/characters';
import { getCharacterExpertise } from '../data/characterExpertise';
import type { ChatMessage } from '../types';
import { MessageRole } from '../types';

/**
 * Archived Group Chat feature (shelved on 2025-10-30).
 *
 * To re-enable this feature:
 * 1. Restore the state hooks (`groupChatCharacters`, `showGroupChatModal`, etc.) inside `App.tsx`.
 * 2. Reintroduce the Settings toggle and Character selector quick actions.
 * 3. Wire `handleSend` to call `computeGroupChatDistribution` before the standard single-character flow.
 * 4. Mount `GroupChatModalArchive` when the user wants to manage the active roster.
 */

export interface GroupChatDistributionAllocation {
  characterId: string;
  characterName: string;
  expertiseRating: string;
  recommendationCount: number;
}

export interface GroupChatDistributionResult {
  handled: boolean;
  genre?: string;
  placeholderMessage?: ChatMessage;
  allocation?: GroupChatDistributionAllocation[];
}

export interface GroupChatHandlerOptions {
  characters: AssistantCharacter[];
  detectGenresFromRequest: (message: string) => string[];
}

export function computeGroupChatDistribution(
  userMessage: string,
  { characters, detectGenresFromRequest }: GroupChatHandlerOptions
): GroupChatDistributionResult {
  if (!characters || characters.length === 0) {
    return { handled: false };
  }

  const detectedGenres = detectGenresFromRequest(userMessage);
  if (detectedGenres.length === 0) {
    return {
      handled: true,
      placeholderMessage: {
        role: MessageRole.ASSISTANT,
        content: `${characters.map(c => c.name).join(' and ')} are here! What genre are you looking for?`,
      },
      allocation: characters.map(character => ({
        characterId: character.id,
        characterName: character.name,
        expertiseRating: '0',
        recommendationCount: 0,
      })),
    };
  }

  const genre = detectedGenres[0];
  const charA = characters[0];
  const charB = characters[1];

  const expertA = getCharacterExpertise(charA.id);
  const expertB = charB ? getCharacterExpertise(charB.id) : null;

  const ratingA = expertA?.genres[genre as keyof typeof expertA.genres] || '0';
  const ratingB = charB ? (expertB?.genres[genre as keyof typeof expertB.genres] || '0') : '0';

  if (charB && ratingA === '-' && ratingB === '-') {
    return {
      handled: true,
      genre,
      placeholderMessage: {
        role: MessageRole.ASSISTANT,
        content: `Sorry, neither ${charA.name} nor ${charB.name} know much about ${genre} anime. You should ask someone else for recommendations in this genre.`,
      },
      allocation: [
        {
          characterId: charA.id,
          characterName: charA.name,
          expertiseRating: ratingA,
          recommendationCount: 0,
        },
        {
          characterId: charB.id,
          characterName: charB.name,
          expertiseRating: ratingB,
          recommendationCount: 0,
        },
      ],
    };
  }

  let recsA = 0;
  let recsB = 0;

  if (!charB) {
    recsA = ratingA === '-' ? 0 : 3;
  } else if (ratingA === '+' && ratingB === '+') {
    recsA = 2;
    recsB = 1;
  } else if (ratingA === '+' && ratingB === '0') {
    recsA = 2;
    recsB = 1;
  } else if (ratingA === '+' && ratingB === '-') {
    recsA = 3;
    recsB = 0;
  } else if (ratingA === '0' && ratingB === '-') {
    recsA = 3;
    recsB = 0;
  } else if (ratingA === '0' && ratingB === '+') {
    recsA = 1;
    recsB = 2;
  } else if (ratingA === '-' && ratingB === '+') {
    recsA = 0;
    recsB = 3;
  } else if (ratingA === '0' && ratingB === '0') {
    recsA = 2;
    recsB = 1;
  } else {
    // Default fallback: prioritise non-weak characters
    recsA = ratingA === '-' ? 0 : 2;
    recsB = charB && ratingB !== '-' ? 1 : 0;
  }

  const allocation: GroupChatDistributionAllocation[] = [
    {
      characterId: charA.id,
      characterName: charA.name,
      expertiseRating: ratingA,
      recommendationCount: recsA,
    },
  ];

  if (charB) {
    allocation.push({
      characterId: charB.id,
      characterName: charB.name,
      expertiseRating: ratingB,
      recommendationCount: recsB,
    });
  }

  const distributionSummary = allocation
    .map(entry => `${entry.characterName} (${entry.expertiseRating}) → ${entry.recommendationCount}`)
    .join(', ');

  return {
    handled: true,
    genre,
    placeholderMessage: {
      role: MessageRole.ASSISTANT,
      content: `${charA.name} and ${charB ? charB.name : 'the main assistant'} will share ${genre} recommendations. Distribution: ${distributionSummary}. (Placeholder – re-enable API calls to fetch real lists.)`,
    },
    allocation,
  };
}

interface GroupChatModalProps {
  availableCharacters: AssistantCharacter[];
  currentGroupChatCharacters: AssistantCharacter[];
  onSelect: (characters: AssistantCharacter[]) => void;
  onClose: () => void;
}

export const GroupChatModalArchive: React.FC<GroupChatModalProps> = ({
  availableCharacters,
  currentGroupChatCharacters,
  onSelect,
  onClose,
}) => {
  const [selectedCharacters, setSelectedCharacters] = useState<AssistantCharacter[]>(currentGroupChatCharacters);

  useEffect(() => {
    console.log('🔍 [Archive] GroupChatModal available characters:', availableCharacters.map(c => c.name));
  }, [availableCharacters]);

  const toggleCharacter = (character: AssistantCharacter) => {
    if (selectedCharacters.find(c => c.id === character.id)) {
      setSelectedCharacters(prev => prev.filter(c => c.id !== character.id));
    } else if (selectedCharacters.length < 2) {
      setSelectedCharacters(prev => [...prev, character]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedCharacters);
    onClose();
  };

  const handleLeaveGroupChat = () => {
    setSelectedCharacters([]);
    onSelect([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full mx-4 border border-gray-700"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Group Chat (Archived)</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close group chat modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-400 mb-6">
          Select up to two characters. When the feature is reactivated, discovery and referrals will pause while group chat is active.
        </p>

        <div className="space-y-1 mb-6 max-h-96 overflow-y-auto">
          {availableCharacters.map((character) => {
            const isSelected = selectedCharacters.some(c => c.id === character.id);

            return (
              <button
                key={character.id}
                onClick={() => toggleCharacter(character)}
                disabled={!isSelected && selectedCharacters.length >= 2}
                className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors relative ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400'
                    : selectedCharacters.length >= 2
                    ? 'opacity-50 cursor-not-allowed text-gray-300'
                    : 'hover:bg-gray-700/50 text-gray-300'
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg overflow-hidden">
                  <img src={character.imagePath} alt={character.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm font-medium">{character.name}</div>
                  <div className="text-xs text-gray-400">{character.anime}</div>
                </div>
                {isSelected && (
                  <div className="bg-cyan-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {selectedCharacters.indexOf(character) + 1}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={handleLeaveGroupChat}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Leave Group Chat
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedCharacters.length === 0}
            className="px-6 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentGroupChatCharacters.length === 0 ? 'Start' : 'Update'} Group Chat ({selectedCharacters.length}/2)
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatModalArchive;
