import { endpoints } from '@/shared/api/endpoints';
import type { LogContext, LogValue } from '@/shared/lib/loggerSanitizer';

type ResolveFrontendLogEndpointOptions = {
  backendRestApiUrl?: string;
  frontendLogEndpoint?: string;
};

export function resolveFrontendLogEndpoint({
  backendRestApiUrl,
  frontendLogEndpoint,
}: ResolveFrontendLogEndpointOptions) {
  const customEndpoint = frontendLogEndpoint?.trim();

  if (customEndpoint) {
    return customEndpoint;
  }

  if (!backendRestApiUrl?.trim()) {
    return null;
  }

  try {
    return new URL(endpoints.telemetry.frontendLogs, backendRestApiUrl).toString();
  } catch {
    return null;
  }
}

export function getWindowErrorContext(event: ErrorEvent): LogContext {
  return {
    error: event.error instanceof Error ? event.error : undefined,
    filename: event.filename,
    line: event.lineno,
    column: event.colno,
    message: event.message,
  };
}

export function getUnhandledRejectionContext(reason: unknown): LogContext {
  return {
    reason: reason instanceof Error ? reason : ({ value: String(reason) } satisfies Record<string, LogValue>),
  };
}
