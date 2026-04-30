export const endpoints = {
  auth: {
    signIn: '/api/v1/auth/signin',
    signUp: '/api/v1/auth/signup',
    refresh: '/api/v1/auth/refresh-token',
    logout: '/api/v1/auth/logout',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password',
  },
  urls: {
    create: '/api/v1/urls',
    list: '/api/v1/urls',
    details: (hash: string) => `/api/v1/urls/${hash}`,
    delete: (hash: string) => `/api/v1/urls/${hash}`,
  },
  user: {
    profile: '/api/v1/users',
    changePassword: '/api/v1/users/change-password',
  },
} as const;
