import type { VitalRecord } from '@/types/monitoring';
import type { Specie } from '@/types/patient';

export type VitalKey =
  | 'heart_rate'
  | 'respiratory_rate'
  | 'rectal_temperature'
  | 'blood_pressure'
  | 'glucose'
  | 'capillary_refill_time';

export interface VitalRange {
  min: number;
  max: number;
}

export interface VitalDefinition {
  key: VitalKey;
  label: string;
  short: string;
  unit: string;
  color: string;
  step: number;
  references: Partial<Record<Specie, VitalRange>>;
}

// Faixas de referência por espécie (tabela de Parâmetros Vitais — cães e gatos).
// Espécies sem faixa definida são registradas, mas não geram avaliação.
export const VITAL_DEFINITIONS: VitalDefinition[] = [
  {
    key: 'heart_rate',
    label: 'Frequência cardíaca',
    short: 'FC',
    unit: 'bpm',
    color: '#ef4444',
    step: 1,
    references: { DOG: { min: 60, max: 160 }, CAT: { min: 120, max: 240 } },
  },
  {
    key: 'respiratory_rate',
    label: 'Frequência respiratória',
    short: 'FR',
    unit: 'mpm',
    color: '#3b82f6',
    step: 1,
    references: { DOG: { min: 18, max: 36 }, CAT: { min: 20, max: 40 } },
  },
  {
    key: 'rectal_temperature',
    label: 'Temperatura retal',
    short: 'Temp',
    unit: '°C',
    color: '#f59e0b',
    step: 0.1,
    references: {
      DOG: { min: 37.5, max: 39.2 },
      CAT: { min: 37.8, max: 39.2 },
    },
  },
  {
    key: 'blood_pressure',
    label: 'Pressão arterial',
    short: 'PA',
    unit: 'mmHg',
    color: '#8b5cf6',
    step: 1,
    references: { DOG: { min: 85, max: 120 }, CAT: { min: 85, max: 120 } },
  },
  {
    key: 'glucose',
    label: 'Glicemia',
    short: 'Glic',
    unit: 'mg/dL',
    color: '#10b981',
    step: 1,
    references: { DOG: { min: 65, max: 118 }, CAT: { min: 73, max: 134 } },
  },
  {
    key: 'capillary_refill_time',
    label: 'TPC',
    short: 'TPC',
    unit: 's',
    color: '#ec4899',
    step: 0.5,
    references: { DOG: { min: 1, max: 2 }, CAT: { min: 1, max: 2 } },
  },
];

export type VitalEvaluation = 'low' | 'normal' | 'high' | 'unknown';

export function getVitalRange(specie: Specie, key: VitalKey): VitalRange | null {
  const def = VITAL_DEFINITIONS.find((d) => d.key === key);
  return def?.references[specie] ?? null;
}

export function evaluateVital(
  specie: Specie,
  key: VitalKey,
  value?: number | null,
): VitalEvaluation {
  if (value === undefined || value === null) return 'unknown';
  const range = getVitalRange(specie, key);
  if (!range) return 'unknown';
  if (value < range.min) return 'low';
  if (value > range.max) return 'high';
  return 'normal';
}

export function formatRange(range: VitalRange | null, unit: string): string {
  if (!range) return 'Sem referência';
  return `${range.min} – ${range.max} ${unit}`;
}

export const EVALUATION_TEXT_COLORS: Record<VitalEvaluation, string> = {
  normal: 'text-emerald-600 dark:text-emerald-400',
  high: 'text-red-600 dark:text-red-400',
  low: 'text-amber-600 dark:text-amber-400',
  unknown: 'text-slate-500 dark:text-slate-400',
};

export const EVALUATION_LABELS: Record<VitalEvaluation, string> = {
  normal: 'Normal',
  high: 'Acima',
  low: 'Abaixo',
  unknown: '—',
};

// ── Cadência de aferição (lembrete de reaferição) ──────────────────────────
export const MONITORING_INTERVAL_OPTIONS: { value: string; label: string }[] = [
  { value: '60', label: 'A cada 1h' },
  { value: '120', label: 'A cada 2h' },
  { value: '240', label: 'A cada 4h' },
  { value: '360', label: 'A cada 6h' },
  { value: '480', label: 'A cada 8h' },
  { value: '720', label: 'A cada 12h' },
  { value: '0', label: 'Sem lembrete' },
];

export interface CadenceState {
  overdue: boolean;
  neverMeasured: boolean;
  minutesSinceLast: number | null;
  minutesUntilDue: number | null;
}

export function evaluateCadence(
  intervalMinutes: number | undefined,
  lastMeasuredAt: string | null | undefined,
  now: number = Date.now(),
): CadenceState | null {
  if (!intervalMinutes || intervalMinutes <= 0) return null;
  if (!lastMeasuredAt) {
    return {
      overdue: true,
      neverMeasured: true,
      minutesSinceLast: null,
      minutesUntilDue: null,
    };
  }
  const minutesSinceLast = Math.floor(
    (now - new Date(lastMeasuredAt).getTime()) / 60000,
  );
  const minutesUntilDue = intervalMinutes - minutesSinceLast;
  return {
    overdue: minutesUntilDue <= 0,
    neverMeasured: false,
    minutesSinceLast,
    minutesUntilDue,
  };
}

export function formatVitalDuration(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}min`;
  if (min === 0) return `${h}h`;
  return `${h}h${String(min).padStart(2, '0')}`;
}

// ── Tendência (piora/melhora entre as últimas medições) ─────────────────────
export type Trend = 'worsening' | 'improving' | 'stable' | 'none';

export function computeVitalTrend(
  specie: Specie,
  key: VitalKey,
  records: VitalRecord[],
): Trend {
  const series = records
    .map((r) => r[key])
    .filter((v): v is number => v !== undefined && v !== null);
  if (series.length < 2) return 'none';

  const last = series[series.length - 1]!;
  const prev = series[series.length - 2]!;
  const delta = last - prev;
  const evalLast = evaluateVital(specie, key, last);
  const evalPrev = evaluateVital(specie, key, prev);

  if (evalLast === 'normal' || evalLast === 'unknown') {
    return evalPrev !== 'normal' && evalPrev !== 'unknown'
      ? 'improving'
      : 'stable';
  }
  if (delta === 0) return 'stable';
  if (evalLast === 'high') return delta > 0 ? 'worsening' : 'improving';
  return delta < 0 ? 'worsening' : 'improving';
}

export const TREND_LABELS: Record<Trend, string> = {
  worsening: 'Piorando',
  improving: 'Melhorando',
  stable: 'Estável',
  none: '',
};

export const CLINICAL_STATUS_LABELS = {
  STABLE: 'Estável',
  UNSTABLE: 'Instável',
  AWAITING_TUTOR: 'Aguardando tutor',
} as const;

export const CLINICAL_STATUS_CLASSES = {
  STABLE:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  UNSTABLE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  AWAITING_TUTOR:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
} as const;
