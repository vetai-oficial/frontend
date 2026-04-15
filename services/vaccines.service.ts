import { httpClient, buildQuery } from '@/infra/http-client';
import type { PaginatedResponse, QueryParams } from '@/types/common';
import type { Vaccine, CreateVaccinePayload, UpdateVaccinePayload } from '@/types/vaccine';

export const vaccinesService = {
  list: (params?: QueryParams) =>
    httpClient<PaginatedResponse<Vaccine>>(`vaccines${buildQuery(params)}`),

  get: (id: string) =>
    httpClient<Vaccine>(`vaccines/${id}`),

  create: (data: CreateVaccinePayload) =>
    httpClient<Vaccine>('vaccines', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateVaccinePayload) =>
    httpClient<Vaccine>(`vaccines/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    httpClient<void>(`vaccines/${id}`, { method: 'DELETE' }),
};
