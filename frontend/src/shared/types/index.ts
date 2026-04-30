export interface User {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  age?: number;
  createdAt?: string;
}

export interface UrlMapping {
  urlHash: string;
  shortUrl: string;
  originalUrl: string;
  clickCount: number;
  createdAt: string;
  expirationDate: string;
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

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
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
  daysCount?: number | undefined;
}

export interface ApiError {
  errorMessage: string;
  status: number;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (tokens: AuthTokens, user: User | null) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  loading: boolean;
}
