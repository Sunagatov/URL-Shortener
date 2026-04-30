import {
  getApiErrorCode,
  getApiErrorMessage,
  getApiErrorRetryAfterSeconds,
  isRateLimitError,
} from '@/shared/lib/apiErrors';

describe('apiErrors', () => {
  it('formats rate limit errors with retryAfterSeconds when available', () => {
    const error = {
      response: {
        status: 429,
        data: {
          code: 'RATE_LIMIT_EXCEEDED',
          errorMessage: 'Too many requests. Please try again later.',
          retryAfterSeconds: 12,
        },
      },
    };

    expect(getApiErrorMessage(error, 'Fallback message')).toBe(
      'Too many requests. Please wait 12 seconds and try again.',
    );
    expect(getApiErrorRetryAfterSeconds(error)).toBe(12);
    expect(getApiErrorCode(error)).toBe('RATE_LIMIT_EXCEEDED');
    expect(isRateLimitError(error)).toBe(true);
  });

  it('falls back to backend error message when retryAfterSeconds is absent', () => {
    const error = {
      response: {
        status: 429,
        data: {
          errorMessage: 'Too many requests. Please try again later.',
        },
      },
    };

    expect(getApiErrorMessage(error, 'Fallback message')).toBe(
      'Too many requests. Please try again later.',
    );
    expect(getApiErrorRetryAfterSeconds(error)).toBeUndefined();
  });
});
