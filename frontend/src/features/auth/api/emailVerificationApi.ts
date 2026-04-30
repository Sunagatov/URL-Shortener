import httpClient from '@/shared/api/httpClient';
import { endpoints } from '@/shared/api/endpoints';
import type { AuthTokens, VerificationChallengeResponse } from '@/shared/types';

export async function verifyEmail(data: { email: string; code: string }): Promise<AuthTokens> {
  const response = await httpClient.post(endpoints.auth.verifyEmail, data);
  return response.data;
}

export async function resendVerificationCode(email: string): Promise<VerificationChallengeResponse> {
  const response = await httpClient.post(endpoints.auth.resendVerification, { email });
  return response.data;
}
