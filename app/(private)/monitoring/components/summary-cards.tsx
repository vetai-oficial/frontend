'use client';

import { AlarmClockOff, CalendarCheck, PawPrint, Stethoscope } from 'lucide-react';

import type { MonitoringSummary } from '@/types/monitoring';

interface SummaryCardsProps {
  summary: MonitoringSummary | null;
  loading?: boolean;
}

const CARDS = [
  {
    key: 'hospitalized' as const,
    label: 'Internados agora',
    icon: PawPrint,
    iconClass: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20',
  },
  {
    key: 'triage' as const,
    label: 'Em triagem',
    icon: Stethoscope,
    iconClass:
      'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  },
  {
    key: 'expected_discharges_today' as const,
    label: 'Altas previstas hoje',
    icon: CalendarCheck,
    iconClass:
      'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  },
  {
    key: 'late_executions' as const,
    label: 'Tarefas atrasadas',
    icon: AlarmClockOff,
    iconClass: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  },
];

export function SummaryCards({ summary, loading = false }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {CARDS.map(({ key, label, icon: Icon, iconClass }) => (
        <div
          key={key}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex items-center gap-3"
        >
          <div className={`p-2.5 rounded-lg shrink-0 ${iconClass}`}>
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            {loading ? (
              <div className="h-7 w-10 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {summary?.[key] ?? 0}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
