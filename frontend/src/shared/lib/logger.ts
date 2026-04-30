type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogPrimitive = boolean | number | string | null | undefined;

export type LogValue =
  | LogPrimitive
  | Date
  | Error
  | LogValue[]
  | { [key: string]: LogValue };

export type LogContext = Record<string, LogValue>;

export type LogEntry = {
  level: LogLevel;
  message: string;
  context?: LogContext;
  runtime: 'browser';
  sessionId: string;
  timestamp: string;
};

type LogReporter = (entry: LogEntry) => void;
type LogMethod = (message: string, context?: LogContext) => void;
type ReporterLevel = LogLevel;
type CreateHttpLogReporterOptions = {
  endpoint: string;
  minLevel?: ReporterLevel;
};

const REDACTED_VALUE = '[REDACTED]';
const MAX_DEPTH = 5;
const SENSITIVE_KEY_PATTERN =
  /authorization|cookie|password|secret|token|api[-_]?key|access[-_]?key|refresh[-_]?token/i;
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

function isSensitiveKey(key: string) {
  return SENSITIVE_KEY_PATTERN.test(key);
}

function sanitizeError(error: Error) {
  return {
    message: error.message,
    name: error.name,
    stack: error.stack,
  };
}

function sanitizeValue(
  value: LogValue,
  depth: number,
  seen: WeakSet<object>,
  key?: string,
): LogValue {
  if (key && isSensitiveKey(key)) {
    return REDACTED_VALUE;
  }

  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return sanitizeError(value);
  }

  if (depth >= MAX_DEPTH) {
    return '[TRUNCATED]';
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1, seen));
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[CIRCULAR]';
    }

    seen.add(value);

    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        sanitizeValue(entryValue as LogValue, depth + 1, seen, entryKey),
      ]),
    );
  }

  return String(value);
}

function sanitizeContext(context?: LogContext) {
  if (!context) {
    return undefined;
  }

  return sanitizeValue(context, 0, new WeakSet()) as LogContext;
}

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

function shouldReportEntry(level: LogLevel, minLevel: ReporterLevel) {
  return consoleThresholdByLevel[level] >= consoleThresholdByLevel[minLevel];
}

function sendWithBeacon(endpoint: string, body: string) {
  if (typeof navigator.sendBeacon !== 'function') {
    return false;
  }

  const payload = new Blob([body], { type: 'application/json' });
  return navigator.sendBeacon(endpoint, payload);
}

async function sendWithFetch(endpoint: string, body: string) {
  if (typeof fetch !== 'function') {
    return;
  }

  await fetch(endpoint, {
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    keepalive: true,
    method: 'POST',
  });
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = createLogEntry(level, message, context);
  emitToConsole(entry);
  reporter?.(entry);
}

export function setLogReporter(nextReporter: LogReporter | null) {
  reporter = nextReporter;
}

export function createHttpLogReporter({
  endpoint,
  minLevel = 'warn',
}: CreateHttpLogReporterOptions): LogReporter {
  const normalizedEndpoint = endpoint.trim();

  return (entry) => {
    if (!normalizedEndpoint || !shouldReportEntry(entry.level, minLevel)) {
      return;
    }

    const body = JSON.stringify(entry);

    if (sendWithBeacon(normalizedEndpoint, body)) {
      return;
    }

    void sendWithFetch(normalizedEndpoint, body);
  };
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
