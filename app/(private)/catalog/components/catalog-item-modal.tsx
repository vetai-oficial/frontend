'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Modal } from '@/app/components/modal';
import { SelectInput } from '@/app/components/select-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { catalogService } from '@/services/catalog.service';
import {
  CATALOG_CATEGORY_LABELS,
  type CatalogCategory,
  type CatalogItem,
  type CreateCatalogItemPayload,
} from '@/types/catalog';

interface CatalogItemModalProps {
  item?: CatalogItem;
  onClose: () => void;
  onSuccess: (item: CatalogItem) => void;
}

const inputCls = 'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500';

const CATEGORY_OPTIONS = (Object.keys(CATALOG_CATEGORY_LABELS) as CatalogCategory[]).map((c) => ({
  value: c,
  label: CATALOG_CATEGORY_LABELS[c],
}));

function fmtPrice(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const cents = parseInt(digits || '0', 10);
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parsePrice(formatted: string): number {
  return parseFloat(formatted.replace(/\./g, '').replace(',', '.')) || 0;
}

export function CatalogItemModal({ item, onClose, onSuccess }: CatalogItemModalProps) {
  const isEditing = !!item;

  const [name, setName] = useState(item?.name ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [price, setPrice] = useState(() =>
    item ? (item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00',
  );
  const [category, setCategory] = useState<CatalogCategory>(item?.category ?? 'SERVICE');
  const [active, setActive] = useState(item?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nome é obrigatório';
    const parsedPrice = parsePrice(price);
    if (parsedPrice <= 0) errs.price = 'Valor deve ser maior que zero';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const payload: CreateCatalogItemPayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: parsedPrice,
        category,
        active,
      };
      let result: CatalogItem;
      if (isEditing) {
        result = await catalogService.update(item.id, payload);
      } else {
        result = await catalogService.create(payload);
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
      title={isEditing ? 'Editar item' : 'Novo item do catálogo'}
      description={isEditing ? 'Atualize as informações do produto ou serviço' : 'Adicione um produto ou serviço com seu preço padrão'}
      onClose={onClose}
    >
      <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-4">
        <div>
          <Label required className="mb-1.5">Nome</Label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Consulta clínica geral"
            className={inputCls}
            autoFocus
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required className="mb-1.5">Preço (R$)</Label>
            <input
              type="text"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(fmtPrice(e.target.value))}
              className={inputCls}
            />
            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
          </div>
          <div>
            <Label required className="mb-1.5">Categoria</Label>
            <SelectInput
              value={category}
              onChange={(v) => setCategory(v as CatalogCategory)}
              options={CATEGORY_OPTIONS}
            />
          </div>
        </div>

        <div>
          <Label className="mb-1.5">Descrição (opcional)</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes adicionais sobre este item..."
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={active}
            onClick={() => setActive((v) => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${active ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${active ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
          </button>
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {active ? 'Ativo — aparece na seleção de cobranças' : 'Inativo — não aparece na seleção'}
          </span>
        </div>

        {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600">
            {saving ? <Loader2 size={16} className="animate-spin" /> : isEditing ? 'Salvar alterações' : 'Adicionar ao catálogo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
