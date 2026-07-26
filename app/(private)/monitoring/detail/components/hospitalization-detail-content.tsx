'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRightLeft,
  Beaker,
  BedDouble,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileDown,
  Loader2,
  MessageSquarePlus,
  MoveRight,
  OctagonPause,
  PawPrint,
  Pencil,
  Pill,
  Plus,
  RotateCcw,
  Scale,
  Skull,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { ApplyTemplateModal } from '../../components/apply-template-modal';
import { ExecuteModal } from '../../components/execute-modal';
import { HospitalizeModal } from '../../components/hospitalize-modal';
import { PrescriptionModal } from '../../components/prescription-modal';
import {
  OccurrenceModal,
  ParametersModal,
  WeightModal,
} from '../../components/quick-add-modals';
import {
  daysSince,
  doseLabel,
  EVENT_TYPE_LABELS,
  fmtDate,
  fmtDateTime,
  FREQUENCY_LABELS,
  nowDateTimeLocal,
  PRESCRIPTION_TYPE_MAP,
  RISK_MAP,
  STATUS_MAP,
  toISO,
} from '../../utils';

import { ConfirmModal } from '@/app/components/common/confirm-modal';
import { Modal } from '@/app/components/common/modal';
import { SectionCard } from '@/app/components/data/section-card';
import { DateInput } from '@/app/components/forms/date-input';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SelectInput } from '@/app/components/forms/select-input';
import { TimeInput } from '@/app/components/forms/time-input';
import { Button } from '@/components/ui/button';
import { dischargeSchema, type DischargeFormData } from '@/schemas/monitoring';
import { monitoringService } from '@/services/monitoring.service';
import type {
  Box,
  Execution,
  Hospitalization,
  HospitalizationEvent,
  HospPrescription,
} from '@/types/monitoring';

type CloseAction = 'discharge' | 'decease' | 'cancel';

const CLOSE_ACTION_INFO: Record<
  CloseAction,
  { title: string; confirm: string; notesLabel: string }
> = {
  discharge: {
    title: 'Registrar Alta',
    confirm: 'Confirmar alta',
    notesLabel: 'Orientações da alta',
  },
  decease: {
    title: 'Registrar Óbito',
    confirm: 'Registrar óbito',
    notesLabel: 'Observações',
  },
  cancel: {
    title: 'Cancelar Internação',
    confirm: 'Cancelar internação',
    notesLabel: 'Motivo do cancelamento',
  },
};

