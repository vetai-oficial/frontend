'use client';

import {
  AlertCircle,
  Pill,
  Stethoscope,
  X,
} from 'lucide-react';
import { useEffect } from 'react';

import { Badge } from '@/app/components/common/badge';
import { Button } from '@/components/ui/button';
import type { ConsultationDisease } from '@/types/consultation';

interface DiseaseDetailModalProps {
  disease: ConsultationDisease;
  generalTreatments: string[];
  onClose: () => void;
}

export function DiseaseDetailModal({
  disease,
  generalTreatments,
  onClose,
}: DiseaseDetailModalProps) {
  const treatments =
    disease.suggestedTreatments && disease.suggestedTreatments.length > 0
      ? disease.suggestedTreatments
      : generalTreatments;
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const severityLabels = {
    red: 'Urgente / Grave',
    yellow: 'Atenção / Moderado',
    green: 'Leve',
  };

  const severityBg = {
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };

  const probability = disease.probability <= 1
    ? Math.round(disease.probability * 100)
    : Math.round(disease.probability);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-5 flex items-start justify-between gap-3 z-10">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${severityBg[disease.severity]}`}>
              <AlertCircle size={20} className={
                disease.severity === 'red' ? 'text-red-600 dark:text-red-400' :
                  disease.severity === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
              } />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {disease.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge color={disease.severity}>
                  {severityLabels[disease.severity]}
                </Badge>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {probability}% probabilidade
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-slate-500">
            <X size={18} />
          </Button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Probabilidade</span>
              <span>{probability}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${
                  disease.severity === 'red' ? 'bg-red-500' :
                    disease.severity === 'yellow' ? 'bg-yellow-500' :
                      'bg-green-500'
                }`}
                style={{ width: `${probability}%` }}
              />
            </div>
          </div>

          {disease.reasoning && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Stethoscope size={16} className="text-teal-600" />
                Raciocínio Clínico
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                {disease.reasoning}
              </p>
            </div>
          )}

          {treatments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Pill size={16} className="text-teal-600" />
                Tratamentos e Medicamentos Sugeridos
              </h3>
              <div className="space-y-2">
                {treatments.map((treatment, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg"
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {treatment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {treatments.length === 0 && (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              <Pill size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                Nenhum tratamento sugerido ainda para esta condição.
                <br />
                Continue a conversa para mais detalhes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
