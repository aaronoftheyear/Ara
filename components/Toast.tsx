import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number; // Duration in milliseconds (default: 6000)
}

export const Toast: React.FC<ToastProps> = ({ message, onDismiss, duration = 6000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-fade after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade animation to complete before calling onDismiss
      setTimeout(() => {
        onDismiss();
      }, 300); // Match transition duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  return (
    <div
      className={`fixed bottom-32 left-1/2 transform -translate-x-1/2 z-[10000] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[300px] max-w-[90vw]">
        <div className="flex-1 text-gray-200 text-sm">{message}</div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-200 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

