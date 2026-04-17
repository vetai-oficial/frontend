'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { DateInput } from '@/app/components/date-input';
import { Modal } from '@/app/components/modal';
import { SelectInput } from '@/app/components/select-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { healthRecordsService } from '@/services/health-records.service';

interface AddWeightModalProps {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddWeightModal({ patientId, onClose, onSuccess }: AddWeightModalProps) {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<'KG' | 'G'>('KG');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || !date) return;
    setSaving(true);
    try {
      await healthRecordsService.create(patientId, {
        type: 'WEIGHT',
        date: new Date(date).toISOString(),
        ...(notes ? { notes } : {}),
        metadata: { value: parseFloat(value), unit },
      });
      onSuccess();
    } catch { /* silently fail */ } finally { setSaving(false); }
  };

  return (
    <Modal title="Registrar Peso" onClose={onClose} maxWidth="sm">
      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="w-value">Peso <span className="text-red-500">*</span></Label>
            <Input id="w-value" type="number" step="0.01" min="0" placeholder="Ex: 12.5" value={value} onChange={(e) => setValue(e.target.value)} required className="mt-1.5" />
          </div>
          <div className="w-24">
            <SelectInput
              label="Unidade"
              value={unit}
              onChange={(v) => setUnit(v as 'KG' | 'G')}
              options={[
                { value: 'KG', label: 'kg' },
                { value: 'G', label: 'g' },
              ]}
            />
          </div>
        </div>
        <DateInput label="Data" value={date} onChange={setDate} required />
        <div>
          <Label htmlFor="w-notes">Observações (opcional)</Label>
          <Input id="w-notes" placeholder="Ex: Após consulta de rotina" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5" />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" disabled={saving} className="bg-teal-600 text-white hover:bg-teal-700">
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
