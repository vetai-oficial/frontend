'use client';

import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardList, Lightbulb, Loader2, Microscope, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/app/components/common/badge';
import { Card } from '@/app/components/common/card';
import { SectionCard } from '@/app/components/data/section-card';
import { Button } from '@/components/ui/button';
import { studiesService } from '@/services/studies.service';
import type { Study } from '@/types/study';

export function PreventionContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudy = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await studiesService.get(id);
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
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={32} className="animate-spin text-teal-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Carregando…</p>
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

  const { prevention } = study;

  if (!prevention) {
    return (
      <div className="text-center py-20">
        <ShieldCheck size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">
          Nenhuma análise de prevenção disponível para este exame.
        </p>
        <Link href={`/exams/detail?id=${study.id}`} className="mt-4 inline-block">
          <Button variant="outline">Voltar ao exame</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/exams/detail?id=${study.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck size={20} className="text-teal-600 dark:text-teal-400" />
            Análise de Prevenção
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {study.title ?? 'Exame'} — {study.patient?.name ?? '-'}
          </p>
        </div>
      </div>

      {prevention.generalDiagnosis && (
        <SectionCard
          title="Diagnóstico Geral"
          subtitle="Avaliação clínica consolidada com base nos valores alterados"
          className="mb-4"
        >
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg mt-1">
            <ClipboardList size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {prevention.generalDiagnosis}
            </p>
          </div>
        </SectionCard>
      )}

      {prevention.alteredValues.length > 0 && (
        <SectionCard
          title="Valores Alterados"
          subtitle="Implicações clínicas por parâmetro"
          className="mb-4"
        >
          <div className="space-y-4">
            {prevention.alteredValues.map((item, i) => (
              <div
                key={i}
                className="border border-red-200 dark:border-red-800/50 rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-red-500 shrink-0" />
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    <span className="text-sm text-red-700 dark:text-red-400 font-medium">
                      {item.value}{item.unit ? ` ${item.unit}` : ''}
                    </span>
                  </div>
                  <Badge color="red">
                    {item.status === 'Alto' ? 'Alto' : 'Baixo'}
                  </Badge>
                </div>

                {item.problems.length > 0 && (
                  <div className="px-4 pt-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 mb-1">Problemas</p>
                    {item.problems.map((problem, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold shrink-0 mt-0.5">
                          {j + 1}
                        </span>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {problem}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {item.recommendations?.length > 0 && (
                  <div className="px-4 pt-3 pb-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400 mb-1">Recomendações</p>
                    {item.recommendations.map((rec, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {prevention.generalRecommendations?.length > 0 && (
        <SectionCard
          title="Recomendações Gerais"
          subtitle="Considerando todos os valores alterados em conjunto"
        >
          <div className="space-y-2">
            {prevention.generalRecommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/50 rounded-lg"
              >
                <CheckCircle2 size={16} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {prevention.alteredValues.length === 0 && !prevention.generalRecommendations?.length && (
        <Card className="p-8 text-center">
          <Lightbulb size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 dark:text-slate-400">
            Nenhuma recomendação disponível.
          </p>
        </Card>
      )}
    </>
  );
}
