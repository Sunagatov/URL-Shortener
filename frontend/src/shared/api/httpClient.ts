import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authSession } from '@/shared/auth/authSession';
import { storage } from '@/shared/auth/storage';
import { endpoints } from '@/shared/api/endpoints';
import { redirectToSignIn } from '@/shared/lib/authRedirect';
import type { AuthTokens } from '@/shared/types';

const backendRestApiUrl = import.meta.env.VITE_BACKEND_REST_API_URL;

if (!backendRestApiUrl) {
    throw new Error('VITE_BACKEND_REST_API_URL environment variable is not set');
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
                authSession.logout();
                redirectToSignIn();

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
            authSession.logout();
            redirectToSignIn();

            return Promise.reject(refreshError);
        }
    }
);

export default axiosInstance;
