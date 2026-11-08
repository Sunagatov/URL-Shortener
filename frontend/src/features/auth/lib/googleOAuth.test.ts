import { webcrypto } from 'node:crypto';
import { consumeGoogleTransaction, getGoogleOAuthUrl } from './googleOAuth';

describe('Google sign-in transaction binding', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('crypto', webcrypto);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('uses random state and S256 PKCE and preserves the internal destination once', async () => {
    const url = new URL(
      await getGoogleOAuthUrl(
        'http://localhost/auth/google/callback',
        '/account/url-mappings?page=2'
      )
    );
    const state = url.searchParams.get('state');
    expect(state).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    const transaction = consumeGoogleTransaction(state);
    const digest = await webcrypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(transaction.codeVerifier)
    );
    expect(url.searchParams.get('code_challenge')).toBe(Buffer.from(digest).toString('base64url'));
    expect(transaction.destination).toBe('/account/url-mappings?page=2');
    expect(() => consumeGoogleTransaction(state)).toThrow();
    const next = new URL(await getGoogleOAuthUrl('http://localhost/auth/google/callback'));
    expect(next.searchParams.get('state')).not.toBe(state);
  });

  it.each([null, '', 'attacker-state'])('rejects missing or mismatched state %s', async state => {
    await getGoogleOAuthUrl('http://localhost/auth/google/callback');
    expect(() => consumeGoogleTransaction(state)).toThrow();
  });

  it('rejects callbacks in a browser that has not started sign-in', () => {
    expect(() => consumeGoogleTransaction('a'.repeat(43))).toThrow();
  });

  it('rejects expired transactions', async () => {
    vi.useFakeTimers();
    const url = new URL(await getGoogleOAuthUrl('http://localhost/auth/google/callback'));
    vi.advanceTimersByTime(10 * 60 * 1000);
    expect(() => consumeGoogleTransaction(url.searchParams.get('state'))).toThrow();
  });

  it.each(['https://attacker.test', '//attacker.test', '/\\attacker.test'])(
    'restricts destination %s to this app',
    async destination => {
      const url = new URL(
        await getGoogleOAuthUrl('http://localhost/auth/google/callback', destination)
      );
      expect(consumeGoogleTransaction(url.searchParams.get('state')).destination).toBe(
        '/account/dashboard'
      );
    }
  );
});
