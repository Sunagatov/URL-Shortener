import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import type { AuthContextType, AuthTokens, User } from '@/shared/auth/types';
import { storage } from '@/shared/auth/storage';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => storage.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => storage.hasValidTokens());

  const login = useCallback((tokens: AuthTokens, userData: User | null) => {
    storage.setTokens(tokens);
    storage.setUser(userData);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const updateUser = useCallback((userData: User) => {
    storage.setUser(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    storage.clearAll();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      user,
      login,
      updateUser,
      logout,
    }),
    [isAuthenticated, user, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
