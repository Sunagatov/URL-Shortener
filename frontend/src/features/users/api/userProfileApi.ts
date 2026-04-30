import httpClient from '@/shared/api/httpClient';
import { endpoints } from '@/shared/api/endpoints';
import type { User } from '@/shared/types';

export async function getUserProfile(): Promise<User> {
  const response = await httpClient.get(endpoints.user.profile);
  return response.data;
}

export async function updateUserProfile(data: {
  firstName: string;
  lastName: string;
  country: string;
  age: number;
}): Promise<User> {
  const response = await httpClient.put(endpoints.user.profile, data);
  return response.data;
}
