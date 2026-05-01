import { endpoints } from '@/shared/api/endpoints';

export const CLIENT_TRACE_ID_HEADER = 'X-Trace-ID';

const backendRestApiUrl = import.meta.env.VITE_BACKEND_REST_API_URL;

if (!backendRestApiUrl) {
  throw new Error('VITE_BACKEND_REST_API_URL environment variable is not set');
}

const AUTH_PATHS = [
  endpoints.auth.signIn,
  endpoints.auth.signUp,
  endpoints.auth.refresh,
];

export const defaultHttpClientConfig = {
  baseURL: backendRestApiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export function isAuthRequest(url?: string): boolean {
  if (!url) {
    return false;
  }

  return AUTH_PATHS.some((path) => url === path || url.endsWith(path));
}
