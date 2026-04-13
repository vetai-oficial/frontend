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
