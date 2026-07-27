'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form';

import { Modal } from '@/app/components/common/modal';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import {
  EVALUATION_LABELS,
  EVALUATION_TEXT_COLORS,
  VITAL_DEFINITIONS,
  evaluateVital,
  formatRange,
  getVitalRange,
} from '@/constants';
import {
  vitalRecordSchema,
  type VitalRecordFormData,
} from '@/schemas/vital-record';
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
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<VitalRecordFormData>({
    resolver: yupResolver(
      vitalRecordSchema,
    ) as unknown as Resolver<VitalRecordFormData>,
  });

  const measured = useWatch({ control });

  const onSubmit = async (data: VitalRecordFormData) => {
    const payload: CreateVitalRecordPayload = {};

    for (const def of VITAL_DEFINITIONS) {
      const value = data[def.key];
      if (value !== undefined && value !== null && !Number.isNaN(value)) {
        payload[def.key] = value;
      }
    }

    if (Object.keys(payload).length === 0) {
      setError('root', {
        message: 'Informe ao menos um sinal vital.',
      });
      return;
    }

    if (data.notes?.trim()) payload.notes = data.notes.trim();

    clearErrors('root');
    setSaving(true);
    try {
      const record = await monitoringService.createVital(
        hospitalizationId,
        payload,
      );
      onSuccess(record);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Registrar Sinais Vitais"
      description="Os valores são adicionados ao histórico da internação"
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
            const current = measured[def.key];
            const evaluation =
              typeof current === 'number' && !Number.isNaN(current)
                ? evaluateVital(specie, def.key, current)
                : 'unknown';

            return (
              <div key={def.key}>
                <Controller
                  name={def.key}
                  control={control}
                  render={({ field }) => (
                    <InputWithLabel
                      label={`${def.label} (${def.unit})`}
                      type="number"
                      inputMode="decimal"
                      step={def.step}
                      min={0}
                      value={field.value === undefined ? '' : String(field.value)}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === '' ? undefined : e.target.valueAsNumber,
                        )
                      }
                      placeholder={
                        range ? formatRange(range, def.unit) : 'Sem referência'
                      }
                      error={errors[def.key]?.message}
                    />
                  )}
                />
                {evaluation !== 'unknown' && (
                  <p
                    className={`text-xs mt-1 ${EVALUATION_TEXT_COLORS[evaluation]}`}
                  >
                    {evaluation === 'normal'
                      ? '✓ Dentro da faixa de referência'
                      : `⚠ ${EVALUATION_LABELS[evaluation]} da faixa (${formatRange(range, def.unit)})`}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <FormTextarea
              label="Observações"
              rows={2}
              placeholder="Anotações sobre a medição (opcional)"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.notes?.message}
            />
          )}
        />

        {errors.root && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {errors.root.message}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
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
