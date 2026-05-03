'use client';

import { CalendarDays, ChevronLeft, ChevronRight, LayoutGrid, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AddEventModal } from './components/add-event-modal';
import { Calendar } from './components/calendar';
import { EventDetailModal } from './components/event-detail-modal';
import { ScheduleSettings, loadScheduleSettings } from './components/schedule-settings';
import type { ScheduleSettingsState } from './components/schedule-settings';
import { TodayEventsList } from './components/today-events-list';
import { WeekCalendar } from './components/week-calendar';
import { MONTH_NAMES, toLocalDateStr } from './utils';

import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { scheduleService } from '@/services/schedule.service';
import type { ScheduleEvent } from '@/types/schedule';

type ViewMode = 'month' | 'week';

function getWeekStart(dateStr: string): Date {
  const [y = 0, m = 0, d = 0] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfWeek = date.getDay(); // 0 = Sunday
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - dayOfWeek);
  return sunday;
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  const startMonth = MONTH_NAMES[weekStart.getMonth()];
  const endMonth = MONTH_NAMES[weekEnd.getMonth()];
  const year = weekEnd.getFullYear();

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${startDay} – ${endDay} de ${startMonth} ${year}`;
  }
  return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`;
}

export default function SchedulePage() {
  const todayStr = toLocalDateStr(new Date());
  const now = new Date();

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettingsState>(() => loadScheduleSettings());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(todayStr));
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [detailEvent, setDetailEvent] = useState<ScheduleEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addInitialDate, setAddInitialDate] = useState<string | undefined>(undefined);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const nextEvents = await scheduleService.list({ size: 500, sort: 'date', direction: 'asc' });
      setEvents(nextEvents);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  function prevPeriod() {
    if (viewMode === 'month') {
      if (currentMonth === 0) { setCurrentYear((y) => y - 1); setCurrentMonth(11); }
      else setCurrentMonth((m) => m - 1);
    } else {
      setWeekStart((ws) => {
        const prev = new Date(ws);
        prev.setDate(ws.getDate() - 7);
        return prev;
      });
    }
  }

  function nextPeriod() {
    if (viewMode === 'month') {
      if (currentMonth === 11) { setCurrentYear((y) => y + 1); setCurrentMonth(0); }
      else setCurrentMonth((m) => m + 1);
    } else {
      setWeekStart((ws) => {
        const next = new Date(ws);
        next.setDate(ws.getDate() + 7);
        return next;
      });
    }
  }

  function handleSwitchView(mode: ViewMode) {
    if (mode === 'week') {
      setWeekStart(getWeekStart(selectedDate));
    }
    setViewMode(mode);
  }

  function handleAddClick(date?: string) {
    setAddInitialDate(date ?? selectedDate);
    setShowAddModal(true);
  }

  async function handleEventSaved() {
    await loadEvents();
    setShowAddModal(false);
    setEditingEvent(null);
  }

  async function handleEventDeleted() {
    await loadEvents();
  }

  const selectedEvents = events.filter((e) => e.date === selectedDate);

  const periodLabel = viewMode === 'month'
    ? `${MONTH_NAMES[currentMonth]} ${currentYear}`
    : formatWeekRange(weekStart);

  return (
    <main className="flex min-h-screen flex-col items-start gap-4">
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
          <Header title="Agendamentos" showStorage={false} />

          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow p-4 sm:p-6">
              <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevPeriod}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" />
                  </button>

                  <h2 className="text-base font-bold text-slate-900 dark:text-white min-w-40 text-center">
                    {periodLabel}
                  </h2>

                  <button
                    onClick={nextPeriod}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronRight size={18} className="text-slate-600 dark:text-slate-300" />
                  </button>
                </div>

                <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                  <button
                    onClick={() => handleSwitchView('month')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                      viewMode === 'month'
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <LayoutGrid size={13} />
                    Mês
                  </button>
                  <button
                    onClick={() => handleSwitchView('week')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-slate-200 dark:border-slate-700 ${
                      viewMode === 'week'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <CalendarDays size={13} />
                    Semana
                  </button>
                </div>
              </div>

              {viewMode === 'month' ? (
                <Calendar
                  year={currentYear}
                  month={currentMonth}
                  events={loadingEvents ? [] : events}
                  selectedDate={selectedDate}
                  today={todayStr}
                  onSelectDate={setSelectedDate}
                  onEventClick={setDetailEvent}
                />
              ) : (
                <WeekCalendar
                  weekStart={weekStart}
                  events={loadingEvents ? [] : events}
                  today={todayStr}
                  startHour={scheduleSettings.weekStartHour}
                  endHour={scheduleSettings.weekEndHour}
                  onEventClick={setDetailEvent}
                />
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  disabled={loadingEvents}
                  onClick={() => handleAddClick(selectedDate)}
                  className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600 gap-1.5"
                >
                  <Plus size={16} /> Novo evento
                </Button>
              </div>
            </div>

            <div className="w-full xl:w-80 bg-white dark:bg-slate-800 rounded-xl shadow p-4 sm:p-6 xl:h-fit xl:sticky xl:top-6">
              <TodayEventsList
                date={selectedDate}
                events={loadingEvents ? [] : selectedEvents}
                onEventClick={setDetailEvent}
                onAddClick={() => handleAddClick(selectedDate)}
              />
              <ScheduleSettings
                settings={scheduleSettings}
                onChange={setScheduleSettings}
              />
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddEventModal
          initialDate={addInitialDate}
          onClose={() => setShowAddModal(false)}
          onSave={handleEventSaved}
          minHour={scheduleSettings.weekStartHour}
          maxHour={scheduleSettings.weekEndHour}
        />
      )}

      {editingEvent && (
        <AddEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={handleEventSaved}
          minHour={scheduleSettings.weekStartHour}
          maxHour={scheduleSettings.weekEndHour}
        />
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onDelete={handleEventDeleted}
          onEdit={(ev) => setEditingEvent(ev)}
        />
      )}
    </main>
  );
}
