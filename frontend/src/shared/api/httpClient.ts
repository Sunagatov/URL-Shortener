import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  CLIENT_TRACE_ID_HEADER,
  defaultHttpClientConfig,
  isAuthRequest,
} from '@/shared/api/httpClientConfig';
import {
  refreshAccessTokenForRequest,
  refreshFailedSession,
  type RetryableRequestConfig,
} from '@/shared/api/httpClientRefresh';
import { storage } from '@/shared/auth/storage';
import { loggerSessionId } from '@/shared/lib/logger';

const rawAxios = axios.create(defaultHttpClientConfig);
const axiosInstance = axios.create(defaultHttpClientConfig);

const attachRequestContext = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  if (config.headers) {
    config.headers[CLIENT_TRACE_ID_HEADER] = loggerSessionId;
  }

  return config;
};

rawAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => attachRequestContext(config),
  (error: AxiosError) => Promise.reject(error),
);

// Request interceptor to add shared trace context and access token headers
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    attachRequestContext(config);

    if (!isAuthRequest(config.url)) {
      const accessToken = storage.getAccessToken();
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const refreshToken = storage.getRefreshToken();

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      !refreshToken ||
      isAuthRequest(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    try {
      const retriedResponse = await refreshAccessTokenForRequest(
        axiosInstance,
        rawAxios,
        originalRequest,
      );

      if (!retriedResponse) {
        return Promise.reject(error);
      }

      return retriedResponse;
    } catch (refreshError) {
      await refreshFailedSession(originalRequest.url, refreshError);
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;
