import type {
  DoseUnit,
  Execution,
  ExecutionStatus,
  HospitalizationEventType,
  HospitalizationRisk,
  HospitalizationStatus,
  PrescriptionFrequency,
  PrescriptionType,
} from '@/types/monitoring';

export const STATUS_MAP: Record<
  HospitalizationStatus,
  { label: string; badge: string; dot: string }
> = {
  TRIAGE: {
    label: 'Triagem',
    badge:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    dot: 'bg-yellow-500',
  },
  HOSPITALIZED: {
    label: 'Internado',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  DISCHARGED: {
    label: 'Alta',
    badge:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    dot: 'bg-green-500',
  },
  DECEASED: {
    label: 'Óbito',
    badge:
      'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    dot: 'bg-slate-500',
  },
  CANCELLED: {
    label: 'Cancelada',
    badge:
      'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400',
    dot: 'bg-slate-400',
  },
};

export const RISK_MAP: Record<
  HospitalizationRisk,
  { label: string; badge: string; dot: string }
> = {
  LOW: {
    label: 'Baixo risco',
    badge:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    dot: 'bg-green-500',
  },
  MEDIUM: {
    label: 'Risco moderado',
    badge:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    dot: 'bg-yellow-500',
  },
  HIGH: {
    label: 'Alto risco',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    dot: 'bg-red-500',
  },
};

export const PRESCRIPTION_TYPE_MAP: Record<
  PrescriptionType,
  { label: string; badge: string }
> = {
  MEDICATION: {
    label: 'Medicamento',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  PROCEDURE: {
    label: 'Procedimento',
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  },
  FLUID: {
    label: 'Fluidoterapia',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  },
};

export const FREQUENCY_LABELS: Record<PrescriptionFrequency, string> = {
  RECURRING: 'Recorrente',
  ONCE: 'Apenas uma vez',
  AS_NEEDED: 'Quando necessário (SOS)',
};

export const DOSE_UNIT_LABELS: Record<DoseUnit, string> = {
  MG: 'mg',
  MCG: 'mcg',
  G: 'g',
  ML: 'ml',
  ML_H: 'ml/h',
  TABLET: 'comprimido(s)',
  CAPSULE: 'cápsula(s)',
  DROP: 'gota(s)',
};

export type ExecutionVisualStatus = ExecutionStatus | 'LATE';

export const EXECUTION_STATUS_MAP: Record<
  ExecutionVisualStatus,
  { label: string; badge: string; chip: string }
> = {
  PENDING: {
    label: 'Programada',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    chip: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  LATE: {
    label: 'Atrasada',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    chip: 'bg-red-500 hover:bg-red-600 text-white',
  },
  DONE: {
    label: 'Concluída',
    badge:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    chip: 'bg-green-500 hover:bg-green-600 text-white',
  },
  CANCELLED: {
    label: 'Cancelada',
    badge:
      'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400',
    chip: 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300',
  },
};

export function executionVisualStatus(
  execution: Execution,
  now: Date = new Date(),
): ExecutionVisualStatus {
  if (execution.status === 'PENDING') {
    return new Date(execution.scheduled_at) < now ? 'LATE' : 'PENDING';
  }
  return execution.status;
}

export const EVENT_TYPE_LABELS: Record<HospitalizationEventType, string> = {
  OCCURRENCE: 'Ocorrência',
  WEIGHT: 'Peso',
  CLINICAL_PARAMETERS: 'Parâmetros clínicos',
  STATUS_CHANGE: 'Situação',
  BOX_CHANGE: 'Box',
};

export function doseLabel(prescription: {
  dose_value?: number;
  dose_unit?: DoseUnit;
}): string {
  if (!prescription.dose_value || !prescription.dose_unit) return '';
  const value = Number.isInteger(prescription.dose_value)
    ? prescription.dose_value
    : prescription.dose_value.toLocaleString('pt-BR');
  return `${value} ${DOSE_UNIT_LABELS[prescription.dose_unit]}`;
}

export function fmtDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function fmtDateTime(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fmtTime(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysSince(iso: string): number {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function dayRangeISO(dateStr: string): { from: string; to: string } {
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function todayLocalISODate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function toISO(date: string, time: string): string {
  return new Date(`${date}T${time || '00:00'}`).toISOString();
}

export function nowDateTimeLocal(): { date: string; time: string } {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  const local = new Date(now.getTime() - offset).toISOString();
  return { date: local.slice(0, 10), time: local.slice(11, 16) };
}
