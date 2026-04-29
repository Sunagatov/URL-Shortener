import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AuthService from '@/features/auth/lib/authService';
import { storage } from '@/features/auth/lib/storage';
import { endpoints } from '@/shared/api/endpoints';
import type { AuthTokens } from '@/shared/types';

const backendRestApiUrl = import.meta.env.REACT_APP_BACKEND_REST_API_URL;

if (!backendRestApiUrl) {
    throw new Error('REACT_APP_BACKEND_REST_API_URL environment variable is not set');
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const AUTH_PATHS = [
    endpoints.auth.signIn,
    endpoints.auth.signUp,
    endpoints.auth.refresh,
];

const isAuthRequest = (url?: string): boolean => {
    if (!url) return false;
    return AUTH_PATHS.some((path) => url === path || url.endsWith(path));
};

const defaultConfig = {
    baseURL: backendRestApiUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
};

const rawAxios = axios.create(defaultConfig);
const axiosInstance = axios.create(defaultConfig);

// Request interceptor to add access token to headers
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (!isAuthRequest(config.url)) {
            const accessToken = storage.getAccessToken();
            if (accessToken && config.headers) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
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

        originalRequest._retry = true;

        try {
            const response = await rawAxios.post(endpoints.auth.refresh, { refreshToken });
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                response.data as Partial<AuthTokens>;

            if (!newAccessToken) {
                AuthService.logout();

                if (!['/', '/signin', '/signup'].includes(window.location.pathname)) {
                    window.location.replace('/signin');
                }

                return Promise.reject(new Error('Refresh endpoint did not return a new access token'));
            }

            storage.setAccessToken(newAccessToken);

            if (newRefreshToken) {
                storage.setRefreshToken(newRefreshToken);
            }

            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            return axiosInstance(originalRequest);
        } catch (refreshError) {
            AuthService.logout();

            if (!['/', '/signin', '/signup'].includes(window.location.pathname)) {
                window.location.replace('/signin');
            }

            return Promise.reject(refreshError);
        }
    }
);

export default axiosInstance;
