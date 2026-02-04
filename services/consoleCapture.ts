export type ConsoleLogLevel = 'log' | 'info' | 'warn' | 'error';

export interface ConsoleLogEntry {
  level: ConsoleLogLevel;
  message: string;
  timestamp: string;
}

const MAX_LOG_ENTRIES = 100;

let logBuffer: ConsoleLogEntry[] = [];
let isConsolePatched = false;

const formatConsoleArgs = (args: unknown[]): string => {
  return args
    .map((arg) => {
      if (typeof arg === 'string') {
        return arg;
      }
      try {
        return JSON.stringify(arg);
      } catch (error) {
        return String(arg);
      }
    })
    .join(' ');
};

const patchConsoleMethod = (level: ConsoleLogLevel) => {
  const originalMethod = console[level];

  console[level] = (...args: unknown[]) => {
    try {
      const entry: ConsoleLogEntry = {
        level,
        message: formatConsoleArgs(args),
        timestamp: new Date().toISOString(),
      };

      logBuffer = [...logBuffer, entry].slice(-MAX_LOG_ENTRIES);
    } catch (error) {
      // If buffering fails, fail silently and fall back to native console behaviour.
    }

    originalMethod.apply(console, args as []);
  };
};

export const startConsoleCapture = (): void => {
  if (isConsolePatched) return;

  (['log', 'info', 'warn', 'error'] as ConsoleLogLevel[]).forEach(patchConsoleMethod);
  isConsolePatched = true;
};

export const getConsoleLogs = (): ConsoleLogEntry[] => {
  return [...logBuffer];
};

export const clearConsoleLogs = (): void => {
  logBuffer = [];
};
