'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { nowDateTimeLocal, toISO } from '../utils';

import { Modal } from '@/app/components/common/modal';
import { DateInput } from '@/app/components/forms/date-input';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SelectInput } from '@/app/components/forms/select-input';
import { TimeInput } from '@/app/components/forms/time-input';
import { Button } from '@/components/ui/button';
import {
  prescriptionFormSchema,
  type PrescriptionFormData,
} from '@/schemas/monitoring';
import { monitoringService } from '@/services/monitoring.service';
import type { CreatePrescriptionPayload, DoseUnit } from '@/types/monitoring';

const TYPE_OPTIONS = [
  { value: 'MEDICATION', label: 'Medicamento' },
  { value: 'PROCEDURE', label: 'Procedimento' },
  { value: 'FLUID', label: 'Fluidoterapia' },
];

const FREQUENCY_OPTIONS = [
  { value: 'RECURRING', label: 'Recorrente' },
  { value: 'ONCE', label: 'Apenas uma vez' },
  { value: 'AS_NEEDED', label: 'Quando necessário (SOS)' },
];

const DOSE_UNIT_OPTIONS = [
  { value: '', label: 'Sem dose' },
  { value: 'MG', label: 'mg' },
  { value: 'MCG', label: 'mcg' },
  { value: 'G', label: 'g' },
  { value: 'ML', label: 'ml' },
  { value: 'ML_H', label: 'ml/h' },
  { value: 'TABLET', label: 'comprimido(s)' },
  { value: 'CAPSULE', label: 'cápsula(s)' },
  { value: 'DROP', label: 'gota(s)' },
];

interface PrescriptionModalProps {
  hospitalizationId: string;
  patientName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PrescriptionModal({
  hospitalizationId,
  patientName,
  onClose,
  onSuccess,
}: PrescriptionModalProps) {
  const [saving, setSaving] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const now = nowDateTimeLocal();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    resolver: yupResolver(
      prescriptionFormSchema,
    ) as Resolver<PrescriptionFormData>,
    defaultValues: {
      type: 'MEDICATION',
      name: '',
      dose_value: '',
      dose_unit: '',
      frequency: 'RECURRING',
      interval_hours: '',
      duration_days: '',
      start_date: now.date,
      start_time: now.time,
      notes: '',
    },
  });

  const frequency = watch('frequency');
  const type = watch('type');

  const onSubmit = async (data: PrescriptionFormData) => {
    setSaving(true);
    try {
      const doseValue = data.dose_value
        ? Number(data.dose_value.replace(',', '.'))
        : undefined;

      const payload: CreatePrescriptionPayload = {
        type: data.type,
        name: data.name,
        frequency: data.frequency,
        start_at:
          data.frequency === 'AS_NEEDED'
            ? new Date().toISOString()
            : toISO(data.start_date ?? now.date, data.start_time ?? now.time),
        ...(doseValue && data.dose_unit
          ? { dose_value: doseValue, dose_unit: data.dose_unit as DoseUnit }
          : {}),
        ...(data.frequency === 'RECURRING'
          ? {
            interval_hours: Number(data.interval_hours),
            duration_days: Number(data.duration_days),
          }
          : {}),
        ...(data.notes ? { notes: data.notes } : {}),
      };

      await monitoringService.createPrescription(hospitalizationId, payload);

      if (saveAsTemplate) {
        await monitoringService.createTemplate({
          name: data.name,
          items: [
            {
              type: data.type,
              name: data.name,
              frequency: data.frequency,
              ...(doseValue && data.dose_unit
                ? {
                  dose_value: doseValue,
                  dose_unit: data.dose_unit as DoseUnit,
                }
                : {}),
              ...(data.frequency === 'RECURRING'
                ? {
                  interval_hours: Number(data.interval_hours),
                  duration_days: Number(data.duration_days),
                }
                : {}),
              ...(data.notes ? { notes: data.notes } : {}),
            },
          ],
        });
      }

      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Nova Prescrição"
      description={patientName ? `Paciente: ${patientName}` : undefined}
      onClose={onClose}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Tipo"
                required
                value={field.value}
                onChange={field.onChange}
                options={TYPE_OPTIONS}
                error={errors.type?.message}
              />
            )}
          />
          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Frequência"
                required
                value={field.value}
                onChange={field.onChange}
                options={FREQUENCY_OPTIONS}
                error={errors.frequency?.message}
              />
            )}
          />
        </div>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label={
                type === 'MEDICATION'
                  ? 'Medicamento'
                  : type === 'FLUID'
                    ? 'Fluidoterapia'
                    : 'Procedimento'
              }
              required
              placeholder={
                type === 'MEDICATION'
                  ? 'Ex: Dipirona 500mg'
                  : type === 'FLUID'
                    ? 'Ex: NaCl 0,9%'
                    : 'Ex: Curativo da ferida cirúrgica'
              }
              value={field.value}
              onChange={field.onChange}
              error={errors.name?.message}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="dose_value"
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label="Dose"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 0.5 (aceita fração)"
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.dose_value?.message}
              />
            )}
          />
          <Controller
            name="dose_unit"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Unidade"
                value={field.value ?? ''}
                onChange={field.onChange}
                options={DOSE_UNIT_OPTIONS}
                error={errors.dose_unit?.message}
              />
            )}
          />
        </div>

        {frequency === 'RECURRING' && (
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="interval_hours"
              control={control}
              render={({ field }) => (
                <InputWithLabel
                  label="A cada (horas)"
                  required
                  type="number"
                  min="1"
                  placeholder="Ex: 8"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={errors.interval_hours?.message}
                />
              )}
            />
            <Controller
              name="duration_days"
              control={control}
              render={({ field }) => (
                <InputWithLabel
                  label="Durante (dias)"
                  required
                  type="number"
                  min="1"
                  placeholder="Ex: 3"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={errors.duration_days?.message}
                />
              )}
            />
          </div>
        )}

        {frequency !== 'AS_NEEDED' && (
          <div className="flex gap-3">
            <div className="flex-1">
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <DateInput
                    label="Início"
                    required
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={errors.start_date?.message}
                  />
                )}
              />
            </div>
            <div className="w-32">
              <Controller
                name="start_time"
                control={control}
                render={({ field }) => (
                  <TimeInput
                    label="Hora"
                    required
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={errors.start_time?.message}
                  />
                )}
              />
            </div>
          </div>
        )}

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <FormTextarea
              label="Observações"
              rows={2}
              placeholder="Ex: Aplicar após alimentação"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.notes?.message}
            />
          )}
        />

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saveAsTemplate}
            onChange={(e) => setSaveAsTemplate(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500"
          />
          Salvar também como modelo de prescrição
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={saving}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
          >
            Prescrever
          </Button>
        </div>
      </form>
    </Modal>
  );
}
