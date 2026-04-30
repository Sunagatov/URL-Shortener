import { endpoints } from '@/shared/api/endpoints';
import { useEffect } from 'react';
import { createHttpLogReporter, logger, setLogReporter } from '@/shared/lib/logger';

const backendRestApiUrl = import.meta.env.VITE_BACKEND_REST_API_URL;
const frontendLogEndpoint =
  import.meta.env.VITE_FRONTEND_LOG_ENDPOINT?.trim() ||
  new URL(endpoints.telemetry.frontendLogs, backendRestApiUrl).toString();

export function FrontendDiagnostics() {
  useEffect(() => {
    if (frontendLogEndpoint) {
      setLogReporter(
        createHttpLogReporter({
          endpoint: frontendLogEndpoint,
          minLevel: 'warn',
        }),
      );
    }

    logger.info('frontend.runtime.started', {
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
    });

    const handleWindowError = (event: ErrorEvent) => {
      logger.error('frontend.runtime.window_error', {
        error: event.error instanceof Error ? event.error : undefined,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        message: event.message,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      logger.error('frontend.runtime.unhandled_rejection', {
        reason: reason instanceof Error ? reason : { value: String(reason) },
      });
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      setLogReporter(null);
    };
  }, []);

  return null;
}
