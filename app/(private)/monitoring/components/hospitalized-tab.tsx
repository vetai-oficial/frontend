'use client';

import {
  AlertTriangle,
  BedDouble,
  Bird,
  Cat,
  CalendarClock,
  Dog,
  Loader2,
  PawPrint,
  Plus,
  Search,
  Stethoscope,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { RISK_MAP, STATUS_MAP, daysSince, dayRangeISO, fmtDate, todayLocalISODate } from '../utils';
import { HospitalizeModal } from './hospitalize-modal';
import { SummaryCards } from './summary-cards';

import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import {
  CLINICAL_STATUS_CLASSES,
  CLINICAL_STATUS_LABELS,
  evaluateCadence,
} from '@/constants';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { authService } from '@/services/auth.service';
import { collaboratorsService } from '@/services/collaborators.service';
import {
  monitoringService,
  type HospitalizationListParams,
} from '@/services/monitoring.service';
import type { PaginatedQueryParams } from '@/types/common';
import type {
  Box,
  Hospitalization,
  MonitoringSummary,
} from '@/types/monitoring';
import type { Collaborator } from '@/types/settings';

const SPECIE_ICONS: Record<string, typeof PawPrint> = {
  DOG: Dog,
  CAT: Cat,
  BIRD: Bird,
};

function cadenceFor(hospitalization: Hospitalization) {
  return evaluateCadence(
    hospitalization.monitoring_interval_minutes,
    hospitalization.latest_vitals?.measured_at,
  );
}

interface Filters {
  search?: string;
  status?: string;
  risk?: string;
  veterinarian_id?: string;
  box_id?: string;
  [key: string]: unknown;
}

export function HospitalizedTab() {
  const router = useRouter();
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [showHospitalize, setShowHospitalize] = useState(false);
  const [vets, setVets] = useState<Collaborator[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);

  const fetchHospitalizations = useCallback(
    (params: PaginatedQueryParams<Filters>) =>
      monitoringService.listHospitalizations({
        ...params,
        status: (params.status || undefined) as HospitalizationListParams['status'],
        risk: (params.risk || undefined) as HospitalizationListParams['risk'],
        veterinarian_id: params.veterinarian_id || undefined,
        box_id: params.box_id || undefined,
        active: params.status ? undefined : true,
      }),
    [],
  );

  const {
    items: hospitalizations,
    loading,
    loadingMore,
    hasMorePage,
    isEmpty,
    filters,
    setFilters,
    setSearch,
    refresh,
    loadNextPage,
  } = usePaginatedResource<Hospitalization, Filters>({
    fetcher: fetchHospitalizations,
    pageSize: 30,
    mode: 'append',
    debounceMs: 300,
  });

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const { from, to } = dayRangeISO(todayLocalISODate());
      const data = await monitoringService.summary(from, to);
      setSummary(data);
    } catch {
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSummary();
    void Promise.all([
      authService.me().catch(() => null),
      collaboratorsService.findAll().catch(() => [] as Collaborator[]),
    ]).then(([me, collaborators]) => {
      const list = collaborators.filter(
        (c) => c.status === 'active' && c.name,
      );
      if (me && !list.some((c) => c.id === me.id)) {
        list.unshift({
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          status: 'active',
          addedAt: new Date().toISOString(),
        });
      }
      setVets(list);
    });
    void monitoringService
      .listBoxes()
      .then(setBoxes)
      .catch(() => undefined);
  }, [fetchSummary]);

  const handleSuccess = () => {
    setShowHospitalize(false);
    void refresh();
    void fetchSummary();
  };

  return (
    <div>
      <SummaryCards summary={summary} loading={summaryLoading} />

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Buscar paciente
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Nome do paciente..."
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:w-[52%]">
            <SelectInput
              label="Situação"
              value={filters.status ?? ''}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
              options={[
                { value: '', label: 'Ativas' },
                { value: 'TRIAGE', label: 'Triagem' },
                { value: 'HOSPITALIZED', label: 'Internado' },
              ]}
            />
            <SelectInput
              label="Risco"
              value={filters.risk ?? ''}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, risk: value }))
              }
              options={[
                { value: '', label: 'Todos' },
                { value: 'LOW', label: 'Baixo' },
                { value: 'MEDIUM', label: 'Moderado' },
                { value: 'HIGH', label: 'Alto' },
              ]}
            />
            <SelectInput
              label="Veterinário"
              value={filters.veterinarian_id ?? ''}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, veterinarian_id: value }))
              }
              options={[
                { value: '', label: 'Todos' },
                ...vets.map((vet) => ({ value: vet.id, label: vet.name ?? '' })),
              ]}
            />
            <SelectInput
              label="Box"
              value={filters.box_id ?? ''}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, box_id: value }))
              }
              options={[
                { value: '', label: 'Todos' },
                ...boxes.map((box) => ({ value: box.id, label: box.name })),
              ]}
            />
          </div>
          <Button
            onClick={() => setShowHospitalize(true)}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 shrink-0"
          >
            <Plus size={16} />
            Internar paciente
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-teal-600" />
        </div>
      ) : isEmpty ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
          <PawPrint size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Nenhum animal internado no momento
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Clique em “Internar paciente” para registrar uma nova internação.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {hospitalizations.map((hospitalization) => {
              const SpecieIcon =
                SPECIE_ICONS[hospitalization.patient?.specie ?? ''] ?? PawPrint;
              const status = STATUS_MAP[hospitalization.status];
              const risk = RISK_MAP[hospitalization.risk];
              return (
                <button
                  key={hospitalization.id}
                  type="button"
                  onClick={() =>
                    router.push(`/monitoring/detail?id=${hospitalization.id}`)
                  }
                  className="text-left bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 shrink-0">
                        <SpecieIcon size={22} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {hospitalization.patient?.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {hospitalization.patient?.breed || '—'}
                        </p>
                      </div>
                    </div>
                    {hospitalization.allergies.length > 0 && (
                      <span
                        title={`Alergias: ${hospitalization.allergies.join(', ')}`}
                        className="text-amber-500 shrink-0"
                      >
                        <AlertTriangle size={18} />
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${status.badge}`}>
                      {status.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${risk.badge}`}>
                      {risk.label}
                    </span>
                    {hospitalization.clinical_status && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${CLINICAL_STATUS_CLASSES[hospitalization.clinical_status]}`}
                      >
                        {CLINICAL_STATUS_LABELS[hospitalization.clinical_status]}
                      </span>
                    )}
                    {cadenceFor(hospitalization)?.overdue && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Aferição atrasada
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-1.5">
                      <Stethoscope size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{hospitalization.veterinarian?.name ?? '—'}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <BedDouble size={13} className="text-slate-400 shrink-0" />
                      {hospitalization.box?.name ?? 'Sem box'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <CalendarClock size={13} className="text-slate-400 shrink-0" />
                      {daysSince(hospitalization.admitted_at)}{' '}
                      {daysSince(hospitalization.admitted_at) === 1 ? 'dia' : 'dias'} internado
                      {hospitalization.expected_discharge_at
                        ? ` · alta prevista ${fmtDate(hospitalization.expected_discharge_at)}`
                        : ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {hasMorePage && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => void loadNextPage()}
                loading={loadingMore}
              >
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}

      {showHospitalize && (
        <HospitalizeModal
          onClose={() => setShowHospitalize(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