function CloseActionModal({
  action,
  hospitalizationId,
  onClose,
  onSuccess,
}: {
  action: CloseAction;
  hospitalizationId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const info = CLOSE_ACTION_INFO[action];
  const now = nowDateTimeLocal();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DischargeFormData>({
    resolver: yupResolver(dischargeSchema) as Resolver<DischargeFormData>,
    defaultValues: { date: now.date, time: now.time, notes: '' },
  });

  const onSubmit = async (data: DischargeFormData) => {
    setSaving(true);
    try {
      const payload = {
        date: toISO(data.date, data.time),
        ...(data.notes ? { notes: data.notes } : {}),
      };
      if (action === 'discharge') {
        await monitoringService.discharge(hospitalizationId, payload);
      } else if (action === 'decease') {
        await monitoringService.decease(hospitalizationId, payload);
      } else {
        await monitoringService.cancel(hospitalizationId, {
          ...(data.notes ? { notes: data.notes } : {}),
        });
      }
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={info.title} onClose={onClose} maxWidth="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {action !== 'cancel' && (
          <div className="flex gap-3">
            <div className="flex-1">
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DateInput
                    label="Data"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.date?.message}
                  />
                )}
              />
            </div>
            <div className="w-32">
              <Controller
                name="time"
                control={control}
                render={({ field }) => (
                  <TimeInput
                    label="Hora"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.time?.message}
                  />
                )}
              />
            </div>
          </div>
        )}
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <FormTextarea
              label={info.notesLabel}
              rows={3}
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.notes?.message}
            />
          )}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Voltar
          </Button>
          <Button
            type="submit"
            loading={saving}
            className={
              action === 'discharge'
                ? 'bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }
          >
            {info.confirm}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function MoveBoxModal({
  hospitalization,
  onClose,
  onSuccess,
}: {
  hospitalization: Hospitalization;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [boxId, setBoxId] = useState(hospitalization.box?.id ?? '');

  useEffect(() => {
    void monitoringService
      .listBoxes()
      .then(setBoxes)
      .catch(() => undefined);
  }, []);

  const options = [
    { value: '', label: 'Sem box' },
    ...boxes
      .filter(
        (box) =>
          box.active &&
          (!box.occupied || box.id === hospitalization.box?.id),
      )
      .map((box) => ({ value: box.id, label: box.name })),
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await monitoringService.moveBox(hospitalization.id, boxId || null);
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Mover de Box" onClose={onClose} maxWidth="sm">
      <div className="space-y-4">
        <SelectInput
          label="Novo box"
          value={boxId}
          onChange={setBoxId}
          options={options}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={() => void handleSave()}
            loading={saving}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
          >
            Mover
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function RescheduleModal({
  prescription,
  onClose,
  onSuccess,
}: {
  prescription: HospPrescription;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const now = nowDateTimeLocal();
  const [date, setDate] = useState(now.date);
  const [time, setTime] = useState(now.time);
  const [intervalHours, setIntervalHours] = useState(
    prescription.interval_hours ? String(prescription.interval_hours) : '',
  );
  const [durationDays, setDurationDays] = useState(
    prescription.duration_days ? String(prescription.duration_days) : '',
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await monitoringService.reschedulePrescription(prescription.id, {
        start_at: toISO(date, time),
        ...(prescription.frequency === 'RECURRING'
          ? {
            interval_hours: Number(intervalHours),
            duration_days: Number(durationDays),
          }
          : {}),
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Interromper e Reprogramar"
      description={`As execuções pendentes de "${prescription.name}" serão canceladas e uma nova programação será criada.`}
      onClose={onClose}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <DateInput label="Novo início" required value={date} onChange={setDate} />
          </div>
          <div className="w-32">
            <TimeInput label="Hora" required value={time} onChange={setTime} />
          </div>
        </div>
        {prescription.frequency === 'RECURRING' && (
          <div className="grid grid-cols-2 gap-3">
            <InputWithLabel
              label="A cada (horas)"
              type="number"
              min="1"
              value={intervalHours}
              onChange={(e) => setIntervalHours(e.target.value)}
            />
            <InputWithLabel
              label="Durante (dias)"
              type="number"
              min="1"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
            />
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={() => void handleSave()}
            loading={saving}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
          >
            Reprogramar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function HospitalizationDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [hospitalization, setHospitalization] = useState<Hospitalization | null>(null);
  const [loading, setLoading] = useState(true);

  const [prescriptions, setPrescriptions] = useState<HospPrescription[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [events, setEvents] = useState<HospitalizationEvent[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [showMoveBox, setShowMoveBox] = useState(false);
  const [closeAction, setCloseAction] = useState<CloseAction | null>(null);
  const [showReopen, setShowReopen] = useState(false);
  const [reopenLoading, setReopenLoading] = useState(false);

  const [showPrescription, setShowPrescription] = useState(false);
  const [showApplyTemplate, setShowApplyTemplate] = useState(false);
  const [stopping, setStopping] = useState<HospPrescription | null>(null);
  const [stopLoading, setStopLoading] = useState(false);
  const [rescheduling, setRescheduling] = useState<HospPrescription | null>(null);
  const [deletingPrescription, setDeletingPrescription] =
    useState<HospPrescription | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [executingSOS, setExecutingSOS] = useState<HospPrescription | null>(null);

  const [quickAdd, setQuickAdd] = useState<'occurrence' | 'weight' | 'parameters' | null>(null);

  const fetchHospitalization = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setHospitalization(await monitoringService.getHospitalization(id));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchPrescriptions = useCallback(async () => {
    if (!id) return;
    setPrescriptionsLoading(true);
    try {
      const [prescriptionsData, executionsData] = await Promise.all([
        monitoringService.listPrescriptions(id),
        monitoringService.listExecutionsByHospitalization(id),
      ]);
      setPrescriptions(prescriptionsData);
      setExecutions(executionsData);
    } finally {
      setPrescriptionsLoading(false);
    }
  }, [id]);

  const fetchTimeline = useCallback(async () => {
    if (!id) return;
    setTimelineLoading(true);
    try {
      const response = await monitoringService.listEvents(id, { size: 50 });
      setEvents(response.data);
    } finally {
      setTimelineLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchHospitalization();
    void fetchPrescriptions();
    void fetchTimeline();
  }, [fetchHospitalization, fetchPrescriptions, fetchTimeline]);

  const executionStats = useMemo(() => {
    const stats = new Map<
      string,
      { done: number; total: number; nextPending?: string }
    >();
    for (const execution of executions) {
      const prescriptionId = execution.prescription?.id;
      if (!prescriptionId) continue;
      const entry = stats.get(prescriptionId) ?? { done: 0, total: 0 };
      if (execution.status !== 'CANCELLED') {
        entry.total += 1;
        if (execution.status === 'DONE') entry.done += 1;
        if (
          execution.status === 'PENDING' &&
          (!entry.nextPending ||
            execution.scheduled_at < entry.nextPending)
        ) {
          entry.nextPending = execution.scheduled_at;
        }
      }
      stats.set(prescriptionId, entry);
    }
    return stats;
  }, [executions]);

  const timelineItems = useMemo(() => {
    const items: Array<{
      key: string;
      date: string;
      icon: typeof PawPrint;
      iconClass: string;
      title: string;
      description?: string;
      user?: string;
    }> = [];

    for (const event of events) {
      const base = {
        key: `event-${event.id}`,
        date: event.date,
        ...(event.created_by?.name ? { user: event.created_by.name } : {}),
      };
      if (event.type === 'WEIGHT') {
        const data = event.data as { value?: number; unit?: string };
        items.push({
          ...base,
          icon: Scale,
          iconClass: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
          title: `Peso registrado: ${data.value ?? '—'} ${(data.unit ?? 'KG').toLowerCase()}`,
          ...(event.description ? { description: event.description } : {}),
        });
      } else if (event.type === 'CLINICAL_PARAMETERS') {
        const data = event.data as {
          values?: Array<{ name: string; value: string; unit?: string }>;
        };
        items.push({
          ...base,
          icon: Beaker,
          iconClass: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
          title: 'Parâmetros clínicos',
          description: (data.values ?? [])
            .map(
              (value) =>
                `${value.name}: ${value.value}${value.unit ? ` ${value.unit}` : ''}`,
            )
            .join(' · '),
        });
      } else if (event.type === 'OCCURRENCE') {
        items.push({
          ...base,
          icon: MessageSquarePlus,
          iconClass: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
          title: event.title ?? 'Ocorrência',
          ...(event.description ? { description: event.description } : {}),
        });
      } else {
        items.push({
          ...base,
          icon: event.type === 'BOX_CHANGE' ? ArrowRightLeft : CalendarClock,
          iconClass: 'text-slate-500 bg-slate-100 dark:bg-slate-700/50',
          title: event.title ?? EVENT_TYPE_LABELS[event.type],
          ...(event.description ? { description: event.description } : {}),
        });
      }
    }

    for (const execution of executions) {
      if (execution.status !== 'DONE' || !execution.executed_at) continue;
      items.push({
        key: `execution-${execution.id}`,
        date: execution.executed_at,
        icon: CheckCircle2,
        iconClass: 'text-green-500 bg-green-50 dark:bg-green-900/20',
        title: `Executado: ${execution.prescription?.name ?? ''}${
          doseLabel(execution.prescription) ? ` (${doseLabel(execution.prescription)})` : ''
        }`,
        ...(execution.notes ? { description: execution.notes } : {}),
        ...(execution.executed_by?.name ? { user: execution.executed_by.name } : {}),
      });
    }

    return items.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [events, executions]);

  if (!id) {
    return (
      <div className="text-center py-20 text-slate-500 dark:text-slate-400">
        Internação não encontrada.
      </div>
    );
  }

  if (loading || !hospitalization) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    );
  }

  const isActive =
    hospitalization.status === 'TRIAGE' ||
    hospitalization.status === 'HOSPITALIZED';
  const status = STATUS_MAP[hospitalization.status];
  const risk = RISK_MAP[hospitalization.risk];

  const refreshAll = () => {
    void fetchHospitalization();
    void fetchPrescriptions();
    void fetchTimeline();
  };

  const handleReopen = async () => {
    setReopenLoading(true);
    try {
      await monitoringService.reopen(hospitalization.id);
      setShowReopen(false);
      refreshAll();
    } finally {
      setReopenLoading(false);
    }
  };

  const handleStop = async () => {
    if (!stopping) return;
    setStopLoading(true);
    try {
      await monitoringService.stopPrescription(stopping.id);
      setStopping(null);
      void fetchPrescriptions();
    } finally {
      setStopLoading(false);
    }
  };

  const handleDeletePrescription = async () => {
    if (!deletingPrescription) return;
    setDeleteLoading(true);
    try {
      await monitoringService.deletePrescription(deletingPrescription.id);
      setDeletingPrescription(null);
      void fetchPrescriptions();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <button
              type="button"
              onClick={() => router.push('/monitoring')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0 mt-1"
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 shrink-0">
              <PawPrint size={28} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/patients/detail?id=${hospitalization.patient?.id}`}
                  className="text-xl font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400"
                >
                  {hospitalization.patient?.name}
                </Link>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.badge}`}>
                  {status.label}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${risk.badge}`}>
                  {risk.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-slate-400" />
                  {hospitalization.veterinarian?.name ?? '—'}
                </span>
                <span className="flex items-center gap-1.5">
                  <BedDouble size={14} className="text-slate-400" />
                  {hospitalization.box?.name ?? 'Sem box'}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarClock size={14} className="text-slate-400" />
                  Entrada {fmtDateTime(hospitalization.admitted_at)} (
                  {daysSince(hospitalization.admitted_at)} dia
                  {daysSince(hospitalization.admitted_at) === 1 ? '' : 's'})
                </span>
                {hospitalization.expected_discharge_at && isActive && (
                  <span className="flex items-center gap-1.5">
                    <MoveRight size={14} className="text-slate-400" />
                    Alta prevista {fmtDate(hospitalization.expected_discharge_at)}
                  </span>
                )}
                {hospitalization.discharged_at && (
                  <span className="flex items-center gap-1.5">
                    <MoveRight size={14} className="text-slate-400" />
                    Saída {fmtDateTime(hospitalization.discharged_at)}
                  </span>
                )}
              </div>
              {hospitalization.allergies.length > 0 && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                  {hospitalization.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {isActive ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
                  <Pencil size={14} />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowMoveBox(true)}>
                  <ArrowRightLeft size={14} />
                  Mover box
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCloseAction('discharge')}
                  className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
                >
                  <FileDown size={14} />
                  Registrar alta
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCloseAction('decease')}
                  className="text-slate-600 dark:text-slate-300"
                >
                  <Skull size={14} />
                  Óbito
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCloseAction('cancel')}
                  className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReopen(true)}
              >
                <RotateCcw size={14} />
                Reabrir internação
              </Button>
            )}
          </div>
        </div>

        {(hospitalization.complaint ||
          hospitalization.diagnosis ||
          hospitalization.prognosis ||
          hospitalization.accessories ||
          hospitalization.observations ||
          hospitalization.discharge_notes) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-sm">
            {hospitalization.complaint && (
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Queixa</p>
                <p className="text-slate-700 dark:text-slate-200">{hospitalization.complaint}</p>
              </div>
            )}
            {hospitalization.diagnosis && (
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Diagnóstico</p>
                <p className="text-slate-700 dark:text-slate-200">{hospitalization.diagnosis}</p>
              </div>
            )}
            {hospitalization.prognosis && (
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Prognóstico</p>
                <p className="text-slate-700 dark:text-slate-200">{hospitalization.prognosis}</p>
              </div>
            )}
            {hospitalization.accessories && (
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Acessórios</p>
                <p className="text-slate-700 dark:text-slate-200">{hospitalization.accessories}</p>
              </div>
            )}
            {hospitalization.observations && (
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Observações</p>
                <p className="text-slate-700 dark:text-slate-200">{hospitalization.observations}</p>
              </div>
            )}
            {hospitalization.discharge_notes && (
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Notas do encerramento</p>
                <p className="text-slate-700 dark:text-slate-200">{hospitalization.discharge_notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <SectionCard
        title="Prescrição Médica"
        subtitle="Medicamentos, procedimentos e fluidoterapias programados"
        headerAction={
          isActive ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApplyTemplate(true)}
              >
                <ClipboardList size={14} />
                Carregar de modelo
              </Button>
              <Button
                size="sm"
                onClick={() => setShowPrescription(true)}
                className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
              >
                <Plus size={14} />
                Prescrição
              </Button>
            </div>
          ) : undefined
        }
      >
        {prescriptionsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-teal-600" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-8">
            <Pill size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Nenhuma prescrição registrada
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {prescriptions.map((prescription) => {
              const stats = executionStats.get(prescription.id);
              const typeInfo = PRESCRIPTION_TYPE_MAP[prescription.type];
              return (
                <div
                  key={prescription.id}
                  className={`p-3 rounded-lg border border-slate-200 dark:border-slate-700 ${
                    prescription.status === 'STOPPED' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {prescription.name}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeInfo.badge}`}>
                          {typeInfo.label}
                        </span>
                        {prescription.status === 'STOPPED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                            Interrompida
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {FREQUENCY_LABELS[prescription.frequency]}
                        {prescription.frequency === 'RECURRING'
                          ? ` · a cada ${prescription.interval_hours}h por ${prescription.duration_days} dia(s)`
                          : ''}
                        {doseLabel(prescription) ? ` · ${doseLabel(prescription)}` : ''}
                        {prescription.frequency !== 'AS_NEEDED'
                          ? ` · início ${fmtDateTime(prescription.start_at)}`
                          : ''}
                      </p>
                      {stats && stats.total > 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-green-500" />
                          {stats.done}/{stats.total} execuções concluídas
                          {stats.nextPending
                            ? ` · próxima ${fmtDateTime(stats.nextPending)}`
                            : ''}
                        </p>
                      )}
                      {prescription.notes && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">
                          {prescription.notes}
                        </p>
                      )}
                    </div>
                    {isActive && (
                      <div className="flex gap-1 shrink-0">
                        {prescription.frequency === 'AS_NEEDED' &&
                          prescription.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            onClick={() => setExecutingSOS(prescription)}
                            disabled={hospitalization.status === 'TRIAGE'}
                            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
                            title={
                              hospitalization.status === 'TRIAGE'
                                ? 'Disponível quando o paciente estiver Internado'
                                : 'Registrar aplicação SOS'
                            }
                          >
                              Executar SOS
                          </Button>
                        )}
                        {prescription.status === 'ACTIVE' &&
                          prescription.frequency !== 'AS_NEEDED' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setRescheduling(prescription)}
                              title="Interromper e reprogramar"
                            >
                              <Clock size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setStopping(prescription)}
                              title="Interromper"
                              className="text-amber-600 hover:text-amber-700"
                            >
                              <OctagonPause size={14} />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeletingPrescription(prescription)}
                          title="Excluir (apenas se nunca executada)"
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Histórico da Internação"
        subtitle="Execuções, ocorrências, pesos e parâmetros em ordem cronológica"
        headerAction={
          isActive ? (
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setQuickAdd('occurrence')}>
                <MessageSquarePlus size={14} />
                Ocorrência
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickAdd('weight')}>
                <Scale size={14} />
                Peso
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickAdd('parameters')}>
                <Beaker size={14} />
                Parâmetros
              </Button>
            </div>
          ) : undefined
        }
      >
        {timelineLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-teal-600" />
          </div>
        ) : timelineItems.length === 0 ? (
          <div className="text-center py-8">
            <CalendarClock size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Nenhum registro ainda
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {timelineItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex gap-3 py-2">
                  <div className={`p-1.5 rounded-lg h-fit shrink-0 ${item.iconClass}`}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-800 dark:text-slate-100 font-medium">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.description}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {fmtDateTime(item.date)}
                      {item.user ? ` · ${item.user}` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {showEdit && (
        <HospitalizeModal
          hospitalization={hospitalization}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            refreshAll();
          }}
        />
      )}
      {showMoveBox && (
        <MoveBoxModal
          hospitalization={hospitalization}
          onClose={() => setShowMoveBox(false)}
          onSuccess={() => {
            setShowMoveBox(false);
            refreshAll();
          }}
        />
      )}
      {closeAction && (
        <CloseActionModal
          action={closeAction}
          hospitalizationId={hospitalization.id}
          onClose={() => setCloseAction(null)}
          onSuccess={() => {
            setCloseAction(null);
            refreshAll();
          }}
        />
      )}
      {showReopen && (
        <ConfirmModal
          title="Reabrir internação"
          description="A internação voltará para a situação Internado. Deseja continuar?"
          confirmLabel="Reabrir"
          variant="default"
          loading={reopenLoading}
          onConfirm={() => void handleReopen()}
          onClose={() => setShowReopen(false)}
        />
      )}
      {showPrescription && (
        <PrescriptionModal
          hospitalizationId={hospitalization.id}
          patientName={hospitalization.patient?.name}
          onClose={() => setShowPrescription(false)}
          onSuccess={() => {
            setShowPrescription(false);
            void fetchPrescriptions();
          }}
        />
      )}
      {showApplyTemplate && (
        <ApplyTemplateModal
          hospitalizationId={hospitalization.id}
          patientName={hospitalization.patient?.name}
          onClose={() => setShowApplyTemplate(false)}
          onSuccess={() => {
            setShowApplyTemplate(false);
            void fetchPrescriptions();
          }}
        />
      )}
      {stopping && (
        <ConfirmModal
          title="Interromper prescrição"
          description={`As execuções pendentes de "${stopping.name}" serão canceladas. Deseja continuar?`}
          confirmLabel="Interromper"
          variant="danger"
          loading={stopLoading}
          onConfirm={() => void handleStop()}
          onClose={() => setStopping(null)}
        />
      )}
      {rescheduling && (
        <RescheduleModal
          prescription={rescheduling}
          onClose={() => setRescheduling(null)}
          onSuccess={() => {
            setRescheduling(null);
            void fetchPrescriptions();
          }}
        />
      )}
      {deletingPrescription && (
        <ConfirmModal
          title="Excluir prescrição"
          description={`Tem certeza que deseja excluir "${deletingPrescription.name}"? Só é possível excluir prescrições que nunca foram executadas.`}
          confirmLabel="Excluir"
          variant="danger"
          loading={deleteLoading}
          onConfirm={() => void handleDeletePrescription()}
          onClose={() => setDeletingPrescription(null)}
        />
      )}
      {executingSOS && (
        <ExecuteModal
          prescription={executingSOS}
          patientName={hospitalization.patient?.name}
          onClose={() => setExecutingSOS(null)}
          onSuccess={() => {
            setExecutingSOS(null);
            void fetchPrescriptions();
            void fetchTimeline();
          }}
        />
      )}
      {quickAdd === 'occurrence' && (
        <OccurrenceModal
          hospitalizationId={hospitalization.id}
          patientName={hospitalization.patient?.name}
          onClose={() => setQuickAdd(null)}
          onSuccess={() => {
            setQuickAdd(null);
            void fetchTimeline();
          }}
        />
      )}
      {quickAdd === 'weight' && (
        <WeightModal
          hospitalizationId={hospitalization.id}
          patientName={hospitalization.patient?.name}
          onClose={() => setQuickAdd(null)}
          onSuccess={() => {
            setQuickAdd(null);
            void fetchTimeline();
          }}
        />
      )}
      {quickAdd === 'parameters' && (
        <ParametersModal
          hospitalizationId={hospitalization.id}
          patientName={hospitalization.patient?.name}
          onClose={() => setQuickAdd(null)}
          onSuccess={() => {
            setQuickAdd(null);
            void fetchTimeline();
          }}
        />
      )}
    </div>
  );
}
