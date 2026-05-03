'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DataTable } from '@/app/components/data/data-table';
import { Header } from '@/app/components/layout/header';
import { SectionCard } from '@/app/components/data/section-card';
import { MetricCard } from '@/components/MetricCard';
import { adminService, type AdminDashboardData } from '@/services/admin.service';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        setData(await adminService.dashboard());
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 pb-12">
      <Header title="Dashboard administrativo" showStorage={false} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Colaboradores" value={data?.total_collaborators ?? 0} icon="Users" color="#6366F1" loading={loading} />
        <MetricCard title="Convites pendentes" value={data?.pending_invites ?? 0} icon="MailPlus" color="#F59E0B" loading={loading} />
        <MetricCard title="Pacientes" value={data?.total_patients ?? 0} icon="PawPrint" color="#42A5F5" loading={loading} />
        <MetricCard title="Exames" value={data?.total_studies ?? 0} icon="Microscope" color="#14B8A6" loading={loading} />
        <MetricCard title="Consultas" value={data?.total_consultations ?? 0} icon="MessagesSquare" color="#A855F7" loading={loading} />
      </div>

      <SectionCard title="Atividade por colaborador" subtitle="Resumo global baseado nos registros vinculados a cada usuário">
        {loading ? (
          <div className="flex justify-center py-10 text-slate-500"><Loader2 className="animate-spin" /></div>
        ) : (
          <DataTable headers={['Colaborador', 'E-mail', 'Pacientes', 'Exames', 'Consultas']}>
            {(data?.collaborators_activity ?? []).length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-sm text-slate-500">Nenhum colaborador ativo.</td></tr>
            ) : (
              data?.collaborators_activity.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
                  <td className="p-4 text-sm text-slate-500">{item.email}</td>
                  <td className="p-4 text-sm">{item.patients}</td>
                  <td className="p-4 text-sm">{item.studies}</td>
                  <td className="p-4 text-sm">{item.consultations}</td>
                </tr>
              ))
            )}
          </DataTable>
        )}
      </SectionCard>
    </div>
  );
}
