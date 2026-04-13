import { httpClient, buildQuery } from '@/infra/http-client';
import type { PaginatedResponse, QueryParams } from '@/types/common';
import type { Patient, CreatePatientPayload, UpdatePatientPayload } from '@/types/patient';

export const patientsService = {
  list: (params?: QueryParams) =>
    httpClient<PaginatedResponse<Patient>>(`patients${buildQuery(params)}`),

  get: (id: string) =>
    httpClient<Patient>(`patients/${id}`),

  create: (data: CreatePatientPayload) =>
    httpClient<Patient>('patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdatePatientPayload) =>
    httpClient<Patient>(`patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    httpClient<void>(`patients/${id}`, { method: 'DELETE' }),
};
