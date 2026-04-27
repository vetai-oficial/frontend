'use client';

import { Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DateInput } from '@/app/components/date-input';
import { Modal } from '@/app/components/modal';
import { SelectInput } from '@/app/components/select-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { catalogService } from '@/services/catalog.service';
import { paymentsService } from '@/services/payments.service';
import type { CatalogItem } from '@/types/catalog';
import { CATALOG_CATEGORY_LABELS } from '@/types/catalog';
import { type ChargeItem, type Payment, type PaymentStatus } from '@/types/payment';
import type { Patient } from '@/types/patient';

interface AddPaymentModalProps {
  tutorId: string;
  pets: Patient[];
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
}

const inputCls = 'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500';

const STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'PAID', label: 'Pago' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

function fmtCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function AddPaymentModal({ tutorId, pets, onClose, onSuccess }: AddPaymentModalProps) {
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('PENDING');
  const [paidAt, setPaidAt] = useState('');
  const [patientId, setPatientId] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [items, setItems] = useState<ChargeItem[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  const petOptions = pets.map((p) => ({ value: p.id, label: p.name }));

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
    if (items.length === 0) errs.items = 'Adicione pelo menos um item';
    const hasInvalidItem = items.some((i) => !i.name.trim() || i.unit_price <= 0 || i.quantity < 1);
    if (hasInvalidItem) errs.items = 'Preencha nome, quantidade e valor de todos os itens';
    if (!dueDate) errs.dueDate = 'Data de vencimento é obrigatória';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const result = await paymentsService.create({
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        items: items.map((i) => ({
          name: i.name.trim(),
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
          ...(i.catalog_item_id ? { catalog_item_id: i.catalog_item_id } : {}),
        })),
        status,
        due_date: dueDate,
        ...(status === 'PAID' ? { paid_at: paidAt || new Date().toISOString().split('T')[0]! } : {}),
        tutor_id: tutorId,
        ...(patientId ? { patient_id: patientId } : {}),
      });
      onSuccess(result);
    } catch {
      setErrors({ general: 'Erro ao salvar. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Nova Cobrança" description="Adicione produtos e serviços para gerar a cobrança" onClose={onClose} maxWidth="lg">
      <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-4">

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

        {petOptions.length > 0 && (
          <div>
            <Label className="mb-1.5">Pet (opcional)</Label>
            <SelectInput
              value={patientId}
              onChange={setPatientId}
              options={petOptions}
              placeholder="Selecione um pet..."
            />
          </div>
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
            {saving ? <Loader2 size={16} className="animate-spin" /> : `Registrar ${total > 0 ? fmtCurrency(total) : ''}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
