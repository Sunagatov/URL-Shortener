const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export const googleOAuthClientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID ?? '';

export function getGoogleOAuthUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: googleOAuthClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });
  if (state) params.set('state', state);
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export const GOOGLE_CALLBACK_PATH = '/auth/google/callback';

export function getGoogleRedirectUri(): string {
  return `${window.location.origin}${GOOGLE_CALLBACK_PATH}`;
}
