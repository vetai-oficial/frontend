'use client';

import { Check } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/infra/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export function Checkbox({ label, description, className, checked, disabled, ...props }: CheckboxProps) {
  return (
    <label className={cn('flex items-start gap-3 text-sm', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer')}>
      <span className="relative mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          className={cn('peer h-4 w-4 appearance-none rounded border border-slate-300 bg-white transition-colors checked:border-indigo-600 checked:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-900', className)}
          {...props}
        />
        <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
      </span>
      {(label || description) && (
        <span>
          {label && <span className="block font-medium text-slate-700 dark:text-slate-200">{label}</span>}
          {description && <span className="text-xs text-slate-500 dark:text-slate-400">{description}</span>}
        </span>
      )}
    </label>
  );
}
