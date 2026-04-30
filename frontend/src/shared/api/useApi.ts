import { useState, useCallback } from 'react';
import {
  getApiErrorCode,
  getApiErrorMessage,
  getApiErrorRetryAfterSeconds,
  getApiErrorStatus,
} from '@/shared/lib/apiErrors';
import { logger } from '@/shared/lib/logger';
import type { ApiError } from '@/shared/types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (apiCall: () => Promise<T>, options?: { action?: string }) => Promise<T | null>;
  reset: () => void;
}

export const useApi = <T>(): UseApiReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<T>, options?: { action?: string }): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiCall();
        setState(prev => ({ ...prev, data: result, loading: false }));
        return result;
      } catch (error: unknown) {
        const status = getApiErrorStatus(error) ?? 500;
        const code = getApiErrorCode(error);
        const retryAfterSeconds = getApiErrorRetryAfterSeconds(error);
        const apiError: ApiError = {
          errorMessage: getApiErrorMessage(error, 'An error occurred'),
          status,
          code,
          retryAfterSeconds,
        };

        if (status === 429) {
          logger.warn('frontend.api.rate_limited', {
            action: options?.action ?? 'unknown',
            error: {
              code: apiError.code,
              message: apiError.errorMessage,
              retryAfterSeconds: apiError.retryAfterSeconds,
              status: apiError.status,
            },
          });
        } else {
          logger.warn('frontend.api.request_failed', {
            action: options?.action ?? 'unknown',
            error: {
              code: apiError.code,
              message: apiError.errorMessage,
              status: apiError.status,
            },
          });
        }

        setState(prev => ({ ...prev, error: apiError, loading: false }));
        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};
