type ErrorResponseData = {
  errorMessage?: string;
  code?: string;
  retryAfterSeconds?: number;
};

type ErrorWithResponse = {
  message?: string;
  response?: {
    status?: number;
    data?: ErrorResponseData;
  };
};

const asErrorWithResponse = (error: unknown): ErrorWithResponse | null => {
  if (error && typeof error === 'object') {
    return error as ErrorWithResponse;
  }

  return null;
};

export const getApiErrorStatus = (error: unknown): number | undefined => {
  return asErrorWithResponse(error)?.response?.status;
};

export const getApiErrorCode = (error: unknown): string | undefined => {
  return asErrorWithResponse(error)?.response?.data?.code;
};

export const getApiErrorRetryAfterSeconds = (error: unknown): number | undefined => {
  const retryAfterSeconds = asErrorWithResponse(error)?.response?.data?.retryAfterSeconds;
  return typeof retryAfterSeconds === 'number' && retryAfterSeconds > 0 ? retryAfterSeconds : undefined;
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const candidate = asErrorWithResponse(error);
  const status = candidate?.response?.status;
  const retryAfterSeconds = getApiErrorRetryAfterSeconds(error);

  if (status === 429 && retryAfterSeconds !== undefined) {
    return `Too many requests. Please wait ${retryAfterSeconds} second${retryAfterSeconds === 1 ? '' : 's'} and try again.`;
  }

  return candidate?.response?.data?.errorMessage || candidate?.message || fallback;
};

export const isSessionInvalidError = (error: unknown): boolean => {
  const status = getApiErrorStatus(error);
  return status === 401 || status === 403 || status === 404;
};

export const isRateLimitError = (error: unknown): boolean => {
  return getApiErrorStatus(error) === 429;
};
