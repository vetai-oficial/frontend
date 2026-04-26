'use client';

import { Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';

import { DateInput } from '@/app/components/date-input';
import { Modal } from '@/app/components/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { healthRecordsService } from '@/services/health-records.service';
import { PRESCRIPTION_USAGE_OPTIONS } from '@/types/health-record';

interface MedicationRow {
  drug: string;
  form: string;
  quantity: string;
  posology: string;
  usage: string;
}

interface AddPrescriptionModalProps {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPrescriptionModal({ patientId, onClose, onSuccess }: AddPrescriptionModalProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [includeDate, setIncludeDate] = useState(true);
  const [medications, setMedications] = useState<MedicationRow[]>([
    { drug: '', form: '', quantity: '', posology: '', usage: 'Oral Veterinário' },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addMedication = () =>
    setMedications((prev) => [...prev, { drug: '', form: '', quantity: '', posology: '', usage: 'Oral Veterinário' }]);

  const removeMedication = (i: number) =>
    setMedications((prev) => prev.filter((_, idx) => idx !== i));

  const updateMedication = (i: number, field: keyof MedicationRow, value: string) =>
    setMedications((prev) => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filled = medications.filter((m) => m.drug.trim() && m.posology.trim());
    if (filled.length === 0) { setError('Adicione ao menos um medicamento com nome e posologia.'); return; }
    if (!date) { setError('Informe a data da receita.'); return; }
    setError('');
    setSaving(true);
    try {
      await healthRecordsService.create(patientId, {
        type: 'PRESCRIPTION',
        date: new Date(date).toISOString(),
        metadata: {
          include_date: includeDate,
          medications: filled.map((m) => ({
            drug: m.drug.trim(),
            form: m.form.trim() || undefined,
            quantity: m.quantity.trim() || undefined,
            posology: m.posology.trim(),
            usage: m.usage || undefined,
          })),
        },
      });
      onSuccess();
    } catch { setError('Erro ao salvar. Tente novamente.'); } finally { setSaving(false); }
  };

  const inputCls = 'mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <Modal title="Nova Receita" description="Adicione medicamentos e posologia" onClose={onClose} maxWidth="lg">
      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-5">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <DateInput label="Data da receita" value={date} onChange={setDate} required />
          </div>
          <label className="flex items-center gap-2 pb-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDate}
              onChange={(e) => setIncludeDate(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 accent-teal-600"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Incluir data na receita</span>
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Medicamentos</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addMedication}
              className="gap-1.5 text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:bg-teal-50 dark:hover:text-teal-300 dark:hover:bg-teal-900/20"
            >
              <Plus size={14} /> Adicionar medicamento
            </Button>
          </div>

          {medications.map((med, i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 space-y-3 bg-slate-50/50 dark:bg-slate-700/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Medicamento {i + 1}
                </span>
                {medications.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeMedication(i)}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <Label htmlFor={`drug-${i}`}>Medicamento <span className="text-red-500">*</span></Label>
                  <input id={`drug-${i}`} value={med.drug} onChange={(e) => updateMedication(i, 'drug', e.target.value)} placeholder="Ex: Amoxicilina" className={inputCls} required />
                </div>
                <div>
                  <Label htmlFor={`form-${i}`} required>Forma</Label>
                  <input id={`form-${i}`} value={med.form} onChange={(e) => updateMedication(i, 'form', e.target.value)} placeholder="Ex: Comprimido" className={inputCls} />
                </div>
                <div>
                  <Label htmlFor={`qty-${i}`} required>Quantidade</Label>
                  <input id={`qty-${i}`} value={med.quantity} onChange={(e) => updateMedication(i, 'quantity', e.target.value)} placeholder="Ex: 500mg" className={inputCls} required />
                </div>
              </div>

              <div>
                <Label htmlFor={`usage-${i}`}>Via de Administração</Label>
                <select
                  id={`usage-${i}`}
                  value={med.usage}
                  onChange={(e) => updateMedication(i, 'usage', e.target.value)}
                  className={inputCls}
                >
                  {PRESCRIPTION_USAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor={`pos-${i}`}>Posologia <span className="text-red-500">*</span></Label>
                <textarea
                  id={`pos-${i}`}
                  value={med.posology}
                  onChange={(e) => updateMedication(i, 'posology', e.target.value)}
                  placeholder="Ex: 1 comprimido a cada 8 horas por 7 dias"
                  rows={2}
                  required
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" disabled={saving} className="bg-teal-600 text-white hover:bg-teal-700">
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Salvar Receita'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
