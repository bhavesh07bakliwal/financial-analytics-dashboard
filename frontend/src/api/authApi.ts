import { apiClient } from './client';
import { User } from '@/types';

export async function loginRequest(email: string, password: string): Promise<User> {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data.data.user;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await apiClient.get('/auth/me');
  return res.data.data.user;
}
