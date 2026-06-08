import httpClient from '@/shared/api/httpClient';
import { endpoints } from '@/shared/api/endpoints';

export async function requestPasswordReset(email: string, turnstileToken?: string): Promise<void> {
  await httpClient.post(endpoints.auth.forgotPassword, {
    email,
    ...(turnstileToken ? { turnstileToken } : {}),
  });
}

export async function resetPassword(data: {
  token: string;
  newPassword: string;
  turnstileToken?: string;
}): Promise<void> {
  await httpClient.post(endpoints.auth.resetPassword, data);
}
