import type { ScheduleEvent } from '@/types/schedule';

const STORAGE_KEY = 'vetai_schedule_events';

function loadEvents(): ScheduleEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ScheduleEvent[]) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: ScheduleEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export const scheduleService = {
  list(): ScheduleEvent[] {
    return loadEvents();
  },

  listByDate(date: string): ScheduleEvent[] {
    return loadEvents().filter((e) => e.date === date);
  },

  create(data: Omit<ScheduleEvent, 'id'>): ScheduleEvent {
    const events = loadEvents();
    const event: ScheduleEvent = { ...data, id: crypto.randomUUID() };
    saveEvents([...events, event]);
    return event;
  },

  update(id: string, data: Partial<Omit<ScheduleEvent, 'id'>>): ScheduleEvent {
    const events = loadEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Evento não encontrado');
    events[idx] = { ...events[idx], ...data };
    saveEvents(events);
    return events[idx];
  },

  delete(id: string): void {
    const events = loadEvents().filter((e) => e.id !== id);
    saveEvents(events);
  },
};
