import httpClient from '@/shared/api/httpClient';
import { endpoints } from '@/shared/api/endpoints';

export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
  await httpClient.put(endpoints.user.changePassword, data);
}
