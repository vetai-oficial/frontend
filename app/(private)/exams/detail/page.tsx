'use client';

import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, Microscope, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

import { Badge } from '@/app/components/badge';
import { Card } from '@/app/components/card';
import { Header } from '@/app/components/header';
import { SectionCard } from '@/app/components/section-card';
import { Button } from '@/components/ui/button';
import { STUDY_STATUS_MAP } from '@/constants';
import { studiesService } from '@/services/studies.service';
import type { AlteredValueInfo, ExamValue, Study } from '@/types/study';

const STATUS_MAP = STUDY_STATUS_MAP;

function formatReference(val: ExamValue): string | null {
  const ref = val.reference;
  if (!ref) return null;
  const unit = ref.unit ?? val.unit ?? '';

  if (ref.type === 'TEXT') {
    return ref.text ?? null;
  }

  if (ref.type === 'RANGE') {
    if (ref.min !== undefined && ref.max !== undefined) {
      return `${ref.min} – ${ref.max}${unit ? ' ' + unit : ''}`;
    }
    if (ref.min !== undefined) return `≥ ${ref.min}${unit ? ' ' + unit : ''}`;
    if (ref.max !== undefined) return `≤ ${ref.max}${unit ? ' ' + unit : ''}`;
  }

  return null;
}

function ExamDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState<AlteredValueInfo | null>(null);

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

  const isWaiting =
    study?.status === 'PENDING' ||
    study?.status === 'PROCESSING' ||
    study?.preventionStatus === 'GENERATING';

  // Poll only while exam status is PROCESSING
  useEffect(() => {
    if (study?.status !== 'PROCESSING') return;
    const interval = setInterval(async () => {
      try {
        const data = await studiesService.get(study.id);
        setStudy(data);
        if (data.status !== 'PROCESSING') clearInterval(interval);
      } catch {
        clearInterval(interval);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [study?.id, study?.status]);

  const hasAlteredValues = study?.results.some((r) =>
    r.values.some((v) => v.status === 'HIGHER' || v.status === 'LOWER'),
  ) ?? false;

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

  // Show a full-page loading while exam is being processed or prevention is generating
  if (isWaiting) {
    const message =
      study.status === 'PENDING' || study.status === 'PROCESSING'
        ? 'Exame em processamento, aguarde alguns instantes.'
        : 'Análise de prevenção em andamento, aguarde alguns instantes.';
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 size={36} className="animate-spin text-teal-600" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">{message}</p>
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
        <div className="flex items-center gap-3">
          {study.status === 'COMPLETED' && hasAlteredValues && (
            <Button
              onClick={() => router.push(`/exams/prevention?id=${study.id}`)}
              className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 dark:hover:bg-teal-800 gap-2"
            >
              <ShieldCheck size={16} />
              Prevenção
            </Button>
          )}
          <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
        </div>
      </div>

      {study.results.length > 0 ? (
        study.results.map((result, i) => {
          const prevention = study.prevention;
          const hasSubgroups = result.values.some((v) => v.subgroup);
          const subgroups = hasSubgroups
            ? [...new Set(result.values.map((v) => v.subgroup).filter(Boolean))] as string[]
            : [];

          const renderValues = (values: typeof result.values) =>
            values.map((val, j) => {
              const isNA = val.value === 'N/A';
              const isAltered = !isNA && (val.status === 'HIGHER' || val.status === 'LOWER');
              const referenceText = formatReference(val);
              const alteredInfo = isAltered
                ? prevention?.alteredValues.find((a) => a.name === val.title)
                : undefined;
              const isClickable = !!alteredInfo;
              return (
                <Card
                  key={j}
                  {...(isClickable ? { onClick: () => setSelectedValue(alteredInfo) } : {})}
                  className={`p-4 transition-colors ${
                    isAltered
                      ? 'border-red-300 dark:border-red-700/60 bg-red-50/50 dark:bg-red-900/10'
                      : isNA
                        ? 'opacity-60'
                        : ''
                  } ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium text-sm truncate ${isAltered ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                        {val.title}
                      </p>
                      {val.unit && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Unidade: {val.unit}
                        </p>
                      )}
                      {referenceText && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Referência: {referenceText}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-lg font-bold ${isAltered ? 'text-red-600 dark:text-red-400' : isNA ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                        {val.value}
                      </p>
                      {!isNA && (
                        <Badge color={isAltered ? 'red' : 'green'}>
                          {val.status === 'HIGHER' ? 'Alto' : val.status === 'LOWER' ? 'Baixo' : 'Normal'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            });

          return (
            <SectionCard key={i} title={result.title} subtitle="Resultados do exame" className="mb-4">
              {hasSubgroups ? (
                <div className="space-y-4">
                  {subgroups.map((sg) => (
                    <div key={sg}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2 px-1">
                        {sg}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {renderValues(result.values.filter((v) => v.subgroup === sg))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {renderValues(result.values)}
                </div>
              )}
            </SectionCard>
          );
        })
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

      {selectedValue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedValue(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-5 py-4 flex items-start justify-between gap-3 z-10">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <AlertTriangle size={16} className="text-red-500 shrink-0" />
                  <h3 className="font-bold text-slate-900 dark:text-white">{selectedValue.name}</h3>
                  <Badge color="red">{selectedValue.status}</Badge>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {selectedValue.value}{selectedValue.unit ? ` ${selectedValue.unit}` : ''}
                </p>
              </div>
              <button onClick={() => setSelectedValue(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {selectedValue.problems.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 mb-2">Problemas</p>
                  <div className="space-y-2">
                    {selectedValue.problems.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{p}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedValue.recommendations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400 mb-2">Recomendações</p>
                  <div className="space-y-2">
                    {selectedValue.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/40 rounded-lg">
                        <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
