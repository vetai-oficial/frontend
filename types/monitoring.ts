import type { Sex, Specie } from './patient';

export type HospitalizationStatus = 'STABLE' | 'UNSTABLE' | 'AWAITING_TUTOR';

export type HospitalizationSector = 'INPATIENT' | 'TRIAGE';

export interface TutorSummary {
  id: string;
  name: string;
  record_number?: number;
  phone?: string;
}

export interface PatientSummary {
  id: string;
  name: string;
  record_number?: number;
  observations?: string;
  specie: Specie;
  breed?: string;
  sex?: Sex;
  birth_date?: string;
  tutor?: TutorSummary;
}

export interface VeterinarianSummary {
  id?: string;
  name: string;
  crmv?: string;
}

export interface VitalRecord {
  id: string;
  measured_at: string;
  recorded_by?: VeterinarianSummary;
  heart_rate?: number;
  respiratory_rate?: number;
  rectal_temperature?: number;
  blood_pressure?: number;
  glucose?: number;
  capillary_refill_time?: number;
  notes?: string;
  created_at: string;
}

export interface Hospitalization {
  id: string;
  patient: PatientSummary;
  status: HospitalizationStatus;
  sector: HospitalizationSector;
  kennel?: string;
  weight_kg?: number;
  veterinarian?: VeterinarianSummary | null;
  reason?: string;
  monitoring_interval_minutes: number;
  admitted_at: string;
  expected_discharge_at?: string;
  discharged_at?: string;
  active: boolean;
  latest_vitals?: VitalRecord | null;
  created_at: string;
  updated_at: string;
}

export interface CreateHospitalizationPayload {
  patient_id: string;
  status?: HospitalizationStatus;
  sector?: HospitalizationSector;
  kennel?: string;
  weight_kg?: number | null;
  expected_discharge_at?: string;
  veterinarian_id?: string;
  reason?: string;
  admitted_at?: string;
  monitoring_interval_minutes?: number;
}

export interface UpdateHospitalizationPayload {
  status?: HospitalizationStatus;
  sector?: HospitalizationSector;
  kennel?: string;
  weight_kg?: number | null;
  expected_discharge_at?: string;
  veterinarian_id?: string;
  reason?: string;
  monitoring_interval_minutes?: number;
}

export interface CreateVitalRecordPayload {
  heart_rate?: number;
  respiratory_rate?: number;
  rectal_temperature?: number;
  blood_pressure?: number;
  glucose?: number;
  capillary_refill_time?: number;
  notes?: string;
}
