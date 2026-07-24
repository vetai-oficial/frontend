'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { DateInput } from '../forms/date-input';
import { InputWithLabel } from '../forms/input-with-label';
import { SearchSelect } from '../forms/search-select';
import { SelectInput } from '../forms/select-input';

import { Button } from '@/components/ui/button';
import { SPECIE_LABELS } from '@/constants';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { patientSchema, type PatientFormData } from '@/schemas/patient';
import { patientsService } from '@/services/patients.service';
import { tutorsService } from '@/services/tutors.service';
import type {
  CreatePatientPayload,
  Patient,
  Sex,
  UpdatePatientPayload,
} from '@/types/patient';
import type { Tutor } from '@/types/tutor';

const SPECIES = Object.entries(SPECIE_LABELS) as [string, string][];

interface PatientModalProps {
  patient?: Patient;
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
}

export function PatientModal({
  patient,
  onClose,
  onSuccess,
}: PatientModalProps) {
  const isEdit = !!patient;

  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showTutorDropdown, setShowTutorDropdown] = useState(false);

  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: yupResolver(
      patientSchema,
    ) as unknown as Resolver<PatientFormData>,
    defaultValues: {
      name: patient?.name ?? '',
      specie: patient?.specie ?? '',
      breed: patient?.breed ?? '',
      birthDate: patient?.birth_date ? patient.birth_date.slice(0, 10) : '',
      sex: patient?.sex ?? '',
      castrationDate: patient?.castration_date
        ? patient.castration_date.slice(0, 10)
        : '',
      deathDate: patient?.death_date ? patient.death_date.slice(0, 10) : '',
      microchip: patient?.microchip ?? '',
      tutorId: patient?.tutor_id ?? '',
    },
  });

  const {
    items: tutors,
    loading: loadingTutors,
    search: tutorSearch,
    setSearch: setTutorSearch,
  } = usePaginatedResource<Tutor, { search?: string }>({
    fetcher: tutorsService.list,
    initialFilters: { search: '' },
    pageSize: 8,
    debounceMs: 300,
  });

  useEffect(() => {
    if (patient?.tutor_id) {
      tutorsService
        .get(patient.tutor_id)
        .then((t) => setSelectedTutor(t))
        .catch(() => null);
    }
  }, [patient]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const onSubmit = async (data: PatientFormData) => {
    setSaving(true);

    try {
      let result: Patient;
      if (isEdit) {
        const payload = {
          name: data.name.trim(),
          specie: data.specie as Patient['specie'],
          tutor_id: selectedTutor?.id ?? patient.tutor_id,
        } as UpdatePatientPayload;
        if (data.breed?.trim()) payload.breed = data.breed.trim();
        if (data.birthDate) payload.birth_date = data.birthDate;
        if (data.sex) payload.sex = data.sex as Sex;
        if (data.castrationDate) payload.castration_date = data.castrationDate;
        if (data.deathDate) payload.death_date = data.deathDate;
        if (data.microchip?.trim()) payload.microchip = data.microchip.trim();
        result = await patientsService.update(patient.id, payload);
      } else {
        const payload = {
          name: data.name.trim(),
          specie: data.specie as Patient['specie'],
          tutor_id: selectedTutor!.id,
        } as CreatePatientPayload;
        if (data.breed?.trim()) payload.breed = data.breed.trim();
        if (data.birthDate) payload.birth_date = data.birthDate;
        if (data.sex) payload.sex = data.sex as Sex;
        if (data.castrationDate) payload.castration_date = data.castrationDate;
        if (data.deathDate) payload.death_date = data.deathDate;
        if (data.microchip?.trim()) payload.microchip = data.microchip.trim();
        result = await patientsService.create(payload);
      }
      onSuccess(result);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200'>
        <div className='flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10'>
          <div>
            <h2 className='text-lg font-bold text-slate-900 dark:text-white'>
              {isEdit ? 'Editar Paciente' : 'Novo Paciente'}
            </h2>
            <p className='text-sm text-slate-500 dark:text-slate-400 mt-0.5'>
              {isEdit
                ? 'Atualize os dados do paciente'
                : 'Cadastre um novo pet'}
            </p>
          </div>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={onClose}
            className='text-slate-500'
          >
            <X size={18} />
          </Button>
        </div>

        <div className='p-5 space-y-4'>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label='Nome'
                required
                type='text'
                value={field.value}
                onChange={field.onChange}
                placeholder='Ex: Rex'
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            name='specie'
            control={control}
            render={({ field }) => (
              <SelectInput
                label='Espécie'
                required
                value={field.value}
                onChange={field.onChange}
                placeholder='Selecione a espécie'
                error={errors.specie?.message}
                options={[
                  { value: '', label: 'Selecione a espécie' },
                  ...SPECIES.map(([v, l]) => ({ value: v, label: l })),
                ]}
              />
            )}
          />

          <div className='grid grid-cols-2 gap-3'>
            <Controller
              name='breed'
              control={control}
              render={({ field }) => (
                <InputWithLabel
                  label='Raça'
                  type='text'
                  value={field.value}
                  onChange={field.onChange}
                  placeholder='Ex: Labrador'
                />
              )}
            />
            <Controller
              name='sex'
              control={control}
              render={({ field }) => (
                <SelectInput
                  label='Sexo'
                  value={field.value}
                  onChange={field.onChange}
                  placeholder='Não informado'
                  options={[
                    { value: '', label: 'Não informado' },
                    { value: 'MALE', label: 'Macho' },
                    { value: 'FEMALE', label: 'Fêmea' },
                  ]}
                />
              )}
            />
          </div>

          <Controller
            name='birthDate'
            control={control}
            render={({ field }) => (
              <DateInput
                label='Data de nascimento'
                value={field.value}
                onChange={field.onChange}
                error={errors.birthDate?.message}
              />
            )}
          />

          <div className='grid grid-cols-2 gap-3'>
            <Controller
              name='castrationDate'
              control={control}
              render={({ field }) => (
                <DateInput
                  label='Data de castração'
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.castrationDate?.message}
                />
              )}
            />
            <Controller
              name='microchip'
              control={control}
              render={({ field }) => (
                <InputWithLabel
                  label='Microchip'
                  type='text'
                  value={field.value}
                  onChange={field.onChange}
                  placeholder='Ex: 900123456789012'
                />
              )}
            />
          </div>

          <Controller
            name='deathDate'
            control={control}
            render={({ field }) => (
              <DateInput
                label='Data de falecimento'
                value={field.value}
                onChange={field.onChange}
                error={errors.deathDate?.message}
              />
            )}
          />

          <SearchSelect
            label='Tutor'
            required
            placeholder='Buscar tutor por nome...'
            search={tutorSearch}
            onSearchChange={setTutorSearch}
            options={tutors.map((tutor) => ({
              id: tutor.id,
              label: tutor.name,
              description: tutor.email,
            }))}
            loading={loadingTutors}
            open={showTutorDropdown}
            onOpenChange={setShowTutorDropdown}
            selectedOption={
              selectedTutor
                ? {
                  id: selectedTutor.id,
                  label: selectedTutor.name,
                  description: selectedTutor.email,
                }
                : null
            }
            onSelect={(option) => {
              const tutor = tutors.find((item) => item.id === option.id);
              if (!tutor) return;
              setSelectedTutor(tutor);
              setValue('tutorId', tutor.id, { shouldValidate: true });
              setTutorSearch('');
            }}
            onClear={() => {
              setSelectedTutor(null);
              setValue('tutorId', '', { shouldValidate: true });
            }}
            error={errors.tutorId?.message}
            emptyMessage='Nenhum tutor encontrado'
          />
        </div>

        <div className='flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700'>
          <Button variant='outline' onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className='bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 dark:hover:bg-teal-800 min-w-[100px]'
          >
            {saving ? (
              <Loader2 size={16} className='animate-spin' />
            ) : isEdit ? (
              'Salvar'
            ) : (
              'Cadastrar'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
