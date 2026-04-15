import { httpClient, buildQuery } from '@/infra/http-client';
import type { PaginatedResponse, QueryParams } from '@/types/common';
import type { Study } from '@/types/study';

export const studiesService = {
  list: (params?: QueryParams & { patient_id?: string }) => {
    const base = buildQuery(params);
    const patientParam = params?.patient_id
      ? `${base ? '&' : '?'}patient_id=${params.patient_id}`
      : '';
    return httpClient<PaginatedResponse<Study>>(`study${base}${patientParam}`);
  },

  get: (id: string) =>
    httpClient<Study>(`study/${id}`),

  upload: (patientId: string, file: File, title: string, examDate?: string) => {
    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('title', title);
    formData.append('file', file);
    if (examDate) formData.append('exam_date', examDate);
    return httpClient<Study>('study/upload', {
      method: 'POST',
      body: formData,
    });
  },

  generatePrevention: (id: string) =>
    httpClient<Study>(`study/${id}/prevention`, {
      method: 'POST',
    }),
};
