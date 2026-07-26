'use client';

import { SelectInput } from '@/app/components/select-input';
import { STATUS_OPTIONS } from '@/constants';
import type { HospitalizationStatus } from '@/types/monitoring';

interface StatusSelectProps {
  value: HospitalizationStatus;
  onChange: (status: HospitalizationStatus) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function StatusSelect({
  value,
  onChange,
  disabled,
  compact,
}: StatusSelectProps) {
  return (
    <SelectInput
      value={value}
      onChange={(v) => onChange(v as HospitalizationStatus)}
      options={STATUS_OPTIONS}
      disabled={disabled ?? false}
      compact={compact ?? false}
    />
  );
}
