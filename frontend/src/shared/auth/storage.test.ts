import { STORAGE_KEYS, storage } from '@/shared/auth/storage';

describe('storage.getUser', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('returns null when the user key is missing', () => {
    expect(storage.getUser()).toBeNull();
  });

  it('returns null for a literal undefined value', () => {
    localStorage.setItem(STORAGE_KEYS.USER, 'undefined');

    expect(storage.getUser()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBe('undefined');
  });

  it('returns a parsed user for valid JSON', () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    expect(storage.getUser()).toEqual(user);
  });

  it('does not throw and clears malformed JSON', () => {
    localStorage.setItem(STORAGE_KEYS.USER, '{bad json');

    expect(storage.getUser()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
  });
});

describe('session persistence', () => {
  beforeEach(() => {
    storage.clearAll();
  });
  it('keeps unchecked remember-me in the browser session, including refreshed tokens', () => {
    storage.setTokens({ accessToken: 'access', refreshToken: 'refresh' }, false);
    storage.setUser({ email: 'jane@example.test' });
    storage.setAccessToken('refreshed');
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('refreshed');
    expect(storage.getRefreshToken()).toBe('refresh');
    expect(storage.getUser()?.email).toBe('jane@example.test');
  });
  it('clears both stores when switching persistence and on logout', () => {
    storage.setTokens({ accessToken: 'persistent', refreshToken: 'old-refresh' }, true);
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('persistent');
    storage.setTokens({ accessToken: 'temporary', refreshToken: 'new-refresh' }, false);
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    storage.setTokens({ accessToken: 'persistent-again', refreshToken: 'third' }, true);
    expect(sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    storage.clearAll();
    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
  });
});
