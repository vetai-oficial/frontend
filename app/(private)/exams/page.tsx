'use client';

import { Eye, Plus, Share2, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/app/components/data-table';
import { Header } from '@/app/components/header';
import { SectionCard } from '@/app/components/section-card';
import { Button } from '@/components/ui/button';

interface Exam {
  id: string;
  nome: string;
  paciente: string;
  tutor: string;
  tipo: string;
  data: string;
}

const examsData: Exam[] = [
  {
    id: '1',
    nome: 'Hemograma Completo',
    paciente: 'Rex',
    tutor: 'Ana Silva',
    tipo: 'Hematologia',
    data: '25/11/2025',
  },
  {
    id: '2',
    nome: 'Raio-X Tórax',
    paciente: 'Luna',
    tutor: 'Carlos Souza',
    tipo: 'Radiologia',
    data: '23/11/2025',
  },
  {
    id: '3',
    nome: 'Ultrassom Abdominal',
    paciente: 'Max',
    tutor: 'Marcos Lima',
    tipo: 'Ultrassonografia',
    data: '20/11/2025',
  },
  {
    id: '4',
    nome: 'Exame de Urina',
    paciente: 'Bella',
    tutor: 'Juliana Costa',
    tipo: 'Análises Clínicas',
    data: '18/11/2025',
  },
  {
    id: '5',
    nome: 'Eletrocardiograma',
    paciente: 'Thor',
    tutor: 'Pedro Santos',
    tipo: 'Cardiologia',
    data: '15/11/2025',
  },
];

export default function Exams() {
  const [exams, setExams] = useState(examsData);

  const handleSearch = (value: string) => {
    if (value.trim() === '') {
      setExams(examsData);
    } else {
      const filtered = examsData.filter(
        (exam) =>
          exam.nome.toLowerCase().includes(value.toLowerCase()) ||
          exam.paciente.toLowerCase().includes(value.toLowerCase()) ||
          exam.tutor.toLowerCase().includes(value.toLowerCase()) ||
          exam.tipo.toLowerCase().includes(value.toLowerCase()),
      );
      setExams(filtered);
    }
  };

  const handleView = (id: string) => {
    // Implementar navegação para detalhes
    void id;
  };

  const handleShare = (id: string) => {
    // Implementar funcionalidade de compartilhamento
    void id;
  };

  const handleDelete = (id: string) => {
    // Implementar funcionalidade de exclusão
    void id;
  };

  const handleAddExam = () => {
    // Implementar funcionalidade de adicionar novo exame
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Exames" showStorage={false} />

        <SectionCard
          title="Lista de exames"
          subtitle="Gerencie todos os exames cadastrados"
          headerAction={
            <Button className="bg-teal-600 dark:bg-teal-700 h-10 text-white hover:bg-teal-700 dark:hover:bg-teal-800" onClick={handleAddExam}>
              <Plus className="h-4 w-4" />
              Novo Exame
            </Button>
          }
        >
          <DataTable
            headers={['Nome', 'Tutor', 'Paciente', 'Tipo', 'Data', 'Ações']}
            columnWidths={['25%', '20%', '10%', '15%', '12%', '13%']}
            showSearch={true}
            onSearch={handleSearch}
            searchPlaceholder="Buscar exames..."
            centerHeaders={true}
          >
            {exams.map((exam) => (
              <tr
                key={exam.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="p-4 text-slate-900 dark:text-white font-medium text-center">
                  {exam.nome}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300 text-center">
                  {exam.tutor}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300 text-center">
                  {exam.paciente}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300 text-center">
                  {exam.tipo}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300 text-center">
                  {exam.data}
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleView(exam.id)}
                      title="Visualizar detalhes"
                    >
                      <Eye className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleShare(exam.id)}
                      title="Compartilhar"
                    >
                      <Share2 className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(exam.id)}
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        </SectionCard>
      </div>
    </div>
  );
}
