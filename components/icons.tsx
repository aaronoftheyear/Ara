import React from 'react';

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
      clipRule="evenodd"
    />
  </svg>
);

export const AssistantIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M16.5 7.5h-9v9h9v-9z" />
    <path
      fillRule="evenodd"
      d="M8.25 4.5A3.75 3.75 0 004.5 8.25v7.5A3.75 3.75 0 008.25 19.5h7.5A3.75 3.75 0 0019.5 15.75v-7.5A3.75 3.75 0 0015.75 4.5h-7.5zM17.25 8.25a.75.75 0 000-1.5h-.75a.75.75 0 000 1.5h.75zM17.25 12a.75.75 0 000-1.5h-3a.75.75 0 000 1.5h3zM17.25 15.75a.75.75 0 000-1.5h-3a.75.75 0 000 1.5h3zM9.75 8.25a.75.75 0 000-1.5H9a.75.75 0 000 1.5h.75zM9.75 12a.75.75 0 000-1.5H9a.75.75 0 000 1.5h.75zM9.75 15.75a.75.75 0 000-1.5H9a.75.75 0 000 1.5h.75z"
      clipRule="evenodd"
    />
  </svg>
);

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a.75.75 0 010-1.113zM12.001 18C7.858 18 4.408 15.44 3.006 12c1.4-3.44 4.852-6 8.995-6s7.592 2.56 8.995 6c-1.402 3.44-4.853 6-8.995 6z" clipRule="evenodd" />
    </svg>
  );
  
  export const EyeSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L8.717 5.305A9.749 9.749 0 0112 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
          <path d="M15.75 12c0 .18-.013.357-.037.53l-1.48-1.48A3.752 3.752 0 0012 9.375a3.75 3.75 0 00-3.75 3.75c0 .18.013.357.037.53l-1.48-1.48A3.752 3.752 0 006.375 12a3.75 3.75 0 003.75 3.75c.18 0 .357-.013.53-.037l1.48 1.48A3.752 3.752 0 0012 15.625a3.75 3.75 0 003.75-3.75z" />
          <path d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c1.552 0 3.021.365 4.348 1.002L14.04 7.04A5.25 5.25 0 008.34 12.74l-1.772 1.772A11.343 11.343 0 011.323 11.447z" />
      </svg>
  );

export const AdjustmentsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10.5 4.5a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z" />
      <path fillRule="evenodd" d="M11.25 3.75a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zM10.5 6a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0V6z" />
      <path d="M10.5 12.75a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z" />
      <path fillRule="evenodd" d="M11.25 12a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zM10.5 14.25a.75.75 0 00-1.5 0V15a.75.75 0 001.5 0v-.75z" />
      <path d="M3.75 6a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H4.5A.75.75 0 013.75 6zm0 10.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75zM15 6a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H15.75A.75.75 0 0115 6zm0 10.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H15.75a.75.75 0 01-.75-.75z" />
    </svg>
);

export const ArrowPathIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 000 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
    </svg>
);

export const BugIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M10.5 1.5a.75.75 0 00-1.5 0V3a3.75 3.75 0 001.964 3.3 5.252 5.252 0 00-4.756 3.03l-1.61-.92a.75.75 0 10-.75 1.3l1.469.84a5.265 5.265 0 00-.067.95v1.5H2.25a.75.75 0 000 1.5h3v1.5a2.25 2.25 0 002.25 2.25h.75v1.5a.75.75 0 001.5 0V19.5h3v1.5a.75.75 0 001.5 0V19.5h.75a2.25 2.25 0 002.25-2.25v-1.5h3a.75.75 0 000-1.5H18v-1.5c0-.327-.023-.649-.067-.964l1.469-.826a.75.75 0 10-.75-1.3l-1.61.905a5.252 5.252 0 00-4.756-3.03A3.75 3.75 0 0015 3V1.5a.75.75 0 00-1.5 0V3a2.25 2.25 0 11-3 0V1.5zm-3 9.75A3.75 3.75 0 0111.25 7.5h1.5A3.75 3.75 0 0116.5 11.25v4.5a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75v-4.5z" />
  </svg>
);

export const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

export const InformationCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd" />
  </svg>
);

export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" />
  </svg>
);