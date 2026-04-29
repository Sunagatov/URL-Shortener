type ErrorResponseData = {
  errorMessage?: string;
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

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const candidate = asErrorWithResponse(error);
  return candidate?.response?.data?.errorMessage || candidate?.message || fallback;
};

export const isSessionInvalidError = (error: unknown): boolean => {
  const status = getApiErrorStatus(error);
  return status === 401 || status === 403 || status === 404;
};
