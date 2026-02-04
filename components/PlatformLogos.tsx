// Platform logos for login screen
import React from 'react';

export const MyAnimeListLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    {/* MAL Blue Color */}
    <rect width="100" height="100" rx="8" fill="#2E51A2"/>
    <text x="50" y="70" fontSize="60" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">
      MAL
    </text>
  </svg>
);

export const AniListLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    {/* AniList Blue Color */}
    <rect width="100" height="100" rx="8" fill="#02A9FF"/>
    <text x="50" y="70" fontSize="48" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">
      AL
    </text>
  </svg>
);

export const AnimePlanetLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    {/* Anime-Planet Green Color */}
    <rect width="100" height="100" rx="8" fill="#00CF35"/>
    <text x="50" y="65" fontSize="36" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">
      AP
    </text>
    <circle cx="30" cy="75" r="4" fill="white"/>
    <circle cx="50" cy="77" r="3" fill="white"/>
    <circle cx="70" cy="75" r="4" fill="white"/>
  </svg>
);

export const ManualIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

