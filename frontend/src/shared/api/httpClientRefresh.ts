import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { AuthTokens } from '@/shared/auth/types';
import { storage } from '@/shared/auth/storage';
import { endpoints } from '@/shared/api/endpoints';
import { redirectToSignIn } from '@/shared/lib/authRedirect';
import { logger } from '@/shared/lib/logger';
import { isAuthRequest } from '@/shared/api/httpClientConfig';

export type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const refreshTokenRequests = new Map<string, Promise<AuthTokens>>();

export async function refreshFailedSession(
  path?: string,
  error?: unknown,
  expectedRefreshToken?: string | null
) {
  if (expectedRefreshToken !== undefined && storage.getRefreshToken() !== expectedRefreshToken)
    return;
  if (error) {
    logger.error('frontend.auth.refresh_failed', {
      error: error instanceof Error ? error : new Error('Token refresh failed'),
      path,
    });
  }

  storage.clearAll();
  redirectToSignIn();
}

export async function refreshAccessTokenForRequest(
  axiosInstance: AxiosInstance,
  rawAxios: AxiosInstance,
  originalRequest: RetryableRequestConfig
) {
  const refreshToken = storage.getRefreshToken();

  if (!refreshToken || isAuthRequest(originalRequest.url)) {
    return null;
  }

  originalRequest._retry = true;
  logger.warn('frontend.auth.access_token_expired', {
    path: originalRequest.url,
    status: 401,
  });

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshTokens(
    rawAxios,
    refreshToken
  );

  const currentRefreshToken = storage.getRefreshToken();
  if (
    currentRefreshToken !== refreshToken &&
    (!newRefreshToken || currentRefreshToken !== newRefreshToken)
  )
    throw new Error('Session changed while refreshing');

  if (!newAccessToken) {
    logger.error('frontend.auth.refresh_missing_access_token', {
      path: originalRequest.url,
    });
    throw new Error('Refresh endpoint did not return a new access token');
  }

  storage.setAccessToken(newAccessToken);

  if (newRefreshToken) {
    storage.setRefreshToken(newRefreshToken);
  }

  if (originalRequest.headers) {
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
  }

  logger.info('frontend.auth.refresh_succeeded', {
    path: originalRequest.url,
  });

  return axiosInstance(originalRequest);
}

function refreshTokens(rawAxios: AxiosInstance, refreshToken: string): Promise<AuthTokens> {
  const pending = refreshTokenRequests.get(refreshToken);
  if (pending) return pending;
  const request = rawAxios
    .post(endpoints.auth.refresh, { refreshToken })
    .then(response => response.data as AuthTokens)
    .finally(() => {
      refreshTokenRequests.delete(refreshToken);
    });

  refreshTokenRequests.set(refreshToken, request);
  return request;
}
