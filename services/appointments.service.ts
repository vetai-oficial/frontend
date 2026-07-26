import { httpClient, buildQuery } from '@/infra/http-client';
import type { Appointment, CreateAppointmentPayload, UpdateAppointmentPayload } from '@/types/appointment';
import type { PaginatedResponse, QueryParams } from '@/types/common';

export const appointmentsService = {
  list: (params?: QueryParams & { tutor_id?: string; patient_id?: string }) => {
    const base = buildQuery(params);
    const extra: string[] = [];
    if (params?.tutor_id) extra.push(`tutor_id=${params.tutor_id}`);
    if (params?.patient_id) extra.push(`patient_id=${params.patient_id}`);
    const suffix = extra.length ? `${base ? '&' : '?'}${extra.join('&')}` : '';
    return httpClient<PaginatedResponse<Appointment>>(`appointments${base}${suffix}`);
  },

  get: (id: string) =>
    httpClient<Appointment>(`appointments/${id}`),

  create: (data: CreateAppointmentPayload) =>
    httpClient<Appointment>('appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateAppointmentPayload) =>
    httpClient<Appointment>(`appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    httpClient<void>(`appointments/${id}`, { method: 'DELETE' }),
};
