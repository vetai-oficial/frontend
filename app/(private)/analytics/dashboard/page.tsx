'use client';

import { CalendarCheck, Microscope, PawPrint, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/app/components/badge';
import { Card } from '@/app/components/card';
import { DataTable } from '@/app/components/data-table';
import { SectionCard } from '@/app/components/section-card';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { MetricCard } from '@/components/MetricCard';
import { Button } from '@/components/ui/button';
import { SPECIE_LABELS, STUDY_STATUS_MAP } from '@/constants';
import { cn } from '@/infra/utils';
import type { DashboardData } from '@/services/analytics.service';
import { analyticsService } from '@/services/analytics.service';
import { scheduleService } from '@/services/schedule.service';
import type { ScheduleEvent } from '@/types/schedule';
import { EVENT_TYPE_MAP } from '@/types/schedule';
import type { StudyStatus } from '@/types/study';

const STATUS_MAP = STUDY_STATUS_MAP;

function fmtDate(val: string | undefined | null): string {
  if (!val) return '-';
  const d = new Date(val);
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayEvents, setTodayEvents] = useState<ScheduleEvent[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getDashboard();
      setData(res);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const events = scheduleService.listByDate(todayIso());
    setTodayEvents(events.sort((a, b) => a.startTime.localeCompare(b.startTime)));
  }, []);

  const patients = data?.latest_patients ?? [];
  const studies = data?.latest_studies ?? [];

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className='flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12'>
      <header className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-slate-800 dark:text-white'>
            Dashboard Analytics
          </h1>
          <p className='text-slate-500 text-sm mt-1'>
            Visualize o desempenho e estatísticas da sua clínica.
          </p>
        </div>
        <Button
          variant='outline'
          onClick={fetchData}
          disabled={loading}
          className='gap-2 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
        >
          <RefreshCcw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Atualizar
        </Button>
      </header>

      {/* Metrics Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <MetricCard
          title='Total de Pacientes'
          value={data?.total_patients ?? 0}
          icon='Users'
          color='#42A5F5'
          loading={loading}
          tooltip='Número total de pacientes cadastrados na clínica.'
        />
        <MetricCard
          title='Total de Laudos'
          value={data?.total_studies ?? 0}
          icon='ClipboardList'
          color='#FFA726'
          loading={loading}
          tooltip='Total de exames e laudos realizados.'
        />
        <MetricCard
          title='Hoje'
          value={data?.total_consultations_today ?? 0}
          icon='Calendar'
          color='#AB47BC'
          loading={loading}
          tooltip='Consultas agendadas ou realizadas no dia de hoje.'
        />
        <MetricCard
          title='Total de Consultas'
          value={data?.total_consultations ?? 0}
          icon='Stethoscope'
          color='#66BB6A'
          loading={loading}
          tooltip='Total histórico de consultas médicas concluídas.'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Overtime Chart + Today Activities */}
        <div className='lg:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {data?.growth_overtime && (
            <AnalyticsChart
              type='line'
              title='Crescimento ao Longo do Tempo'
              subtitle='Comparativo de novos pacientes e consultas realizadas'
              data={data.growth_overtime}
              className='lg:col-span-2'
              height={310}
              loading={loading}
            />
          )}

          {/* Today's Activities */}
          <SectionCard
            title='Atividades de Hoje'
            subtitle='Eventos agendados para o dia de hoje'
          >
            <div className='h-[260px] overflow-y-auto mt-2'>
              {todayEvents.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-full text-center py-4'>
                  <CalendarCheck size={32} className='text-slate-300 dark:text-slate-600 mb-2' />
                  <p className='text-sm text-slate-500 dark:text-slate-400'>
                    Nenhuma atividade para hoje.
                  </p>
                </div>
              ) : (
                <div className='flex flex-col gap-2'>
                  {todayEvents.map((event) => {
                    const typeInfo = EVENT_TYPE_MAP[event.type];
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'flex items-start gap-3 rounded-lg border p-3 text-sm',
                          typeInfo.bg,
                        )}
                      >
                        <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', typeInfo.dot)} />
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center justify-between gap-2'>
                            <span className={cn('font-medium truncate', typeInfo.color)}>
                              {event.title}
                            </span>
                            <span className='shrink-0 text-xs text-slate-500 dark:text-slate-400'>
                              {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                            </span>
                          </div>
                          {event.patientName && (
                            <p className='mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400'>
                              {event.patientName}
                            </p>
                          )}
                          {event.description && (
                            <p className='mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500'>
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Species Distribution */}
        {data?.patients_by_specie && (
          <AnalyticsChart
            type='doughnut'
            title='Distribuição por Espécie'
            subtitle='Quais animais são mais atendidos'
            data={data.patients_by_specie}
            loading={loading}
          />
        )}

        {/* Consultations Status */}
        {data?.consultations_status && (
          <AnalyticsChart
            type='bar'
            title='Status das Consultas'
            subtitle='Acompanhamento do progresso clínico'
            data={data.consultations_status}
            loading={loading}
          />
        )}

        {/* Latest Exams Table */}
        <SectionCard
          title='Exames recentes'
          subtitle='Últimos resultados enviados.'
          className='flex flex-col h-[440px]'
        >
          <DataTable
            headers={['Data', 'Paciente', 'Título', 'Status', 'Ações']}
            className='h-full'
          >
            {studies.length === 0 ? (
              <tr>
                <td colSpan={5} className='p-8 text-center'>
                  <Microscope
                    size={32}
                    className='text-slate-300 dark:text-slate-600 mx-auto mb-2'
                  />
                  <p className='text-sm text-slate-500 dark:text-slate-400'>
                    Nenhum exame ainda.
                  </p>
                </td>
              </tr>
            ) : (
              studies.map((study) => {
                const statusInfo = STATUS_MAP[study.status as StudyStatus] ?? {
                  label: study.status,
                  color: 'yellow' as const,
                };
                return (
                  <tr
                    key={study.id}
                    className='hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'
                  >
                    <td className='p-4 text-slate-600 dark:text-slate-300 text-sm'>
                      {fmtDate(study.created_at)}
                    </td>
                    <td className='p-4'>
                      <span className='font-medium text-slate-900 dark:text-white text-sm'>
                        {study.patient?.name ?? '-'}
                      </span>
                    </td>
                    <td className='p-4 text-slate-600 dark:text-slate-300 text-sm'>
                      {study.title ?? 'Sem título'}
                    </td>
                    <td className='p-4'>
                      <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                    </td>
                    <td className='p-4 text-right'>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => router.push(`/exams/detail?id=${study.id}`)}
                        className='text-teal-600 h-auto p-0'
                      >
                        Abrir
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </DataTable>
        </SectionCard>

        {/* Latest Patients Card List */}
        <SectionCard
          title='Últimos Pacientes'
          subtitle='Pacientes adicionados recentemente'
          className='flex flex-col h-[440px]'
        >
          <div className='flex-1 overflow-y-auto min-h-0'>
            <div className='flex flex-col gap-3 mt-4'>
              {patients.length === 0 ? (
                <div className='text-center py-8'>
                  <PawPrint
                    size={32}
                    className='text-slate-300 dark:text-slate-600 mx-auto mb-2'
                  />
                  <p className='text-sm text-slate-500 dark:text-slate-400'>
                  Nenhum paciente ainda.
                  </p>
                </div>
              ) : (
                patients.map((patient) => (
                  <Card
                    key={patient.id}
                    className='p-4 shadow-sm border-slate-100 dark:border-white/5'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center'>
                          <PawPrint
                            size={18}
                            className='text-teal-600 dark:text-teal-400'
                          />
                        </div>
                        <div>
                          <h3 className='font-semibold text-gray-900 dark:text-white text-sm'>
                            {patient.name}
                          </h3>
                          <p className='text-xs text-slate-500 dark:text-slate-400'>
                            {SPECIE_LABELS[patient.specie as keyof typeof SPECIE_LABELS] ?? patient.specie}
                          </p>
                        </div>
                      </div>
                      <span className='text-xs text-gray-500 dark:text-slate-400'>
                        {fmtDate(patient.created_at)}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
