'use client';

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';

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

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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
  const d = parseInt(dd, 10);
  const m = parseInt(mm, 10);
  const y = parseInt(yyyy, 10);
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900) return '';
  return `${yyyy}-${mm}-${dd}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface CalendarDropdownProps {
  value: string; // YYYY-MM-DD or ''
  onSelect: (iso: string) => void;
  onClose: () => void;
  anchorRect: DOMRect;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

function CalendarDropdown({ value, onSelect, onClose, anchorRect, dropdownRef }: CalendarDropdownProps) {
  const CALENDAR_HEIGHT = 300;
  const GAP = 6;
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const openUpward = spaceBelow < CALENDAR_HEIGHT + GAP && anchorRect.top > CALENDAR_HEIGHT + GAP;

  const style: React.CSSProperties = {
    position: 'fixed',
    left: anchorRect.left,
    width: Math.max(anchorRect.width, 288),
    zIndex: 9999,
    ...(openUpward
      ? { bottom: window.innerHeight - anchorRect.top + GAP }
      : { top: anchorRect.bottom + GAP }),
  };
  const today = new Date();
  const initial = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = React.useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(initial.getMonth());

  const selectedParts = value
    ? { y: parseInt(value.slice(0, 4)), m: parseInt(value.slice(5, 7)) - 1, d: parseInt(value.slice(8, 10)) }
    : null;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const handleDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onSelect(`${viewYear}-${mm}-${dd}`);
    onClose();
  };

  const goToToday = () => {
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    onSelect(`${today.getFullYear()}-${mm}-${dd}`);
    onClose();
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div
      ref={dropdownRef}
      style={style}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 p-3 animate-in fade-in-0 zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 select-none">
          {MONTHS[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-slate-400 dark:text-slate-500 py-1 select-none">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;

          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear();

          const isSelected =
            selectedParts !== null &&
            day === selectedParts.d &&
            viewMonth === selectedParts.m &&
            viewYear === selectedParts.y;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDay(day)}
              className={cn(
                'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all duration-100 select-none',
                isSelected
                  ? 'bg-teal-500 text-white font-semibold shadow-sm shadow-teal-300 dark:shadow-teal-900'
                  : isToday
                    ? 'bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-semibold ring-1 ring-teal-400 dark:ring-teal-600'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300',
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <button
          type="button"
          onClick={() => { onSelect(''); onClose(); }}
          className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors px-1"
        >
          Limpar
        </button>
        <button
          type="button"
          onClick={goToToday}
          className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors px-1"
        >
          Hoje
        </button>
      </div>
    </div>
  );
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
  const [display, setDisplay] = React.useState(() => isoToDisplay(value));
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { setMounted(true); }, []);

  // Sync display when value changes externally
  React.useEffect(() => {
    setDisplay(isoToDisplay(value));
  }, [value]);

  // Close on outside click or scroll
  React.useEffect(() => {
    if (!anchorRect) return;
    const close = (e: MouseEvent) => {
      const node = e.target as Node;
      const insideContainer = containerRef.current?.contains(node);
      const insideDropdown = dropdownRef.current?.contains(node);
      if (!insideContainer && !insideDropdown) setAnchorRect(null);
    };
    const closeOnScroll = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setAnchorRect(null);
    };
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', closeOnScroll, true);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', closeOnScroll, true);
    };
  }, [anchorRect]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    const formatted = formatDigits(digits);
    setDisplay(formatted);
    onChange(displayToIso(formatted));
  };

  const handleSelect = (iso: string) => {
    onChange(iso);
    setDisplay(isoToDisplay(iso));
  };

  const toggleCalendar = () => {
    if (disabled) return;
    if (anchorRect) { setAnchorRect(null); return; }
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setAnchorRect(rect);
  };

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const open = anchorRect !== null;

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
      <div className="relative" ref={containerRef}>
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
          onClick={toggleCalendar}
          disabled={disabled}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 transition-colors disabled:cursor-not-allowed',
            open
              ? 'text-teal-600 dark:text-teal-400'
              : 'text-slate-400 hover:text-teal-600 dark:hover:text-teal-400',
          )}
        >
          <Calendar size={15} />
        </button>
      </div>

      {mounted && open && anchorRect && createPortal(
        <CalendarDropdown
          value={value}
          onSelect={handleSelect}
          onClose={() => setAnchorRect(null)}
          anchorRect={anchorRect}
          dropdownRef={dropdownRef}
        />,
        document.body,
      )}

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
