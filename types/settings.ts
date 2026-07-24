export interface Collaborator {
  id: string;
  name: string | null;
  email: string;
  role: string;
  role_id?: string | null;
  role_name?: string;
  status: 'active' | 'pending';
  addedAt: string;
  expiresAt?: string;
}

export interface InviteCollaboratorPayload {
  email: string;
  role_id: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  hospital_id: string;
  permissions: string[];
  is_default: boolean;
  collaborators_count: number;
  collaborator_ids: string[];
}

export interface RolePayload {
  name: string;
  description?: string;
  permissions: string[];
  collaborator_ids?: string[];
}
