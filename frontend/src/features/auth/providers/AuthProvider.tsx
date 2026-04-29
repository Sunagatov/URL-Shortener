import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AuthService from '@/features/auth/lib/authService';
import type { AuthContextType, User, AuthTokens } from '@/shared/types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(AuthService.isAuthenticated);
    const [user, setUser] = useState<User | null>(AuthService.user);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const handleAuthChange = (authenticated: boolean, userData: User | null) => {
            setIsAuthenticated(authenticated);
            setUser(userData);
            setLoading(false);
        };

        AuthService.addListener(handleAuthChange);

        return () => {
            AuthService.removeListener(handleAuthChange);
        };
    }, []);

    const login = useCallback((tokens: AuthTokens, userData: User | null) => {
        setLoading(true);
        AuthService.login(tokens, userData);
    }, []);

    const updateUser = useCallback((userData: User) => {
        AuthService.updateUser(userData);
    }, []);

    const logout = useCallback(() => {
        setLoading(true);
        AuthService.logout();
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
