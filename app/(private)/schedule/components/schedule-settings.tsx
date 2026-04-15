'use client';

import { ChevronDown, Settings2 } from 'lucide-react';
import { useState } from 'react';

export interface ScheduleSettingsState {
  weekStartHour: number;
  weekEndHour: number;
}

export const DEFAULT_SCHEDULE_SETTINGS: ScheduleSettingsState = {
  weekStartHour: 7,
  weekEndHour: 21,
};

const STORAGE_KEY = 'vetai_schedule_settings';

export function loadScheduleSettings(): ScheduleSettingsState {
  if (typeof window === 'undefined') return DEFAULT_SCHEDULE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SCHEDULE_SETTINGS, ...(JSON.parse(raw) as Partial<ScheduleSettingsState>) } : DEFAULT_SCHEDULE_SETTINGS;
  } catch {
    return DEFAULT_SCHEDULE_SETTINGS;
  }
}

export function saveScheduleSettings(s: ScheduleSettingsState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

interface ScheduleSettingsProps {
  settings: ScheduleSettingsState;
  onChange: (s: ScheduleSettingsState) => void;
}

const hourOptions = Array.from({ length: 25 }, (_, i) => i); // 0–24

export function ScheduleSettings({ settings, onChange }: ScheduleSettingsProps) {
  const [open, setOpen] = useState(false);

  function update(field: keyof ScheduleSettingsState, value: number) {
    const next = { ...settings, [field]: value };
    // Keep start < end
    if (field === 'weekStartHour' && value >= next.weekEndHour) next.weekEndHour = Math.min(value + 1, 24);
    if (field === 'weekEndHour' && value <= next.weekStartHour) next.weekStartHour = Math.max(value - 1, 0);
    onChange(next);
    saveScheduleSettings(next);
  }

  const selectCls =
    'rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <div className="border-t border-slate-100 dark:border-slate-700 pt-3 mt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-left group"
      >
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
          <Settings2 size={13} />
          Configurações de exibição
        </div>
        <ChevronDown
          size={13}
          className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-3">
          {/* Week interval */}
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Intervalo da semana
            </p>
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-0.5 flex-1">
                <label className="text-[10px] text-slate-400 dark:text-slate-500">Início</label>
                <select
                  className={selectCls}
                  value={settings.weekStartHour}
                  onChange={(e) => update('weekStartHour', Number(e.target.value))}
                >
                  {hourOptions.slice(0, 24).map((h) => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
              <span className="text-xs text-slate-400 mt-3">–</span>
              <div className="flex flex-col gap-0.5 flex-1">
                <label className="text-[10px] text-slate-400 dark:text-slate-500">Fim</label>
                <select
                  className={selectCls}
                  value={settings.weekEndHour}
                  onChange={(e) => update('weekEndHour', Number(e.target.value))}
                >
                  {hourOptions.slice(1).map((h) => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
              Aplica-se à visualização semanal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
