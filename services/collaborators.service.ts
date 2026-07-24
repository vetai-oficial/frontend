import { httpClient } from '@/infra/http-client';
import type {
  Collaborator,
  InviteCollaboratorPayload,
} from '@/types/settings';

export const collaboratorsService = {
  findAll: () => httpClient<Collaborator[]>('collaborators'),

  invite: (data: InviteCollaboratorPayload) =>
    httpClient<{ message?: string }>('collaborators/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRole: (id: string, roleId: string) =>
    httpClient<Collaborator>(`collaborators/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role_id: roleId }),
    }),
};
