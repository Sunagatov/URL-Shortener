export const routes = {
  home: '/',
  signIn: '/signin',
  signUp: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  account: '/account',
  dashboard: '/account/dashboard',
  profile: '/account/profile',
  security: '/account/security',
  urlMappings: '/account/url-mappings',
  urlDetails: (hash: string) => `/account/url-mappings/${hash}`,
} as const;
