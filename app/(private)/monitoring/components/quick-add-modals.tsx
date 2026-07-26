'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Beaker, MessageSquarePlus, Scale } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  monitoringWeightSchema,
  occurrenceSchema,
  type MonitoringWeightFormData,
  type OccurrenceFormData,
} from '@/schemas/monitoring';
import { monitoringService } from '@/services/monitoring.service';
import type { ClinicalParameter } from '@/types/monitoring';

export type QuickAddKind = 'occurrence' | 'weight' | 'parameters';

interface QuickAddChooserProps {
  patientName?: string;
  onChoose: (kind: QuickAddKind) => void;
  onClose: () => void;
}

export function QuickAddChooserModal({
  patientName,
  onChoose,
  onClose,
}: QuickAddChooserProps) {
  const options = [
    {
      kind: 'occurrence' as const,
      label: 'Ocorrência',
      description: 'Registre algo relevante que aconteceu',
      icon: MessageSquarePlus,
    },
    {
      kind: 'weight' as const,
      label: 'Peso',
      description: 'Registre uma pesagem do paciente',
      icon: Scale,
    },
    {
      kind: 'parameters' as const,
      label: 'Parâmetros clínicos',
      description: 'Temperatura, apetite, hidratação e mais',
      icon: Beaker,
    },
  ];

  return (
    <Modal
      title="Novo registro"
      description={patientName ? `Paciente: ${patientName}` : undefined}
      onClose={onClose}
      maxWidth="sm"
    >
      <div className="space-y-2">
        {options.map(({ kind, label, description, icon: Icon }) => (
          <button
            key={kind}
            type="button"
            onClick={() => onChoose(kind)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 shrink-0">
              <Icon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

interface QuickAddBaseProps {
  hospitalizationId: string;
  patientName?: string;
  defaultDate?: string;
  defaultTime?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function OccurrenceModal({
  hospitalizationId,
  patientName,
  defaultDate,
  defaultTime,
  onClose,
  onSuccess,
}: QuickAddBaseProps) {
  const [saving, setSaving] = useState(false);
  const now = nowDateTimeLocal();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OccurrenceFormData>({
    resolver: yupResolver(occurrenceSchema) as Resolver<OccurrenceFormData>,
    defaultValues: {
      title: '',
      description: '',
      date: defaultDate ?? now.date,
      time: defaultTime ?? now.time,
    },
  });

  const onSubmit = async (data: OccurrenceFormData) => {
    setSaving(true);
    try {
      await monitoringService.createEvent(hospitalizationId, {
        type: 'OCCURRENCE',
        date: toISO(data.date, data.time),
        title: data.title,
        ...(data.description ? { description: data.description } : {}),
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Registrar Ocorrência"
      description={patientName ? `Paciente: ${patientName}` : undefined}
      onClose={onClose}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Resumo"
              required
              placeholder="Ex: Vômito após medicação"
              value={field.value}
              onChange={field.onChange}
              error={errors.title?.message}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <FormTextarea
              label="Descrição"
              rows={3}
              placeholder="Detalhe o que aconteceu"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.description?.message}
            />
          )}
        />
        <div className="flex gap-3">
          <div className="flex-1">
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="Data"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.date?.message}
                />
              )}
            />
          </div>
          <div className="w-32">
            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <TimeInput
                  label="Hora"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.time?.message}
                />
              )}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={saving}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function WeightModal({
  hospitalizationId,
  patientName,
  defaultDate,
  defaultTime,
  onClose,
  onSuccess,
}: QuickAddBaseProps) {
  const [saving, setSaving] = useState(false);
  const now = nowDateTimeLocal();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MonitoringWeightFormData>({
    resolver: yupResolver(
      monitoringWeightSchema,
    ) as Resolver<MonitoringWeightFormData>,
    defaultValues: {
      value: '',
      unit: 'KG',
      date: defaultDate ?? now.date,
      time: defaultTime ?? now.time,
      notes: '',
    },
  });

  const onSubmit = async (data: MonitoringWeightFormData) => {
    setSaving(true);
    try {
      await monitoringService.createEvent(hospitalizationId, {
        type: 'WEIGHT',
        date: toISO(data.date, data.time),
        ...(data.notes ? { description: data.notes } : {}),
        data: {
          value: Number(data.value.replace(',', '.')),
          unit: data.unit,
        },
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Registrar Peso"
      description={patientName ? `Paciente: ${patientName}` : undefined}
      onClose={onClose}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Controller
              name="value"
              control={control}
              render={({ field }) => (
                <InputWithLabel
                  label="Peso"
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 12.5"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.value?.message}
                />
              )}
            />
          </div>
          <div className="w-24">
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Unidade"
                  value={field.value}
                  onChange={(value) => field.onChange(value as 'KG' | 'G')}
                  options={[
                    { value: 'KG', label: 'kg' },
                    { value: 'G', label: 'g' },
                  ]}
                  error={errors.unit?.message}
                />
              )}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="Data"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.date?.message}
                />
              )}
            />
          </div>
          <div className="w-32">
            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <TimeInput
                  label="Hora"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.time?.message}
                />
              )}
            />
          </div>
        </div>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Anotação"
              placeholder="Opcional"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.notes?.message}
            />
          )}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={saving}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function ParametersModal({
  hospitalizationId,
  patientName,
  defaultDate,
  defaultTime,
  onClose,
  onSuccess,
}: QuickAddBaseProps) {
  const [saving, setSaving] = useState(false);
  const [parameters, setParameters] = useState<ClinicalParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const now = nowDateTimeLocal();
  const [date, setDate] = useState(defaultDate ?? now.date);
  const [time, setTime] = useState(defaultTime ?? now.time);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void monitoringService
      .listParameters()
      .then((data) => setParameters(data.filter((parameter) => parameter.active)))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const filled = parameters
      .filter((parameter) => values[parameter.id]?.trim())
      .map((parameter) => ({
        name: parameter.name,
        value: values[parameter.id]?.trim() ?? '',
        ...(parameter.unit ? { unit: parameter.unit } : {}),
      }));

    if (!filled.length) {
      setError('Preencha ao menos um parâmetro');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await monitoringService.createEvent(hospitalizationId, {
        type: 'CLINICAL_PARAMETERS',
        date: toISO(date, time),
        data: { values: filled },
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Registrar Parâmetros Clínicos"
      description={patientName ? `Paciente: ${patientName}` : undefined}
      onClose={onClose}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
            Carregando parâmetros...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {parameters.map((parameter) => (
              <InputWithLabel
                key={parameter.id}
                label={
                  parameter.unit
                    ? `${parameter.name} (${parameter.unit})`
                    : parameter.name
                }
                placeholder="—"
                value={values[parameter.id] ?? ''}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [parameter.id]: e.target.value,
                  }))
                }
              />
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1">
            <DateInput label="Data" required value={date} onChange={setDate} />
          </div>
          <div className="w-32">
            <TimeInput label="Hora" required value={time} onChange={setTime} />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={saving}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
