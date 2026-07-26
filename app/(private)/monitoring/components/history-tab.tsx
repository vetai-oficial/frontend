'use client';

import { History, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';

import { fmtDate, RISK_MAP, STATUS_MAP } from '../utils';

import { DataTable, type DataTableColumn } from '@/app/components/data/data-table';
import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import {
  monitoringService,
  type HospitalizationListParams,
} from '@/services/monitoring.service';
import type { PaginatedQueryParams } from '@/types/common';
import type { Hospitalization } from '@/types/monitoring';

interface Filters {
  search?: string;
  status?: string;
  [key: string]: unknown;
}

export function HistoryTab() {
  const fetchHospitalizations = useCallback(
    (params: PaginatedQueryParams<Filters>) =>
      monitoringService.listHospitalizations({
        ...params,
        status: (params.status ||
          undefined) as HospitalizationListParams['status'],
      }),
    [],
  );

  const {
    items,
    loading,
    loadingMore,
    hasMorePage,
    filters,
    setFilters,
    setSearch,
    loadNextPage,
  } = usePaginatedResource<Hospitalization, Filters>({
    fetcher: fetchHospitalizations,
    pageSize: 20,
    mode: 'append',
    debounceMs: 300,
    sort: 'admittedAt',
    direction: 'desc',
  });

  const columns: DataTableColumn<Hospitalization>[] = [
    {
      key: 'patient',
      header: 'Paciente',
      render: (row) => (
        <Link
          href={`/monitoring/detail?id=${row.id}`}
          className="font-medium text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400"
        >
          {row.patient?.name ?? '—'}
        </Link>
      ),
    },
    {
      key: 'veterinarian',
      header: 'Veterinário',
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-300">
          {row.veterinarian?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'box',
      header: 'Box',
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-300">
          {row.box?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'risk',
      header: 'Risco',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${RISK_MAP[row.risk].badge}`}
        >
          {RISK_MAP[row.risk].label}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Situação',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_MAP[row.status].badge}`}
        >
          {STATUS_MAP[row.status].label}
        </span>
      ),
    },
    {
      key: 'admitted_at',
      header: 'Entrada',
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-300">
          {fmtDate(row.admitted_at)}
        </span>
      ),
    },
    {
      key: 'discharged_at',
      header: 'Saída',
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-300">
          {row.discharged_at ? fmtDate(row.discharged_at) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <DataTable<Hospitalization>
        columns={columns}
        data={items}
        getRowKey={(row) => row.id}
        showSearch
        onSearch={setSearch}
        searchPlaceholder="Buscar por paciente..."
        actions={
          <div className="w-48">
            <SelectInput
              compact
              value={filters.status ?? ''}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
              options={[
                { value: '', label: 'Todas as situações' },
                { value: 'TRIAGE', label: 'Triagem' },
                { value: 'HOSPITALIZED', label: 'Internado' },
                { value: 'DISCHARGED', label: 'Alta' },
                { value: 'DECEASED', label: 'Óbito' },
                { value: 'CANCELLED', label: 'Cancelada' },
              ]}
            />
          </div>
        }
        emptyState={
          loading ? (
            <span className="flex items-center justify-center gap-2 py-6">
              <Loader2 size={18} className="animate-spin text-teal-600" />
              Carregando...
            </span>
          ) : (
            <span className="flex flex-col items-center gap-2 py-6 text-slate-400">
              <History size={32} className="text-slate-300 dark:text-slate-600" />
              Nenhuma internação encontrada
            </span>
          )
        }
      />

      {hasMorePage && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => void loadNextPage()}
            loading={loadingMore}
          >
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  );
}
