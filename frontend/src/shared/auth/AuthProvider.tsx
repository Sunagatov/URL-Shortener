import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import type { AuthContextType, AuthTokens, User } from '@/shared/auth/types';
import { storage } from '@/shared/auth/storage';
import httpClient from '@/shared/api/httpClient';
import { endpoints } from '@/shared/api/endpoints';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => storage.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => storage.hasValidTokens());

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
