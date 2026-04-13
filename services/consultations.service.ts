import { httpClient, buildQuery } from '@/infra/http-client';
import type { PaginatedResponse, QueryParams } from '@/types/common';
import type { Consultation } from '@/types/consultation';

export const consultationsService = {
  create: (patientId?: string) =>
    httpClient<Consultation>('consultations', {
      method: 'POST',
      body: JSON.stringify(patientId ? { patientId } : {}),
    }),

  list: (params?: QueryParams) =>
    httpClient<PaginatedResponse<Consultation>>(
      `consultations${buildQuery(params)}`,
    ),

  get: (id: string) =>
    httpClient<Consultation>(`consultations/${id}`),

  getInProgress: () =>
    httpClient<Consultation | null>('consultations/in-progress'),
};
