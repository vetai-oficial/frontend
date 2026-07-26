export type HospitalizationStatus =
  | 'TRIAGE'
  | 'HOSPITALIZED'
  | 'DISCHARGED'
  | 'DECEASED'
  | 'CANCELLED';

export type HospitalizationRisk = 'LOW' | 'MEDIUM' | 'HIGH';

export type PrescriptionType = 'MEDICATION' | 'PROCEDURE' | 'FLUID';

export type PrescriptionFrequency = 'RECURRING' | 'ONCE' | 'AS_NEEDED';

export type PrescriptionStatus = 'ACTIVE' | 'STOPPED';

export type ExecutionStatus = 'PENDING' | 'DONE' | 'CANCELLED';

export type HospitalizationEventType =
  | 'OCCURRENCE'
  | 'WEIGHT'
  | 'CLINICAL_PARAMETERS'
  | 'STATUS_CHANGE'
  | 'BOX_CHANGE';

export type DoseUnit =
  | 'MG'
  | 'MCG'
  | 'G'
  | 'ML'
  | 'ML_H'
  | 'TABLET'
  | 'CAPSULE'
  | 'DROP';

export interface PatientMini {
  id: string;
  name: string;
  specie?: string;
  breed?: string;
  sex?: string;
}

export interface UserMini {
  id: string;
  name: string;
}

export interface BoxMini {
  id: string;
  name: string;
}

export interface Hospitalization {
  id: string;
  patient: PatientMini;
  status: HospitalizationStatus;
  risk: HospitalizationRisk;
  veterinarian: UserMini;
  box?: BoxMini;
  admitted_at: string;
  expected_discharge_at?: string;
  complaint?: string;
  diagnosis?: string;
  prognosis?: string;
  allergies: string[];
  accessories?: string;
  observations?: string;
  discharged_at?: string;
  discharge_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHospitalizationPayload {
  patient_id: string;
  status: 'TRIAGE' | 'HOSPITALIZED';
  risk: HospitalizationRisk;
  veterinarian_id: string;
  box_id?: string;
  expected_discharge_at?: string;
  complaint?: string;
  diagnosis?: string;
  prognosis?: string;
  allergies?: string[];
  accessories?: string;
  observations?: string;
}

export type UpdateHospitalizationPayload = Partial<
  Omit<CreateHospitalizationPayload, 'patient_id'>
>;

export interface HospPrescription {
  id: string;
  hospitalization_id: string;
  type: PrescriptionType;
  name: string;
  dose_value?: number;
  dose_unit?: DoseUnit;
  frequency: PrescriptionFrequency;
  interval_hours?: number;
  duration_days?: number;
  start_at: string;
  notes?: string;
  status: PrescriptionStatus;
  created_by?: UserMini;
  created_at: string;
  updated_at: string;
}

export interface CreatePrescriptionPayload {
  type: PrescriptionType;
  name: string;
  dose_value?: number;
  dose_unit?: DoseUnit;
  frequency: PrescriptionFrequency;
  interval_hours?: number;
  duration_days?: number;
  start_at: string;
  notes?: string;
}

export interface ExecutionPrescription {
  id: string;
  type: PrescriptionType;
  name: string;
  dose_value?: number;
  dose_unit?: DoseUnit;
  frequency: PrescriptionFrequency;
  notes?: string;
}

export interface ExecutionHospitalization {
  id: string;
  status: HospitalizationStatus;
  patient: PatientMini;
  box?: BoxMini;
}

export interface Execution {
  id: string;
  prescription: ExecutionPrescription;
  hospitalization: ExecutionHospitalization;
  scheduled_at: string;
  status: ExecutionStatus;
  executed_at?: string;
  executed_by?: UserMini;
  notes?: string;
}

export interface HospitalizationEvent {
  id: string;
  hospitalization_id: string;
  type: HospitalizationEventType;
  date: string;
  title?: string;
  description?: string;
  data: Record<string, unknown>;
  created_by?: UserMini;
  created_at: string;
}

export interface CreateEventPayload {
  type: 'OCCURRENCE' | 'WEIGHT' | 'CLINICAL_PARAMETERS';
  date: string;
  title?: string;
  description?: string;
  data?: Record<string, unknown>;
}

export interface Box {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  occupied: boolean;
  occupant?: {
    hospitalization_id: string;
    patient_name: string;
  };
  created_at: string;
}

export interface ClinicalParameter {
  id: string;
  name: string;
  unit?: string;
  active: boolean;
  created_at: string;
}

export interface ClinicalParameterValue {
  name: string;
  value: string;
  unit?: string;
}

export interface TemplateItem {
  type: PrescriptionType;
  name: string;
  dose_value?: number;
  dose_unit?: DoseUnit;
  frequency: PrescriptionFrequency;
  interval_hours?: number;
  duration_days?: number;
  notes?: string;
}

export interface PrescriptionTemplate {
  id: string;
  name: string;
  description?: string;
  items: TemplateItem[];
  created_at: string;
}

export interface MonitoringSummary {
  hospitalized: number;
  triage: number;
  expected_discharges_today: number;
  late_executions: number;
}
