'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Controller, type Control, type FieldValues } from 'react-hook-form';

import { cn } from '@/infra/utils';

export interface TimeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string | undefined;
  required?: boolean;
  disabled?: boolean;
  minHour?: number;
  maxHour?: number;
  className?: string;
  containerClassName?: string;
  id?: string;
  control?: Control<FieldValues>;
  name?: string;
}

function splitTime(value: string): { h: number | null; m: number | null } {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return { h: null, m: null };
  return { h: parseInt(match[1]!, 10), m: parseInt(match[2]!, 10) };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const DROPDOWN_HEIGHT = 220;
const GAP = 4;

interface PartDropdownProps {
  items: number[];
  selected: number | null;
  onSelect: (n: number) => void;
  onClose: () => void;
  anchorRect: DOMRect;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  header: string;
}

function PartDropdown({
  items,
  selected,
  onSelect,
  onClose,
  anchorRect,
  dropdownRef,
  header,
}: PartDropdownProps) {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (selected === null || !listRef.current) return;
    const item = listRef.current.children[selected] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'center' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const openUpward =
    spaceBelow < DROPDOWN_HEIGHT + GAP &&
    anchorRect.top > DROPDOWN_HEIGHT + GAP;

  const style: React.CSSProperties = {
    position: 'fixed',
    left: anchorRect.left,
    width: anchorRect.width,
    zIndex: 9999,
    ...(openUpward
      ? { bottom: window.innerHeight - anchorRect.top + GAP }
      : { top: anchorRect.bottom + GAP }),
  };

  return (
    <div
      ref={dropdownRef}
      style={style}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className='rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150'
    >
      <div className='text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide text-center py-1.5 border-b border-slate-100 dark:border-slate-700 select-none'>
        {header}
      </div>
      <div ref={listRef} className='h-[184px] overflow-y-auto py-1'>
        {items.map((n) => (
          <button
            key={n}
            type='button'
            onClick={() => {
              onSelect(n);
              onClose();
            }}
            className={cn(
              'w-full text-sm text-center py-1.5 transition-colors select-none',
              selected === n
                ? 'bg-teal-500 text-white font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300',
            )}
          >
            {String(n).padStart(2, '0')}
          </button>
        ))}
      </div>
    </div>
  );
}

interface PartInputProps {
  value: number | null;
  max: number;
  placeholder: string;
  items: number[];
  dropdownHeader: string;
  disabled?: boolean;
  onChange: (n: number | null) => void;
  id?: string;
}

function PartInput({
  value,
  max,
  placeholder,
  items,
  dropdownHeader,
  disabled,
  onChange,
  id,
}: PartInputProps) {
  const [display, setDisplay] = React.useState(
    value !== null ? String(value).padStart(2, '0') : '',
  );
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    setDisplay(value !== null ? String(value).padStart(2, '0') : '');
  }, [value]);

  React.useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const node = e.target as Node;
      if (
        !containerRef.current?.contains(node) &&
        !dropdownRef.current?.contains(node)
      ) {
        setOpen(false);
      }
    };
    const closeScroll = (e: Event) => {
      const target = e.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', closeScroll, true);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', closeScroll, true);
    };
  }, [open]);

  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);

  function openDropdown() {
    if (disabled) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setAnchorRect(rect);
    setOpen(true);
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 2);
    setDisplay(digits);
    if (digits.length === 2) {
      const n = clamp(parseInt(digits, 10), 0, max);
      onChange(n);
      setDisplay(String(n).padStart(2, '0'));
    } else if (digits === '') {
      onChange(null);
    }
  };

  const handleBlur = () => {
    if (display.length === 1) {
      const n = clamp(parseInt(display, 10), 0, max);
      onChange(n);
      setDisplay(String(n).padStart(2, '0'));
    }
  };

  return (
    <div ref={containerRef} className='relative flex-1'>
      <input
        id={id}
        type='text'
        inputMode='numeric'
        value={display}
        placeholder={placeholder}
        maxLength={2}
        disabled={disabled}
        onChange={handleTextChange}
        onFocus={openDropdown}
        onBlur={handleBlur}
        className={cn(
          'w-full text-center px-2 py-2.5 text-sm font-medium border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors',
          open ? 'border-teal-500' : 'border-slate-200 dark:border-slate-600',
          disabled && 'opacity-60 cursor-not-allowed',
        )}
      />

      {mounted &&
        open &&
        anchorRect &&
        createPortal(
          <PartDropdown
            items={items}
            selected={value}
            onSelect={onChange}
            onClose={() => setOpen(false)}
            anchorRect={anchorRect}
            dropdownRef={dropdownRef}
            header={dropdownHeader}
          />,
          document.body,
        )}
    </div>
  );
}

function TimeInputInner({
  value,
  onChange,
  label,
  error,
  required,
  disabled,
  minHour = 0,
  maxHour = 23,
  className,
  containerClassName,
  id,
}: Omit<TimeInputProps, 'control' | 'name'> & {
  value: string;
  onChange: (value: string) => void;
}) {
  const initial = splitTime(value);
  const [localH, setLocalH] = React.useState<number | null>(initial.h);
  const [localM, setLocalM] = React.useState<number | null>(initial.m);

  const prevValue = React.useRef(value);
  React.useEffect(() => {
    if (value === prevValue.current) return;
    prevValue.current = value;
    const { h, m } = splitTime(value);
    setLocalH(h);
    setLocalM(m);
  }, [value]);

  function handleHourChange(newH: number | null) {
    setLocalH(newH);
    if (newH !== null && localM !== null) {
      onChange(
        `${String(newH).padStart(2, '0')}:${String(localM).padStart(2, '0')}`,
      );
    } else if (newH === null) {
      onChange('');
    }
  }

  function handleMinChange(newM: number | null) {
    setLocalM(newM);
    if (localH !== null && newM !== null) {
      onChange(
        `${String(localH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`,
      );
    } else if (newM === null) {
      onChange('');
    }
  }

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('w-full', containerClassName, className)}>
      {label && (
        <label
          htmlFor={`${inputId}-h`}
          className='text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block'
        >
          {label}
          {required && <span className='text-red-500 ml-0.5'>*</span>}
        </label>
      )}

      <div className='flex items-center gap-1.5'>
        <PartInput
          id={`${inputId}-h`}
          value={localH}
          max={maxHour}
          placeholder='HH'
          items={HOURS.filter((h) => h >= minHour && h <= maxHour)}
          dropdownHeader='Hora'
          {...(disabled !== undefined ? { disabled } : {})}
          onChange={handleHourChange}
        />

        <span className='text-lg font-semibold text-slate-400 dark:text-slate-500 select-none leading-none pb-0.5'>
          :
        </span>

        <PartInput
          id={`${inputId}-m`}
          value={localM}
          max={59}
          placeholder='MM'
          items={MINUTES}
          dropdownHeader='Minuto'
          {...(disabled !== undefined ? { disabled } : {})}
          onChange={handleMinChange}
        />
      </div>

      {error && (
        <p className='mt-1 text-xs text-red-500 dark:text-red-400'>{error}</p>
      )}
    </div>
  );
}

export function TimeInput({
  value,
  onChange,
  control,
  name,
  ...rest
}: TimeInputProps) {
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TimeInputInner
            value={field.value}
            onChange={field.onChange}
            {...rest}
          />
        )}
      />
    );
  }

  return (
    <TimeInputInner
      value={value ?? ''}
      onChange={onChange ?? (() => {})}
      {...rest}
    />
  );
}
