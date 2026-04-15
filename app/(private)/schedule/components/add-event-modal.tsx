'use client';

import { Check, ChevronDown, PawPrint, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { toLocalDateStr } from '../utils';

import { Modal } from '@/app/components/modal';
import { Button } from '@/components/ui/button';
import { patientsService } from '@/services/patients.service';
import { scheduleService } from '@/services/schedule.service';
import { tutorsService } from '@/services/tutors.service';
import type { Patient } from '@/types/patient';
import type { EventType, ScheduleEvent } from '@/types/schedule';
import { EVENT_TYPE_MAP } from '@/types/schedule';
import type { Tutor } from '@/types/tutor';

function toInternalDate(display: string): string {
  // dd/mm/YYYY → YYYY-MM-DD
  const parts = display.split('/');
  if (parts.length !== 3 || (parts[2] ?? '').length !== 4) return '';
  return `${parts[2]}-${String(parts[1]).padStart(2, '0')}-${String(parts[0]).padStart(2, '0')}`;
}

function toDisplayDate(internal: string): string {
  // YYYY-MM-DD → dd/mm/YYYY
  if (!internal) return '';
  const [y, m, d] = internal.split('-');
  return `${d}/${m}/${y}`;
}

function maskDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

interface ComboBoxItem { id: string; label: string; sub?: string }

interface ComboBoxProps {
  placeholder: string;
  icon: React.ReactNode;
  value: ComboBoxItem | null;
  inputValue: string;
  onInputChange: (v: string) => void;
  results: ComboBoxItem[];
  loading: boolean;
  onSelect: (item: ComboBoxItem) => void;
  onClear: () => void;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  inputCls: string;
}

function ComboBox({
  placeholder, icon, value, inputValue, onInputChange, results, loading,
  onSelect, onClear, open, onOpenChange, inputCls,
}: ComboBoxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpenChange(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onOpenChange]);

  return (
    <div ref={ref} className="relative">
      {value ? (
        <div className="flex items-center gap-2 w-full rounded-lg border border-teal-400 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/20 px-3 py-2">
          <span className="text-teal-600 dark:text-teal-400 shrink-0">{icon}</span>
          <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white truncate">{value.label}</span>
          {value.sub && <span className="text-xs text-slate-500 dark:text-slate-400 truncate shrink-0">{value.sub}</span>}
          <button type="button" onClick={onClear} className="shrink-0 text-slate-400 hover:text-red-500 transition-colors">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</span>
          <input
            className={`${inputCls} pl-8 pr-8`}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => { onInputChange(e.target.value); onOpenChange(true); }}
            onFocus={() => onOpenChange(true)}
          />
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      )}

      {open && !value && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-slate-400 px-3 py-2">Buscando...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-slate-400 px-3 py-2">
              {inputValue.length < 2 ? 'Digite para buscar…' : 'Nenhum resultado'}
            </p>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onSelect(r); onOpenChange(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Check size={12} className="text-teal-500 opacity-0 group-hover:opacity-100" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white truncate">{r.label}</p>
                  {r.sub && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{r.sub}</p>}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface EventFormState {
  title: string;
  description: string;
  dateDisplay: string; // dd/mm/YYYY
  startTime: string;
  endTime: string;
  type: EventType;
}

interface AddEventModalProps {
  initialDate?: string; // YYYY-MM-DD
  event?: ScheduleEvent; // if provided → edit mode
  onClose: () => void;
  onSave: (event: ScheduleEvent) => void;
}

export function AddEventModal({ initialDate, event: editingEvent, onClose, onSave }: AddEventModalProps) {
  const isEditing = !!editingEvent;

  const [form, setForm] = useState<EventFormState>({
    title: editingEvent?.title ?? '',
    description: editingEvent?.description ?? '',
    dateDisplay: toDisplayDate(editingEvent?.date ?? initialDate ?? toLocalDateStr(new Date())),
    startTime: editingEvent?.startTime ?? '',
    endTime: editingEvent?.endTime ?? '',
    type: editingEvent?.type ?? 'consultation',
  });
  const [error, setError] = useState('');

  // Patient combobox
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState<ComboBoxItem[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientOpen, setPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<ComboBoxItem | null>(
    editingEvent?.patientName ? { id: editingEvent.patientName, label: editingEvent.patientName } : null,
  );

  // Tutor combobox
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorResults, setTutorResults] = useState<ComboBoxItem[]>([]);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<ComboBoxItem | null>(
    editingEvent?.tutorName ? { id: editingEvent.tutorName, label: editingEvent.tutorName } : null,
  );

  // Debounced patient search
  useEffect(() => {
    if (patientQuery.length < 2) { setPatientResults([]); return; }
    setPatientLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await patientsService.list({ search: patientQuery, size: 8 });
        setPatientResults(res.data.map((p: Patient) => ({ id: p.id, label: p.name, sub: p.breed ?? undefined, _tutor_id: p.tutor_id } as ComboBoxItem & { _tutor_id: string })));
      } catch { /* silently */ } finally { setPatientLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [patientQuery]);

  // Debounced tutor search
  useEffect(() => {
    if (tutorQuery.length < 2) { setTutorResults([]); return; }
    setTutorLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await tutorsService.list({ search: tutorQuery, size: 8 });
        setTutorResults(res.data.map((t: Tutor) => ({ id: t.id, label: t.name, sub: t.phone ?? t.email ?? undefined })));
      } catch { /* silently */ } finally { setTutorLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [tutorQuery]);

  async function handleSelectPatient(item: ComboBoxItem) {
    setSelectedPatient(item);
    setPatientQuery('');
    // Auto-fill tutor from patient
    const tutorId = (item as ComboBoxItem & { _tutor_id?: string })._tutor_id;
    if (tutorId && !selectedTutor) {
      try {
        const tutor = await tutorsService.get(tutorId);
        setSelectedTutor({ id: tutor.id, label: tutor.name, sub: tutor.phone ?? tutor.email ?? undefined });
      } catch { /* silently */ }
    }
  }

  function handleClearPatient() {
    setSelectedPatient(null);
    setPatientQuery('');
    setPatientResults([]);
  }

  function handleSelectTutor(item: ComboBoxItem) {
    setSelectedTutor(item);
    setTutorQuery('');
  }

  function handleClearTutor() {
    setSelectedTutor(null);
    setTutorQuery('');
    setTutorResults([]);
  }

  function set(field: keyof EventFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleDateChange(raw: string) {
    set('dateDisplay', maskDateInput(raw));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('O título é obrigatório.'); return; }
    const internalDate = toInternalDate(form.dateDisplay);
    if (!internalDate) { setError('Data inválida. Use o formato dd/mm/aaaa.'); return; }
    if (!form.startTime) { setError('O horário de início é obrigatório.'); return; }
    setError('');

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      date: internalDate,
      startTime: form.startTime,
      endTime: form.endTime || undefined,
      type: form.type,
      patientName: selectedPatient?.label.trim() || undefined,
      tutorName: selectedTutor?.label.trim() || undefined,
    };

    const saved = isEditing
      ? scheduleService.update(editingEvent.id, payload)
      : scheduleService.create(payload);

    onSave(saved);
  }

  const inputCls =
    'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500';
  const labelCls = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';

  return (
    <Modal title={isEditing ? 'Editar Evento' : 'Novo Evento'} description="Preencha os dados do agendamento" onClose={onClose} maxWidth="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <div>
          <label className={labelCls}>Título *</label>
          <input
            className={inputCls}
            placeholder="Ex: Consulta de rotina"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Data *</label>
            <input
              className={inputCls}
              placeholder="dd/mm/aaaa"
              value={form.dateDisplay}
              onChange={(e) => handleDateChange(e.target.value)}
              inputMode="numeric"
              maxLength={10}
            />
          </div>
          <div>
            <label className={labelCls}>Tipo</label>
            <select
              className={inputCls}
              value={form.type}
              onChange={(e) => set('type', e.target.value as EventType)}
            >
              {(Object.keys(EVENT_TYPE_MAP) as EventType[]).map((t) => (
                <option key={t} value={t}>{EVENT_TYPE_MAP[t].label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Horário início *</label>
            <input
              type="time"
              className={inputCls}
              value={form.startTime}
              onChange={(e) => set('startTime', e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Horário fim</label>
            <input
              type="time"
              className={inputCls}
              value={form.endTime}
              onChange={(e) => set('endTime', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Paciente</label>
          <ComboBox
            placeholder="Buscar paciente…"
            icon={<PawPrint size={14} />}
            value={selectedPatient}
            inputValue={patientQuery}
            onInputChange={setPatientQuery}
            results={patientResults}
            loading={patientLoading}
            onSelect={handleSelectPatient}
            onClear={handleClearPatient}
            open={patientOpen}
            onOpenChange={setPatientOpen}
            inputCls={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Tutor</label>
          <ComboBox
            placeholder="Buscar tutor…"
            icon={<User size={14} />}
            value={selectedTutor}
            inputValue={tutorQuery}
            onInputChange={setTutorQuery}
            results={tutorResults}
            loading={tutorLoading}
            onSelect={handleSelectTutor}
            onClear={handleClearTutor}
            open={tutorOpen}
            onOpenChange={setTutorOpen}
            inputCls={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Descrição</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            placeholder="Observações adicionais…"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600">
            {isEditing ? 'Salvar alterações' : 'Salvar evento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
