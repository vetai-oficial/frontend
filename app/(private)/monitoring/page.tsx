'use client';

import { Activity, AlertTriangle, Loader2, Plus, Printer, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AddPetModal } from './components/add-pet-modal';
import { BoardCard } from './components/board-card';

import { Header } from '@/app/components/header';
import { Button } from '@/components/ui/button';
import {
  SECTOR_LABELS,
  SECTOR_ORDER,
  STATUS_LABELS,
  computePriority,
  evaluateCadence,
} from '@/constants';
import { monitoringService } from '@/services/monitoring.service';
import type {
  Hospitalization,
  HospitalizationSector,
  HospitalizationStatus,
} from '@/types/monitoring';

type StatusFilter = 'ALL' | HospitalizationStatus;

// Pontuação de severidade para ordenar/priorizar o painel de atenção.
function severityScore(hospitalization: Hospitalization): number {
  const priority = computePriority(
    hospitalization.patient.specie,
    hospitalization.latest_vitals,
  );
  const cadence = evaluateCadence(
    hospitalization.monitoring_interval_minutes,
    hospitalization.latest_vitals?.measured_at,
  );
  let score = 0;
  if (priority === 'critical') score += 100;
  else if (priority === 'attention') score += 50;
  if (cadence?.overdue) score += 30;
  return score;
}

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'UNSTABLE', label: STATUS_LABELS.UNSTABLE },
  { value: 'AWAITING_TUTOR', label: STATUS_LABELS.AWAITING_TUTOR },
  { value: 'STABLE', label: STATUS_LABELS.STABLE },
];

export default function MonitoringPage() {
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [active, setActive] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await monitoringService.list({
        active,
        size: 50,
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
      });
      setHospitalizations(response.data);
    } catch {
      // tratado no httpClient
    } finally {
      setLoading(false);
    }
  }, [active, statusFilter]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Mantém o painel atualizado (recalcula prioridade e aferições atrasadas).
  useEffect(() => {
    const timer = setInterval(() => void fetchData(), 60000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const handleAddSuccess = (hospitalization: Hospitalization) => {
    setShowAddModal(false);
    toast.success('Pet adicionado ao monitoramento');
    if (active) {
      setHospitalizations((prev) => [hospitalization, ...prev]);
    }
  };

  const sorted = [...hospitalizations].sort(
    (a, b) => severityScore(b) - severityScore(a),
  );
  const groups = SECTOR_ORDER.map((sector) => ({
    sector,
    items: sorted.filter((h) => (h.sector ?? 'INPATIENT') === sector),
  })).filter((group) => group.items.length > 0);
  const attentionCount = hospitalizations.filter(
    (h) => severityScore(h) > 0,
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Animais internados" showStorage={false} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-teal-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-400'
                }`}
              >
                {filter.label}
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
            <button
              onClick={() => setActive((prev) => !prev)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                active
                  ? 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-400'
                  : 'bg-slate-700 text-white'
              }`}
            >
              {active ? 'Internados' : 'Com alta'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => void fetchData()}
              disabled={loading}
              title="Atualizar painel"
              aria-label="Atualizar painel"
            >
              <RotateCcw size={16} className={loading ? 'animate-spin' : ''} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.print()}
              title="Imprimir painel"
              aria-label="Imprimir painel"
            >
              <Printer size={16} />
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-600 dark:bg-teal-700 h-10 text-white hover:bg-teal-700 dark:hover:bg-teal-800"
            >
              <Plus size={18} /> Adicionar Pet
            </Button>
          </div>
        </div>

        {active && attentionCount > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle size={16} className="shrink-0" />
            <span>
              <strong>{attentionCount}</strong>{' '}
              {attentionCount === 1
                ? 'paciente precisa'
                : 'pacientes precisam'}{' '}
              de atenção (estado crítico ou aferição atrasada).
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-teal-600" />
          </div>
        ) : hospitalizations.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-12 text-center">
            <Activity size={36} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {active
                ? 'Nenhum pet em monitoramento. Adicione um paciente para começar.'
                : 'Nenhuma internação encerrada encontrada.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <SectorSection
                key={group.sector}
                sector={group.sector}
                items={group.items}
              />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddPetModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
}

function SectorSection({
  sector,
  items,
}: {
  sector: HospitalizationSector;
  items: Hospitalization[];
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-medium text-slate-600 dark:text-slate-300">
        {SECTOR_LABELS[sector]}
        <span className="ml-2 text-sm text-slate-400 dark:text-slate-500">
          ({items.length})
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {items.map((hospitalization) => (
          <BoardCard key={hospitalization.id} hospitalization={hospitalization} />
        ))}
      </div>
    </section>
  );
}
