export interface VerificationChallengeResponse {
  email: string;
  expiresInSeconds: number;
  resendAvailableInSeconds: number;
  deliveryMode: 'email' | 'log';
}

export interface SignUpResponse {
  verificationRequired: boolean;
  accessToken?: string;
  refreshToken?: string;
  email?: string;
  expiresInSeconds?: number;
  resendAvailableInSeconds?: number;
  deliveryMode?: 'email' | 'log';
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
