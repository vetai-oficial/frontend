export type AppointmentType = 'CONSULTATION' | 'SURGERY' | 'VACCINE' | 'EXAM' | 'OTHER';
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  tutor_id: string;
  patient_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentPayload {
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time?: string;
  type?: AppointmentType;
  status?: AppointmentStatus;
  tutor_id: string;
  patient_id?: string;
}

export interface UpdateAppointmentPayload {
  title?: string;
  description?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  type?: AppointmentType;
  status?: AppointmentStatus;
  patient_id?: string;
}

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  CONSULTATION: 'Consulta',
  SURGERY: 'Cirurgia',
  VACCINE: 'Vacina',
  EXAM: 'Exame',
  OTHER: 'Outro',
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Agendado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

export const APPOINTMENT_TYPE_COLORS: Record<AppointmentType, { bg: string; text: string; dot: string }> = {
  CONSULTATION: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  SURGERY: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  VACCINE: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  EXAM: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  OTHER: { bg: 'bg-slate-100 dark:bg-slate-700/50', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-500' },
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, { bg: string; text: string }> = {
  SCHEDULED: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  CANCELLED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
};
