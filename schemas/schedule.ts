import * as yup from 'yup';

import type { EventType } from '@/types/schedule';

export const scheduleSchema = yup.object({
  patientId: yup.string().required('Paciente é obrigatório'),
  tutorId: yup.string().required('Tutor é obrigatório'),
  date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .required('Data é obrigatória')
    .test('valid-date', 'Data inválida', (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),
  time: yup
    .string()
    .matches(/^\d{2}:\d{2}$/, 'Horário inválido')
    .required('Horário é obrigatório'),
  type: yup.string().required('Tipo é obrigatório'),
  notes: yup.string().optional(),
});

export type ScheduleFormData = yup.InferType<typeof scheduleSchema>;

export const scheduleEventSchema = yup.object({
  title: yup.string().trim().required('O título é obrigatório.'),
  description: yup.string().optional(),
  date: yup
    .string()
    .required('Data é obrigatória.')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida.'),
  startTime: yup
    .string()
    .required('O horário de início é obrigatório.')
    .matches(/^\d{2}:\d{2}$/, 'Horário inválido.'),
  endTime: yup.string().optional().matches(/^$|^\d{2}:\d{2}$/, 'Horário inválido.'),
  type: yup
    .mixed<EventType>()
    .oneOf(['consultation', 'surgery', 'vaccine', 'exam', 'other'])
    .required('Tipo é obrigatório.'),
  patientName: yup.string().trim().required('Paciente é obrigatório.'),
  tutorName: yup.string().trim().required('Tutor é obrigatório.'),
});

export type ScheduleEventFormData = yup.InferType<typeof scheduleEventSchema>;
