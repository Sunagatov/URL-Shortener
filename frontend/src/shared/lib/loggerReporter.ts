type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogEntry = {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  runtime: 'browser';
  sessionId: string;
  timestamp: string;
};

export type LogReporter = (entry: LogEntry) => void;

type CreateHttpLogReporterOptions = {
  endpoint: string;
  minLevel?: LogLevel;
};

const levelWeight: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldReportEntry(level: LogLevel, minLevel: LogLevel) {
  return levelWeight[level] >= levelWeight[minLevel];
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
