import type { Permission } from './permissions';

export interface RoleCollaborator {
  id: string;
  name: string;
  email: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  hospital_id?: string;
  permissions: Permission[];
  collaborators?: RoleCollaborator[];
  collaborators_count?: number;
  collaborator_ids?: string[];
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RolePayload {
  name: string;
  description?: string;
  permissions: Permission[];
  collaborator_ids?: string[];
}
