'use client';

import { Loader2, Microscope, PawPrint, UploadIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/app/components/badge';
import { Card } from '@/app/components/card';
import { DataTable } from '@/app/components/data-table';
import { Header } from '@/app/components/header';
import { SectionCard } from '@/app/components/section-card';
import { StatCard } from '@/app/components/stat-card';
import { Button } from '@/components/ui/button';
import { STUDY_STATUS_MAP } from '@/constants';
import { patientsService } from '@/services/patients.service';
import { studiesService } from '@/services/studies.service';
import type { Patient } from '@/types/patient';
import type { Study } from '@/types/study';

const STATUS_MAP = STUDY_STATUS_MAP;

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalStudies, setTotalStudies] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [patientsRes, studiesRes] = await Promise.all([
        patientsService.list({ size: 5, sort: 'createdAt', direction: 'desc' }),
        studiesService.list({ size: 5, sort: 'createdAt', direction: 'desc' }),
      ]);
      setPatients(patientsRes.data);
      setTotalPatients(patientsRes.meta.total_elements);
      setStudies(studiesRes.data);
      setTotalStudies(studiesRes.meta.total_elements);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const completedStudies = studies.filter((s) => s.status === 'COMPLETED').length;
  const pendingStudies = studies.filter((s) => s.status === 'PENDING' || s.status === 'PROCESSING').length;

  return (
    <main className="flex min-h-screen flex-col items-start gap-4">
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
          <Header title="Dashboard" usedGB={3.3} totalGB={10} />

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-teal-600" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Pacientes" value={totalPatients} />
                <StatCard title="Total de Exames" value={totalStudies} />
                <StatCard title="Exames concluídos" value={completedStudies} />
                <StatCard title="Exames em análise" value={pendingStudies} />
              </div>

              <SectionCard
                title="Exames recentes"
                subtitle="Últimos resultados enviados."
                headerAction={
                  <Button variant="outline" className="bg-teal-600 dark:bg-teal-700 h-10 text-white hover:text-white hover:bg-teal-700 dark:hover:bg-teal-800 border-teal-600 dark:border-teal-700">
                    <UploadIcon className="text-white" /> Enviar exame
                  </Button>
                }
              >
                <DataTable headers={['Data', 'Paciente', 'Título', 'Status', 'Ações']}>
                  {studies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center">
                        <Microscope size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum exame ainda.</p>
                      </td>
                    </tr>
                  ) : (
                    studies.map((study) => {
                      const statusInfo = STATUS_MAP[study.status] ?? { label: study.status, color: 'yellow' as const };
                      return (
                        <tr key={study.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 text-slate-600 dark:text-slate-300">
                            {new Date(study.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {study.patient?.name ?? '-'}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">
                            {study.title ?? 'Sem título'}
                          </td>
                          <td className="p-4">
                            <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                          </td>
                          <td className="p-4 text-right">
                            <button className="text-teal-600 hover:underline text-sm font-medium">
                              Abrir
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </DataTable>
              </SectionCard>

              <div className="flex flex-col lg:flex-row gap-4 mt-8">
                <SectionCard
                  title="Últimos Pacientes"
                  subtitle="Pacientes adicionados recentemente"
                  className="w-full lg:w-1/2"
                >
                  <div className="flex flex-col gap-3">
                    {patients.length === 0 ? (
                      <div className="text-center py-8">
                        <PawPrint size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum paciente ainda.</p>
                      </div>
                    ) : (
                      patients.map((patient) => (
                        <Card key={patient.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                                <PawPrint size={18} className="text-teal-600 dark:text-teal-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{patient.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{patient.specie}</p>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-slate-400">
                              {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </SectionCard>

                <SectionCard
                  title="Resumo"
                  subtitle="Visão geral da sua clínica"
                  className="w-full lg:w-1/2"
                >
                  <div className="flex flex-col gap-3">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total de pacientes</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{totalPatients}</p>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total de exames</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{totalStudies}</p>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Exames concluídos</p>
                        <p className="text-lg font-bold text-teal-600 dark:text-teal-400">{completedStudies}</p>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Em processamento</p>
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{pendingStudies}</p>
                      </div>
                    </Card>
                  </div>
                </SectionCard>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
