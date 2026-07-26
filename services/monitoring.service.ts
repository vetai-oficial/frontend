import { buildQuery, httpClient } from '@/infra/http-client';
import type { PaginatedResponse, QueryParams } from '@/types/common';
import type {
  Box,
  ClinicalParameter,
  CreateEventPayload,
  CreateHospitalizationPayload,
  CreatePrescriptionPayload,
  Execution,
  Hospitalization,
  HospitalizationEvent,
  HospitalizationRisk,
  HospitalizationStatus,
  HospPrescription,
  MonitoringSummary,
  PrescriptionTemplate,
  TemplateItem,
  UpdateHospitalizationPayload,
} from '@/types/monitoring';

export interface HospitalizationListParams extends QueryParams {
  status?: HospitalizationStatus | undefined;
  risk?: HospitalizationRisk | undefined;
  veterinarian_id?: string | undefined;
  box_id?: string | undefined;
  patient_id?: string | undefined;
  active?: boolean | undefined;
}

function buildExtraQuery(
  params: HospitalizationListParams | undefined,
): string {
  const base = buildQuery(params);
  if (!params) return base;

  const extra = new URLSearchParams();
  if (params.status) extra.set('status', params.status);
  if (params.risk) extra.set('risk', params.risk);
  if (params.veterinarian_id)
    extra.set('veterinarian_id', params.veterinarian_id);
  if (params.box_id) extra.set('box_id', params.box_id);
  if (params.patient_id) extra.set('patient_id', params.patient_id);
  if (params.active !== undefined) extra.set('active', String(params.active));

  const extraQs = extra.toString();
  if (!extraQs) return base;
  return base ? `${base}&${extraQs}` : `?${extraQs}`;
}

