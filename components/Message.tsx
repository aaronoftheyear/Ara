
import React, { useEffect, useRef } from 'react';
import { MessageRole } from '../types';
import type { ChatMessage } from '../types';
import { UserIcon, AssistantIcon } from './icons';
import RecommendationCard from './RecommendationCard';
import LoadingSpinner from './LoadingSpinner';
import SystemNotification from './SystemNotification';
// ARCHIVED: CharacterReferral component moved to archive/components/CharacterReferral_2025-11-17.tsx
// Automatic referral switching enabled - referrals are now accepted automatically without user input

interface MessageProps {
  message: ChatMessage;
  isLoading?: boolean;
  characterImage?: string; // Current session character image (for new messages)
  characterName?: string;
  characterLoadingMessages?: string[];
  onAcceptReferral?: (characterId: string, userMessage: string) => void;
  onDeclineReferral?: () => void;
  unlockedCharacters?: string[];
}

const renderWithBold = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const Message: React.FC<MessageProps> = ({ message, isLoading = false, characterImage, characterName, characterLoadingMessages, onAcceptReferral, onDeclineReferral, unlockedCharacters = [] }) => {
  const isUser = message.role === MessageRole.USER;
  const isSystem = message.role === MessageRole.SYSTEM;
  const hasAutoAcceptedRef = useRef(false);

  // For system notifications (WhatsApp-style)
  if (isSystem) {
    return <SystemNotification message={message.content} />;
  }

  // Use stored character image if available (for old messages), otherwise use current
  const displayImage = message.characterImage || characterImage;
  const displayName = message.characterName || characterName;
  
  // Detect handoff loading message (empty content with character image = loading during handoff)
  const isHandoffLoading = !isUser && !isSystem && !message.content && message.characterImage;
  // Show loading if global isLoading OR if this is a handoff loading message
  const shouldShowLoading = isLoading || isHandoffLoading;
  // For handoff loading, don't show loading text (pass undefined for characterLoadingMessages)
  const loadingMessagesForThis = isHandoffLoading ? undefined : characterLoadingMessages;
  
  // Debug: Log if fallback is being used
  if (message.role === 'assistant' && !message.characterImage) {
    console.warn("⚠️ Message missing characterImage, using fallback:", { 
      content: message.content.substring(0, 50), 
      stored: message.characterImage, 
      fallback: characterImage 
    });
  }

  // Automatic referral acceptance: When a referral is detected, automatically accept it
  useEffect(() => {
    if (
      !isUser && 
      !isLoading && 
      message.referredCharacterId && 
      message.referredCharacterName && 
      onAcceptReferral && 
      !hasAutoAcceptedRef.current
    ) {
      hasAutoAcceptedRef.current = true;
      console.log("🔄 Auto-accepting referral to:", message.referredCharacterName);
      // Get the original user message from the referral metadata or use empty string (handleAcceptReferral will find it)
      const userMessage = ''; // handleAcceptReferral will extract from messages array
      onAcceptReferral(
        message.referredCharacterId,
        userMessage,
        message.referralHandoff,
        message.referralAcknowledgment,
        message.referralPitch
      );
    }
  }, [message.referredCharacterId, message.referredCharacterName, isLoading, isUser, onAcceptReferral, message.referralHandoff, message.referralAcknowledgment, message.referralPitch]);

  return (
    <div className={`flex items-start gap-4 my-6 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg overflow-hidden">
          {displayImage ? (
            <img src={displayImage} alt={displayName || 'Assistant'} className="w-full h-full object-cover" title={displayName} />
          ) : (
            <AssistantIcon className="w-6 h-6 text-white" />
          )}
        </div>
      )}

      <div className={`${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-5 py-3 rounded-2xl shadow-md max-w-2xl ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-700 text-gray-200 rounded-bl-none'
          }`}
        >
              {shouldShowLoading ? <LoadingSpinner characterMessages={loadingMessagesForThis} /> : <p className="whitespace-pre-wrap">{isUser ? message.content : renderWithBold(message.content)}</p>}
        </div>
              
              {/* ARCHIVED: CharacterReferral buttons removed 2025-11-17 - automatic switching enabled */}
              {/* Referrals are now automatically accepted via useEffect above */}
              {/* See archive/components/CharacterReferral_2025-11-17.tsx for restoration */}

              {!isUser && message.recommendations && message.recommendations.length > 0 && !isLoading && (
                <div className="mt-4 sm:mt-4 sm:ml-0 overflow-visible sm:overflow-hidden">
                  {/* Mobile: Full width with 10px buffer on each side, Desktop: Normal layout */}
                  <div className="w-[calc(100vw-20px)] sm:w-full sm:px-0 px-[10px] -ml-[calc(12px+2.5rem+1rem)] sm:ml-0">
                    {message.recommendations.map((rec) => (
                      <RecommendationCard key={rec.title} recommendation={rec} isManga={message.isManga} />
                    ))}
                  </div>
                </div>
              )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center shadow-lg order-2">
          <UserIcon className="w-6 h-6 text-gray-300" />
        </div>
      )}
    </div>
  );
};

export default Message;
