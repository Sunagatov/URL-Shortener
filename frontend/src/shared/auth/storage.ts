import type { AuthTokens, User } from '@/shared/auth/types';

export const AUTH_SESSION_CHANGED_EVENT = 'shorty:auth-session-changed';
const notifySessionChanged = () => window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;
const MODE_KEY = 'shorty.auth.persistence';
const selectedStorage = (): Storage =>
  sessionStorage.getItem(MODE_KEY) === 'session' ? sessionStorage : localStorage;

export const storage = {
  getAccessToken: (): string | null => selectedStorage().getItem(STORAGE_KEYS.ACCESS_TOKEN),
  setAccessToken: (token: string): void => {
    selectedStorage().setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },
  getRefreshToken: (): string | null => selectedStorage().getItem(STORAGE_KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string): void => {
    selectedStorage().setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },
  getUser: (): User | null => {
    const raw = selectedStorage().getItem(STORAGE_KEYS.USER);
    try {
      return raw && raw !== 'undefined' ? (JSON.parse(raw) as User) : null;
    } catch {
      selectedStorage().removeItem(STORAGE_KEYS.USER);
      return null;
    }
  },
  setUser: (user: User | null): void => {
    if (user) selectedStorage().setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    else selectedStorage().removeItem(STORAGE_KEYS.USER);
    notifySessionChanged();
  },
  isPersistent: (): boolean => selectedStorage() === localStorage,
  setTokens: (tokens: AuthTokens, rememberMe?: boolean): void => {
    if (rememberMe !== undefined) {
      storage.clearAll();
      sessionStorage.setItem(MODE_KEY, rememberMe ? 'local' : 'session');
    }
    storage.setAccessToken(tokens.accessToken);
    storage.setRefreshToken(tokens.refreshToken);
  },
  clearAll: (): void => {
    for (const target of [localStorage, sessionStorage]) {
      Object.values(STORAGE_KEYS).forEach(key => target.removeItem(key));
      target.removeItem(MODE_KEY);
    }
    notifySessionChanged();
  },
  hasValidTokens: (): boolean => !!(storage.getAccessToken() && storage.getRefreshToken()),
};
