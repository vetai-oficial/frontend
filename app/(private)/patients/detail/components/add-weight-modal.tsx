'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { Modal } from '@/app/components/common/modal';
import { DateInput } from '@/app/components/forms/date-input';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import {
  weightRecordSchema,
  type WeightRecordFormData,
} from '@/schemas/health-record';
import { healthRecordsService } from '@/services/health-records.service';

interface AddWeightModalProps {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddWeightModal({ patientId, onClose, onSuccess }: AddWeightModalProps) {
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WeightRecordFormData>({
    resolver: yupResolver(weightRecordSchema) as Resolver<WeightRecordFormData>,
    defaultValues: {
      value: '',
      unit: 'KG',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  const onSubmit = async (data: WeightRecordFormData) => {
    setSaving(true);
    try {
      await healthRecordsService.create(patientId, {
        type: 'WEIGHT',
        date: new Date(data.date).toISOString(),
        ...(data.notes ? { notes: data.notes } : {}),
        metadata: { value: parseFloat(data.value), unit: data.unit },
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Registrar Peso" onClose={onClose} maxWidth="sm">
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

        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DateInput
              label="Data"
              value={field.value}
              onChange={field.onChange}
              required
              error={errors.date?.message}
            />
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Observações"
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="Ex: Após consulta de rotina"
              error={errors.notes?.message}
            />
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving} className="bg-teal-600 text-white hover:bg-teal-700">
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
