'use client';

import { Eye, Loader2, Microscope, UploadIcon } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { UploadExamModal } from '@/app/components/business/upload-exam-modal';
import { Badge } from '@/app/components/common/badge';
import { DataTable } from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { STUDY_STATUS_MAP } from '@/constants';
import { studiesService } from '@/services/studies.service';
import type { PaginatedMeta } from '@/types/common';
import type { Study } from '@/types/study';

const STATUS_MAP = STUDY_STATUS_MAP;

export default function ExamsPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchStudies = useCallback(async (searchQuery?: string, page = 1) => {
    setLoading(true);
    try {
      const response = await studiesService.list({
        page,
        size: 10,
        search: searchQuery,
      });
      setStudies(response.data);
      setMeta(response.meta);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStudies();
  }, [fetchStudies]);

  const handleSearch = (value: string) => {
    setSearch(value);
    void fetchStudies(value);
  };

  const handleUploadSuccess = (study: Study) => {
    setShowUploadModal(false);
    setStudies((prev) => [study, ...prev]);
    setMeta((prev) => prev ? { ...prev, total_elements: prev.total_elements + 1 } : prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Exames" showStorage={false} />

        <SectionCard
          title="Lista de exames"
          subtitle={meta ? `${meta.total_elements} exames no total` : 'Carregando...'}
          headerAction={
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-teal-600 dark:bg-teal-700 h-10 text-white hover:bg-teal-700 dark:hover:bg-teal-800"
            >
              <UploadIcon size={18} /> Enviar Exame
            </Button>
          }
        >
          <DataTable
            headers={['Título', 'Paciente', 'Status', 'Data', 'Ações']}
            showSearch={true}
            onSearch={handleSearch}
            searchPlaceholder="Buscar exames..."
            maxBodyHeight={520}
          >
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <Loader2 size={24} className="animate-spin text-teal-600 mx-auto" />
                </td>
              </tr>
            ) : studies.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <Microscope size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {search ? 'Nenhum exame encontrado.' : 'Nenhum exame cadastrado ainda.'}
                  </p>
                </td>
              </tr>
            ) : (
              studies.map((study) => {
                const statusInfo = STATUS_MAP[study.status] ?? { label: study.status, color: 'yellow' as const };
                return (
                  <tr
                    key={study.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4 text-slate-900 dark:text-white font-medium">
                      {study.title ?? 'Sem título'}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {study.patient?.name ?? '-'}
                    </td>
                    <td className="p-4">
                      <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {study.examDate
                        ? new Date(study.examDate).toLocaleDateString('pt-BR')
                        : new Date(study.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-end">
                      <Link href={`/exams/detail?id=${study.id}`}>
                        <Button variant="ghost" size="icon-sm" title="Ver detalhes">
                          <Eye size={16} className="text-slate-600 dark:text-slate-300" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </DataTable>
        </SectionCard>
      </div>

      {showUploadModal && (
        <UploadExamModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
