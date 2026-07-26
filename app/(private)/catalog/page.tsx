'use client';

import { BookOpen, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { CatalogItemModal } from './components/catalog-item-modal';

import { ConfirmModal } from '@/app/components/common/confirm-modal';
import { DataTable } from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { SelectInput } from '@/app/components/forms/select-input';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { catalogService } from '@/services/catalog.service';
import {
  CATALOG_CATEGORY_COLORS,
  CATALOG_CATEGORY_LABELS,
  type CatalogCategory,
  type CatalogItem,
} from '@/types/catalog';
import type { PaginatedMeta } from '@/types/common';

const CATEGORY_FILTER_OPTIONS = [
  { value: '', label: 'Todas as categorias' },
  ...(Object.keys(CATALOG_CATEGORY_LABELS) as CatalogCategory[]).map((c) => ({
    value: c,
    label: CATALOG_CATEGORY_LABELS[c],
  })),
];

const ACTIVE_FILTER_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Ativos' },
  { value: 'false', label: 'Inativos' },
];

function fmtCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('true');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CatalogItem | null>(null);

  const fetchItems = useCallback(async (opts?: {
    category?: string;
    active?: string;
    page?: number;
  }) => {
    setLoading(true);
    try {
      const res = await catalogService.list({
        page: opts?.page ?? 1,
        size: 20,
        ...(opts?.category ? { category: opts.category as CatalogCategory } : {}),
        ...(opts?.active !== '' && opts?.active !== undefined ? { active: opts.active === 'true' } : {}),
      });
      setItems(res.data);
      setMeta(res.meta);
    } catch {
      /* silently */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems({ category: categoryFilter, active: activeFilter, page });
  }, [fetchItems, categoryFilter, activeFilter, page]);

  const handleCreateSuccess = (item: CatalogItem) => {
    setShowModal(false);
    setItems((prev) => [item, ...prev]);
    setMeta((prev) => prev ? { ...prev, total_elements: prev.total_elements + 1 } : prev);
  };

  const handleEditSuccess = (updated: CatalogItem) => {
    setShowModal(false);
    setEditingItem(undefined);
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      await catalogService.delete(confirmDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== confirmDelete.id));
      setMeta((prev) => prev ? { ...prev, total_elements: prev.total_elements - 1 } : prev);
    } catch {
      /* silently */
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const openEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(undefined);
  };

  const totalPages = meta?.total_pages ?? 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="CatÃ¡logo" showStorage={false} />

        <SectionCard
          title="Produtos e ServiÃ§os"
          subtitle={meta ? `${meta.total_elements} item${meta.total_elements !== 1 ? 's' : ''} no catÃ¡logo` : 'Carregando...'}
          headerAction={
            <Button
              onClick={() => { setEditingItem(undefined); setShowModal(true); }}
              className="bg-teal-600 dark:bg-teal-700 h-10 text-white hover:bg-teal-700 dark:hover:bg-teal-800"
            >
              <Plus size={18} /> Novo item
            </Button>
          }
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="w-52">
              <SelectInput
                value={categoryFilter}
                onChange={(v) => { setCategoryFilter(v); setPage(1); }}
                options={CATEGORY_FILTER_OPTIONS}
                placeholder="Todas as categorias"
              />
            </div>
            <div className="w-36">
              <SelectInput
                value={activeFilter}
                onChange={(v) => { setActiveFilter(v); setPage(1); }}
                options={ACTIVE_FILTER_OPTIONS}
              />
            </div>
          </div>

          <DataTable
            headers={['Nome', 'Categoria', 'PreÃ§o', 'Status', 'AÃ§Ãµes']}
            columnWidths={['', '160px', '130px', '110px', '90px']}
          >
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <Loader2 size={24} className="animate-spin text-teal-600 mx-auto" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <BookOpen size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {categoryFilter || activeFilter !== 'true' ? 'Nenhum item encontrado para os filtros selecionados.' : 'Nenhum item no catÃ¡logo ainda.'}
                  </p>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const catColors = CATALOG_CATEGORY_COLORS[item.category];
                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-xs">{item.description}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${catColors.bg} ${catColors.text}`}>
                        {CATALOG_CATEGORY_LABELS[item.category]}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                      {fmtCurrency(item.price)}
                    </td>
                    <td className="p-4">
                      {item.active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)} title="Editar">
                          <Pencil size={15} className="text-slate-500 dark:text-slate-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setConfirmDelete(item)}
                          title="Excluir"
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id
                            ? <Loader2 size={15} className="animate-spin text-red-500" />
                            : <Trash2 size={15} className="text-red-500" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </DataTable>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-4">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  variant={n === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(n)}
                  className={n === page ? 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600' : ''}
                >
                  {n}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                PrÃ³xima
              </Button>
            </div>
          )}
        </SectionCard>
      </div>

      {showModal && (
        <CatalogItemModal
          {...(editingItem ? { item: editingItem } : {})}
          onClose={closeModal}
          onSuccess={editingItem ? handleEditSuccess : handleCreateSuccess}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Excluir item do catÃ¡logo?"
          description={`"${confirmDelete.name}" serÃ¡ removido permanentemente do catÃ¡logo.`}
          confirmLabel="Excluir"
          loading={!!deletingId}
          onConfirm={() => { void handleDelete(); }}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
