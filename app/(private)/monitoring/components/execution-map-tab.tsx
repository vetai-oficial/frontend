'use client';

import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  dayRangeISO,
  doseLabel,
  EXECUTION_STATUS_MAP,
  executionVisualStatus,
  fmtTime,
  PRESCRIPTION_TYPE_MAP,
  todayLocalISODate,
} from '../utils';
import { ExecuteModal } from './execute-modal';
import {
  OccurrenceModal,
  ParametersModal,
  QuickAddChooserModal,
  WeightModal,
  type QuickAddKind,
} from './quick-add-modals';

import { Modal } from '@/app/components/common/modal';
import { DateInput } from '@/app/components/forms/date-input';
import { Button } from '@/components/ui/button';
import { cn } from '@/infra/utils';
import { monitoringService } from '@/services/monitoring.service';
import type { Execution, Hospitalization } from '@/types/monitoring';

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

interface SlotSelection {
  hospitalization: Hospitalization;
  hour: number;
  executions: Execution[];
}

interface QuickAddSelection {
  hospitalization: Hospitalization;
  hour: number;
  kind?: QuickAddKind;
}

export function ExecutionMapTab() {
  const [date, setDate] = useState(todayLocalISODate());
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  const [slot, setSlot] = useState<SlotSelection | null>(null);
  const [executing, setExecuting] = useState<Execution | null>(null);
  const [quickAdd, setQuickAdd] = useState<QuickAddSelection | null>(null);

  const isToday = date === todayLocalISODate();
  const currentHour = new Date().getHours();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = dayRangeISO(date);
      const [hospitalizationsResponse, executionsResponse] = await Promise.all([
        monitoringService.listHospitalizations({ active: true, size: 200 }),
        monitoringService.listExecutions(from, to),
      ]);
      setHospitalizations(hospitalizationsResponse.data);
      setExecutions(executionsResponse);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const executionsByCell = useMemo(() => {
    const map = new Map<string, Execution[]>();
    for (const execution of executions) {
      if (execution.status === 'CANCELLED') continue;
      const hour = new Date(execution.scheduled_at).getHours();
      const key = `${execution.hospitalization?.id}-${hour}`;
      const list = map.get(key) ?? [];
      list.push(execution);
      map.set(key, list);
    }
    return map;
  }, [executions]);

  const shiftDate = (days: number) => {
    const next = new Date(`${date}T12:00`);
    next.setDate(next.getDate() + days);
    const offset = next.getTimezoneOffset() * 60 * 1000;
    setDate(new Date(next.getTime() - offset).toISOString().slice(0, 10));
  };

  const chipClass = (cellExecutions: Execution[]): string => {
    const statuses = cellExecutions.map((execution) =>
      executionVisualStatus(execution),
    );
    if (statuses.includes('LATE')) return EXECUTION_STATUS_MAP.LATE.chip;
    if (statuses.includes('PENDING')) return EXECUTION_STATUS_MAP.PENDING.chip;
    if (statuses.includes('DONE')) return EXECUTION_STATUS_MAP.DONE.chip;
    return EXECUTION_STATUS_MAP.CANCELLED.chip;
  };

  const closeAllAndRefresh = () => {
    setSlot(null);
    setExecuting(null);
    setQuickAdd(null);
    void fetchData();
  };

  return (
    <div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-4 flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
        <div className="flex items-end gap-2">
          <Button variant="outline" size="icon" onClick={() => shiftDate(-1)}>
            <ChevronLeft size={16} />
          </Button>
          <div className="w-44">
            <DateInput label="Dia" value={date} onChange={setDate} />
          </div>
          <Button variant="outline" size="icon" onClick={() => shiftDate(1)}>
            <ChevronRight size={16} />
          </Button>
          {!isToday && (
            <Button variant="outline" onClick={() => setDate(todayLocalISODate())}>
              Hoje
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" /> Programada
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" /> Atrasada
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500" /> Concluída
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-teal-600" />
        </div>
      ) : hospitalizations.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
          <ClipboardCheck size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Nenhum animal internado
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            O mapa de execução mostra a programação de cada paciente internado.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin">
            <table className="border-collapse w-max min-w-full">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-900 text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-r border-slate-200 dark:border-slate-700 min-w-44">
                    Paciente
                  </th>
                  {HOURS.map((hour) => (
                    <th
                      key={hour}
                      className={cn(
                        'px-1.5 py-3 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 min-w-12',
                        isToday && hour === currentHour &&
                          'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100',
                      )}
                    >
                      {String(hour).padStart(2, '0')}h
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hospitalizations.map((hospitalization) => (
                  <tr key={hospitalization.id} className="group">
                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/90 px-4 py-2.5 border-b border-r border-slate-200 dark:border-slate-700">
                      <Link
                        href={`/monitoring/detail?id=${hospitalization.id}`}
                        className="text-sm font-medium text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400"
                      >
                        {hospitalization.patient?.name}
                      </Link>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {hospitalization.box?.name ?? 'Sem box'}
                        {hospitalization.status === 'TRIAGE' ? ' · Triagem' : ''}
                      </p>
                    </td>
                    {HOURS.map((hour) => {
                      const cellExecutions =
                        executionsByCell.get(`${hospitalization.id}-${hour}`) ?? [];
                      return (
                        <td
                          key={hour}
                          className={cn(
                            'relative border-b border-slate-100 dark:border-slate-700/60 text-center px-1 py-2 align-middle',
                            isToday && hour === currentHour &&
                              'bg-slate-100 dark:bg-slate-700/40',
                          )}
                        >
                          {cellExecutions.length > 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setSlot({ hospitalization, hour, executions: cellExecutions })
                              }
                              className={cn(
                                'w-8 h-8 rounded-full text-xs font-bold inline-flex items-center justify-center transition-colors shadow-sm',
                                chipClass(cellExecutions),
                              )}
                              title={`${cellExecutions.length} procedimento(s) às ${String(hour).padStart(2, '0')}h`}
                            >
                              {cellExecutions.length}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setQuickAdd({ hospitalization, hour })}
                              className="w-8 h-8 rounded-full inline-flex items-center justify-center text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
                              title="Adicionar registro"
                            >
                              <Plus size={14} />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {slot && (
        <Modal
          title={`${slot.hospitalization.patient?.name} · ${String(slot.hour).padStart(2, '0')}h`}
          description={`Programação do horário — ${slot.executions.length} item(ns)`}
          onClose={() => setSlot(null)}
          maxWidth="lg"
        >
          <div className="space-y-2">
            {slot.executions.map((execution) => {
              const visual = executionVisualStatus(execution);
              const statusInfo = EXECUTION_STATUS_MAP[visual];
              return (
                <div
                  key={execution.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {execution.prescription?.name}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${PRESCRIPTION_TYPE_MAP[execution.prescription.type].badge}`}
                      >
                        {PRESCRIPTION_TYPE_MAP[execution.prescription.type].label}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusInfo.badge}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {fmtTime(execution.scheduled_at)}
                      {doseLabel(execution.prescription)
                        ? ` · ${doseLabel(execution.prescription)}`
                        : ''}
                      {execution.status === 'DONE' && execution.executed_by?.name
                        ? ` · Executado por ${execution.executed_by.name}${execution.executed_at ? ` às ${fmtTime(execution.executed_at)}` : ''}`
                        : ''}
                    </p>
                    {execution.notes && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">
                        {execution.notes}
                      </p>
                    )}
                  </div>
                  {execution.status === 'PENDING' && (
                    <Button
                      size="sm"
                      onClick={() => setExecuting(execution)}
                      className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 shrink-0"
                      disabled={slot.hospitalization.status === 'TRIAGE'}
                      title={
                        slot.hospitalization.status === 'TRIAGE'
                          ? 'Paciente em triagem — mude a situação para Internado para executar'
                          : undefined
                      }
                    >
                      Executar
                    </Button>
                  )}
                </div>
              );
            })}
            {slot.hospitalization.status === 'TRIAGE' && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Paciente em triagem: execuções ficam bloqueadas até a situação mudar para
                Internado.
              </p>
            )}
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuickAdd({
                    hospitalization: slot.hospitalization,
                    hour: slot.hour,
                  });
                  setSlot(null);
                }}
              >
                <Plus size={14} />
                Outro registro
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSlot(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {executing && (
        <ExecuteModal
          execution={executing}
          onClose={() => setExecuting(null)}
          onSuccess={closeAllAndRefresh}
        />
      )}

      {quickAdd && !quickAdd.kind && (
        <QuickAddChooserModal
          patientName={quickAdd.hospitalization.patient?.name}
          onChoose={(kind) => setQuickAdd({ ...quickAdd, kind })}
          onClose={() => setQuickAdd(null)}
        />
      )}
      {quickAdd?.kind === 'occurrence' && (
        <OccurrenceModal
          hospitalizationId={quickAdd.hospitalization.id}
          patientName={quickAdd.hospitalization.patient?.name}
          defaultDate={date}
          defaultTime={`${String(quickAdd.hour).padStart(2, '0')}:00`}
          onClose={() => setQuickAdd(null)}
          onSuccess={closeAllAndRefresh}
        />
      )}
      {quickAdd?.kind === 'weight' && (
        <WeightModal
          hospitalizationId={quickAdd.hospitalization.id}
          patientName={quickAdd.hospitalization.patient?.name}
          defaultDate={date}
          defaultTime={`${String(quickAdd.hour).padStart(2, '0')}:00`}
          onClose={() => setQuickAdd(null)}
          onSuccess={closeAllAndRefresh}
        />
      )}
      {quickAdd?.kind === 'parameters' && (
        <ParametersModal
          hospitalizationId={quickAdd.hospitalization.id}
          patientName={quickAdd.hospitalization.patient?.name}
          defaultDate={date}
          defaultTime={`${String(quickAdd.hour).padStart(2, '0')}:00`}
          onClose={() => setQuickAdd(null)}
          onSuccess={closeAllAndRefresh}
        />
      )}
    </div>
  );
}
