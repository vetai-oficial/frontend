'use client';

import { AlertTriangle, Info, UserRound } from 'lucide-react';
import Link from 'next/link';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BOARD_ACCENT_BAR,
  BOARD_ACCENT_LABELS,
  BOARD_ACCENT_TEXT,
  SPECIE_LABELS,
  boardAccent,
  computePriority,
  evaluateCadence,
  getInitials,
  vetBadgeClass,
} from '@/constants';
import type { Hospitalization } from '@/types/monitoring';

interface BoardCardProps {
  hospitalization: Hospitalization;
}

function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

function formatWeight(weight: number): string {
  return `${weight.toFixed(1).replace(/\.0$/, '').replace('.', ',')} kg`;
}

export function BoardCard({ hospitalization }: BoardCardProps) {
  const { patient, veterinarian } = hospitalization;
  const priority = computePriority(patient.specie, hospitalization.latest_vitals);
  const cadence = evaluateCadence(
    hospitalization.monitoring_interval_minutes,
    hospitalization.latest_vitals?.measured_at,
  );
  const overdue = cadence?.overdue ?? false;
  const accent = boardAccent(hospitalization.status, priority, overdue);

  const description = [
    patient.breed || SPECIE_LABELS[patient.specie],
    hospitalization.weight_kg ? formatWeight(hospitalization.weight_kg) : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Link
      href={`/monitoring/detail?id=${hospitalization.id}`}
      className="group flex min-h-24 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
    >
      <span
        aria-hidden
        className={`w-2 shrink-0 ${BOARD_ACCENT_BAR[accent]}`}
      />
      <span className="sr-only">
        {BOARD_ACCENT_LABELS[accent]}
        {overdue ? ' — aferição atrasada' : ''}
      </span>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 px-3 py-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1">
              <span className="truncate font-semibold text-slate-800 dark:text-white">
                {patient.name}
              </span>
              {patient.record_number && (
                <span className="shrink-0 text-sm italic text-slate-400 dark:text-slate-500">
                  ({patient.record_number})
                </span>
              )}
              {overdue && (
                <AlertTriangle size={13} className="shrink-0 text-red-500" aria-hidden />
              )}
            </div>
            <p className="truncate text-xs italic text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {veterinarian ? (
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs font-bold ${vetBadgeClass(veterinarian.name)}`}
                  >
                    {getInitials(veterinarian.name)}
                  </span>
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500">
                    <UserRound size={16} />
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent>
                {veterinarian ? (
                  <p>
                    {veterinarian.name}
                    {veterinarian.crmv ? ` — CRMV ${veterinarian.crmv}` : ''}
                  </p>
                ) : (
                  <p>Sem veterinário responsável</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {hospitalization.expected_discharge_at
            ? `Alta prevista ${formatShortDate(hospitalization.expected_discharge_at)}`
            : 'Sem previsão de alta'}
        </p>

        <div className="flex items-end justify-between gap-2">
          <span
            className={`text-sm font-semibold ${BOARD_ACCENT_TEXT[accent]}`}
          >
            {hospitalization.kennel || ' '}
          </span>
          <Info
            size={14}
            className="shrink-0 text-slate-400 transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
