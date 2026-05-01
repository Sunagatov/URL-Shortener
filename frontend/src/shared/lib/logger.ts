import { sanitizeContext, type LogContext } from '@/shared/lib/loggerSanitizer';
import {
  type LogEntry,
  type LogReporter,
} from '@/shared/lib/loggerReporter';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogMethod = (message: string, context?: LogContext) => void;
const browserRuntime = 'browser' as const;
const isDevelopment = import.meta.env.DEV;
const consoleThresholdByLevel: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};
const consoleThreshold = isDevelopment ? consoleThresholdByLevel.debug : consoleThresholdByLevel.warn;

let reporter: LogReporter | null = null;

export const loggerSessionId = crypto.randomUUID();

function emitToConsole(entry: LogEntry) {
  if (consoleThresholdByLevel[entry.level] < consoleThreshold) {
    return;
  }

  const consoleMethod =
    entry.level === 'debug'
      ? console.debug
      : entry.level === 'info'
        ? console.info
        : entry.level === 'warn'
          ? console.warn
          : console.error;

  consoleMethod(`[frontend:${entry.level}] ${entry.message}`, {
    ...entry,
    context: entry.context,
  });
}

function createLogEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
  return {
    context: sanitizeContext(context),
    level,
    message,
    runtime: browserRuntime,
    sessionId: loggerSessionId,
    timestamp: new Date().toISOString(),
  };
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = createLogEntry(level, message, context);
  emitToConsole(entry);
  reporter?.(entry);
}

export function setLogReporter(nextReporter: LogReporter | null) {
  reporter = nextReporter;
}

const debug: LogMethod = (message, context) => log('debug', message, context);
const info: LogMethod = (message, context) => log('info', message, context);
const warn: LogMethod = (message, context) => log('warn', message, context);
const error: LogMethod = (message, context) => log('error', message, context);

export const logger = {
  debug,
  error,
  info,
  warn,
};

export type { LogContext } from '@/shared/lib/loggerSanitizer';
export { createHttpLogReporter } from '@/shared/lib/loggerReporter';
