import type { ConsoleLogEntry } from './consoleCapture';

export interface BugReportPayload {
  description: string;
  contactEmail?: string;
  includeConsoleLogs: boolean;
  consoleLogs?: ConsoleLogEntry[];
}

export interface BugReportResponse {
  ok: boolean;
  status: number;
  message?: string;
}

const buildReportBody = (payload: BugReportPayload) => {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
  const locationHref = typeof window !== 'undefined' ? window.location.href : 'unknown';

  return {
    description: payload.description,
    contactEmail: payload.contactEmail || null,
    userAgent,
    pageUrl: locationHref,
    timestamp: new Date().toISOString(),
    consoleLogs: payload.includeConsoleLogs ? payload.consoleLogs || [] : [],
  };
};

export const submitBugReport = async (payload: BugReportPayload): Promise<BugReportResponse> => {
  const endpoint = import.meta.env.VITE_BUG_REPORT_ENDPOINT;

  if (!endpoint) {
    throw new Error('Bug report endpoint is not configured. Set VITE_BUG_REPORT_ENDPOINT before deploying.');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildReportBody(payload)),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => 'Failed to submit bug report');
    throw new Error(message || `Bug report failed with status ${response.status}`);
  }

  let message: string | undefined;
  try {
    const data = await response.json();
    message = data?.message;
  } catch (error) {
    // If the endpoint does not return JSON, ignore parsing errors.
  }

  return {
    ok: true,
    status: response.status,
    message,
  };
};
