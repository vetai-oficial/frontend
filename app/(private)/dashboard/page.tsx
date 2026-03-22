'use client';
import { UploadIcon } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/app/components/badge';
import { Card } from '@/app/components/card';
import { DataTable } from '@/app/components/data-table';
import { Header } from '@/app/components/header';
import { SectionCard } from '@/app/components/section-card';
import { StatCard } from '@/app/components/stat-card';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const INITIAL_PATIENTS = [
    { id: 1, name: 'Thor', species: 'Cão', breed: 'Golden Retriever', owner: 'Ana Silva', phone: '(11) 99999-0001', examsCount: 5, lastExam: '2023-10-25', created: '2023-01-15', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80' },
    { id: 2, name: 'Luna', species: 'Gato', breed: 'Siamês', owner: 'Carlos Souza', phone: '(11) 99999-0002', examsCount: 2, lastExam: '2023-11-02', created: '2023-05-20', image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=150&q=80' },
    { id: 3, name: 'Bob', species: 'Cão', breed: 'Bulldog', owner: 'Marcos Lima', phone: '(11) 99999-0003', examsCount: 0, lastExam: '-', created: '2023-11-10', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=150&q=80' },
  ];

  const INITIAL_EXAMS = [
    { id: 101, patientId: 1, type: 'Hemograma Completo', date: '2023-10-25', status: 'Concluído', notes: 'Leucócitos levemente aumentados.', images: [] },
    { id: 102, patientId: 1, type: 'Raio-X Torax', date: '2023-09-10', status: 'Concluído', notes: 'Sem alterações visíveis.', images: ['https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=300&q=80'] },
    { id: 103, patientId: 2, type: 'Ultrassom Abdominal', date: '2023-11-02', status: 'Análise', notes: 'Aguardando laudo.', images: [] },
  ];

  const MONITORED_PETS = [
    { id: 1, name: 'Thor', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80', status: 'Estável', statusColor: 'green' as const },
    { id: 2, name: 'Luna', image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=150&q=80', status: 'Atenção', statusColor: 'yellow' as const },
    { id: 3, name: 'Max', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=150&q=80', status: 'Crítico', statusColor: 'red' as const },
  ];

  const RECENT_ACTIVITIES = [
    { id: 1, petName: 'Thor', action: 'realizou exame de Hemograma Completo', time: '2 horas atrás' },
    { id: 2, petName: 'Luna', action: 'foi adicionado ao sistema', time: '5 horas atrás' },
    { id: 3, petName: 'Max', action: 'teve status de monitoramento atualizado', time: '1 dia atrás' },
    { id: 4, petName: 'Thor', action: 'teve consulta agendada', time: '2 dias atrás' },
  ];

  const [patients] = useState(INITIAL_PATIENTS);
  const [exams] = useState(INITIAL_EXAMS);

  return (
    <main className="flex min-h-screen flex-col items-start gap-4">
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
          <Header title="Dashboard" usedGB={3.3} totalGB={10} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Pacientes" value={3} />
            <StatCard title="Exames concluídos" value={2} />
            <StatCard title="Exames em análise" value={1} />
            <StatCard title="Em monitoramento" value={3} />
          </div>

          <SectionCard
            title="Exames recentes"
            subtitle="Gerencie os últimos resultados enviados."
            headerAction={
              <Button variant="outline" className="bg-teal-600 dark:bg-teal-700 h-10 text-white hover:text-white hover:bg-teal-700 dark:hover:bg-teal-800 border-teal-600 dark:border-teal-700">
                <UploadIcon className="text-white"/> Enviar exame
              </Button>
            }
          >
            <DataTable headers={['Data', 'Paciente', 'Tipo de Exame', 'Status', 'Ações']}>
              {exams.map((exam) => {
                const patient = patients.find((p) => p.id === exam.patientId);
                return (
                  <tr key={exam.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-slate-600 dark:text-slate-300">{new Date(exam.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={patient?.image} className="w-8 h-8 rounded-full object-cover" alt="" />
                        <span className="font-medium text-slate-900 dark:text-white">{patient?.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{exam.type}</td>
                    <td className="p-4">
                      <Badge color={exam.status === 'Concluído' ? 'green' : 'yellow'}>{exam.status}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-teal-600 hover:underline text-sm font-medium">Abrir</button>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          </SectionCard>

          <div className="flex flex-col lg:flex-row gap-4 mt-8">
            <SectionCard
              title="Monitoramento"
              subtitle="Visualização dos pacientes em monitoramento"
              className="w-full lg:w-1/3"
            >
              <div className="flex flex-col gap-3">
                {MONITORED_PETS.map((pet) => (
                  <Card key={pet.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={pet.image} alt={pet.name} className="w-12 h-12 rounded-full object-cover" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">{pet.name}</h3>
                      </div>
                      <Badge color={pet.statusColor}>{pet.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Últimos Pacientes"
              subtitle="Pacientes adicionados recentemente"
              className="w-full lg:w-1/3"
            >
              <div className="flex flex-col gap-3">
                {patients.map((patient) => (
                  <Card key={patient.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={patient.image} alt={patient.name} className="w-12 h-12 rounded-full object-cover" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">{patient.name}</h3>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-slate-400">{new Date(patient.created).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Últimas Atividades"
              subtitle="Histórico recente de atividades"
              className="w-full lg:w-1/3"
            >
              <div className="flex flex-col gap-3">
                {RECENT_ACTIVITIES.map((activity) => (
                  <Card key={activity.id} className="p-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-bold">{activity.petName}</span> {activity.action}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-slate-400">{activity.time}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}
