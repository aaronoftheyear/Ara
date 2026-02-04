import React, { useMemo, useState } from 'react';
import type { ConsoleLogEntry } from '../services/consoleCapture';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ConsoleLogEntry[];
  onSubmit: (payload: { description: string; contactEmail?: string; includeConsoleLogs: boolean }) => Promise<void>;
  isSubmitting: boolean;
  status: 'idle' | 'success' | 'error';
  errorMessage?: string;
}

const BugReportModal: React.FC<BugReportModalProps> = ({
  isOpen,
  onClose,
  logs,
  onSubmit,
  isSubmitting,
  status,
  errorMessage,
}) => {
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [includeConsoleLogs, setIncludeConsoleLogs] = useState(true);
  const [showLogs, setShowLogs] = useState(false);

  const formattedLogs = useMemo(() => {
    return logs
      .map((entry) => {
        const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
        return `${prefix} ${entry.message}`;
      })
      .join('\n');
  }, [logs]);

  const resetForm = () => {
    setDescription('');
    setContactEmail('');
    setIncludeConsoleLogs(true);
    setShowLogs(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!description.trim()) {
      return;
    }

    await onSubmit({
      description: description.trim(),
      contactEmail: contactEmail.trim() || undefined,
      includeConsoleLogs,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-2xl rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Report a Bug</h2>
            <p className="text-sm text-gray-400 mt-1">
              Let us know what went wrong. Console diagnostics are attached automatically unless you opt out.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Close bug report dialog"
            type="button"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="bug-description">
              What happened? <span className="text-red-400">*</span>
            </label>
            <textarea
              id="bug-description"
              required
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-600"
              placeholder="Describe the steps and what you expected to happen..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="bug-email">
              Contact email (optional)
            </label>
            <input
              id="bug-email"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-600"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-3 py-2">
            <label className="flex items-center gap-2 text-sm text-gray-300" htmlFor="include-console">
              <input
                id="include-console"
                type="checkbox"
                checked={includeConsoleLogs}
                onChange={(event) => setIncludeConsoleLogs(event.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
              />
              Include console diagnostics (recommended)
            </label>
            <button
              type="button"
              disabled={logs.length === 0}
              onClick={() => setShowLogs((prev) => !prev)}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 disabled:text-gray-500"
            >
              {showLogs ? 'Hide logs' : `View logs (${logs.length})`}
            </button>
          </div>

          {showLogs && logs.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-700 bg-black/60 p-3 text-xs text-gray-300">
              <pre className="whitespace-pre-wrap break-words text-gray-200">{formattedLogs}</pre>
            </div>
          )}

          {status === 'success' && (
            <div className="rounded-lg border border-green-600/40 bg-green-900/30 px-3 py-2 text-sm text-green-200">
              Thank you! Your bug report was sent successfully.
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-lg border border-red-600/40 bg-red-900/30 px-3 py-2 text-sm text-red-200">
              {errorMessage || 'We could not send the bug report. Please try again in a moment.'}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 hover:bg-cyan-500"
            >
              {isSubmitting ? 'Sending…' : 'Submit report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BugReportModal;
