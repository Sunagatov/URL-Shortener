export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  age?: number;
  createdAt: string;
}

export interface UrlMapping {
  id: string;
  originalUrl: string;
  shortUrl: string;
  urlHash: string;
  createdAt: string;
  expiresAt?: string | null;
  clickCount: number;
  isActive: boolean;
  userId?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  age: number;
}

export interface CreateUrlRequest {
  originalUrl: string;
  customAlias?: string | undefined;
  expiresAt?: string | undefined;
}

export interface ApiError {
  errorMessage: string;
  status: number;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (tokens: AuthTokens, user: User) => void;
  logout: () => void;
  loading: boolean;
}
