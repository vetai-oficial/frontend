export type HealthRecordType =
  | 'WEIGHT'
  | 'BLOOD_PRESSURE'
  | 'MEDICATION'
  | 'CLINICAL_NOTE'
  | 'VACCINE'
  | 'NOTE'
  | 'PRESCRIPTION';

export interface WeightMetadata {
  value: number;
  unit: 'KG' | 'G';
}

export interface VaccineMetadata {
  vaccine_id: string;
  vaccine_name: string;
  vaccine_code: string;
  batch?: string;
  dose_number: string;
  revaccination_date?: string;
  previous_dose_date?: string;
  applied_by?: string;
}

export interface ClinicalNoteMetadata {
  title: string;
  description: string;
}

export interface NoteMetadata {
  text: string;
}

export interface PrescriptionMedication {
  drug: string;
  form?: string;
  quantity?: string;
  posology: string;
}

export interface PrescriptionMetadata {
  include_date: boolean;
  medications: PrescriptionMedication[];
}

export interface HealthRecord {
  id: string;
  type: HealthRecordType;
  date: string;
  notes?: string;
  metadata: WeightMetadata | VaccineMetadata | ClinicalNoteMetadata | NoteMetadata | Record<string, unknown>;
  created_at: string;
}

export interface CreateHealthRecordPayload {
  type: HealthRecordType;
  date: string;
  notes?: string;
  metadata: WeightMetadata | VaccineMetadata | ClinicalNoteMetadata | NoteMetadata | Record<string, unknown>;
}

export interface PatientDocument {
  id: string;
  fileName: string;
  mimeType: string;
  created_at: string;
}
