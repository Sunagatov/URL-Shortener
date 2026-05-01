export interface User {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  age?: number;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (tokens: AuthTokens, user: User | null) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  loading: boolean;
}
