import type { StudyStatus } from '@/types/study';

export const STUDY_STATUS_MAP: Record<
  StudyStatus,
  { label: string; color: 'green' | 'yellow' | 'red' | 'blue' }
> = {
  COMPLETED: { label: 'Concluído', color: 'green' },
  PROCESSING: { label: 'Processando', color: 'blue' },
  PENDING: { label: 'Pendente', color: 'yellow' },
  FAILED: { label: 'Falhou', color: 'red' },
};
