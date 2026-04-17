import { CalendarX, PawPrint, Plus, User } from 'lucide-react';

import type { ScheduleEvent } from '@/types/schedule';
import { EVENT_TYPE_MAP } from '@/types/schedule';

interface TodayEventsListProps {
  date: string;
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
  onAddClick: () => void;
}

export function TodayEventsList({ date, events, onEventClick, onAddClick }: TodayEventsListProps) {
  const sorted = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const dateFormatted = new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white capitalize">{dateFormatted}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {sorted.length === 0 ? 'Nenhum evento' : `${sorted.length} evento${sorted.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-10 text-center">
          <CalendarX size={36} className="text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Sem eventos para este dia.</p>
          <button
            onClick={onAddClick}
            className="mt-3 text-sm text-teal-600 dark:text-teal-400 hover:underline font-medium"
          >
            Agendar evento
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {sorted.map((ev) => {
            const typeInfo = EVENT_TYPE_MAP[ev.type];
            return (
              <button
                key={ev.id}
                onClick={() => onEventClick(ev)}
                className={`w-full text-left rounded-lg border p-3 transition-all hover:shadow-sm ${typeInfo.bg}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${typeInfo.dot}`} />
                    <p className={`text-sm font-semibold truncate ${typeInfo.color}`}>{ev.title}</p>
                  </div>
                  <span className={`text-xs shrink-0 font-medium ${typeInfo.color}`}>
                    {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
                  </span>
                </div>
                {(ev.patientName ?? ev.tutorName) && (
                  <div className="flex flex-col gap-0.5 mt-1.5 pl-4">
                    {ev.patientName && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <PawPrint size={11} /> {ev.patientName}
                      </div>
                    )}
                    {ev.tutorName && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <User size={11} /> {ev.tutorName}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
