const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vetai_token');
}

export function setToken(token: string): void {
  localStorage.setItem('vetai_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('vetai_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      (errorData as { message?: string })?.message ?? 'Erro na requisição',
      errorData,
    );
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// ─── Types ──────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  crmv?: string;
  hospital_id?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
  message?: string;
}

export interface PaginatedMeta {
  last: boolean;
  first: boolean;
  total_elements: number;
  total_pages: number;
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface QueryParams {
  page?: number | undefined;
  size?: number | undefined;
  sort?: string | undefined;
  direction?: 'asc' | 'desc' | undefined;
  search?: string | undefined;
}

export type Specie = 'DOG' | 'CAT' | 'BIRD' | 'REPTILE' | 'HORSE' | 'OTHER';

export interface Patient {
  id: string;
  name: string;
  specie: Specie;
  breed?: string;
  birth_date?: string;
  tutor_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientPayload {
  name: string;
  specie: Specie;
  breed?: string;
  birth_date?: string;
  tutor_id: string;
}

export interface Tutor {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTutorPayload {
  name: string;
  phone?: string;
  email?: string;
}

export interface UpdateTutorPayload {
  name?: string;
  phone?: string;
  email?: string;
}

export type StudyStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type ExamValueStatus = 'REGULAR' | 'HIGHER';

export interface ExamValue {
  title: string;
  status: ExamValueStatus;
  unit?: string;
  value: string;
  reference?: {
    type: 'TEXT' | 'RANGE';
    value: string | { min?: number; max?: number };
    unit?: string;
  };
}

export interface ExamResult {
  title: string;
  values: ExamValue[];
}

export interface Study {
  id: string;
  patient: Patient;
  status: StudyStatus;
  examDate?: string;
  title?: string;
  results: ExamResult[];
  created_at: string;
  updated_at: string;
}

export type HealthRecordType = 'WEIGHT' | 'BLOOD_PRESSURE' | 'MEDICATION';

export interface HealthRecord {
  id: string;
  type: HealthRecordType;
  date: string;
  notes?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreateHealthRecordPayload {
  type: HealthRecordType;
  date: string;
  notes?: string;
  metadata: Record<string, unknown>;
}

// ─── API Methods ────────────────────────────────────────

function buildQuery(params?: QueryParams): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.size) searchParams.set('size', String(params.size));
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.direction) searchParams.set('direction', params.direction);
  if (params.search) searchParams.set('search', params.search);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      request<AuthResponse>('auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    register: (data: { name: string; email: string; password: string }) =>
      request<AuthResponse>('auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  patients: {
    list: (params?: QueryParams) =>
      request<PaginatedResponse<Patient>>(`patients${buildQuery(params)}`),
    get: (id: string) => request<Patient>(`patients/${id}`),
    create: (data: CreatePatientPayload) =>
      request<Patient>('patients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  healthRecords: {
    list: (patientId: string, params?: QueryParams & { type?: HealthRecordType }) => {
      const query = buildQuery(params);
      const sep = query ? '&' : '?';
      const typeParam = params?.type ? `${sep}type=${params.type}` : '';
      return request<PaginatedResponse<HealthRecord>>(
        `patients/${patientId}/records${query}${typeParam}`,
      );
    },
    create: (patientId: string, data: CreateHealthRecordPayload) =>
      request<HealthRecord>(`patients/${patientId}/records`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (patientId: string, recordId: string) =>
      request<void>(`patients/${patientId}/records/${recordId}`, {
        method: 'DELETE',
      }),
  },

  studies: {
    list: (params?: QueryParams) =>
      request<PaginatedResponse<Study>>(`study${buildQuery(params)}`),
    get: (id: string) => request<Study>(`study/${id}`),
    upload: (patientId: string, file: File) => {
      const formData = new FormData();
      formData.append('patientId', patientId);
      formData.append('file', file);
      return request<Study>('study/upload', {
        method: 'POST',
        body: formData,
      });
    },
  },

  tutors: {
    list: (params?: QueryParams) =>
      request<PaginatedResponse<Tutor>>(`tutors${buildQuery(params)}`),
    get: (id: string) => request<Tutor>(`tutors/${id}`),
    create: (data: CreateTutorPayload) =>
      request<Tutor>('tutors', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateTutorPayload) =>
      request<Tutor>(`tutors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`tutors/${id}`, { method: 'DELETE' }),
  },
};
