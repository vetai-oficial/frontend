export function parseBirthDate(iso: string) {
  const parts = iso.slice(0, 10).split('-').map(Number);
  return new Date(parts[0]!, (parts[1] ?? 1) - 1, parts[2] ?? 1);
}

export function calcAge(birthDate: Date): string {
  const now = new Date();
  const totalMonths = Math.floor((now.getTime() - birthDate.getTime()) / (30.4375 * 24 * 60 * 60 * 1000));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'}`;
  if (months === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
}

export { fmtDate, fmtDateTime } from '@/utils/date-format';

export const STUDY_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  FAILED: 'Falhou',
};

export const STUDY_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};
