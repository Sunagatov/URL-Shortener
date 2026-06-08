type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = Record<string, unknown>;

type LogEntry = {
  context?: LogContext;
  level: LogLevel;
  message: string;
  runtime: 'browser';
  sessionId: string;
  timestamp: string;
};

const backendRestApiUrl = import.meta.env.VITE_BACKEND_REST_API_URL;
const configuredFrontendLogEndpoint = import.meta.env.VITE_FRONTEND_LOG_ENDPOINT?.trim();
const isDevelopment = import.meta.env.DEV;
const consoleThresholdByLevel: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};
const consoleThreshold = isDevelopment
  ? consoleThresholdByLevel.debug
  : consoleThresholdByLevel.warn;

export const loggerSessionId = crypto.randomUUID();

function resolveRemoteLogEndpoint() {
  if (configuredFrontendLogEndpoint) {
    return configuredFrontendLogEndpoint;
  }

  if (!backendRestApiUrl?.trim()) {
    return null;
  }

  try {
    return new URL('/api/v1/frontend/logs', backendRestApiUrl).toString();
  } catch {
    return null;
  }
}

function serializeContext(context?: LogContext) {
  if (!context) {
    return undefined;
  }

  const seen = new WeakSet<object>();

  try {
    return JSON.parse(
      JSON.stringify(context, (_key, value: unknown) => {
        if (value instanceof Error) {
          return {
            message: value.message,
            name: value.name,
            stack: value.stack,
          };
        }

        if (value instanceof Date) {
          return value.toISOString();
        }

        if (value && typeof value === 'object') {
          if (seen.has(value as object)) {
            return '[Circular]';
          }

          seen.add(value as object);
        }

        return value;
      })
    ) as LogContext;
  } catch {
    return {
      note: 'Context could not be serialized',
    } satisfies LogContext;
  }
}

function createLogEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
  return {
    context: serializeContext(context),
    level,
    message,
    runtime: 'browser',
    sessionId: loggerSessionId,
    timestamp: new Date().toISOString(),
  };
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

  consoleMethod(`[frontend:${entry.level}] ${entry.message}`, entry.context);
}

function reportRemotely(entry: LogEntry) {
  if (!['warn', 'error'].includes(entry.level)) {
    return;
  }

  const endpoint = resolveRemoteLogEndpoint();

  if (!endpoint) {
    return;
  }

  const body = JSON.stringify(entry);

  if (typeof navigator.sendBeacon === 'function') {
    const payload = new Blob([body], { type: 'application/json' });

    if (navigator.sendBeacon(endpoint, payload)) {
      return;
    }
  }

  if (typeof fetch === 'function') {
    void fetch(endpoint, {
      body,
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
      method: 'POST',
    }).catch(() => {
      // Remote telemetry must never interfere with app behavior.
    });
  }
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = createLogEntry(level, message, context);
  emitToConsole(entry);
  reportRemotely(entry);
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
};
