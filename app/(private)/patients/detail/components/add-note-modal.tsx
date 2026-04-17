'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Modal } from '@/app/components/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { healthRecordsService } from '@/services/health-records.service';

interface AddNoteModalProps {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddNoteModal({ patientId, onClose, onSuccess }: AddNoteModalProps) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;
    setSaving(true);
    try {
      await healthRecordsService.create(patientId, {
        type: 'NOTE',
        date: new Date().toISOString(),
        metadata: { text },
      });
      onSuccess();
    } catch { /* silently fail */ } finally { setSaving(false); }
  };

  return (
    <Modal title="Nova Nota" onClose={onClose} maxWidth="sm">
      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
        <div>
          <Label htmlFor="note-text">Nota / Observação <span className="text-red-500">*</span></Label>
          <textarea
            id="note-text"
            placeholder="Escreva uma observação sobre o paciente..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            required
            autoFocus
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
