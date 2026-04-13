'use client';

import { AlertTriangle, CheckCircle2, Lightbulb, ShieldCheck, X } from 'lucide-react';
import { useEffect } from 'react';

import type { StudyPrevention } from '@/types/study';

interface PreventionModalProps {
  prevention: StudyPrevention;
  studyTitle?: string;
  onClose: () => void;
}

export function PreventionModal({
  prevention,
  studyTitle,
  onClose,
}: PreventionModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-5 flex items-start justify-between gap-3 z-10">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700">
              <ShieldCheck size={20} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Análise de Prevenção
              </h2>
              {studyTitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {studyTitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6">
          {prevention.alteredValues.map((altered, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <AlertTriangle size={15} className="text-red-500" />
                {altered.name}
              </h3>
              {altered.problems.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {altered.problems.map((problem, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{problem}</p>
                    </div>
                  ))}
                </div>
              )}
              {altered.recommendations.length > 0 && (
                <div className="space-y-1.5">
                  {altered.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/40 rounded-lg">
                      <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {prevention.generalRecommendations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Lightbulb size={16} className="text-teal-500" />
                Recomendações Gerais
              </h3>
              <div className="space-y-2">
                {prevention.generalRecommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/50 rounded-lg">
                    <CheckCircle2 size={16} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
