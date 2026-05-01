import { storage } from '@/shared/auth/storage';
import type { AuthTokens, User } from '@/shared/auth/types';

type AuthListener = (isAuthenticated: boolean, user: User | null) => void;

class AuthSession {
    private static instance: AuthSession;
    private listeners: Set<AuthListener> = new Set();
    private _isAuthenticated: boolean;
    private _user: User | null;

    private constructor() {
        this._isAuthenticated = storage.hasValidTokens();
        this._user = storage.getUser();
    }

    public static getInstance(): AuthSession {
        if (!AuthSession.instance) {
            AuthSession.instance = new AuthSession();
        }
        return AuthSession.instance;
    }

    public get isAuthenticated(): boolean {
        return this._isAuthenticated;
    }

    public get user(): User | null {
        return this._user;
    }

    public login(tokens: AuthTokens, user: User | null): void {
        storage.setTokens(tokens);
        storage.setUser(user);
        this._isAuthenticated = true;
        this._user = user;
        this.notifyListeners();
    }

    public logout(): void {
        storage.clearAll();
        this._isAuthenticated = false;
        this._user = null;
        this.notifyListeners();
    }

    public updateUser(user: User): void {
        storage.setUser(user);
        this._user = user;
        this.notifyListeners();
    }

    public addListener(listener: AuthListener): void {
        this.listeners.add(listener);
    }

    public removeListener(listener: AuthListener): void {
        this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            listener(this._isAuthenticated, this._user);
        });
    }
}

export const authSession = AuthSession.getInstance();
