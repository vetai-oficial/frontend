'use client';

import { Check, ChevronDown, CreditCard, Loader2, Pencil, Plus, Trash2, User, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PaymentModal } from './components/payment-modal';

import { ConfirmModal } from '@/app/components/confirm-modal';
import { DataTable } from '@/app/components/data-table';
import { Header } from '@/app/components/header';
import { SelectInput } from '@/app/components/select-input';
import { SectionCard } from '@/app/components/section-card';
import { Button } from '@/components/ui/button';
import { paymentsService } from '@/services/payments.service';
import { tutorsService } from '@/services/tutors.service';
import type { PaginatedMeta } from '@/types/common';
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  type Payment,
  type PaymentStatus,
} from '@/types/payment';
import type { Tutor } from '@/types/tutor';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos os status' },
  ...( Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((s) => ({
    value: s,
    label: PAYMENT_STATUS_LABELS[s],
  })),
];

interface TutorFilter { id: string; name: string }

function TutorFilterComboBox({
  value,
  onSelect,
  onClear,
}: {
  value: TutorFilter | null;
  onSelect: (t: TutorFilter) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TutorFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await tutorsService.list({ search: query, size: 8 });
        setResults(res.data.map((t: Tutor) => ({ id: t.id, name: t.name })));
      } catch { /* silently */ } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (value) {
    return (
      <div className="flex items-center gap-1.5 h-9 pl-3 pr-2 rounded-lg border border-teal-400 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-sm text-teal-700 dark:text-teal-300 font-medium">
        <User size={13} className="shrink-0" />
        <span className="truncate max-w-40">{value.name}</span>
        <button type="button" onClick={onClear} className="ml-1 text-teal-500 hover:text-red-500 transition-colors">
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-8 pr-8 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Filtrar por tutor..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-slate-400 px-3 py-2 flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> Buscando...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-slate-400 px-3 py-2">{query.length < 2 ? 'Digite ao menos 2 caracteres...' : 'Nenhum tutor encontrado'}</p>
          ) : (
            results.map((t) => (
              <button
                key={t.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onSelect(t); setOpen(false); setQuery(''); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Check size={12} className="text-teal-500 opacity-0" />
                <span className="text-slate-900 dark:text-white">{t.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('T')[0]!.split('-').map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString('pt-BR');
}

function fmtAmount(amount: number) {
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState('');
  const [tutorFilter, setTutorFilter] = useState<TutorFilter | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Payment | null>(null);

  const fetchPayments = useCallback(async (opts?: {
    status?: string;
    tutorId?: string;
    page?: number;
  }) => {
    setLoading(true);
    try {
      const res = await paymentsService.list({
        page: opts?.page ?? 1,
        size: 15,
        ...(opts?.status ? { status: opts.status } : {}),
        ...(opts?.tutorId ? { tutor_id: opts.tutorId } : {}),
      });
      setPayments(res.data);
      setMeta(res.meta);
    } catch {
      /* silently */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPayments({ status: statusFilter, ...(tutorFilter?.id ? { tutorId: tutorFilter.id } : {}), page });
  }, [fetchPayments, statusFilter, tutorFilter, page]);

  const handleStatusChange = (v: string) => {
    setStatusFilter(v);
    setPage(1);
  };

  const handleTutorSelect = (t: TutorFilter) => {
    setTutorFilter(t);
    setPage(1);
  };

  const handleTutorClear = () => {
    setTutorFilter(null);
    setPage(1);
  };

  const handleCreateSuccess = (p: Payment) => {
    setShowModal(false);
    setPayments((prev) => [p, ...prev]);
    setMeta((prev) => prev ? { ...prev, total_elements: prev.total_elements + 1 } : prev);
  };

  const handleEditSuccess = (updated: Payment) => {
    setShowModal(false);
    setEditingPayment(undefined);
    setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      await paymentsService.delete(confirmDelete.id);
      setPayments((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      setMeta((prev) => prev ? { ...prev, total_elements: prev.total_elements - 1 } : prev);
    } catch {
      /* silently */
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const openEdit = (p: Payment) => {
    setEditingPayment(p);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPayment(undefined);
  };

  const totalPages = meta?.total_pages ?? 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Pagamentos" showStorage={false} />

        <SectionCard
          title="Cobranças"
          subtitle={meta ? `${meta.total_elements} cobrança${meta.total_elements !== 1 ? 's' : ''} no total` : 'Carregando...'}
          headerAction={
            <Button
              onClick={() => { setEditingPayment(undefined); setShowModal(true); }}
              className="bg-teal-600 dark:bg-teal-700 h-10 text-white hover:bg-teal-700 dark:hover:bg-teal-800"
            >
              <Plus size={18} /> Nova Cobrança
            </Button>
          }
        >
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="w-56">
              <SelectInput
                value={statusFilter}
                onChange={handleStatusChange}
                options={STATUS_FILTER_OPTIONS}
                placeholder="Todos os status"
              />
            </div>
            <div className="w-64">
              <TutorFilterComboBox
                value={tutorFilter}
                onSelect={handleTutorSelect}
                onClear={handleTutorClear}
              />
            </div>
          </div>

          <DataTable
            headers={['Itens', 'Valor', 'Status', 'Vencimento', 'Pago em', 'Ações']}
            columnWidths={['', '120px', '120px', '120px', '120px', '100px']}
          >
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  <Loader2 size={24} className="animate-spin text-teal-600 mx-auto" />
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  <CreditCard size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {statusFilter || tutorFilter ? 'Nenhuma cobrança encontrada para os filtros selecionados.' : 'Nenhuma cobrança cadastrada ainda.'}
                  </p>
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const colors = PAYMENT_STATUS_COLORS[p.status];
                const firstItem = p.items[0];
                const extraCount = p.items.length - 1;
                const itemsSummary = firstItem
                  ? `${firstItem.name}${extraCount > 0 ? ` +${extraCount} item${extraCount > 1 ? 's' : ''}` : ''}`
                  : '—';
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-900 dark:text-white">{itemsSummary}</p>
                      {p.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-xs">{p.notes}</p>}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                      {fmtAmount(p.amount)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                        {PAYMENT_STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">
                      {fmtDate(p.due_date)}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">
                      {p.paid_at ? fmtDate(p.paid_at) : <span className="text-slate-400 dark:text-slate-500">—</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)} title="Editar">
                          <Pencil size={15} className="text-slate-500 dark:text-slate-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setConfirmDelete(p)}
                          title="Excluir"
                          disabled={deletingId === p.id}
                        >
                          {deletingId === p.id
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

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
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
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </SectionCard>
      </div>

      {showModal && (
        <PaymentModal
          {...(editingPayment ? { payment: editingPayment } : {})}
          onClose={closeModal}
          onSuccess={editingPayment ? handleEditSuccess : handleCreateSuccess}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Excluir cobrança?"
          description={`Esta cobrança de ${fmtAmount(confirmDelete.amount)} será removida permanentemente.`}
          confirmLabel="Excluir"
          loading={!!deletingId}
          onConfirm={() => { void handleDelete(); }}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
