import { httpClient } from '@/infra/http-client';
import type { Role, RolePayload } from '@/types/settings';

export const rolesService = {
  findAll: () => httpClient<Role[]>('roles'),

  findOne: (id: string) => httpClient<Role>(`roles/${id}`),

  create: (data: RolePayload) =>
    httpClient<Role>('roles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: RolePayload) =>
    httpClient<Role>(`roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    httpClient<void>(`roles/${id}`, {
      method: 'DELETE',
    }),
};
