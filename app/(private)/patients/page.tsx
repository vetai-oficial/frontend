'use client';

import { ChevronRight, Loader2, PawPrint, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { PatientModal } from '@/app/components/business/patient-modal';
import { DataTable } from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { SPECIE_LABELS } from '@/constants';
import { patientsService } from '@/services/patients.service';
import type { PaginatedMeta } from '@/types/common';
import type { Patient } from '@/types/patient';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchPatients = useCallback(async (searchQuery?: string, page = 1) => {
    setLoading(true);
    try {
      const response = await patientsService.list({ page, size: 10, search: searchQuery });
      setPatients(response.data);
      setMeta(response.meta);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchPatients(); }, [fetchPatients]);

  const handleSearch = (value: string) => {
    setSearch(value);
    void fetchPatients(value);
  };

  const handleCreateSuccess = (patient: Patient) => {
    setShowCreateModal(false);
    setPatients((prev) => [patient, ...prev]);
    setMeta((prev) => prev ? { ...prev, total_elements: prev.total_elements + 1 } : prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Pacientes" showStorage={false} />

        <SectionCard
          title="Pacientes cadastrados"
          subtitle={meta ? `${meta.total_elements} pacientes no total` : 'Carregando...'}
          headerAction={
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-teal-600 dark:bg-teal-700 h-10 text-white hover:bg-teal-700 dark:hover:bg-teal-800"
            >
              <Plus size={18} /> Novo Paciente
            </Button>
          }
        >
          <DataTable
            headers={['Animal', 'Espécie', 'Raça', 'Cadastrado em', '']}
            showSearch={true}
            onSearch={handleSearch}
            searchPlaceholder="Buscar por nome..."
          >
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <Loader2 size={24} className="animate-spin text-teal-600 mx-auto" />
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <PawPrint size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {search ? 'Nenhum paciente encontrado.' : 'Nenhum paciente cadastrado ainda.'}
                  </p>
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="p-4">
                    <Link href={`/patients/detail?id=${patient.id}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                        <PawPrint size={18} className="text-teal-600 dark:text-teal-400" />
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">{patient.name}</p>
                    </Link>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {SPECIE_LABELS[patient.specie] ?? patient.specie}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {patient.breed ?? '-'}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/patients/detail?id=${patient.id}`}>
                      <ChevronRight className="inline text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" size={20} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </DataTable>
        </SectionCard>
      </div>

      {showCreateModal && (
        <PatientModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
