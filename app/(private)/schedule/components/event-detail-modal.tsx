import { CalendarDays, Clock, Pencil, PawPrint, Trash2, User } from 'lucide-react';

import { Modal } from '@/app/components/modal';
import { Button } from '@/components/ui/button';
import { scheduleService } from '@/services/schedule.service';
import type { ScheduleEvent } from '@/types/schedule';
import { EVENT_TYPE_MAP } from '@/types/schedule';

interface EventDetailModalProps {
  event: ScheduleEvent;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (event: ScheduleEvent) => void;
}

export function EventDetailModal({ event, onClose, onDelete, onEdit }: EventDetailModalProps) {
  const typeInfo = EVENT_TYPE_MAP[event.type];

  function handleDelete() {
    scheduleService.delete(event.id);
    onDelete(event.id);
    onClose();
  }

  const rowCls = 'flex items-start gap-3 text-sm';
  const labelCls = 'text-slate-500 dark:text-slate-400 min-w-[80px]';
  const valueCls = 'text-slate-900 dark:text-white font-medium';

  const dateFormatted = new Date(`${event.date}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Modal title={event.title} onClose={onClose} maxWidth="md">
      <div className="flex flex-col gap-4">
        <span className={`inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-semibold border ${typeInfo.bg} ${typeInfo.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${typeInfo.dot}`} />
          {typeInfo.label}
        </span>

        <div className="flex flex-col gap-3">
          <div className={rowCls}>
            <CalendarDays size={16} className="text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className={labelCls}>Data</span>
              <p className={`${valueCls} capitalize`}>{dateFormatted}</p>
            </div>
          </div>

          <div className={rowCls}>
            <Clock size={16} className="text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className={labelCls}>Horário</span>
              <p className={valueCls}>
                {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
              </p>
            </div>
          </div>

          {event.patientName && (
            <div className={rowCls}>
              <PawPrint size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className={labelCls}>Paciente</span>
                <p className={valueCls}>{event.patientName}</p>
              </div>
            </div>
          )}

          {event.tutorName && (
            <div className={rowCls}>
              <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className={labelCls}>Tutor</span>
                <p className={valueCls}>{event.tutorName}</p>
              </div>
            </div>
          )}

          {event.description && (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
              {event.description}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
          <Button
            variant="ghost"
            onClick={handleDelete}
            className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
          >
            <Trash2 size={15} /> Excluir
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>Fechar</Button>
            <Button
              onClick={() => { onEdit(event); onClose(); }}
              className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600 gap-1.5"
            >
              <Pencil size={14} /> Editar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
