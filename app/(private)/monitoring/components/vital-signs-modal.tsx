'use client';

import { Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { InputWithLabel } from '@/app/components/input-with-label';
import { Modal } from '@/app/components/modal';
import { Button } from '@/components/ui/button';
import {
  EVALUATION_LABELS,
  EVALUATION_TEXT_COLORS,
  VITAL_DEFINITIONS,
  evaluateVital,
  formatRange,
  getVitalRange,
} from '@/constants';
import { monitoringService } from '@/services/monitoring.service';
import type { CreateVitalRecordPayload, VitalRecord } from '@/types/monitoring';
import type { Specie } from '@/types/patient';

interface VitalSignsModalProps {
  hospitalizationId: string;
  specie: Specie;
  onClose: () => void;
  onSuccess: (record: VitalRecord) => void;
}

export function VitalSignsModal({
  hospitalizationId,
  specie,
  onClose,
  onSuccess,
}: VitalSignsModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const payload: CreateVitalRecordPayload = {};
    let hasAny = false;

    for (const def of VITAL_DEFINITIONS) {
      const raw = values[def.key];
      if (raw !== undefined && raw.trim() !== '') {
        const num = Number(raw.replace(',', '.'));
        if (!Number.isNaN(num)) {
          payload[def.key] = num;
          hasAny = true;
        }
      }
    }

    if (!hasAny) {
      setError('Informe ao menos um sinal vital.');
      return;
    }

    if (notes.trim()) payload.notes = notes.trim();

    setError('');
    setSaving(true);
    try {
      const record = await monitoringService.addVitals(hospitalizationId, payload);
      onSuccess(record);
    } catch {
      setError('Erro ao registrar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Registrar Sinais Vitais"
      description="Os valores são adicionados ao histórico de internação"
      onClose={onClose}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">
          <Clock size={14} className="mt-px shrink-0" />
          <span>
            A data, o horário e o veterinário responsável são registrados
            automaticamente no momento do envio.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VITAL_DEFINITIONS.map((def) => {
            const range = getVitalRange(specie, def.key);
            const raw = values[def.key];
            const num =
              raw !== undefined && raw.trim() !== ''
                ? Number(raw.replace(',', '.'))
                : undefined;
            const evaluation =
              num !== undefined && !Number.isNaN(num)
                ? evaluateVital(specie, def.key, num)
                : 'unknown';
            return (
              <div key={def.key}>
                <InputWithLabel
                  label={`${def.label} (${def.unit})`}
                  type="number"
                  inputMode="decimal"
                  step={def.step}
                  min={0}
                  value={values[def.key] ?? ''}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [def.key]: e.target.value }))
                  }
                  placeholder={range ? formatRange(range, def.unit) : 'Sem referência'}
                />
                {evaluation !== 'unknown' && (
                  <p className={`text-xs mt-1 ${EVALUATION_TEXT_COLORS[evaluation]}`}>
                    {evaluation === 'normal'
                      ? '✓ Dentro da faixa de referência'
                      : `⚠ ${EVALUATION_LABELS[evaluation]} da faixa (${formatRange(range, def.unit)})`}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
            Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Anotações sobre a medição (opcional)"
            className="w-full px-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 border-slate-200 dark:border-slate-600 resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 dark:hover:bg-teal-800 min-w-[120px]"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Registrar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
