import { httpClient } from '@/infra/http-client';
import type { PatientDocument } from '@/types/health-record';

export const documentsService = {
  list: (patientId: string) =>
    httpClient<PatientDocument[]>(`patients/${patientId}/documents`),

  upload: (patientId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return httpClient<PatientDocument>(`patients/${patientId}/documents`, {
      method: 'POST',
      body: formData,
    });
  },

  delete: (patientId: string, documentId: string) =>
    httpClient<void>(`patients/${patientId}/documents/${documentId}`, {
      method: 'DELETE',
    }),
};
