'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Modal } from '@/app/components/modal';
import { SelectInput } from '@/app/components/select-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { vaccinesService } from '@/services/vaccines.service';
import type { Vaccine } from '@/types/vaccine';

const PERIOD_OPTIONS = [
  { label: 'Sem revacinação', value: undefined },
  { label: '30 dias', value: 30 },
  { label: '60 dias', value: 60 },
  { label: '90 dias', value: 90 },
  { label: '6 meses (180 dias)', value: 180 },
  { label: '1 ano (365 dias)', value: 365 },
  { label: '2 anos (730 dias)', value: 730 },
] as const;

interface VaccineFormModalProps {
  vaccine?: Vaccine;
  onClose: () => void;
  onSuccess: () => void;
}

export function VaccineFormModal({ vaccine, onClose, onSuccess }: VaccineFormModalProps) {
  const isEdit = !!vaccine;
  const [name, setName] = useState(vaccine?.name ?? '');
  const [period, setPeriod] = useState<number | undefined>(vaccine?.revaccination_period_days);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Nome é obrigatório'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await vaccinesService.update(vaccine.id, { name: name.trim(), ...(period !== undefined ? { revaccination_period_days: period } : {}) });
      } else {
        await vaccinesService.create({ name: name.trim(), ...(period !== undefined ? { revaccination_period_days: period } : {}) });
      }
      onSuccess();
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Editar Vacina' : 'Nova Vacina'}
      description={isEdit ? 'Atualize os dados da vacina' : 'Adicione uma nova vacina ao catálogo do workspace'}
      onClose={onClose}
      maxWidth="sm"
    >
      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
        <div>
          <Label htmlFor="vaccine-name">
            Nome <span className="text-red-500">*</span>
          </Label>
          <Input
            id="vaccine-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Raiva, V8, Giárdia..."
            className={`mt-1.5 ${error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''}`}
            autoFocus
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <div>
          <SelectInput
            label="Período de Revacinação"
            value={period !== undefined ? String(period) : ''}
            onChange={(v) => setPeriod(v ? Number(v) : undefined)}
            options={PERIOD_OPTIONS.map((opt) => ({
              value: opt.value !== undefined ? String(opt.value) : '',
              label: opt.label,
            }))}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Usado para calcular automaticamente a próxima revacinação ao registrar uma dose.
          </p>
        </div>

        {isEdit && (
          <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Código: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{vaccine.code}</span>
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : isEdit ? 'Salvar' : 'Criar Vacina'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
