'use client';

import { Calendar } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/infra/utils';

export interface DateInputProps {
  value: string; // YYYY-MM-DD or empty
  onChange: (value: string) => void; // emits YYYY-MM-DD or ''
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

// YYYY-MM-DD → dd/mm/YYYY
function isoToDisplay(iso: string): string {
  if (!iso || iso.length < 10) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// digits only → dd/mm/YYYY (partial ok)
function formatDigits(digits: string): string {
  const d = digits.slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

// dd/mm/YYYY → YYYY-MM-DD (only if complete)
function displayToIso(display: string): string {
  const digits = display.replace(/\D/g, '');
  if (digits.length < 8) return '';
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  // basic validity check
  const d = parseInt(dd, 10);
  const m = parseInt(mm, 10);
  const y = parseInt(yyyy, 10);
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900) return '';
  return `${yyyy}-${mm}-${dd}`;
}

export function DateInput({
  value,
  onChange,
  label,
  error,
  placeholder = 'dd/mm/aaaa',
  className,
  containerClassName,
  required,
  disabled,
  id,
}: DateInputProps) {
  const hiddenRef = React.useRef<HTMLInputElement>(null);
  const [display, setDisplay] = React.useState(() => isoToDisplay(value));
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'));
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Sync display when value changes externally
  React.useEffect(() => {
    setDisplay(isoToDisplay(value));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow only digits and slashes
    const digits = raw.replace(/\D/g, '');
    const formatted = formatDigits(digits);
    setDisplay(formatted);
    const iso = displayToIso(formatted);
    onChange(iso);
  };

  const handleNativePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    onChange(iso);
    setDisplay(isoToDisplay(iso));
  };

  const openPicker = () => {
    if (disabled) return;
    try {
      hiddenRef.current?.showPicker();
    } catch {
      hiddenRef.current?.click();
    }
  };

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          value={display}
          onChange={handleTextChange}
          placeholder={placeholder}
          maxLength={10}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2.5 pr-10 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors',
            error
              ? 'border-red-400 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-200 dark:border-slate-600',
            disabled && 'opacity-60 cursor-not-allowed',
            className,
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={openPicker}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors disabled:cursor-not-allowed"
        >
          <Calendar size={15} />
        </button>
        <input
          ref={hiddenRef}
          type="date"
          value={value}
          onChange={handleNativePick}
          tabIndex={-1}
          aria-hidden="true"
          style={{ colorScheme: isDark ? 'dark' : 'light' }}
          className="absolute right-0 top-0 h-full w-10 opacity-0 pointer-events-none"
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
