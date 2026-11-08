const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TRANSACTION_KEY = 'shorty.google.transaction';
const TRANSACTION_LIFETIME_MS = 10 * 60 * 1000;

export const googleOAuthClientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID ?? '';

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function internalDestination(value?: string): string {
  if (!value?.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value))
    return '/account/dashboard';
  const url = new URL(value, window.location.origin);
  return url.origin === window.location.origin
    ? `${url.pathname}${url.search}${url.hash}`
    : '/account/dashboard';
}

export async function getGoogleOAuthUrl(
  redirectUri: string,
  destination?: string
): Promise<string> {
  const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const codeVerifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  const params = new URLSearchParams({
    client_id: googleOAuthClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state,
    code_challenge: base64url(new Uint8Array(digest)),
    code_challenge_method: 'S256',
  });
  sessionStorage.setItem(
    TRANSACTION_KEY,
    JSON.stringify({
      state,
      codeVerifier,
      destination: internalDestination(destination),
      expiresAt: Date.now() + TRANSACTION_LIFETIME_MS,
    })
  );
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export function consumeGoogleTransaction(state: string | null): {
  codeVerifier: string;
  destination: string;
} {
  const stored = sessionStorage.getItem(TRANSACTION_KEY);
  sessionStorage.removeItem(TRANSACTION_KEY);
  const transaction = stored ? JSON.parse(stored) : null;
  if (
    !state ||
    !transaction ||
    transaction.state !== state ||
    !Number.isFinite(transaction.expiresAt) ||
    transaction.expiresAt <= Date.now() ||
    transaction.expiresAt > Date.now() + TRANSACTION_LIFETIME_MS ||
    typeof transaction.codeVerifier !== 'string' ||
    !/^[A-Za-z0-9_-]{43}$/.test(transaction.codeVerifier)
  ) {
    throw new Error('Google sign-in expired or was not started in this browser. Please try again.');
  }
  return {
    codeVerifier: transaction.codeVerifier,
    destination: internalDestination(transaction.destination),
  };
}

export const GOOGLE_CALLBACK_PATH = '/auth/google/callback';

export function getGoogleRedirectUri(): string {
  return `${window.location.origin}${GOOGLE_CALLBACK_PATH}`;
}
