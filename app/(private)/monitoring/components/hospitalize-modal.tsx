'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { Modal } from '@/app/components/common/modal';
import { DateInput } from '@/app/components/forms/date-input';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SearchSelect } from '@/app/components/forms/search-select';
import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import {
  hospitalizeSchema,
  type HospitalizeFormData,
} from '@/schemas/monitoring';
import { authService } from '@/services/auth.service';
import { collaboratorsService } from '@/services/collaborators.service';
import { monitoringService } from '@/services/monitoring.service';
import { patientsService } from '@/services/patients.service';
import type { Box, Hospitalization } from '@/types/monitoring';
import type { Collaborator } from '@/types/settings';

interface HospitalizeModalProps {
  hospitalization?: Hospitalization;
  onClose: () => void;
  onSuccess: () => void;
}

export function HospitalizeModal({
  hospitalization,
  onClose,
  onSuccess,
}: HospitalizeModalProps) {
  const isEdit = Boolean(hospitalization);
  const [saving, setSaving] = useState(false);

  const [vets, setVets] = useState<Collaborator[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);

  const [patientSearch, setPatientSearch] = useState('');
  const [patientOptions, setPatientOptions] = useState<
    Array<{ id: string; label: string; description?: string | undefined }>
  >([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientOpen, setPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    label: string;
  } | null>(
    hospitalization
      ? { id: hospitalization.patient.id, label: hospitalization.patient.name }
      : null,
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<HospitalizeFormData>({
    resolver: yupResolver(hospitalizeSchema) as Resolver<HospitalizeFormData>,
    defaultValues: {
      patient_id: hospitalization?.patient.id ?? '',
      status:
        hospitalization?.status === 'TRIAGE' ? 'TRIAGE' : hospitalization ? 'HOSPITALIZED' : 'TRIAGE',
      risk: hospitalization?.risk ?? 'LOW',
      veterinarian_id: hospitalization?.veterinarian?.id ?? '',
      box_id: hospitalization?.box?.id ?? '',
      expected_discharge_date: hospitalization?.expected_discharge_at
        ? hospitalization.expected_discharge_at.slice(0, 10)
        : '',
      complaint: hospitalization?.complaint ?? '',
      diagnosis: hospitalization?.diagnosis ?? '',
      prognosis: hospitalization?.prognosis ?? '',
      accessories: hospitalization?.accessories ?? '',
      observations: hospitalization?.observations ?? '',
    },
  });

  const [allergies, setAllergies] = useState(
    hospitalization?.allergies.join(', ') ?? '',
  );

  useEffect(() => {
    void Promise.all([
      authService.me().catch(() => null),
      collaboratorsService.findAll().catch(() => [] as Collaborator[]),
    ]).then(([me, collaborators]) => {
      const list = collaborators.filter(
        (c) => c.status === 'active' && c.name,
      );
      if (me && !list.some((c) => c.id === me.id)) {
        list.unshift({
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          status: 'active',
          addedAt: new Date().toISOString(),
        });
      }
      setVets(list);
    });
    void monitoringService
      .listBoxes()
      .then(setBoxes)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (isEdit) return;
    const timeout = window.setTimeout(async () => {
      setPatientsLoading(true);
      try {
        const response = await patientsService.list({
          search: patientSearch || undefined,
          size: 10,
        });
        setPatientOptions(
          response.data.map((patient) => ({
            id: patient.id,
            label: patient.name,
            description: patient.breed || undefined,
          })),
        );
      } finally {
        setPatientsLoading(false);
      }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [patientSearch, isEdit]);

  const boxOptions = useMemo(() => {
    const currentBoxId = hospitalization?.box?.id;
    return [
      { value: '', label: 'Sem box' },
      ...boxes
        .filter(
          (box) =>
            box.active && (!box.occupied || box.id === currentBoxId),
        )
        .map((box) => ({ value: box.id, label: box.name })),
      ...boxes
        .filter((box) => box.active && box.occupied && box.id !== currentBoxId)
        .map((box) => ({
          value: `occupied-${box.id}`,
          label: `${box.name} — ocupado (${box.occupant?.patient_name ?? ''})`,
        })),
    ];
  }, [boxes, hospitalization]);

  const onSubmit = async (data: HospitalizeFormData) => {
    if (data.box_id?.startsWith('occupied-')) {
      return;
    }
    setSaving(true);
    try {
      const allergiesList = allergies
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        status: data.status,
        risk: data.risk,
        veterinarian_id: data.veterinarian_id,
        ...(data.box_id ? { box_id: data.box_id } : {}),
        ...(data.expected_discharge_date
          ? {
            expected_discharge_at: new Date(
              `${data.expected_discharge_date}T12:00`,
            ).toISOString(),
          }
          : {}),
        ...(data.complaint ? { complaint: data.complaint } : {}),
        ...(data.diagnosis ? { diagnosis: data.diagnosis } : {}),
        ...(data.prognosis ? { prognosis: data.prognosis } : {}),
        allergies: allergiesList,
        ...(data.accessories ? { accessories: data.accessories } : {}),
        ...(data.observations ? { observations: data.observations } : {}),
      };

      if (isEdit && hospitalization) {
        await monitoringService.updateHospitalization(hospitalization.id, payload);
      } else {
        await monitoringService.createHospitalization({
          patient_id: data.patient_id,
          ...payload,
        });
      }
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Editar Internação' : 'Internar Paciente'}
      description={
        isEdit
          ? undefined
          : 'Registre a internação para acompanhar o paciente no monitoramento'
      }
      onClose={onClose}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!isEdit && (
          <SearchSelect
            label="Paciente"
            required
            placeholder="Buscar paciente pelo nome..."
            search={patientSearch}
            onSearchChange={setPatientSearch}
            options={patientOptions}
            loading={patientsLoading}
            open={patientOpen}
            onOpenChange={setPatientOpen}
            selectedOption={selectedPatient}
            onSelect={(option) => {
              setSelectedPatient(option);
              setValue('patient_id', option.id, { shouldValidate: true });
              setPatientOpen(false);
            }}
            onClear={() => {
              setSelectedPatient(null);
              setValue('patient_id', '');
            }}
            error={errors.patient_id?.message}
            emptyMessage="Nenhum paciente encontrado"
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Situação"
                required
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'TRIAGE', label: 'Triagem' },
                  { value: 'HOSPITALIZED', label: 'Internado' },
                ]}
                error={errors.status?.message}
              />
            )}
          />
          <Controller
            name="risk"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Risco"
                required
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'LOW', label: 'Baixo' },
                  { value: 'MEDIUM', label: 'Moderado' },
                  { value: 'HIGH', label: 'Alto' },
                ]}
                error={errors.risk?.message}
              />
            )}
          />
          <Controller
            name="expected_discharge_date"
            control={control}
            render={({ field }) => (
              <DateInput
                label="Alta prevista"
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.expected_discharge_date?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            name="veterinarian_id"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Veterinário responsável"
                required
                placeholder="Selecione"
                value={field.value}
                onChange={field.onChange}
                options={vets.map((vet) => ({
                  value: vet.id,
                  label: vet.name ?? '',
                }))}
                error={errors.veterinarian_id?.message}
              />
            )}
          />
          <Controller
            name="box_id"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Box"
                value={field.value ?? ''}
                onChange={(value) => {
                  if (value.startsWith('occupied-')) return;
                  field.onChange(value);
                }}
                options={boxOptions}
                error={errors.box_id?.message}
              />
            )}
          />
        </div>

        <Controller
          name="complaint"
          control={control}
          render={({ field }) => (
            <FormTextarea
              label="Queixa relatada"
              rows={2}
              placeholder="Ex: Vômito e apatia há 2 dias"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.complaint?.message}
            />
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            name="diagnosis"
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label="Diagnóstico"
                placeholder="Se houver"
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.diagnosis?.message}
              />
            )}
          />
          <Controller
            name="prognosis"
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label="Prognóstico"
                placeholder="Se houver"
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.prognosis?.message}
              />
            )}
          />
        </div>

        <InputWithLabel
          label="Alergias e marcações"
          placeholder="Separe por vírgula. Ex: Dipirona, Alergia alimentar"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            name="accessories"
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label="Acessórios"
                placeholder="Ex: Coleira vermelha, caminha"
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.accessories?.message}
              />
            )}
          />
          <Controller
            name="observations"
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label="Observações"
                placeholder="Outras informações relevantes"
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.observations?.message}
              />
            )}
          />
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
            {isEdit ? 'Salvar alterações' : 'Internar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
