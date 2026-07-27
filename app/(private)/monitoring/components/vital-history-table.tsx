'use client';

import { fmtDateTime } from '../utils';

import {
  EVALUATION_TEXT_COLORS,
  VITAL_DEFINITIONS,
  evaluateVital,
} from '@/constants';
import type { VitalRecord } from '@/types/monitoring';
import type { Specie } from '@/types/patient';

interface VitalHistoryTableProps {
  specie: Specie;
  records: VitalRecord[];
}

export function VitalHistoryTable({
  specie,
  records,
}: VitalHistoryTableProps) {
  const ordered = [...records].reverse();

  if (ordered.length === 0) {
    return (
      <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
        Nenhuma medição registrada ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
            <th className="p-3 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Data/Hora
            </th>
            {VITAL_DEFINITIONS.map((def) => (
              <th
                key={def.key}
                className="p-3 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap text-center"
              >
                {def.short}
                <span className="block text-[10px] font-normal">{def.unit}</span>
              </th>
            ))}
            <th className="p-3 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Registrado por
            </th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((record) => (
            <tr
              key={record.id}
              className="border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                {fmtDateTime(record.measured_at)}
                {record.notes && (
                  <span className="block text-[11px] text-slate-400 dark:text-slate-500 max-w-[180px] truncate">
                    {record.notes}
                  </span>
                )}
              </td>
              {VITAL_DEFINITIONS.map((def) => {
                const value = record[def.key];
                const evaluation = evaluateVital(specie, def.key, value);
                return (
                  <td
                    key={def.key}
                    className={`p-3 text-center font-medium ${value !== undefined && value !== null ? EVALUATION_TEXT_COLORS[evaluation] : 'text-slate-300 dark:text-slate-600'}`}
                  >
                    {value !== undefined && value !== null ? value : '—'}
                  </td>
                );
              })}
              <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                {record.recorded_by ? (
                  <>
                    {record.recorded_by.name}
                    {record.recorded_by.crmv && (
                      <span className="block text-[11px] text-slate-400 dark:text-slate-500">
                        CRMV {record.recorded_by.crmv}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-300 dark:text-slate-600">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
