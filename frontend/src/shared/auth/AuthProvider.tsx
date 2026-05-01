import { createContext, useCallback, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { authSession } from '@/shared/auth/authSession';
import type { AuthContextType, AuthTokens, User } from '@/shared/auth/types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useSyncExternalStore(authSession.subscribe, authSession.getSnapshot, authSession.getSnapshot);
  const [loading, setLoading] = useState(false);

  const login = useCallback((tokens: AuthTokens, userData: User | null) => {
    setLoading(true);
    authSession.login(tokens, userData);
    setLoading(false);
  }, []);

  const updateUser = useCallback((userData: User) => {
    authSession.updateUser(userData);
  }, []);

  const logout = useCallback(() => {
    setLoading(true);
    authSession.logout();
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated: authState.isAuthenticated,
      user: authState.user,
      login,
      updateUser,
      logout,
      loading,
    }),
    [authState.isAuthenticated, authState.user, loading, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
