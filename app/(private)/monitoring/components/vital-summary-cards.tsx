'use client';

import {
  EVALUATION_LABELS,
  EVALUATION_TEXT_COLORS,
  TREND_LABELS,
  VITAL_DEFINITIONS,
  computeVitalTrend,
  evaluateVital,
  formatRange,
  getVitalRange,
  type VitalKey,
} from '@/constants';
import type { VitalRecord } from '@/types/monitoring';
import type { Specie } from '@/types/patient';

interface VitalSummaryCardsProps {
  specie: Specie;
  records: VitalRecord[];
}

// Pega o valor mais recente de cada parâmetro (um registro pode não conter todos).
function latestValueByKey(
  records: VitalRecord[],
  key: VitalKey,
): { value: number; measuredAt: string } | null {
  for (let i = records.length - 1; i >= 0; i--) {
    const value = records[i]?.[key];
    if (value !== undefined && value !== null) {
      return { value, measuredAt: records[i]!.measured_at };
    }
  }
  return null;
}

export function VitalSummaryCards({ specie, records }: VitalSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {VITAL_DEFINITIONS.map((def) => {
        const latest = latestValueByKey(records, def.key);
        const evaluation = evaluateVital(specie, def.key, latest?.value);
        const range = getVitalRange(specie, def.key);
        const trend = computeVitalTrend(specie, def.key, records);

        return (
          <div
            key={def.key}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {def.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${EVALUATION_TEXT_COLORS[evaluation]}`}>
              {latest ? latest.value : '—'}
              {latest && (
                <span className="text-xs font-normal text-slate-400 ml-1">{def.unit}</span>
              )}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {formatRange(range, def.unit)}
              </span>
              {latest && evaluation !== 'unknown' && (
                <span className={`text-[11px] font-semibold ${EVALUATION_TEXT_COLORS[evaluation]}`}>
                  {EVALUATION_LABELS[evaluation]}
                </span>
              )}
            </div>
            {trend === 'worsening' && (
              <span className="mt-1 inline-block text-[11px] font-semibold text-red-600 dark:text-red-400">
                ↑ {TREND_LABELS.worsening}
              </span>
            )}
            {trend === 'improving' && (
              <span className="mt-1 inline-block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                ↓ {TREND_LABELS.improving}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
