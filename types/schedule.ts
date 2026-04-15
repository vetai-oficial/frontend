export type EventType = 'consultation' | 'surgery' | 'vaccine' | 'exam' | 'other';

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  type: EventType;
  patientName?: string;
  tutorName?: string;
}

export const EVENT_TYPE_MAP: Record<EventType, { label: string; color: string; bg: string; dot: string }> = {
  consultation: {
    label: 'Consulta',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  surgery: {
    label: 'Cirurgia',
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
  },
  vaccine: {
    label: 'Vacina',
    color: 'text-green-700 dark:text-green-300',
    bg: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
    dot: 'bg-green-500',
  },
  exam: {
    label: 'Exame',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
  other: {
    label: 'Outro',
    color: 'text-slate-700 dark:text-slate-300',
    bg: 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600',
    dot: 'bg-slate-500',
  },
};
