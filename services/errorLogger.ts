// Error logging service for frontend
// Sends errors to backend API

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ErrorLog {
  message: string;
  stack?: string;
  userAgent: string;
  url: string;
  timestamp: string;
}

export async function logError(error: Error | string, stack?: string): Promise<void> {
  try {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = stack || (error instanceof Error ? error.stack : undefined);

    const errorLog: ErrorLog = {
      message: errorMessage,
      stack: errorStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(`${API_BASE_URL}/error`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorLog),
    });
    
    // Only log if it's not a 404 (API not deployed yet)
    if (!response.ok && response.status !== 404) {
      console.warn('Failed to log error to backend:', response.status);
    }
  } catch (err) {
    // Silently fail
    console.warn('Error logging failed:', err);
  }
}

// Initialize global error handler
export function initializeErrorHandler(): void {
  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    logError(event.error || event.message, event.error?.stack);
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(
      event.reason instanceof Error ? event.reason : String(event.reason),
      event.reason instanceof Error ? event.reason.stack : undefined
    );
  });
}

