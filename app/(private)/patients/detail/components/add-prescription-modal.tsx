'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFieldArray, useForm, type Resolver } from 'react-hook-form';

import { DateInput } from '@/app/components/forms/date-input';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Modal } from '@/app/components/common/modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  prescriptionSchema,
  type PrescriptionFormData,
} from '@/schemas/health-record';
import { healthRecordsService } from '@/services/health-records.service';

interface AddPrescriptionModalProps {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPrescriptionModal({ patientId, onClose, onSuccess }: AddPrescriptionModalProps) {
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    resolver: yupResolver(prescriptionSchema) as Resolver<PrescriptionFormData>,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      includeDate: true,
      medications: [{ drug: '', form: '', quantity: '', posology: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  });

  const onSubmit = async (data: PrescriptionFormData) => {
    setSaving(true);
    try {
      await healthRecordsService.create(patientId, {
        type: 'PRESCRIPTION',
        date: new Date(data.date).toISOString(),
        metadata: {
          include_date: data.includeDate,
          medications: data.medications.map((medication) => ({
            drug: medication.drug.trim(),
            form: medication.form?.trim() || undefined,
            quantity: medication.quantity?.trim() || undefined,
            posology: medication.posology.trim(),
          })),
        },
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Nova Receita" description="Adicione medicamentos e posologia" onClose={onClose} maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="Data da receita"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={errors.date?.message}
                />
              )}
            />
          </div>
          <Controller
            name="includeDate"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                label="Incluir data na receita"
                className="accent-teal-600"
              />
            )}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Medicamentos</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => append({ drug: '', form: '', quantity: '', posology: '' })}
              className="gap-1.5 text-xs text-teal-600 hover:bg-teal-50 hover:text-teal-700 dark:text-teal-400 dark:hover:bg-teal-900/20 dark:hover:text-teal-300"
            >
              <Plus size={14} /> Adicionar medicamento
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-600 dark:bg-slate-700/30">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Medicamento {index + 1}
                </span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(index)}
                    className="text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Controller
                  name={`medications.${index}.drug`}
                  control={control}
                  render={({ field: medicationField }) => (
                    <InputWithLabel
                      label="Medicamento"
                      required
                      placeholder="Ex: Amoxicilina"
                      value={medicationField.value}
                      onChange={medicationField.onChange}
                      error={errors.medications?.[index]?.drug?.message}
                    />
                  )}
                />
                <Controller
                  name={`medications.${index}.form`}
                  control={control}
                  render={({ field: medicationField }) => (
                    <InputWithLabel
                      label="Forma"
                      placeholder="Ex: Comprimido"
                      value={medicationField.value ?? ''}
                      onChange={medicationField.onChange}
                      error={errors.medications?.[index]?.form?.message}
                    />
                  )}
                />
                <Controller
                  name={`medications.${index}.quantity`}
                  control={control}
                  render={({ field: medicationField }) => (
                    <InputWithLabel
                      label="Quantidade"
                      placeholder="Ex: 500mg"
                      value={medicationField.value ?? ''}
                      onChange={medicationField.onChange}
                      error={errors.medications?.[index]?.quantity?.message}
                    />
                  )}
                />
              </div>

              <Controller
                name={`medications.${index}.posology`}
                control={control}
                render={({ field: medicationField }) => (
                  <FormTextarea
                    label="Posologia"
                    required
                    rows={2}
                    placeholder="Ex: 1 comprimido a cada 8 horas por 7 dias"
                    value={medicationField.value}
                    onChange={medicationField.onChange}
                    error={errors.medications?.[index]?.posology?.message}
                  />
                )}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving} className="bg-teal-600 text-white hover:bg-teal-700">
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Salvar Receita'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
