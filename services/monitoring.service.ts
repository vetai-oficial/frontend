import { httpClient, buildQuery } from '@/infra/http-client';
import type { PaginatedResponse, QueryParams } from '@/types/common';
import type {
  CreateHospitalizationPayload,
  CreateVitalRecordPayload,
  Hospitalization,
  HospitalizationStatus,
  UpdateHospitalizationPayload,
  VitalRecord,
} from '@/types/monitoring';

interface MonitoringListParams extends QueryParams {
  status?: HospitalizationStatus;
  active?: boolean;
}

export const monitoringService = {
  list: (params?: MonitoringListParams) => {
    const query = buildQuery(params);
    const extra: string[] = [];
    if (params?.status) extra.push(`status=${params.status}`);
    if (params?.active !== undefined) extra.push(`active=${params.active}`);
    const sep = query ? '&' : '?';
    const suffix = extra.length ? `${sep}${extra.join('&')}` : '';
    return httpClient<PaginatedResponse<Hospitalization>>(
      `monitoring${query}${suffix}`,
    );
  },

  get: (id: string) => httpClient<Hospitalization>(`monitoring/${id}`),

  create: (data: CreateHospitalizationPayload) =>
    httpClient<Hospitalization>('monitoring', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateHospitalizationPayload) =>
    httpClient<Hospitalization>(`monitoring/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  discharge: (id: string) =>
    httpClient<Hospitalization>(`monitoring/${id}/discharge`, {
      method: 'POST',
    }),

  delete: (id: string) =>
    httpClient<void>(`monitoring/${id}`, { method: 'DELETE' }),

  listVitals: (id: string) =>
    httpClient<VitalRecord[]>(`monitoring/${id}/vitals`),

  addVitals: (id: string, data: CreateVitalRecordPayload) =>
    httpClient<VitalRecord>(`monitoring/${id}/vitals`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
