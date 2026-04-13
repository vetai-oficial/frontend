export type ConsultationStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface ConsultationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ConsultationDisease {
  name: string;
  probability: number;
  severity: 'red' | 'yellow' | 'green';
  reasoning?: string;
  suggestedTreatments?: string[];
}

export interface ConsultationDiagnosis {
  diseases: ConsultationDisease[];
  suggestedTreatments: string[];
  suggestedQuestions: string[];
  summary?: string;
  selectedDiseaseName?: string;
}

export interface Consultation {
  id: string;
  user_id: string;
  patient_id?: string;
  status: ConsultationStatus;
  started_at: string;
  finished_at?: string;
  messages: ConsultationMessage[];
  diagnosis: ConsultationDiagnosis;
  created_at: string;
  updated_at: string;
}
