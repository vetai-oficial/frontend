'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { DateInput } from '@/app/components/date-input';
import { Modal } from '@/app/components/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { healthRecordsService } from '@/services/health-records.service';

interface AddClinicalNoteModalProps {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddClinicalNoteModal({ patientId, onClose, onSuccess }: AddClinicalNoteModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date) return;
    setSaving(true);
    try {
      await healthRecordsService.create(patientId, {
        type: 'CLINICAL_NOTE',
        date: new Date(date).toISOString(),
        metadata: { title, description },
      });
      onSuccess();
    } catch { /* silently fail */ } finally { setSaving(false); }
  };

  return (
    <Modal title="Novo Registro Clínico" onClose={onClose} maxWidth="md">
      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
        <div>
          <Label htmlFor="cn-title">Título <span className="text-red-500">*</span></Label>
          <Input id="cn-title" placeholder="Ex: Consulta de rotina" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1.5" />
        </div>
        <DateInput label="Data" value={date} onChange={setDate} required />
        <div>
          <Label htmlFor="cn-desc">Descrição <span className="text-red-500">*</span></Label>
          <textarea
            id="cn-desc"
            placeholder="Descreva o registro clínico..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
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
