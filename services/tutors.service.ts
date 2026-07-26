import { httpClient, buildQuery } from '@/infra/http-client';
import type { PaginatedResponse, QueryParams } from '@/types/common';
import type { Patient } from '@/types/patient';
import type { Tutor, CreateTutorPayload, UpdateTutorPayload } from '@/types/tutor';

export const tutorsService = {
  list: (params?: QueryParams) =>
    httpClient<PaginatedResponse<Tutor>>(`tutors${buildQuery(params)}`),

  get: (id: string) =>
    httpClient<Tutor>(`tutors/${id}`),

  listPatients: (tutorId: string, params?: QueryParams) =>
    httpClient<PaginatedResponse<Patient>>(`tutors/${tutorId}/patients${buildQuery(params)}`),

  create: (data: CreateTutorPayload) =>
    httpClient<Tutor>('tutors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTutorPayload) =>
    httpClient<Tutor>(`tutors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    httpClient<void>(`tutors/${id}`, { method: 'DELETE' }),
};
