import httpClient from '@/shared/api/httpClient';
import { endpoints } from '@/shared/api/endpoints';
import type {
  RefreshTokenResponse,
  SignInRequest,
  SignUpRequest,
  SignUpResponse,
} from '@/features/auth/types/auth';
import type { AuthTokens } from '@/shared/auth/types';

export async function signIn(data: SignInRequest): Promise<AuthTokens> {
  const response = await httpClient.post(endpoints.auth.signIn, data);
  return response.data;
}

export async function signUp(data: SignUpRequest): Promise<SignUpResponse> {
  const response = await httpClient.post(endpoints.auth.signUp, data);
  return response.data;
}

export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const response = await httpClient.post(endpoints.auth.refresh, { refreshToken });
  return response.data;
}
