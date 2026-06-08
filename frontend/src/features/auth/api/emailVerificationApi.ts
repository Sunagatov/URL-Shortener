import httpClient from '@/shared/api/httpClient';
import { endpoints } from '@/shared/api/endpoints';
import type { VerificationChallengeResponse } from '@/features/auth/types/auth';
import type { AuthTokens } from '@/shared/auth/types';

export async function verifyEmail(data: {
  email: string;
  code: string;
  turnstileToken?: string;
}): Promise<AuthTokens> {
  const response = await httpClient.post(endpoints.auth.verifyEmail, data);
  return response.data;
}

export async function resendVerificationCode(
  email: string,
  turnstileToken?: string,
): Promise<VerificationChallengeResponse> {
  const response = await httpClient.post(endpoints.auth.resendVerification, {
    email,
    ...(turnstileToken ? { turnstileToken } : {}),
  });
  return response.data;
}
