'use client';

import {
  AlertCircle,
  Bot,
  ChevronRight,
  Clock,
  History,
  Loader2,
  Star,
  User,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/app/components/common/badge';
import { consultationsService } from '@/services/consultations.service';
import type { Consultation } from '@/types/consultation';
import { normalizeProb } from '@/utils/date-format';

interface ConsultationHistoryProps {
  onClose: () => void;
}

export function ConsultationHistory({ onClose }: ConsultationHistoryProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  const fetchConsultations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await consultationsService.list({
        size: 20,
        sort: 'startedAt',
        direction: 'desc',
      });
      setConsultations(response.data);
    } catch {
      // fail silently
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConsultations();
  }, [fetchConsultations]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedConsultation) {
          setSelectedConsultation(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, selectedConsultation]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (selectedConsultation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedConsultation(null)} />
        <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-5 flex items-center justify-between z-10">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Detalhes da Consulta
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatDate(selectedConsultation.started_at)}
                {selectedConsultation.finished_at && ` — ${formatDate(selectedConsultation.finished_at)}`}
              </p>
            </div>
            <button onClick={() => setSelectedConsultation(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              <X size={18} className="text-slate-500" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-5 space-y-5">
            {selectedConsultation.diagnosis?.summary && (
              <div className="p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
                <h3 className="text-sm font-semibold text-teal-800 dark:text-teal-200 mb-1">Resumo</h3>
                <p className="text-sm text-teal-700 dark:text-teal-300">{selectedConsultation.diagnosis.summary}</p>
              </div>
            )}

            {selectedConsultation.diagnosis?.diseases?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Diagnósticos</h3>
                <div className="space-y-2">
                  {selectedConsultation.diagnosis.diseases.map((d, i) => {
                    const isSelected = selectedConsultation.diagnosis?.selectedDiseaseName === d.name;
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          isSelected
                            ? 'border-teal-400 dark:border-teal-600 bg-teal-50/50 dark:bg-teal-900/10'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <Star size={14} className="text-teal-600 dark:text-teal-400" fill="currentColor" />
                          ) : (
                            <AlertCircle size={14} className={
                              d.severity === 'red' ? 'text-red-500' :
                                d.severity === 'yellow' ? 'text-yellow-500' : 'text-green-500'
                            } />
                          )}
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{d.name}</span>
                          {isSelected && (
                            <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                              (selecionada)
                            </span>
                          )}
                        </div>
                        <Badge color={d.severity}>{normalizeProb(d.probability)}%</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedConsultation.diagnosis?.suggestedTreatments?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Tratamentos sugeridos</h3>
                <div className="space-y-2">
                  {selectedConsultation.diagnosis.suggestedTreatments.map((t, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <p className="text-sm text-slate-700 dark:text-slate-300">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Mensagens</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                {selectedConsultation.messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-teal-600' : 'bg-slate-600'
                    }`}>
                      {msg.role === 'user' ? <User size={12} className="text-white" /> : <Bot size={12} className="text-white" />}
                    </div>
                    <div className={`max-w-[80%] p-2.5 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-teal-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <History size={20} className="text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Histórico de consultas</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-teal-600" />
            </div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <History size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma consulta realizada ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {consultations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConsultation(c)}
                  className="w-full text-left p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge color={c.status === 'COMPLETED' ? 'green' : 'blue'}>
                          {c.status === 'COMPLETED' ? 'Finalizada' : 'Em andamento'}
                        </Badge>
                        {c.diagnosis?.diseases?.length > 0 && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {c.diagnosis.diseases.length} diagnóstico(s)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Clock size={12} />
                        <span>{formatDate(c.started_at)}</span>
                      </div>
                      {c.diagnosis?.selectedDiseaseName && (
                        <div className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 mt-1">
                          <Star size={10} fill="currentColor" />
                          <span className="font-medium">{c.diagnosis.selectedDiseaseName}</span>
                        </div>
                      )}
                      {c.diagnosis?.diseases?.length > 0 && !c.diagnosis?.selectedDiseaseName && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">
                          {c.diagnosis.diseases.map((d) => d.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-teal-600 transition-colors shrink-0 ml-2" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
