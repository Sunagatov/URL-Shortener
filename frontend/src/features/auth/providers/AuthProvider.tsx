import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authSession } from '@/shared/auth/authSession';
import type { AuthContextType, User, AuthTokens } from '@/shared/types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authSession.isAuthenticated);
    const [user, setUser] = useState<User | null>(authSession.user);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const handleAuthChange = (authenticated: boolean, userData: User | null) => {
            setIsAuthenticated(authenticated);
            setUser(userData);
            setLoading(false);
        };

        authSession.addListener(handleAuthChange);

        return () => {
            authSession.removeListener(handleAuthChange);
        };
    }, []);

    const login = useCallback((tokens: AuthTokens, userData: User | null) => {
        setLoading(true);
        authSession.login(tokens, userData);
    }, []);

    const updateUser = useCallback((userData: User) => {
        authSession.updateUser(userData);
    }, []);

    const logout = useCallback(() => {
        setLoading(true);
        authSession.logout();
    }, []);

    const value: AuthContextType = {
        isAuthenticated,
        user,
        login,
        updateUser,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
