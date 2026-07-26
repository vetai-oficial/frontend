'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  doseLabel,
  FREQUENCY_LABELS,
  nowDateTimeLocal,
  PRESCRIPTION_TYPE_MAP,
  toISO,
} from '../utils';

import { Modal } from '@/app/components/common/modal';
import { DateInput } from '@/app/components/forms/date-input';
import { SelectInput } from '@/app/components/forms/select-input';
import { TimeInput } from '@/app/components/forms/time-input';
import { Button } from '@/components/ui/button';
import { monitoringService } from '@/services/monitoring.service';
import type { PrescriptionTemplate } from '@/types/monitoring';

interface ApplyTemplateModalProps {
  hospitalizationId: string;
  patientName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemSelection {
  checked: boolean;
  date: string;
  time: string;
}

export function ApplyTemplateModal({
  hospitalizationId,
  patientName,
  onClose,
  onSuccess,
}: ApplyTemplateModalProps) {
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [selections, setSelections] = useState<ItemSelection[]>([]);
  const [error, setError] = useState<string | null>(null);

  const template = templates.find((item) => item.id === templateId);

  useEffect(() => {
    void monitoringService
      .listTemplates({ size: 100, sort: 'name', direction: 'asc' })
      .then((response) => setTemplates(response.data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!template) {
      setSelections([]);
      return;
    }
    const now = nowDateTimeLocal();
    setSelections(
      template.items.map(() => ({ checked: true, date: now.date, time: now.time })),
    );
  }, [template]);

  const handleSubmit = async () => {
    if (!template) {
      setError('Selecione um modelo');
      return;
    }
    const items = selections
      .map((selection, index) => ({ selection, index }))
      .filter(({ selection }) => selection.checked)
      .map(({ selection, index }) => ({
        index,
        start_at: toISO(selection.date, selection.time),
      }));

    if (!items.length) {
      setError('Selecione ao menos um item do modelo');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await monitoringService.applyTemplate(hospitalizationId, {
        template_id: template.id,
        items,
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Carregar de Modelo"
      description={patientName ? `Paciente: ${patientName}` : undefined}
      onClose={onClose}
      maxWidth="xl"
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-teal-600" />
        </div>
      ) : templates.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
          Nenhum modelo cadastrado ainda. Crie modelos na aba “Modelos de Prescrição”.
        </p>
      ) : (
        <div className="space-y-4">
          <SelectInput
            label="Modelo de prescrição"
            required
            placeholder="Selecione um modelo"
            value={templateId}
            onChange={setTemplateId}
            options={templates.map((item) => ({
              value: item.id,
              label: `${item.name} (${item.items.length} item${item.items.length === 1 ? '' : 's'})`,
            }))}
          />

          {template && (
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
              {template.items.map((item, index) => {
                const selection = selections[index];
                if (!selection) return null;
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-colors ${
                      selection.checked
                        ? 'border-teal-300 dark:border-teal-700 bg-teal-50/40 dark:bg-teal-900/10'
                        : 'border-slate-200 dark:border-slate-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selection.checked}
                        onChange={(e) =>
                          setSelections((prev) =>
                            prev.map((current, currentIndex) =>
                              currentIndex === index
                                ? { ...current, checked: e.target.checked }
                                : current,
                            ),
                          )
                        }
                        className="mt-1 rounded border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {item.name}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${PRESCRIPTION_TYPE_MAP[item.type].badge}`}
                          >
                            {PRESCRIPTION_TYPE_MAP[item.type].label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {FREQUENCY_LABELS[item.frequency]}
                          {item.frequency === 'RECURRING'
                            ? ` · a cada ${item.interval_hours}h por ${item.duration_days} dia(s)`
                            : ''}
                          {doseLabel(item) ? ` · ${doseLabel(item)}` : ''}
                        </p>
                        {selection.checked && item.frequency !== 'AS_NEEDED' && (
                          <div className="flex gap-2 mt-2">
                            <div className="flex-1 max-w-44">
                              <DateInput
                                label="Início"
                                value={selection.date}
                                onChange={(value) =>
                                  setSelections((prev) =>
                                    prev.map((current, currentIndex) =>
                                      currentIndex === index
                                        ? { ...current, date: value }
                                        : current,
                                    ),
                                  )
                                }
                              />
                            </div>
                            <div className="w-28">
                              <TimeInput
                                label="Hora"
                                value={selection.time}
                                onChange={(value) =>
                                  setSelections((prev) =>
                                    prev.map((current, currentIndex) =>
                                      currentIndex === index
                                        ? { ...current, time: value }
                                        : current,
                                    ),
                                  )
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              loading={saving}
              disabled={!template}
              className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
            >
              Aplicar modelo
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
