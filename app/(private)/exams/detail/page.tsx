'use client';

import { ArrowLeft, Loader2, Microscope } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

import { Badge } from '@/app/components/badge';
import { Card } from '@/app/components/card';
import { Header } from '@/app/components/header';
import { SectionCard } from '@/app/components/section-card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { Study } from '@/lib/api';

const STATUS_MAP: Record<string, { label: string; color: 'green' | 'yellow' | 'red' | 'blue' }> = {
  COMPLETED: { label: 'Concluído', color: 'green' },
  PROCESSING: { label: 'Processando', color: 'blue' },
  PENDING: { label: 'Pendente', color: 'yellow' },
  FAILED: { label: 'Falhou', color: 'red' },
};

function ExamDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudy = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.studies.get(id);
      setStudy(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchStudy();
  }, [fetchStudy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    );
  }

  if (!study) {
    return (
      <div className="text-center py-20">
        <Microscope size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Exame não encontrado.</p>
        <Link href="/exams" className="mt-4 inline-block">
          <Button variant="outline">Voltar aos exames</Button>
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[study.status] ?? { label: study.status, color: 'yellow' as const };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/exams">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {study.title ?? 'Exame'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Paciente: {study.patient?.name ?? '-'}
          </p>
        </div>
        <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
      </div>

      {study.results.length > 0 ? (
        study.results.map((result, i) => (
          <SectionCard key={i} title={result.title} subtitle="Resultados do exame" className="mb-4">
            <div className="space-y-2">
              {result.values.map((val, j) => (
                <Card key={j} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{val.title}</p>
                      {val.unit && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">Unidade: {val.unit}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{val.value}</p>
                      <Badge color={val.status === 'REGULAR' ? 'green' : 'red'}>
                        {val.status === 'REGULAR' ? 'Normal' : 'Alterado'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </SectionCard>
        ))
      ) : (
        <Card className="p-8 text-center">
          <Microscope size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 dark:text-slate-400">
            {study.status === 'PENDING' || study.status === 'PROCESSING'
              ? 'O exame está sendo processado. Os resultados aparecerão aqui em breve.'
              : 'Nenhum resultado disponível para este exame.'}
          </p>
        </Card>
      )}
    </>
  );
}

export default function ExamDetailPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Detalhes do Exame" showStorage={false} />
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-teal-600" />
            </div>
          }
        >
          <ExamDetailContent />
        </Suspense>
      </div>
    </div>
  );
}
