
import React, { useRef, useEffect } from 'react';
import Message from './Message';
import type { ChatMessage } from '../types';
import { MessageRole } from '../types';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  characterImage?: string;
  characterName?: string;
  characterLoadingMessages?: string[];
  isRecommendationRequest?: boolean; // New prop to determine loading type
  onAcceptReferral?: (characterId: string, userMessage: string) => void;
  onDeclineReferral?: () => void;
  unlockedCharacters?: string[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, characterImage, characterName, characterLoadingMessages, isRecommendationRequest, onAcceptReferral, onDeclineReferral, unlockedCharacters }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const isMobile = window.innerWidth < 640; // sm breakpoint
      
      // If the last message has recommendations, scroll to top of message
      if (lastMessage.recommendations && lastMessage.recommendations.length > 0) {
        // Find the message element and scroll to top of it
        const messageElements = scrollRef.current.querySelectorAll('[data-message-index]');
        if (messageElements.length > 0) {
          const lastMessageElement = messageElements[messageElements.length - 1] as HTMLElement;
          lastMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (lastMessage.role === 'system') {
        // On mobile, don't auto-scroll for system messages
        if (!isMobile) {
          const messageElements = scrollRef.current.querySelectorAll('[data-message-index]');
          if (messageElements.length > 0) {
            const lastMessageElement = messageElements[messageElements.length - 1] as HTMLElement;
            lastMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        // On mobile, do nothing - don't scroll
      } else {
        // For regular messages (user messages or non-recommendation assistant messages), scroll to bottom
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  return (
        <div ref={scrollRef} className="mobile-chat-area flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 pb-32 sm:pb-6">
          {messages.map((msg, index) => (
            <div key={index} data-message-index={index}>
              <Message 
                message={msg} 
                characterImage={characterImage} 
                characterName={characterName} 
                characterLoadingMessages={characterLoadingMessages}
                onAcceptReferral={onAcceptReferral}
                onDeclineReferral={onDeclineReferral}
                unlockedCharacters={unlockedCharacters}
              />
            </div>
          ))}
      {isLoading && (
        <Message 
          message={{ role: MessageRole.ASSISTANT, content: '' }} 
          isLoading={true} 
          characterImage={characterImage} 
          characterName={characterName} 
          characterLoadingMessages={isRecommendationRequest ? characterLoadingMessages : undefined}
        />
      )}
        </div>
  );
};

export default ChatWindow;