export const monitoringService = {
  summary: (from: string, to: string) =>
    httpClient<MonitoringSummary>(
      `monitoring/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ),

  listHospitalizations: (params?: HospitalizationListParams) =>
    httpClient<PaginatedResponse<Hospitalization>>(
      `monitoring/hospitalizations${buildExtraQuery(params)}`,
    ),

  getHospitalization: (id: string) =>
    httpClient<Hospitalization>(`monitoring/hospitalizations/${id}`),

  createHospitalization: (data: CreateHospitalizationPayload) =>
    httpClient<Hospitalization>('monitoring/hospitalizations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateHospitalization: (id: string, data: UpdateHospitalizationPayload) =>
    httpClient<Hospitalization>(`monitoring/hospitalizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  discharge: (id: string, data: { date?: string; notes?: string }) =>
    httpClient<Hospitalization>(`monitoring/hospitalizations/${id}/discharge`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  decease: (id: string, data: { date?: string; notes?: string }) =>
    httpClient<Hospitalization>(`monitoring/hospitalizations/${id}/decease`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancel: (id: string, data: { notes?: string }) =>
    httpClient<Hospitalization>(`monitoring/hospitalizations/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  reopen: (id: string) =>
    httpClient<Hospitalization>(`monitoring/hospitalizations/${id}/reopen`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  moveBox: (id: string, boxId: string | null) =>
    httpClient<Hospitalization>(`monitoring/hospitalizations/${id}/move-box`, {
      method: 'POST',
      body: JSON.stringify(boxId ? { box_id: boxId } : {}),
    }),

  listPrescriptions: (hospitalizationId: string) =>
    httpClient<HospPrescription[]>(
      `monitoring/hospitalizations/${hospitalizationId}/prescriptions`,
    ),

  createPrescription: (
    hospitalizationId: string,
    data: CreatePrescriptionPayload,
  ) =>
    httpClient<HospPrescription>(
      `monitoring/hospitalizations/${hospitalizationId}/prescriptions`,
      { method: 'POST', body: JSON.stringify(data) },
    ),

  applyTemplate: (
    hospitalizationId: string,
    data: { template_id: string; items: Array<{ index: number; start_at: string }> },
  ) =>
    httpClient<HospPrescription[]>(
      `monitoring/hospitalizations/${hospitalizationId}/prescriptions/apply-template`,
      { method: 'POST', body: JSON.stringify(data) },
    ),

  stopPrescription: (id: string) =>
    httpClient<HospPrescription>(`monitoring/prescriptions/${id}/stop`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  reschedulePrescription: (
    id: string,
    data: { start_at: string; interval_hours?: number; duration_days?: number },
  ) =>
    httpClient<HospPrescription>(`monitoring/prescriptions/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deletePrescription: (id: string) =>
    httpClient<void>(`monitoring/prescriptions/${id}`, { method: 'DELETE' }),

  listExecutions: (from: string, to: string, hospitalizationId?: string) => {
    const params = new URLSearchParams({ from, to });
    if (hospitalizationId) params.set('hospitalization_id', hospitalizationId);
    return httpClient<Execution[]>(`monitoring/executions?${params.toString()}`);
  },

  listExecutionsByHospitalization: (hospitalizationId: string) =>
    httpClient<Execution[]>(
      `monitoring/hospitalizations/${hospitalizationId}/executions`,
    ),

  execute: (id: string, data: { executed_at: string; notes?: string }) =>
    httpClient<Execution>(`monitoring/executions/${id}/execute`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  executeAsNeeded: (
    prescriptionId: string,
    data: { executed_at: string; notes?: string },
  ) =>
    httpClient<Execution>(
      `monitoring/prescriptions/${prescriptionId}/executions`,
      { method: 'POST', body: JSON.stringify(data) },
    ),

  listEvents: (
    hospitalizationId: string,
    params?: QueryParams & { type?: string },
  ) => {
    const base = buildQuery(params);
    const type = params?.type
      ? `${base ? '&' : '?'}type=${params.type}`
      : '';
    return httpClient<PaginatedResponse<HospitalizationEvent>>(
      `monitoring/hospitalizations/${hospitalizationId}/events${base}${type}`,
    );
  },

  createEvent: (hospitalizationId: string, data: CreateEventPayload) =>
    httpClient<HospitalizationEvent>(
      `monitoring/hospitalizations/${hospitalizationId}/events`,
      { method: 'POST', body: JSON.stringify(data) },
    ),

  listBoxes: () => httpClient<Box[]>('monitoring/boxes'),

  createBox: (data: { name: string; description?: string }) =>
    httpClient<Box>('monitoring/boxes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateBox: (
    id: string,
    data: {
      name?: string | undefined;
      description?: string | undefined;
      active?: boolean | undefined;
    },
  ) =>
    httpClient<Box>(`monitoring/boxes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteBox: (id: string) =>
    httpClient<void>(`monitoring/boxes/${id}`, { method: 'DELETE' }),

  listParameters: () =>
    httpClient<ClinicalParameter[]>('monitoring/clinical-parameters'),

  createParameter: (data: { name: string; unit?: string }) =>
    httpClient<ClinicalParameter>('monitoring/clinical-parameters', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateParameter: (
    id: string,
    data: {
      name?: string | undefined;
      unit?: string | undefined;
      active?: boolean | undefined;
    },
  ) =>
    httpClient<ClinicalParameter>(`monitoring/clinical-parameters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteParameter: (id: string) =>
    httpClient<void>(`monitoring/clinical-parameters/${id}`, {
      method: 'DELETE',
    }),

  listTemplates: (params?: QueryParams) =>
    httpClient<PaginatedResponse<PrescriptionTemplate>>(
      `monitoring/prescription-templates${buildQuery(params)}`,
    ),

  getTemplate: (id: string) =>
    httpClient<PrescriptionTemplate>(`monitoring/prescription-templates/${id}`),

  createTemplate: (data: {
    name: string;
    description?: string;
    items: TemplateItem[];
  }) =>
    httpClient<PrescriptionTemplate>('monitoring/prescription-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTemplate: (
    id: string,
    data: {
      name?: string | undefined;
      description?: string | undefined;
      items?: TemplateItem[] | undefined;
    },
  ) =>
    httpClient<PrescriptionTemplate>(
      `monitoring/prescription-templates/${id}`,
      { method: 'PATCH', body: JSON.stringify(data) },
    ),

  deleteTemplate: (id: string) =>
    httpClient<void>(`monitoring/prescription-templates/${id}`, {
      method: 'DELETE',
    }),
};
