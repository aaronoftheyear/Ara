import React from 'react';

interface SystemNotificationProps {
  message: string;
}

const SystemNotification: React.FC<SystemNotificationProps> = ({ message }) => {
  return (
    <div className="flex justify-center my-4 px-2">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm max-w-md w-full">
        <p className="text-gray-400 text-xs sm:text-sm text-center whitespace-pre-line leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
};

export default SystemNotification;

