import { httpClient } from '@/infra/http-client';
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types/auth';

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
};
