'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { Modal } from '@/app/components/common/modal';
import { DateInput } from '@/app/components/forms/date-input';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import {
  clinicalNoteSchema,
  type ClinicalNoteFormData,
} from '@/schemas/health-record';
import { healthRecordsService } from '@/services/health-records.service';

interface AddClinicalNoteModalProps {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddClinicalNoteModal({ patientId, onClose, onSuccess }: AddClinicalNoteModalProps) {
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicalNoteFormData>({
    resolver: yupResolver(clinicalNoteSchema) as Resolver<ClinicalNoteFormData>,
    defaultValues: {
      title: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = async (data: ClinicalNoteFormData) => {
    setSaving(true);
    try {
      await healthRecordsService.create(patientId, {
        type: 'CLINICAL_NOTE',
        date: new Date(data.date).toISOString(),
        metadata: {
          title: data.title.trim(),
          description: data.description.trim(),
        },
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Novo Registro Clínico" onClose={onClose} maxWidth="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Título"
              required
              placeholder="Ex: Consulta de rotina"
              value={field.value}
              onChange={field.onChange}
              error={errors.title?.message}
            />
          )}
        />

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
          name="description"
          control={control}
          render={({ field }) => (
            <FormTextarea
              label="Descrição"
              required
              rows={4}
              placeholder="Descreva o registro clínico..."
              value={field.value}
              onChange={field.onChange}
              error={errors.description?.message}
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
