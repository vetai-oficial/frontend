import { httpClient, buildQuery } from '@/infra/http-client';
import type { PaginatedResponse, QueryParams } from '@/types/common';
import type { Payment, CreatePaymentPayload, UpdatePaymentPayload } from '@/types/payment';

export const paymentsService = {
  list: (params?: QueryParams & { tutor_id?: string; patient_id?: string; status?: string }) => {
    const base = buildQuery(params);
    const extra: string[] = [];
    if (params?.tutor_id) extra.push(`tutor_id=${params.tutor_id}`);
    if (params?.patient_id) extra.push(`patient_id=${params.patient_id}`);
    if (params?.status) extra.push(`status=${params.status}`);
    const suffix = extra.length ? `${base ? '&' : '?'}${extra.join('&')}` : '';
    return httpClient<PaginatedResponse<Payment>>(`payments${base}${suffix}`);
  },

  get: (id: string) =>
    httpClient<Payment>(`payments/${id}`),

  create: (data: CreatePaymentPayload) =>
    httpClient<Payment>('payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdatePaymentPayload) =>
    httpClient<Payment>(`payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    httpClient<void>(`payments/${id}`, { method: 'DELETE' }),
};
