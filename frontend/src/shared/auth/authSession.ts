import { storage } from '@/shared/auth/storage';
import type { AuthTokens, User } from '@/shared/auth/types';

type AuthSnapshot = {
  isAuthenticated: boolean;
  user: User | null;
};

type AuthListener = () => void;

let snapshot: AuthSnapshot = {
  isAuthenticated: storage.hasValidTokens(),
  user: storage.getUser(),
};

const listeners = new Set<AuthListener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    listener();
  });
}

function updateSnapshot(nextSnapshot: AuthSnapshot) {
  snapshot = nextSnapshot;
  notifyListeners();
}

export const authSession = {
  getSnapshot(): AuthSnapshot {
    return snapshot;
  },

  subscribe(listener: AuthListener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },

  login(tokens: AuthTokens, user: User | null) {
    storage.setTokens(tokens);
    storage.setUser(user);
    updateSnapshot({
      isAuthenticated: true,
      user,
    });
  },

  logout() {
    storage.clearAll();
    updateSnapshot({
      isAuthenticated: false,
      user: null,
    });
  },

  updateUser(user: User) {
    storage.setUser(user);
    updateSnapshot({
      ...snapshot,
      user,
    });
  },
};
