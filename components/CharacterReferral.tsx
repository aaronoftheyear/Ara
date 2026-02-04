import React from 'react';

interface CharacterReferralProps {
  referredCharacterId: string;
  referredCharacterName: string;
  currentCharacterName: string;
  onAcceptReferral: () => void;
  onDeclineReferral: () => void;
  isCharacterLocked: boolean;
}

const CharacterReferral: React.FC<CharacterReferralProps> = ({ 
  referredCharacterId, 
  referredCharacterName, 
  currentCharacterName,
  onAcceptReferral, 
  onDeclineReferral,
  isCharacterLocked
}) => {
  const [isHidden, setIsHidden] = React.useState(false);

  const handleAccept = () => {
    setIsHidden(true);
    onAcceptReferral();
  };

  const handleDecline = () => {
    setIsHidden(true);
    onDeclineReferral();
  };

  if (isHidden) return null;

  return (
    <div className="mt-2 flex gap-3 justify-center">
      <button
        onClick={handleAccept}
        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
      >
        {isCharacterLocked ? 'Discover New Contact' : `Switch to ${referredCharacterName.split(' ')[0]}`}
      </button>
      <button
        onClick={handleDecline}
        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
      >
        Continue with {currentCharacterName.split(' ')[0]}
      </button>
    </div>
  );
};

export default CharacterReferral;

