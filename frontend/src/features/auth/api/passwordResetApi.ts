import httpClient from '@/shared/api/httpClient';
import { endpoints } from '@/shared/api/endpoints';

export async function requestPasswordReset(email: string): Promise<void> {
  await httpClient.post(endpoints.auth.forgotPassword, { email });
}

export async function resetPassword(data: {
  token: string;
  newPassword: string;
}): Promise<void> {
  await httpClient.post(endpoints.auth.resetPassword, data);
}
