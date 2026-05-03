'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { FormTextarea } from '@/app/components/forms/form-textarea';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Modal } from '@/app/components/common/modal';
import { SearchSelect } from '@/app/components/forms/search-select';
import { SelectInput } from '@/app/components/forms/select-input';
import { TimeInput } from '@/app/components/forms/time-input';
import { Button } from '@/components/ui/button';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import {
  scheduleEventSchema,
  type ScheduleEventFormData,
} from '@/schemas/schedule';
import { patientsService } from '@/services/patients.service';
import { scheduleService } from '@/services/schedule.service';
import { tutorsService } from '@/services/tutors.service';
import type { Patient } from '@/types/patient';
import type { EventType, ScheduleEvent } from '@/types/schedule';
import { EVENT_TYPE_MAP } from '@/types/schedule';
import type { Tutor } from '@/types/tutor';
import { toLocalDateStr } from '../utils';

interface ComboBoxItem {
  id: string;
  label: string;
  description?: string | undefined;
}

interface AddEventModalProps {
  initialDate?: string | undefined;
  event?: ScheduleEvent;
  onClose: () => void;
  onSave: (event: ScheduleEvent) => void;
  minHour?: number;
  maxHour?: number;
}

export function AddEventModal({
  initialDate,
  event: editingEvent,
  onClose,
  onSave,
  minHour = 0,
  maxHour = 23,
}: AddEventModalProps) {
  const isEditing = !!editingEvent;
  const [patientOpen, setPatientOpen] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<(ComboBoxItem & { tutorId?: string }) | null>(
    editingEvent?.patientName
      ? { id: editingEvent.patientName, label: editingEvent.patientName }
      : null,
  );
  const [selectedTutor, setSelectedTutor] = useState<ComboBoxItem | null>(
    editingEvent?.tutorName
      ? { id: editingEvent.tutorName, label: editingEvent.tutorName }
      : null,
  );

  const {
    items: patients,
    loading: patientLoading,
    search: patientSearch,
    setSearch: setPatientSearch,
  } = usePaginatedResource<Patient, { search?: string }>({
    fetcher: patientsService.list,
    initialFilters: { search: '' },
    pageSize: 8,
    debounceMs: 300,
  });

  const {
    items: tutors,
    loading: tutorLoading,
    search: tutorSearch,
    setSearch: setTutorSearch,
  } = usePaginatedResource<Tutor, { search?: string }>({
    fetcher: tutorsService.list,
    initialFilters: { search: '' },
    pageSize: 8,
    debounceMs: 300,
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ScheduleEventFormData>({
    resolver: yupResolver(scheduleEventSchema) as Resolver<ScheduleEventFormData>,
    defaultValues: {
      title: editingEvent?.title ?? '',
      description: editingEvent?.description ?? '',
      date: editingEvent?.date ?? initialDate ?? toLocalDateStr(new Date()),
      startTime: editingEvent?.startTime ?? '',
      endTime: editingEvent?.endTime ?? '',
      type: editingEvent?.type ?? 'consultation',
      patientName: editingEvent?.patientName ?? '',
      tutorName: editingEvent?.tutorName ?? '',
    },
  });

  const handleSelectPatient = async (option: ComboBoxItem) => {
    const patient = patients.find((item) => item.id === option.id);
    if (!patient) return;

    const nextSelection = {
      id: patient.id,
      label: patient.name,
      description: patient.breed,
      tutorId: patient.tutor_id,
    };

    setSelectedPatient(nextSelection);
    setValue('patientName', patient.name, { shouldValidate: true });
    setPatientSearch('');

    if (patient.tutor_id && !selectedTutor) {
      try {
        const tutor = await tutorsService.get(patient.tutor_id);
        const tutorOption = {
          id: tutor.id,
          label: tutor.name,
          description: tutor.phone ?? tutor.email,
        };
        setSelectedTutor(tutorOption);
        setValue('tutorName', tutor.name, { shouldValidate: true });
      } catch {
        // keep form usable even if tutor auto-fill fails
      }
    }
  };

  const onSubmit = async (data: ScheduleEventFormData) => {
    const payload = {
      title: data.title.trim(),
      ...(data.description?.trim() ? { description: data.description.trim() } : {}),
      date: data.date,
      startTime: data.startTime,
      ...(data.endTime ? { endTime: data.endTime } : {}),
      type: data.type,
      patientName: data.patientName.trim(),
      tutorName: data.tutorName.trim(),
    };

    const saved = isEditing
      ? await scheduleService.update(editingEvent.id, payload)
      : await scheduleService.create(payload);
    onSave(saved);
  };

  return (
    <Modal
      title={isEditing ? 'Editar Evento' : 'Novo Evento'}
      description='Preencha os dados do agendamento'
      onClose={onClose}
      maxWidth='md'
    >
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <Controller
          name='title'
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label='Título'
              required
              placeholder='Ex: Consulta de rotina'
              value={field.value}
              onChange={field.onChange}
              error={errors.title?.message}
            />
          )}
        />

        <div className='grid grid-cols-2 gap-3'>
          <Controller
            name='date'
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label='Data'
                required
                placeholder='aaaa-mm-dd'
                value={field.value}
                onChange={field.onChange}
                error={errors.date?.message}
              />
            )}
          />

          <Controller
            name='type'
            control={control}
            render={({ field }) => (
              <SelectInput
                label='Tipo'
                required
                value={field.value}
                onChange={(value) => field.onChange(value as EventType)}
                options={(Object.keys(EVENT_TYPE_MAP) as EventType[]).map((type) => ({
                  value: type,
                  label: EVENT_TYPE_MAP[type].label,
                }))}
                error={errors.type?.message}
              />
            )}
          />
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <Controller
            name='startTime'
            control={control}
            render={({ field }) => (
              <TimeInput
                label='Horário início'
                required
                value={field.value}
                onChange={field.onChange}
                minHour={minHour}
                maxHour={maxHour}
                error={errors.startTime?.message}
              />
            )}
          />

          <Controller
            name='endTime'
            control={control}
            render={({ field }) => (
              <TimeInput
                label='Horário fim'
                value={field.value ?? ''}
                onChange={field.onChange}
                minHour={minHour}
                maxHour={maxHour}
                error={errors.endTime?.message}
              />
            )}
          />
        </div>

        <SearchSelect
          label='Paciente'
          required
          placeholder='Buscar paciente...'
          search={patientSearch}
          onSearchChange={setPatientSearch}
          options={patients.map((patient) => ({
            id: patient.id,
            label: patient.name,
            description: patient.breed,
          }))}
          loading={patientLoading}
          open={patientOpen}
          onOpenChange={setPatientOpen}
          selectedOption={selectedPatient}
          onSelect={(option) => {
            void handleSelectPatient(option);
          }}
          onClear={() => {
            setSelectedPatient(null);
            setValue('patientName', '', { shouldValidate: true });
          }}
          error={errors.patientName?.message}
          emptyMessage='Nenhum paciente encontrado'
        />

        <SearchSelect
          label='Tutor'
          required
          placeholder='Buscar tutor...'
          search={tutorSearch}
          onSearchChange={setTutorSearch}
          options={tutors.map((tutor) => ({
            id: tutor.id,
            label: tutor.name,
            description: tutor.phone ?? tutor.email,
          }))}
          loading={tutorLoading}
          open={tutorOpen}
          onOpenChange={setTutorOpen}
          selectedOption={selectedTutor}
          onSelect={(option) => {
            setSelectedTutor(option);
            setValue('tutorName', option.label, { shouldValidate: true });
            setTutorSearch('');
          }}
          onClear={() => {
            setSelectedTutor(null);
            setValue('tutorName', '', { shouldValidate: true });
          }}
          error={errors.tutorName?.message}
          emptyMessage='Nenhum tutor encontrado'
        />

        <Controller
          name='description'
          control={control}
          render={({ field }) => (
            <FormTextarea
              label='Descrição'
              rows={3}
              placeholder='Observações adicionais...'
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.description?.message}
            />
          )}
        />
        <div className='flex justify-end gap-2 pt-1'>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancelar
          </Button>
          <Button type='submit' className='border-teal-600 bg-teal-600 text-white hover:bg-teal-700'>
            {isEditing ? 'Salvar alterações' : 'Salvar evento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
