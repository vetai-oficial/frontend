'use client';

import { Loader2, Pencil, Plus, Syringe, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { VaccineFormModal } from './components/vaccine-form-modal';

import { ConfirmModal } from '@/app/components/common/confirm-modal';
import { DataTable } from '@/app/components/data/data-table';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { vaccinesService } from '@/services/vaccines.service';
import type { Vaccine } from '@/types/vaccine';
import { fmtDate, fmtPeriod } from '@/utils/date-format';

export default function VaccinesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editVaccine, setEditVaccine] = useState<Vaccine | null>(null);
  const [deleteVaccine, setDeleteVaccine] = useState<Vaccine | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    items: vaccines,
    loading,
    search,
    page,
    meta,
    setSearch,
    setPage,
    refresh,
  } = usePaginatedResource<Vaccine, { search?: string }>({
    fetcher: vaccinesService.list,
    initialFilters: { search: '' },
    pageSize: 15,
    debounceMs: 300,
  });

  const handleDelete = async () => {
    if (!deleteVaccine) return;
    setDeleting(true);
    try {
      await vaccinesService.delete(deleteVaccine.id);
      setDeleteVaccine(null);
      await refresh();
    } catch {
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Catálogo de Vacinas" showStorage={false} />

        <DataTable
          headers={['Nome', 'Código', 'Período de Revacinação', 'Criado em', 'Ações']}
          showSearch
          searchPlaceholder="Buscar vacina..."
          onSearch={setSearch}
          columnWidths={['flex-1', 'w-32', 'w-44', 'w-36', 'w-24']}
          actions={
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 dark:hover:bg-teal-800 h-9"
            >
              <Plus size={16} /> Nova Vacina
            </Button>
          }
        >
          {loading ? (
            <tr>
              <td colSpan={5} className="py-12 text-center">
                <Loader2 size={24} className="animate-spin text-teal-600 mx-auto" />
              </td>
            </tr>
          ) : vaccines.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center">
                <Syringe size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {search ? 'Nenhuma vacina encontrada.' : 'Nenhuma vacina cadastrada ainda.'}
                </p>
              </td>
            </tr>
          ) : (
            vaccines.map((vaccine) => (
              <tr
                key={vaccine.id}
                className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                      <Syringe size={14} className="text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{vaccine.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {vaccine.code}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {vaccine.revaccination_period_days ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400">
                      {fmtPeriod(vaccine.revaccination_period_days)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                  {fmtDate(vaccine.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditVaccine(vaccine)}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => setDeleteVaccine(vaccine)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </DataTable>

        {(meta?.total_pages ?? 1) > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: meta?.total_pages ?? 1 }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-teal-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <VaccineFormModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); void refresh(); }}
        />
      )}

      {editVaccine && (
        <VaccineFormModal
          vaccine={editVaccine}
          onClose={() => setEditVaccine(null)}
          onSuccess={() => { setEditVaccine(null); void refresh(); }}
        />
      )}

      {deleteVaccine && (
        <ConfirmModal
          title="Excluir vacina?"
          description={`A vacina "${deleteVaccine.name}" (${deleteVaccine.code}) será removida permanentemente do catálogo.`}
          confirmLabel="Excluir"
          loading={deleting}
          onConfirm={() => { void handleDelete(); }}
          onClose={() => setDeleteVaccine(null)}
        />
      )}
    </div>
  );
}
