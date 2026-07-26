'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Modal } from '@/app/components/common/modal';
import { DateInput } from '@/app/components/forms/date-input';
import { SelectInput } from '@/app/components/forms/select-input';
import { TimeInput } from '@/app/components/forms/time-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { appointmentsService } from '@/services/appointments.service';
import {
  APPOINTMENT_TYPE_LABELS,
  type Appointment,
  type AppointmentType,
} from '@/types/appointment';
import type { Patient } from '@/types/patient';

interface AddAppointmentModalProps {
  tutorId: string;
  pets: Patient[];
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
}

const inputCls = 'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500';

const TYPE_OPTIONS = (Object.keys(APPOINTMENT_TYPE_LABELS) as AppointmentType[]).map((t) => ({
  value: t,
  label: APPOINTMENT_TYPE_LABELS[t],
}));

export function AddAppointmentModal({ tutorId, pets, onClose, onSuccess }: AddAppointmentModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<AppointmentType>('CONSULTATION');
  const [patientId, setPatientId] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const petOptions = pets.map((p) => ({ value: p.id, label: p.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'TÃ­tulo Ã© obrigatÃ³rio';
    if (!date) errs.date = 'Data Ã© obrigatÃ³ria';
    if (!startTime) errs.startTime = 'HorÃ¡rio de inÃ­cio Ã© obrigatÃ³rio';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const result = await appointmentsService.create({
        title: title.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        date,
        start_time: startTime,
        ...(endTime ? { end_time: endTime } : {}),
        type,
        tutor_id: tutorId,
        ...(patientId ? { patient_id: patientId } : {}),
      });
      onSuccess(result);
    } catch {
      setErrors({ general: 'Erro ao salvar. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Novo Agendamento" description="Agende uma atividade para este tutor" onClose={onClose}>
      <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-4">

        <div>
          <Label required className="mb-1.5">TÃ­tulo</Label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Consulta de rotina"
            className={inputCls}
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <DateInput
              label="Data"
              value={date}
              onChange={setDate}
              required
              error={errors.date}
            />
          </div>
          <div>
            <Label required className="mb-1.5">Tipo</Label>
            <SelectInput
              value={type}
              onChange={(v) => setType(v as AppointmentType)}
              options={TYPE_OPTIONS}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TimeInput
            label="HorÃ¡rio inÃ­cio"
            required
            value={startTime}
            onChange={setStartTime}
          />
          <TimeInput
            label="HorÃ¡rio fim"
            value={endTime}
            onChange={setEndTime}
          />
        </div>
        {errors.startTime && <p className="-mt-2 text-xs text-red-500">{errors.startTime}</p>}

        {petOptions.length > 0 && (
          <div>
            <Label className="mb-1.5">Pet (opcional)</Label>
            <SelectInput
              value={patientId}
              onChange={setPatientId}
              options={petOptions}
              placeholder="Selecione um pet..."
            />
          </div>
        )}

        <div>
          <Label className="mb-1.5">DescriÃ§Ã£o</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ObservaÃ§Ãµes..."
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>

        {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600">
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Agendar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
