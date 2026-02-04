// Session tracking service for active users
// Sends heartbeat to backend API

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

let sessionId: string | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

export function getSessionId(): string {
  if (!sessionId) {
    // Generate or retrieve session ID
    const stored = sessionStorage.getItem('ara_session_id');
    if (stored) {
      sessionId = stored;
    } else {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('ara_session_id', sessionId);
    }
  }
  return sessionId;
}

export async function sendHeartbeat(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: getSessionId(),
        timestamp: Date.now(),
      }),
    });
    
    // Only log if it's not a 404 (API not deployed yet)
    if (!response.ok && response.status !== 404) {
      console.warn('Heartbeat failed:', response.status);
    }
  } catch (err) {
    // Silently fail - API might not be deployed
  }
}

export function startSessionTracking(): void {
  // Send initial heartbeat
  sendHeartbeat();

  // Send heartbeat every 2 minutes
  heartbeatInterval = setInterval(() => {
    sendHeartbeat();
  }, 2 * 60 * 1000);

  // Send heartbeat on page visibility change (user comes back)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      sendHeartbeat();
    }
  });
}

export function stopSessionTracking(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

