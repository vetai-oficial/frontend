import { httpClient } from '@/infra/http-client';
import type { AuthResponse, LoginPayload, RegisterPayload, User, UserAddress } from '@/types/auth';

export interface UpdateProfilePayload {
  name?: string;
  crmv?: string;
  phone?: string;
  address?: Partial<UserAddress>;
}

export const authService = {
  login: (data: LoginPayload) =>
    httpClient<AuthResponse>('auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: RegisterPayload) =>
    httpClient<AuthResponse>('auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () =>
    httpClient<User>('auth/me'),

  updateProfile: (data: UpdateProfilePayload) =>
    httpClient<User>('auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
