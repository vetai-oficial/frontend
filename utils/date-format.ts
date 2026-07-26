export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

// Interpreta a data como local para não deslocar o dia por fuso horário.
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

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function normalizeProb(p: number): number {
  return p <= 1 ? Math.round(p * 100) : Math.round(p);
}

export function fmtPeriod(days?: number): string {
  if (!days) return '—';
  if (days === 30) return '30 dias';
  if (days === 60) return '60 dias';
  if (days === 90) return '90 dias';
  if (days === 180) return '6 meses';
  if (days === 365) return '1 ano';
  if (days === 730) return '2 anos';
  return `${days} dias`;
}
