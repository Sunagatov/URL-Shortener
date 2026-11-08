import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthContextType, AuthTokens, User } from '@/shared/auth/types';
import { AUTH_SESSION_CHANGED_EVENT, storage } from '@/shared/auth/storage';
import httpClient from '@/shared/api/httpClient';
import { endpoints } from '@/shared/api/endpoints';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => storage.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => storage.hasValidTokens());

  useEffect(() => {
    const reconcileSession = () => {
      const authenticated = storage.hasValidTokens();
      setIsAuthenticated(authenticated);
      setUser(authenticated ? storage.getUser() : null);
    };
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, reconcileSession);
    window.addEventListener('storage', reconcileSession);
    window.addEventListener('focus', reconcileSession);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, reconcileSession);
      window.removeEventListener('storage', reconcileSession);
      window.removeEventListener('focus', reconcileSession);
    };
  }, []);

  const login = useCallback((tokens: AuthTokens, userData: User | null, rememberMe = false) => {
    storage.setTokens(tokens, rememberMe);
    storage.setUser(userData);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const updateUser = useCallback((userData: User) => {
    storage.setUser(userData);
    setUser(userData);
  }, []);

  const clearSession = useCallback(() => {
    storage.clearAll();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = storage.getRefreshToken();
    const accessToken = storage.getAccessToken();
    // Clear only after the server acknowledges revocation. Callers show failures to the user.
    if (refreshToken || accessToken)
      await httpClient.post(endpoints.auth.logout, { refreshToken, accessToken });
    // A delayed acknowledgement for an old account must not erase a newer login.
    if (
      refreshToken
        ? storage.getRefreshToken() === refreshToken
        : !storage.getRefreshToken() && storage.getAccessToken() === accessToken
    )
      clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      user,
      login,
      updateUser,
      logout,
      clearSession,
    }),
    [isAuthenticated, user, login, logout, updateUser, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
