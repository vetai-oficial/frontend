'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CalendarCheck,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { EditHospitalizationModal } from './edit-hospitalization-modal';
import { HospitalizationSummary } from './hospitalization-summary';
import { StatusSelect } from './status-select';
import { VitalHistoryTable } from './vital-history-table';
import { VitalSignsModal } from './vital-signs-modal';
import { VitalSummaryCards } from './vital-summary-cards';
import { VitalsChart } from './vitals-chart';

import { ConfirmModal } from '@/app/components/confirm-modal';
import { SectionCard } from '@/app/components/section-card';
import { SelectInput } from '@/app/components/select-input';
import { Button } from '@/components/ui/button';
import {
  EVALUATION_LABELS,
  MONITORING_INTERVAL_OPTIONS,
  STATUS_LABELS,
  VITAL_DEFINITIONS,
  computePriority,
  computeVitalTrend,
  evaluateCadence,
  evaluateVital,
  formatDuration,
  formatRange,
  getVitalRange,
} from '@/constants';
import { monitoringService } from '@/services/monitoring.service';
import type {
  Hospitalization,
  HospitalizationStatus,
  VitalRecord,
} from '@/types/monitoring';

function formatDate(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MonitoringDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [hospitalization, setHospitalization] = useState<Hospitalization | null>(null);
  const [records, setRecords] = useState<VitalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDischarge, setShowDischarge] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [hosp, vitals] = await Promise.all([
        monitoringService.get(id),
        monitoringService.listVitals(id),
      ]);
      setHospitalization(hosp);
      setRecords(vitals);
    } catch {
      // erro já tratado via toast no httpClient
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleStatusChange = async (status: HospitalizationStatus) => {
    if (!hospitalization) return;
    setUpdatingStatus(true);
    try {
      const updated = await monitoringService.update(hospitalization.id, { status });
      setHospitalization(updated);
      toast.success(`Status atualizado para ${STATUS_LABELS[status]}`);
    } catch {
      // tratado no httpClient
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleIntervalChange = async (value: string) => {
    if (!hospitalization) return;
    setUpdatingStatus(true);
    try {
      const updated = await monitoringService.update(hospitalization.id, {
        monitoring_interval_minutes: Number(value),
      });
      setHospitalization(updated);
      toast.success('Frequência de aferição atualizada');
    } catch {
      // tratado no httpClient
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDischarge = async () => {
    if (!hospitalization) return;
    setActionLoading(true);
    try {
      const updated = await monitoringService.discharge(hospitalization.id);
      setHospitalization(updated);
      toast.success('Alta registrada com sucesso');
      setShowDischarge(false);
    } catch {
      // tratado no httpClient
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!hospitalization) return;
    setActionLoading(true);
    try {
      await monitoringService.delete(hospitalization.id);
      toast.success('Internação removida');
      router.push('/monitoring');
    } catch {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    );
  }

  if (!hospitalization) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 dark:text-slate-400">Internação não encontrada.</p>
        <Link href="/monitoring" className="text-teal-600 hover:underline text-sm mt-2 inline-block">
          Voltar ao monitoramento
        </Link>
      </div>
    );
  }

  const { patient } = hospitalization;
  const priority = computePriority(patient.specie, hospitalization.latest_vitals);

  const alerts: { tone: 'red' | 'amber'; text: string }[] = [];
  const cadence = evaluateCadence(
    hospitalization.monitoring_interval_minutes,
    hospitalization.latest_vitals?.measured_at,
  );
  if (cadence?.overdue) {
    alerts.push({
      tone: 'red',
      text: cadence.neverMeasured
        ? 'Nenhuma aferição registrada — registre os sinais vitais.'
        : `Aferição atrasada há ${formatDuration(Math.abs(cadence.minutesUntilDue ?? 0))}.`,
    });
  }
  for (const def of VITAL_DEFINITIONS) {
    let value: number | undefined;
    for (let i = records.length - 1; i >= 0; i--) {
      const candidate = records[i]?.[def.key];
      if (candidate !== undefined && candidate !== null) {
        value = candidate;
        break;
      }
    }
    if (value === undefined) continue;
    const evaluation = evaluateVital(patient.specie, def.key, value);
    const trend = computeVitalTrend(patient.specie, def.key, records);
    const range = getVitalRange(patient.specie, def.key);
    if (evaluation === 'high' || evaluation === 'low') {
      alerts.push({
        tone: 'red',
        text: `${def.label}: ${value} ${def.unit} — ${EVALUATION_LABELS[evaluation]} da faixa (${formatRange(range, def.unit)})${trend === 'worsening' ? ' e piorando' : ''}.`,
      });
    } else if (trend === 'worsening') {
      alerts.push({ tone: 'amber', text: `${def.label}: tendência de piora.` });
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/monitoring"
        className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
        <HospitalizationSummary
          hospitalization={hospitalization}
          priority={priority}
        />

        {hospitalization.reason && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {hospitalization.reason}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-700 pt-5 lg:flex-row lg:items-center lg:justify-end">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="w-full lg:w-52">
              <StatusSelect
                value={hospitalization.status}
                onChange={handleStatusChange}
                disabled={updatingStatus || !hospitalization.active}
              />
            </div>
            <div className="w-full lg:w-52">
              <SelectInput
                value={String(hospitalization.monitoring_interval_minutes ?? 0)}
                onChange={handleIntervalChange}
                options={MONITORING_INTERVAL_OPTIONS}
                disabled={updatingStatus || !hospitalization.active}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setShowVitalModal(true)}
              className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 dark:hover:bg-teal-800"
            >
              <Plus size={16} /> Registrar sinais
            </Button>
            <Button variant="outline" onClick={() => setShowEditModal(true)}>
              <Pencil size={16} /> Editar dados
            </Button>
            {hospitalization.active && (
              <Button variant="outline" onClick={() => setShowDischarge(true)}>
                <LogOut size={16} /> Dar alta
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDelete(true)}
              className="text-slate-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100 dark:border-slate-700 text-sm">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Status</p>
            <p className="font-medium text-slate-900 dark:text-white">
              {STATUS_LABELS[hospitalization.status]}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Entrada</p>
            <p className="font-medium text-slate-900 dark:text-white">
              {formatDate(hospitalization.admitted_at)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Alta</p>
            <p className="font-medium text-slate-900 dark:text-white">
              {formatDate(hospitalization.discharged_at)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Medições</p>
            <p className="font-medium text-slate-900 dark:text-white">{records.length}</p>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-red-700 dark:text-red-300">
            <AlertTriangle size={16} /> Alertas ({alerts.length})
          </div>
          <ul className="space-y-1">
            {alerts.map((alert, i) => (
              <li
                key={i}
                className={`text-sm flex items-start gap-2 ${
                  alert.tone === 'red'
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                <span className="mt-0.5">•</span>
                <span>{alert.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <CalendarCheck size={16} className="text-teal-600" /> Últimos sinais vitais
        </h3>
        <VitalSummaryCards specie={patient.specie} records={records} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Evolução ao longo do tempo
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {VITAL_DEFINITIONS.map((def) => (
            <VitalsChart
              key={def.key}
              specie={patient.specie}
              definition={def}
              records={records}
            />
          ))}
        </div>
      </div>

      <SectionCard
        title="Histórico de internação"
        subtitle="Todas as medições registradas — o histórico não pode ser alterado"
      >
        <VitalHistoryTable specie={patient.specie} records={records} />
      </SectionCard>

      {showVitalModal && (
        <VitalSignsModal
          hospitalizationId={hospitalization.id}
          specie={patient.specie}
          onClose={() => setShowVitalModal(false)}
          onSuccess={() => {
            setShowVitalModal(false);
            toast.success('Sinais vitais registrados');
            void loadData();
          }}
        />
      )}

      {showEditModal && (
        <EditHospitalizationModal
          hospitalization={hospitalization}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updated) => {
            setHospitalization(updated);
            setShowEditModal(false);
            toast.success('Dados da internação atualizados');
          }}
        />
      )}

      {showDischarge && (
        <ConfirmModal
          title="Dar alta ao paciente"
          description="Isso encerra a internação. O histórico permanece disponível para consulta."
          confirmLabel="Confirmar alta"
          variant="default"
          loading={actionLoading}
          onConfirm={handleDischarge}
          onClose={() => setShowDischarge(false)}
        />
      )}

      {showDelete && (
        <ConfirmModal
          title="Remover internação"
          description="Esta ação remove a internação e todo o seu histórico de sinais vitais. Não pode ser desfeita."
          confirmLabel="Remover"
          loading={actionLoading}
          onConfirm={handleDelete}
          onClose={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
