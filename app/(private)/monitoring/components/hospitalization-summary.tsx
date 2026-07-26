'use client';

import { MessageCircle, PawPrint, Phone } from 'lucide-react';

import { Badge } from '@/app/components/badge';
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  SECTOR_PLACEMENT_LABELS,
  SEX_LABELS,
  SPECIE_LABELS,
  type Priority,
} from '@/constants';
import type { Hospitalization } from '@/types/monitoring';
import { calcAge, parseBirthDate } from '@/utils/date-format';
import { whatsappLink } from '@/utils/phone';

interface HospitalizationSummaryProps {
  hospitalization: Hospitalization;
  priority: Priority;
}

function formatWeight(weight: number): string {
  return `${weight.toFixed(1).replace(/\.0$/, '').replace('.', ',')} kg`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR');
}

export function HospitalizationSummary({
  hospitalization,
  priority,
}: HospitalizationSummaryProps) {
  const { patient, veterinarian } = hospitalization;
  const { tutor } = patient;
  const whatsapp = whatsappLink(tutor?.phone);

  const traits = [
    SPECIE_LABELS[patient.specie],
    patient.sex ? SEX_LABELS[patient.sex] : null,
    patient.breed,
    patient.birth_date ? calcAge(parseBirthDate(patient.birth_date)) : null,
    hospitalization.weight_kg ? formatWeight(hospitalization.weight_kg) : null,
  ].filter(Boolean);

  const sectorLabel =
    SECTOR_PLACEMENT_LABELS[hospitalization.sector ?? 'INPATIENT'];
  const placement = hospitalization.kennel
    ? `${sectorLabel} no box ${hospitalization.kennel}`
    : sectorLabel;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40">
          <PawPrint size={26} className="text-teal-600 dark:text-teal-400" />
        </div>

        <div className="min-w-0 space-y-1.5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {patient.name}
            </h2>
            {patient.record_number && (
              <span className="text-base italic text-slate-400 dark:text-slate-500">
                ({patient.record_number})
              </span>
            )}
          </div>

          <p className="text-sm italic text-slate-500 dark:text-slate-400">
            {traits.join(', ')}
          </p>

          {patient.observations && (
            <p className="inline-block rounded bg-violet-500 px-2 py-1 text-xs font-semibold text-white">
              {patient.observations}
            </p>
          )}

          {tutor && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {tutor.name}
              </span>
              {tutor.record_number && (
                <span className="text-sm italic text-slate-400 dark:text-slate-500">
                  ({tutor.record_number})
                </span>
              )}
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Conversar com ${tutor.name} no WhatsApp`}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <MessageCircle size={13} />
                  WhatsApp
                </a>
              ) : (
                <span
                  title="Tutor sem telefone cadastrado"
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                >
                  <Phone size={13} />
                  Sem telefone
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm lg:items-end">
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Badge color={PRIORITY_COLORS[priority]}>
            {PRIORITY_LABELS[priority]}
          </Badge>
          {!hospitalization.active && <Badge color="blue">Alta</Badge>}
        </div>
        <p className="text-slate-700 dark:text-slate-200">{placement}</p>
        <p className="text-slate-500 dark:text-slate-400">
          {hospitalization.expected_discharge_at
            ? `Alta prevista para ${formatDate(hospitalization.expected_discharge_at)}`
            : 'Sem previsão de alta'}
        </p>
        <p className="text-slate-500 dark:text-slate-400">
          Veterinário:{' '}
          <strong className="font-semibold text-slate-800 dark:text-white">
            {veterinarian?.name ?? '—'}
          </strong>
        </p>
      </div>
    </div>
  );
}
