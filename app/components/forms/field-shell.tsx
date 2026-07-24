'use client';

import type { ReactNode } from 'react';

import { cn } from '@/infra/utils';

interface FieldShellProps {
  label?: string;
  required?: boolean | undefined;
  error?: string | undefined;
  className?: string;
  children: ReactNode;
}

export function FieldShell({ label, required, error, className, children }: FieldShellProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'>
          {label}
          {required && <span className='ml-0.5 text-red-500'>*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className='mt-1 text-xs text-red-500 dark:text-red-400'>{error}</p>
      )}
    </div>
  );
}
