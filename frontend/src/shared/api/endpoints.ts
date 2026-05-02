export const endpoints = {
  auth: {
    signIn: '/api/v1/auth/signin',
    signUp: '/api/v1/auth/signup',
    refresh: '/api/v1/auth/refresh-token',
    logout: '/api/v1/auth/logout',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password',
    verifyEmail: '/api/v1/auth/verify-email',
    resendVerification: '/api/v1/auth/resend-verification',
  },
  urls: {
    create: '/api/v1/urls',
    list: '/api/v1/urls',
    details: (hash: string) => `/api/v1/urls/${hash}`,
    delete: (hash: string) => `/api/v1/urls/${hash}`,
    analytics: {
      summary: (hash: string) => `/api/v1/urls/${hash}/analytics/summary`,
      timeseries: (hash: string) => `/api/v1/urls/${hash}/analytics/timeseries`,
      breakdown: (hash: string, dimension: string) => `/api/v1/urls/${hash}/analytics/${dimension}`,
    },
  },
  user: {
    profile: '/api/v1/users',
    changePassword: '/api/v1/users/change-password',
  },
  telemetry: {
    frontendLogs: '/api/v1/frontend/logs',
  },
  analytics: {
    summary: '/api/v1/analytics/summary',
    timeseries: '/api/v1/analytics/timeseries',
    topLinks: '/api/v1/analytics/top-links',
    breakdown: (dimension: string) => `/api/v1/analytics/${dimension}`,
  },
} as const;
