'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Clock } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { doseLabel, fmtTime, nowDateTimeLocal, PRESCRIPTION_TYPE_MAP, toISO } from '../utils';

import { Modal } from '@/app/components/common/modal';
import { DateInput } from '@/app/components/forms/date-input';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { TimeInput } from '@/app/components/forms/time-input';
import { Button } from '@/components/ui/button';
import { executeSchema, type ExecuteFormData } from '@/schemas/monitoring';
import { monitoringService } from '@/services/monitoring.service';
import type { Execution, HospPrescription } from '@/types/monitoring';

interface ExecuteModalProps {
  execution?: Execution;
  prescription?: HospPrescription;
  patientName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExecuteModal({
  execution,
  prescription,
  patientName,
  onClose,
  onSuccess,
}: ExecuteModalProps) {
  const [saving, setSaving] = useState(false);

  const info = execution
    ? {
      name: execution.prescription.name,
      type: execution.prescription.type,
      dose: doseLabel(execution.prescription),
      patient: execution.hospitalization?.patient?.name,
      scheduled: fmtTime(execution.scheduled_at),
    }
    : prescription
      ? {
        name: prescription.name,
        type: prescription.type,
        dose: doseLabel(prescription),
        patient: patientName,
        scheduled: null,
      }
      : null;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ExecuteFormData>({
    resolver: yupResolver(executeSchema) as Resolver<ExecuteFormData>,
    defaultValues: {
      date: nowDateTimeLocal().date,
      time: nowDateTimeLocal().time,
      notes: '',
    },
  });

  const fillNow = () => {
    const { date, time } = nowDateTimeLocal();
    setValue('date', date, { shouldValidate: true });
    setValue('time', time, { shouldValidate: true });
  };

  const onSubmit = async (data: ExecuteFormData) => {
    setSaving(true);
    try {
      const payload = {
        executed_at: toISO(data.date, data.time),
        ...(data.notes ? { notes: data.notes } : {}),
      };
      if (execution) {
        await monitoringService.execute(execution.id, payload);
      } else if (prescription) {
        await monitoringService.executeAsNeeded(prescription.id, payload);
      }
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Registrar Execução" onClose={onClose} maxWidth="md">
      {info && (
        <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-slate-900 dark:text-white text-sm">
              {info.name}
              {info.dose ? (
                <span className="font-normal text-slate-500 dark:text-slate-400"> · {info.dose}</span>
              ) : null}
            </p>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${PRESCRIPTION_TYPE_MAP[info.type].badge}`}
            >
              {PRESCRIPTION_TYPE_MAP[info.type].label}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {info.patient ? `Paciente: ${info.patient}` : ''}
            {info.scheduled ? ` · Programado para ${info.scheduled}` : ''}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="Data da execução"
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
          <Button type="button" variant="outline" onClick={fillNow} className="shrink-0">
            <Clock size={15} />
            Agora
          </Button>
        </div>

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <FormTextarea
              label="Observações"
              rows={2}
              placeholder="Ex: Animal reagiu bem à medicação"
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
            Concluir execução
          </Button>
        </div>
      </form>
    </Modal>
  );
}
