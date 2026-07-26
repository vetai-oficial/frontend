import type {
  HospitalizationSector,
  HospitalizationStatus,
  VitalRecord,
} from '@/types/monitoring';
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
// Espécies sem faixa definida são registradas, mas não geram alerta de prioridade.
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
    references: { DOG: { min: 37.5, max: 39.2 }, CAT: { min: 37.8, max: 39.2 } },
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

export const STATUS_LABELS: Record<HospitalizationStatus, string> = {
  STABLE: 'Estável',
  UNSTABLE: 'Instável',
  AWAITING_TUTOR: 'Aguardando Tutor',
};

export type BadgeColor = 'red' | 'green' | 'yellow' | 'blue';

export const STATUS_COLORS: Record<HospitalizationStatus, BadgeColor> = {
  STABLE: 'green',
  UNSTABLE: 'red',
  AWAITING_TUTOR: 'yellow',
};

export const STATUS_OPTIONS: { value: HospitalizationStatus; label: string }[] =
  [
    { value: 'STABLE', label: STATUS_LABELS.STABLE },
    { value: 'UNSTABLE', label: STATUS_LABELS.UNSTABLE },
    { value: 'AWAITING_TUTOR', label: STATUS_LABELS.AWAITING_TUTOR },
  ];

// ── Setores do painel de internação ────────────────────────────────────────
export const SECTOR_LABELS: Record<HospitalizationSector, string> = {
  INPATIENT: 'Internados',
  TRIAGE: 'Triagem',
};

export const SECTOR_ORDER: HospitalizationSector[] = ['INPATIENT', 'TRIAGE'];

// Singular, para a frase de alocação na ficha ("Internado no box C-01").
export const SECTOR_PLACEMENT_LABELS: Record<HospitalizationSector, string> = {
  INPATIENT: 'Internado',
  TRIAGE: 'Em triagem',
};

export const SECTOR_OPTIONS: { value: HospitalizationSector; label: string }[] =
  [
    { value: 'INPATIENT', label: SECTOR_LABELS.INPATIENT },
    { value: 'TRIAGE', label: SECTOR_LABELS.TRIAGE },
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

export type Priority = 'critical' | 'attention' | 'normal' | 'unknown';

// Prioridade derivada da última medição: quanto mais parâmetros fora da faixa,
// maior a prioridade clínica do paciente.
export function computePriority(
  specie: Specie,
  vitals?: VitalRecord | null,
): Priority {
  if (!vitals) return 'unknown';

  let measured = 0;
  let outOfRange = 0;

  for (const def of VITAL_DEFINITIONS) {
    const evaluation = evaluateVital(specie, def.key, vitals[def.key]);
    if (evaluation === 'unknown') continue;
    measured++;
    if (evaluation !== 'normal') outOfRange++;
  }

  if (measured === 0) return 'unknown';
  if (outOfRange >= 3) return 'critical';
  if (outOfRange >= 1) return 'attention';
  return 'normal';
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: 'Crítico',
  attention: 'Atenção',
  normal: 'Estável',
  unknown: 'Sem medição',
};

export const PRIORITY_COLORS: Record<Priority, BadgeColor> = {
  critical: 'red',
  attention: 'yellow',
  normal: 'green',
  unknown: 'blue',
};

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

export function formatDuration(totalMinutes: number): string {
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

// ── Painel de internação (cartões compactos) ───────────────────────────────
export type BoardAccent = 'red' | 'orange' | 'amber' | 'green' | 'blue';

export const BOARD_ACCENT_BAR: Record<BoardAccent, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-400',
  green: 'bg-emerald-500',
  blue: 'bg-sky-500',
};

export const BOARD_ACCENT_TEXT: Record<BoardAccent, string> = {
  red: 'text-red-600 dark:text-red-400',
  orange: 'text-orange-600 dark:text-orange-400',
  amber: 'text-amber-600 dark:text-amber-400',
  green: 'text-emerald-600 dark:text-emerald-400',
  blue: 'text-sky-600 dark:text-sky-400',
};

export const BOARD_ACCENT_LABELS: Record<BoardAccent, string> = {
  red: 'Crítico',
  orange: 'Instável',
  amber: 'Atenção',
  green: 'Estável',
  blue: 'Aguardando tutor',
};

export function boardAccent(
  status: HospitalizationStatus,
  priority: Priority,
  overdue: boolean,
): BoardAccent {
  if (priority === 'critical' || overdue) return 'red';
  if (status === 'UNSTABLE') return 'orange';
  if (priority === 'attention') return 'amber';
  if (status === 'AWAITING_TUTOR') return 'blue';
  return 'green';
}

export function getInitials(name: string): string {
  const parts = name
    .replace(/\b(dr|dra|drs|prof|med|vet)\.?\b/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

const VET_BADGE_COLORS = [
  'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
];

// Cor estável por veterinário: facilita identificar o responsável no painel.
export function vetBadgeClass(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return VET_BADGE_COLORS[hash % VET_BADGE_COLORS.length]!;
}
