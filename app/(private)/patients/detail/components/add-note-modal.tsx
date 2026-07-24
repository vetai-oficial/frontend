'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { Modal } from '@/app/components/common/modal';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { Button } from '@/components/ui/button';
import {
  patientNoteSchema,
  type PatientNoteFormData,
} from '@/schemas/health-record';
import { healthRecordsService } from '@/services/health-records.service';

interface AddNoteModalProps {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddNoteModal({ patientId, onClose, onSuccess }: AddNoteModalProps) {
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientNoteFormData>({
    resolver: yupResolver(patientNoteSchema) as Resolver<PatientNoteFormData>,
    defaultValues: {
      text: '',
    },
  });

  const onSubmit = async (data: PatientNoteFormData) => {
    setSaving(true);
    try {
      await healthRecordsService.create(patientId, {
        type: 'NOTE',
        date: new Date().toISOString(),
        metadata: { text: data.text.trim() },
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Nova Nota" onClose={onClose} maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="text"
          control={control}
          render={({ field }) => (
            <FormTextarea
              label="Nota / Observação"
              required
              rows={5}
              placeholder="Escreva uma observação sobre o paciente..."
              value={field.value}
              onChange={field.onChange}
              error={errors.text?.message}
              autoFocus
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
