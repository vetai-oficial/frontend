import { httpClient } from '@/infra/http-client';
import type {
  AuthResponse,
  LoginPayload,
  RefreshResponse,
  RegisterPayload,
  TeamMember,
  User,
  UserAddress,
} from '@/types/auth';

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

  me: () =>
    httpClient<User>('auth/me', {
      method: 'GET',
    }),

  refresh: (refresh_token: string) =>
    httpClient<RefreshResponse>('auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    }),

  listTeam: () =>
    httpClient<TeamMember[]>('auth/team'),

  updateProfile: (data: UpdateProfilePayload) =>
    httpClient<User>('auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
