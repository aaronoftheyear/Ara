import React, { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  characterMessages?: string[];
}

const animeLoadingMessages = [
  { text: "Reading Backstory", duration: 1500 },
  { text: "Reading Backstory", duration: 1400 },
  { text: "Separating Canon from Fillers", duration: 1600 },
  { text: "Separating Canon from Fillers", duration: 1500 },
  { text: "Writing Recommendations", duration: 1700 },
  { text: "Writing Recommendations", duration: 1600 },
  { text: "Listening to Ending Theme", duration: 1500 },
];

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ characterMessages }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (characterMessages && characterMessages.length > 0) {
      // Limit to first 2 character messages for recommendations
      const limitedMessages = characterMessages.slice(0, 2);
      
      // Stop cycling after reaching the last message
      if (currentMessageIndex >= limitedMessages.length - 1) return;
      
      const timer = setTimeout(() => {
        setCurrentMessageIndex(prev => Math.min(prev + 1, limitedMessages.length - 1));
      }, 6000); // 6 seconds each for readability
      return () => clearTimeout(timer);
    } else {
      // Use default anime loading messages
      if (currentStep >= animeLoadingMessages.length - 1) return;

      const timer = setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, animeLoadingMessages.length - 1));
      }, animeLoadingMessages[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep, characterMessages, currentMessageIndex]);

  // For questions, show simple dots without text
  if (!characterMessages || characterMessages.length === 0) {
    return (
      <div className="flex justify-center items-center space-x-1">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
      </div>
    );
  }

  // For recommendations, show character messages (limited to 2)
  const limitedMessages = characterMessages.slice(0, 2);
  const currentText = limitedMessages[currentMessageIndex];

  return (
    <div className="flex flex-col justify-center items-center space-y-3">
      <div className="flex justify-center items-center space-x-1">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
      </div>
      <div className="text-cyan-300 text-sm font-medium animate-pulse">
        {currentText}
      </div>
    </div>
  );
};

export default LoadingSpinner;
