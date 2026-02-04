import React, { useState, useEffect, useRef } from 'react';
import { SendIcon } from './icons';

interface MessageInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  quickPrompts: string[];
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, isLoading, quickPrompts }) => {
  const [input, setInput] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSendTimeRef = useRef<number>(0);
  const COOLDOWN_DURATION = 30; // 30 seconds

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (cooldownSeconds > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            if (cooldownTimerRef.current) {
              clearInterval(cooldownTimerRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    }

    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, [cooldownSeconds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && cooldownSeconds === 0) {
      onSend(input);
      setInput('');
      setCooldownSeconds(COOLDOWN_DURATION);
      lastSendTimeRef.current = Date.now();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (!isLoading && cooldownSeconds === 0) {
      onSend(prompt);
      setCooldownSeconds(COOLDOWN_DURATION);
      lastSendTimeRef.current = Date.now();
    }
  };

  const isDisabled = isLoading || cooldownSeconds > 0;

  return (
    <div className="mobile-fixed-input fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto p-2 sm:p-3 md:p-4 bg-gray-900 border-t border-gray-700 z-10">
        <div className="flex items-center gap-2 mb-2 sm:mb-3 overflow-x-auto scrollbar-hide pb-1">
            <div className="flex gap-1.5 sm:gap-2 min-w-max">
                {quickPrompts.map(prompt => (
                    <button 
                        key={prompt}
                        onClick={() => handleQuickPrompt(prompt)}
                        disabled={isDisabled}
                        className="px-3 py-1 bg-gray-700 text-xs sm:text-sm text-gray-300 rounded-full hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex-shrink-0"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-2 sm:px-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isLoading 
                ? "Please wait..." 
                : cooldownSeconds > 0 
                  ? `Please wait ${cooldownSeconds}s...`
                  : "Ask for a recommendation..."
            }
            disabled={isDisabled}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            inputMode="text"
            enterKeyHint="send"
            style={{ 
              WebkitUserSelect: 'text',
              userSelect: 'text',
              WebkitTouchCallout: 'default',
              touchAction: 'manipulation'
            }}
            className="w-full bg-gray-700 text-gray-200 placeholder-gray-400 rounded-full py-2 sm:py-3 pl-4 sm:pl-5 pr-12 sm:pr-14 text-sm sm:text-base border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isDisabled || !input.trim()}
            style={{ 
              WebkitTouchCallout: 'default',
              touchAction: 'manipulation',
              pointerEvents: 'auto'
            }}
            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-cyan-500 text-white hover:bg-cyan-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            title={cooldownSeconds > 0 ? `Please wait ${cooldownSeconds} seconds before sending another message` : ''}
          >
            <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;