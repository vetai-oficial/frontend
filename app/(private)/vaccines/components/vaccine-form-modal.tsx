'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Modal } from '@/app/components/modal';
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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));
    const observer = new MutationObserver(() => setIsDark(root.classList.contains('dark')));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Nome é obrigatório'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await vaccinesService.update(vaccine.id, { name: name.trim(), revaccination_period_days: period });
      } else {
        await vaccinesService.create({ name: name.trim(), revaccination_period_days: period });
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
          <Label htmlFor="vaccine-period">Período de Revacinação</Label>
          <select
            id="vaccine-period"
            value={period ?? ''}
            onChange={(e) => setPeriod(e.target.value ? Number(e.target.value) : undefined)}
            style={{ colorScheme: isDark ? 'dark' : 'light' }}
            className="mt-1.5 w-full h-10 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value ?? 'none'} value={opt.value ?? ''}>
                {opt.label}
              </option>
            ))}
          </select>
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
