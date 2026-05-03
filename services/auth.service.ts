import { httpClient } from '@/infra/http-client';
import type {
  AuthResponse,
  LoginPayload,
  RefreshResponse,
  RegisterPayload,
  User,
} from '@/types/auth';

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

  me: () =>
    httpClient<User>('auth/me', {
      method: 'GET',
    }),

  refresh: (refresh_token: string) =>
    httpClient<RefreshResponse>('auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    }),
};
