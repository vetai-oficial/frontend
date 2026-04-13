import { httpClient, buildQuery } from '@/infra/http-client';
import type { PaginatedResponse, QueryParams } from '@/types/common';
import type {
  HealthRecord,
  HealthRecordType,
  CreateHealthRecordPayload,
} from '@/types/health-record';

export const healthRecordsService = {
  list: (
    patientId: string,
    params?: QueryParams & { type?: HealthRecordType },
  ) => {
    const query = buildQuery(params);
    const sep = query ? '&' : '?';
    const typeParam = params?.type ? `${sep}type=${params.type}` : '';
    return httpClient<PaginatedResponse<HealthRecord>>(
      `patients/${patientId}/records${query}${typeParam}`,
    );
  },

  create: (patientId: string, data: CreateHealthRecordPayload) =>
    httpClient<HealthRecord>(`patients/${patientId}/records`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (patientId: string, recordId: string) =>
    httpClient<void>(`patients/${patientId}/records/${recordId}`, {
      method: 'DELETE',
    }),
};
