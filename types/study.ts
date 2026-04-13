import type { Patient } from './patient';

export type StudyStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type PreventionStatus = 'GENERATING' | 'COMPLETED' | 'FAILED';
export type ExamValueStatus = 'REGULAR' | 'HIGHER' | 'LOWER';

export interface ExamReference {
  type: 'TEXT' | 'RANGE';
  min?: number;
  max?: number;
  text?: string;
  unit?: string;
}

export interface ExamValue {
  title: string;
  status: ExamValueStatus;
  unit?: string;
  value: string;
  subgroup?: string;
  reference?: ExamReference;
}

export interface ExamResult {
  title: string;
  values: ExamValue[];
}

export interface AlteredValueInfo {
  name: string;
  value: string;
  unit?: string;
  status: string;
  problems: string[];
  recommendations: string[];
}

export interface StudyPrevention {
  alteredValues: AlteredValueInfo[];
  generalRecommendations: string[];
}

export interface Study {
  id: string;
  patient: Patient;
  status: StudyStatus;
  preventionStatus?: PreventionStatus;
  examDate?: string;
  title?: string;
  results: ExamResult[];
  prevention?: StudyPrevention;
  created_at: string;
  updated_at: string;
}
