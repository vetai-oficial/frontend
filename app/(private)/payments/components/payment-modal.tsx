'use client';

import { Check, ChevronDown, Loader2, Plus, Search, Trash2, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { DateInput } from '@/app/components/date-input';
import { Modal } from '@/app/components/modal';
import { SelectInput } from '@/app/components/select-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { catalogService } from '@/services/catalog.service';
import { paymentsService } from '@/services/payments.service';
import { tutorsService } from '@/services/tutors.service';
import type { CatalogItem } from '@/types/catalog';
import { CATALOG_CATEGORY_LABELS } from '@/types/catalog';
import type { Tutor } from '@/types/tutor';
import {
  PAYMENT_STATUS_LABELS,
  type ChargeItem,
  type Payment,
  type PaymentStatus,
} from '@/types/payment';

interface PaymentModalProps {
  payment?: Payment;
  defaultTutor?: { id: string; name: string };
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
}

const inputCls = 'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500';

const STATUS_OPTIONS = (Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((s) => ({
  value: s,
  label: PAYMENT_STATUS_LABELS[s],
}));

interface TutorItem { id: string; name: string; phone?: string }

function TutorComboBox({
  value,
  onSelect,
  onClear,
  disabled,
}: {
  value: TutorItem | null;
  onSelect: (t: TutorItem) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TutorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await tutorsService.list({ search: query, size: 8 });
        setResults(res.data.map((t: Tutor) => ({ id: t.id, name: t.name, ...(t.phone ? { phone: t.phone } : {}) })));
      } catch { /* silently */ } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (value) {
    return (
      <div className="flex items-center gap-2 w-full rounded-lg border border-teal-400 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/20 px-3 py-2">
        <User size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
        <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white truncate">{value.name}</span>
        {value.phone && <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 truncate">{value.phone}</span>}
        {!disabled && (
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClear} className="shrink-0 text-slate-400 hover:text-red-500">
            <X size={14} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          className={`${inputCls} pl-8 pr-8`}
          placeholder="Buscar tutor pelo nome..."
          value={query}
          disabled={disabled}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-slate-400 px-3 py-2">Buscando...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-slate-400 px-3 py-2">
              {query.length < 2 ? 'Digite ao menos 2 caracteres...' : 'Nenhum tutor encontrado'}
            </p>
          ) : (
            results.map((t) => (
              <button
                key={t.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onSelect(t); setOpen(false); setQuery(''); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Check size={12} className="text-teal-500 opacity-0" />
                <div className="min-w-0">
                  <p className="text-slate-900 dark:text-white truncate">{t.name}</p>
                  {t.phone && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.phone}</p>}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function fmtCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PaymentModal({ payment, defaultTutor, onClose, onSuccess }: PaymentModalProps) {
  const isEditing = !!payment;

  const [tutor, setTutor] = useState<TutorItem | null>(
    defaultTutor ? { id: defaultTutor.id, name: defaultTutor.name } : null,
  );
  const [notes, setNotes] = useState(payment?.notes ?? '');
  const [dueDate, setDueDate] = useState(payment?.due_date ?? '');
  const [status, setStatus] = useState<PaymentStatus>(payment?.status ?? 'PENDING');
  const [paidAt, setPaidAt] = useState(payment?.paid_at ?? '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [items, setItems] = useState<ChargeItem[]>(payment?.items ?? []);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  useEffect(() => {
    const load = async () => {
      setCatalogLoading(true);
      try {
        const res = await catalogService.list({ size: 200, active: true });
        setCatalogItems(res.data);
      } catch {
        // silently fail
      } finally {
        setCatalogLoading(false);
      }
    };
    void load();
  }, []);

  const filteredCatalog = catalogItems.filter((c) =>
    c.name.toLowerCase().includes(catalogSearch.toLowerCase()),
  );

  const addFromCatalog = (item: CatalogItem) => {
    const existing = items.findIndex((i) => i.catalog_item_id === item.id);
    if (existing >= 0) {
      setItems((prev) =>
        prev.map((i, idx) => idx === existing ? { ...i, quantity: i.quantity + 1 } : i),
      );
    } else {
      setItems((prev) => [...prev, {
        name: item.name,
        quantity: 1,
        unit_price: item.price,
        catalog_item_id: item.id,
      }]);
    }
    setShowCatalog(false);
    setCatalogSearch('');
  };

  const addCustomItem = () => {
    setItems((prev) => [...prev, { name: '', quantity: 1, unit_price: 0 }]);
  };

  const updateItem = (index: number, field: keyof ChargeItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!isEditing && !tutor) errs.tutor = 'Selecione um tutor';
    if (items.length === 0) errs.items = 'Adicione pelo menos um item';
    const hasInvalidItem = items.some((i) => !i.name.trim() || i.unit_price <= 0 || i.quantity < 1);
    if (hasInvalidItem) errs.items = 'Preencha nome, quantidade e valor de todos os itens';
    if (!dueDate) errs.dueDate = 'Data de vencimento é obrigatória';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      let result: Payment;
      const mappedItems = items.map((i) => ({
        name: i.name.trim(),
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        ...(i.catalog_item_id ? { catalog_item_id: i.catalog_item_id } : {}),
      }));
      if (isEditing) {
        result = await paymentsService.update(payment.id, {
          ...(notes.trim() ? { notes: notes.trim() } : {}),
          items: mappedItems,
          status,
          due_date: dueDate,
          ...(status === 'PAID' ? { paid_at: paidAt || new Date().toISOString().split('T')[0]! } : {}),
        });
      } else {
        result = await paymentsService.create({
          ...(notes.trim() ? { notes: notes.trim() } : {}),
          items: mappedItems,
          status,
          due_date: dueDate,
          ...(status === 'PAID' ? { paid_at: paidAt || new Date().toISOString().split('T')[0]! } : {}),
          tutor_id: tutor!.id,
        });
      }
      onSuccess(result);
    } catch {
      setErrors({ general: 'Erro ao salvar. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Editar Cobrança' : 'Nova Cobrança'}
      description={isEditing ? 'Atualize os itens e dados da cobrança' : 'Adicione produtos e serviços para gerar a cobrança'}
      onClose={onClose}
      maxWidth="lg"
    >
      <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-4">

        {!isEditing && (
          <div>
            <Label required className="mb-1.5">Tutor</Label>
            <TutorComboBox
              value={tutor}
              onSelect={(t) => setTutor(t)}
              onClear={() => setTutor(null)}
            />
            {errors.tutor && <p className="mt-1 text-xs text-red-500">{errors.tutor}</p>}
          </div>
        )}

        {/* Items section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label required>Itens da cobrança</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { setShowCatalog((v) => !v); setCatalogSearch(''); }}
                className="gap-1.5 text-xs h-7"
              >
                <Search size={12} />
                Do catálogo
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addCustomItem}
                className="gap-1.5 text-xs h-7"
              >
                <Plus size={12} />
                Avulso
              </Button>
            </div>
          </div>

          {/* Catalog picker */}
          {showCatalog && (
            <div className="mb-3 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
              <div className="p-2 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Buscar produto ou serviço..."
                  className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
              </div>
              <div className="max-h-44 overflow-y-auto">
                {catalogLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 size={16} className="animate-spin text-slate-400" />
                  </div>
                ) : filteredCatalog.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    {catalogItems.length === 0 ? 'Nenhum item no catálogo.' : 'Nenhum resultado.'}
                  </p>
                ) : (
                  filteredCatalog.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addFromCatalog(item)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors text-left border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                        <span className="ml-2 text-xs text-slate-400">{CATALOG_CATEGORY_LABELS[item.category]}</span>
                      </div>
                      <span className="text-teal-600 dark:text-teal-400 font-medium shrink-0 ml-3">{fmtCurrency(item.price)}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Items list */}
          {items.length === 0 ? (
            <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg py-6 text-center text-sm text-slate-400 dark:text-slate-500">
              Adicione itens do catálogo ou crie avulsos
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-center">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(idx, 'name', e.target.value)}
                    placeholder="Nome do item"
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                    placeholder="Qtd"
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unit_price}
                    onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))}
                    placeholder="R$ 0,00"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <div className="flex justify-end pt-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Total: <span className="text-teal-600 dark:text-teal-400">{fmtCurrency(total)}</span>
                </span>
              </div>
            </div>
          )}
          {errors.items && <p className="mt-1 text-xs text-red-500">{errors.items}</p>}
        </div>

        {/* Due date + status */}
        <div className="grid grid-cols-2 gap-3">
          <DateInput
            label="Vencimento"
            value={dueDate}
            onChange={setDueDate}
            required
            error={errors.dueDate}
          />
          <div>
            <Label required className="mb-1.5">Status</Label>
            <SelectInput
              value={status}
              onChange={(v) => setStatus(v as PaymentStatus)}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        {status === 'PAID' && (
          <DateInput label="Data do pagamento" value={paidAt} onChange={setPaidAt} />
        )}

        <div>
          <Label className="mb-1.5">Observações</Label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Atendimento referente a 10/05"
            className={inputCls}
          />
        </div>

        {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600">
            {saving ? <Loader2 size={16} className="animate-spin" /> : isEditing ? 'Salvar alterações' : `Registrar ${total > 0 ? fmtCurrency(total) : ''}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
