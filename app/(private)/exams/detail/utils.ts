import type { ExamValue } from '@/types/study';

export function formatReference(val: ExamValue): string | null {
  const ref = val.reference;
  if (!ref) return null;
  const unit = ref.unit ?? val.unit ?? '';

  if (ref.type === 'TEXT') {
    return ref.text ?? null;
  }

  if (ref.type === 'RANGE') {
    if (ref.min !== undefined && ref.max !== undefined) {
      return `${ref.min} – ${ref.max}${unit ? ' ' + unit : ''}`;
    }
    if (ref.min !== undefined) return `≥ ${ref.min}${unit ? ' ' + unit : ''}`;
    if (ref.max !== undefined) return `≤ ${ref.max}${unit ? ' ' + unit : ''}`;
  }

  return null;
}
