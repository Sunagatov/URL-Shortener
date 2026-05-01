import { useEffect } from 'react';
import {
  getUnhandledRejectionContext,
  getWindowErrorContext,
  resolveFrontendLogEndpoint,
} from '@/app/diagnostics';
import { createHttpLogReporter, logger, setLogReporter } from '@/shared/lib/logger';

export function FrontendDiagnostics() {
  useEffect(() => {
    const frontendLogEndpoint = resolveFrontendLogEndpoint({
      backendRestApiUrl: import.meta.env.VITE_BACKEND_REST_API_URL,
      frontendLogEndpoint: import.meta.env.VITE_FRONTEND_LOG_ENDPOINT,
    });

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
      logger.error('frontend.runtime.window_error', getWindowErrorContext(event));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error(
        'frontend.runtime.unhandled_rejection',
        getUnhandledRejectionContext(event.reason),
      );
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
