export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
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
