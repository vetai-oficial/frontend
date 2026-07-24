import { httpClient } from '@/infra/http-client';
import type { Patient } from '@/types/patient';
import type { Study } from '@/types/study';

export interface CollaboratorActivity {
  id: string;
  name: string;
  email: string;
  patients: number;
  studies: number;
  consultations: number;
}

export interface AdminDashboardData {
  total_collaborators: number;
  pending_invites: number;
  total_patients: number;
  total_studies: number;
  total_consultations: number;
  collaborators_activity: CollaboratorActivity[];
  latest_patients: Patient[];
  latest_studies: Study[];
}

export const adminService = {
  dashboard: () => httpClient<AdminDashboardData>('admin/dashboard'),
};
