import { DAY_NAMES, getDaysInMonth, getFirstDayOfMonth } from '../utils';

import { EVENT_TYPE_MAP } from '@/types/schedule';
import type { ScheduleEvent } from '@/types/schedule';

interface CalendarProps {
  year: number;
  month: number;
  events: ScheduleEvent[];
  selectedDate: string | null;
  today: string;
  onSelectDate: (date: string) => void;
  onEventClick: (event: ScheduleEvent) => void;
}

export function Calendar({ year, month, events, selectedDate, today, onSelectDate, onEventClick }: CalendarProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const eventsByDate: Record<string, ScheduleEvent[]> = {};
  for (const e of events) {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date]!.push(e);
  }

  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-[72px]" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = eventsByDate[dateStr] ?? [];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`relative h-[72px] flex flex-col items-start p-1.5 rounded-lg border text-left transition-colors ${
                isSelected
                  ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-400 dark:border-teal-600'
                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span
                className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-0.5 ${
                  isToday
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {day}
              </span>

              <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                {dayEvents.slice(0, 2).map((ev) => {
                  const past = ev.date < today;
                  const bgColor = past
                    ? 'bg-slate-100 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600'
                    : `${EVENT_TYPE_MAP[ev.type].bg}`;
                  const textColor = past
                    ? 'text-slate-400 dark:text-slate-500'
                    : EVENT_TYPE_MAP[ev.type].color;
                  const dotColor = past
                    ? 'bg-slate-300 dark:bg-slate-600'
                    : EVENT_TYPE_MAP[ev.type].dot;
                  return (
                    <button
                      key={ev.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                      className={`w-full truncate text-[10px] font-medium px-1 py-0.5 rounded flex items-center gap-1 border ${bgColor} ${textColor} hover:opacity-80 transition-opacity`}
                    >
                      <span className={`w-1 h-1 rounded-full shrink-0 ${dotColor}`} />
                      <span className="truncate">{ev.title}</span>
                    </button>
                  );
                })}
                {dayEvents.length > 2 && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 px-1">
                    +{dayEvents.length - 2} mais
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
