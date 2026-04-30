import { useEffect } from 'react';
import { logger } from '@/shared/lib/logger';

export function FrontendDiagnostics() {
  useEffect(() => {
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
    };
  }, []);

  return null;
}
