type LogPrimitive = boolean | number | string | null | undefined;

export type LogValue =
  | LogPrimitive
  | Date
  | Error
  | LogValue[]
  | { [key: string]: LogValue };

export type LogContext = Record<string, LogValue>;

const REDACTED_VALUE = '[REDACTED]';
const MAX_DEPTH = 5;
const SENSITIVE_KEY_PATTERN =
  /authorization|cookie|password|secret|token|api[-_]?key|access[-_]?key|refresh[-_]?token/i;

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

export function sanitizeContext(context?: LogContext) {
  if (!context) {
    return undefined;
  }

  return sanitizeValue(context, 0, new WeakSet()) as LogContext;
}
