'use client';

import { ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/app/components/data-table';
import { Header } from '@/app/components/header';
import { SectionCard } from '@/app/components/section-card';
import { Button } from '@/components/ui/button';

export default function PatientsPage() {
  const INITIAL_PATIENTS = [
    { id: 1, name: 'Thor', species: 'Cão', breed: 'Golden Retriever', owner: 'Ana Silva', phone: '(11) 99999-0001', examsCount: 5, lastExam: '25/10/2023', created: '2023-01-15', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80' },
    { id: 2, name: 'Luna', species: 'Gato', breed: 'Siamês', owner: 'Carlos Souza', phone: '(11) 99999-0002', examsCount: 2, lastExam: '02/11/2023', created: '2023-05-20', image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=150&q=80' },
    { id: 3, name: 'Bob', species: 'Cão', breed: 'Bulldog', owner: 'Marcos Lima', phone: '(11) 99999-0003', examsCount: 0, lastExam: 'N/A', created: '2023-11-10', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=150&q=80' },
  ];
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [_searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setPatients(INITIAL_PATIENTS);
    } else {
      const filtered = INITIAL_PATIENTS.filter((patient) =>
        patient.name.toLowerCase().includes(value.toLowerCase()) ||
        patient.owner.toLowerCase().includes(value.toLowerCase()) ||
        patient.species.toLowerCase().includes(value.toLowerCase()) ||
        patient.breed.toLowerCase().includes(value.toLowerCase()),
      );
      setPatients(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Pacientes" showStorage={false} />

        <SectionCard
          title="Pacientes cadastrados"
          subtitle="Base completa de animais cadastrados."
          headerAction={
            <Button className="bg-teal-600 dark:bg-teal-700 h-10 text-white hover:bg-teal-700 dark:hover:bg-teal-800">
              <Plus size={18} /> Novo Paciente
            </Button>
          }
        >
          <DataTable
            headers={['Animal', 'Tutor', 'Qtd. Exames', 'Último Exame', '']}
            showSearch={true}
            onSearch={handleSearch}
            searchPlaceholder="Buscar por nome, tutor, espécie ou raça"
          >
            {patients.map((patient) => (
              <tr
                key={patient.id}
                onClick={() => {}}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={patient.image} className="w-10 h-10 rounded-full object-cover" alt="" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{patient.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{patient.species} • {patient.breed}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-slate-900 dark:text-white">{patient.owner}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{patient.phone}</p>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300 pl-8">{patient.examsCount}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{patient.lastExam}</td>
                <td className="p-4 text-right">
                  <ChevronRight className="inline text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" size={20} />
                </td>
              </tr>
            ))}
          </DataTable>
        </SectionCard>
      </div>
    </div>
  );
}
