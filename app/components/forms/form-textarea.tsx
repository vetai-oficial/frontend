'use client';

import * as React from 'react';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues } from 'react-hook-form';

import { cn } from '@/infra/utils';

export interface FormTextareaProps extends React.ComponentProps<'textarea'> {
  label?: string;
  required?: boolean;
  error?: string | undefined;
  containerClassName?: string;
  control?: Control<FieldValues>;
  name?: string;
}

const FormTextareaInner = React.forwardRef<
  HTMLTextAreaElement,
  Omit<FormTextareaProps, 'control' | 'name'> & {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
      }
      >(function FormTextareaInnerComponent(
        { className, label, required, error, containerClassName, value, onChange, ...props },
        ref,
      ) {
        const inputId = React.useId();

        return (
          <div className={cn('w-full', containerClassName)}>
            {label && (
              <label
                htmlFor={inputId}
                className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
              >
                {label}
                {required && <span className='ml-0.5 text-red-500'>*</span>}
              </label>
            )}
            <textarea
              id={inputId}
              ref={ref}
              value={value}
              onChange={onChange}
              className={cn(
                'w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white',
                error
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500'
                  : 'border-slate-200 dark:border-slate-600',
                className,
              )}
              {...props}
            />
            {error && (
              <p className='mt-1 text-xs text-red-500 dark:text-red-400'>{error}</p>
            )}
          </div>
        );
      });
FormTextareaInner.displayName = 'FormTextareaInner';

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ value, onChange, control, name, ...props }, ref) => {
    if (control && name) {
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <FormTextareaInner
              value={String(field.value ?? '')}
              onChange={field.onChange}
              {...props}
              ref={ref}
            />
          )}
        />
      );
    }

    return (
      <FormTextareaInner
        value={String(value ?? '')}
        onChange={onChange ?? (() => {})}
        {...props}
        ref={ref}
      />
    );
  },
);
FormTextarea.displayName = 'FormTextarea';
