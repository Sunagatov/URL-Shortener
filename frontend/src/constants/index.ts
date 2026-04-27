export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: '/api/v1/auth/signin',
    SIGNUP: '/api/v1/auth/signup',
    REFRESH: '/api/v1/auth/refresh-token',
    LOGOUT: '/api/v1/auth/logout',
  },
  URLS: {
    CREATE: '/api/v1/urls',
    LIST: '/api/v1/urls',
    DETAILS: (hash: string) => `/api/v1/urls/${hash}`,
    DELETE: (hash: string) => `/api/v1/urls/${hash}`,
  },
  USER: {
    PROFILE: '/api/v1/user/profile',
    UPDATE: '/api/v1/user/profile',
    CHANGE_PASSWORD: '/api/v1/user/change-password',
  },
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

export const ROUTES = {
  HOME: '/',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  DASHBOARD: '/account/dashboard',
  PROFILE: '/account/profile',
  SECURITY: '/account/security',
  URL_MAPPINGS: '/account/url-mappings',
  URL_DETAILS: (hash: string) => `/account/url-mappings/${hash}`,
} as const;

export const VALIDATION_RULES = {
  EMAIL: {
    REQUIRED: 'Email is required',
    INVALID: 'Please enter a valid email address',
  },
  PASSWORD: {
    REQUIRED: 'Password is required',
    MIN_LENGTH: 'Password must be at least 8 characters',
  },
  URL: {
    REQUIRED: 'URL is required',
    INVALID: 'Please enter a valid URL',
  },
} as const;
