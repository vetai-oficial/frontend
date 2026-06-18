'use client';

import {
  AlertCircle,
  Bot,
  CheckCircle,
  Copy,
  History,
  Info,
  Loader2,
  Plus,
  RotateCcw,
  Send,
  Star,
  User,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ConfirmFinishModal } from './components/confirm-finish-modal';
import { FinishingOverlay } from './components/finishing-overlay';
import { TypingEffect } from './components/typing-effect';
import { TypingIndicator } from './components/typing-indicator';

import { ConsultationHistory } from '@/app/components/business/consultation-history';
import { DiseaseDetailModal } from '@/app/components/business/disease-detail-modal';
import { Badge } from '@/app/components/common/badge';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConsultation } from '@/hooks/use-consultation';
import type { ChatMessage } from '@/hooks/use-consultation';
import { disconnectSocket } from '@/infra/socket';
import { consultationsService } from '@/services/consultations.service';
import type { ConsultationDisease } from '@/types/consultation';
import { normalizeProb } from '@/utils/date-format';

export default function Consultation() {
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCheckingInProgress, setIsCheckingInProgress] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [markedDiseaseIndex, setMarkedDiseaseIndex] = useState<number | null>(null);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [detailDisease, setDetailDisease] = useState<ConsultationDisease | null>(null);

  const {
    messages,
    isLoading,
    isFinishing,
    diseases,
    suggestedInfo,
    suggestedTreatments,
    isFinished,
    summary,
    sendMessage,
    finishConsultation,
    resetMessages,
  } = useConsultation({
    consultationId,
    initialMessages: [],
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => { disconnectSocket(); };
  }, []);

  const resumeConsultation = useCallback(
    (consultation: {
      id: string;
      messages: { role: 'user' | 'assistant'; content: string; timestamp: string }[];
      diagnosis?: {
        diseases?: ConsultationDisease[];
        suggestedTreatments?: string[];
        suggestedQuestions?: string[];
      };
    }) => {
      setConsultationId(consultation.id);
      const restoredMessages: ChatMessage[] = consultation.messages.map(
        (msg, i) => ({
          id: i + 1,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          isNew: false,
        }),
      );
      resetMessages(restoredMessages, consultation.diagnosis);
      setMarkedDiseaseIndex(null);
      setShowConfirmFinish(false);
    },
    [resetMessages],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const existing = await consultationsService.getInProgress();
        if (!cancelled && existing) {
          resumeConsultation(existing);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setIsCheckingInProgress(false);
      }
    })();
    return () => { cancelled = true; };
  }, [resumeConsultation]);

  const handleNewConsultation = useCallback(async () => {
    setIsCreating(true);
    try {
      const consultation = await consultationsService.create();
      resumeConsultation(consultation);
    } catch {
      try {
        const existing = await consultationsService.getInProgress();
        if (existing) resumeConsultation(existing);
      } catch {
        // silently fail
      }
    } finally {
      setIsCreating(false);
    }
  }, [resumeConsultation]);

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim() || isLoading) return;
    sendMessage(inputMessage.trim());
    setInputMessage('');
  }, [inputMessage, isLoading, sendMessage]);

  const handleCopyMessage = (content: string) => {
    void navigator.clipboard.writeText(content);
  };

  const handleResendMessage = (content: string) => {
    if (isLoading) return;
    sendMessage(content);
  };

  const handleFinishClick = () => {
    if (diseases.length > 0 && markedDiseaseIndex === null) {
      setShowConfirmFinish(true);
      return;
    }
    const selectedName = markedDiseaseIndex !== null ? diseases[markedDiseaseIndex]?.name : undefined;
    finishConsultation(selectedName);
  };

  const handleConfirmFinish = () => {
    setShowConfirmFinish(false);
    finishConsultation(undefined);
  };

  const getSeverityColor = (severity: 'red' | 'yellow' | 'green') => {
    const colors = {
      red: 'text-red-600 dark:text-red-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      green: 'text-green-600 dark:text-green-400',
    };
    return colors[severity];
  };

  if (isCheckingInProgress) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
          <Header title="Consulta" showStorage={false} />
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-teal-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Verificando consultas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!consultationId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
          <Header title="Consulta" showStorage={false} />
          <div className="flex flex-col items-center justify-center py-20">
            <Bot size={64} className="text-teal-600 dark:text-teal-400 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Assistente de Anamnese IA
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
              Inicie uma nova consulta para receber auxílio da inteligência artificial no diagnóstico veterinário.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleNewConsultation} disabled={isCreating} className="bg-teal-600 hover:bg-teal-700 text-white px-6 h-11">
                {isCreating ? (<><Loader2 size={18} className="animate-spin" /> Iniciando...</>) : (<><Plus size={18} /> Nova consulta</>)}
              </Button>
              <Button variant="outline" onClick={() => setShowHistory(true)} className="h-11">
                <History size={18} /> Histórico
              </Button>
            </div>
          </div>
        </div>
        {showHistory && <ConsultationHistory onClose={() => setShowHistory(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Consulta" showStorage={false} />

        {isFinished && summary && (
          <div className="mb-4 p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-teal-600 dark:text-teal-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-1">Consulta finalizada</h3>
                <p className="text-sm text-teal-700 dark:text-teal-300">{summary}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleNewConsultation} className="bg-teal-600 hover:bg-teal-700 text-white" size="sm">
                <Plus size={16} /> Nova consulta
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
                <History size={16} /> Histórico
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SectionCard
              title="Chat com Assistente IA"
              subtitle="Converse com o assistente para diagnóstico auxiliar"
              headerAction={
                !isFinished ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFinishClick}
                      disabled={isLoading || isFinishing || messages.length < 3}
                      className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-900/20"
                    >
                      {isFinishing ? (
                        <><Loader2 size={16} className="animate-spin" /> Finalizando...</>
                      ) : (
                        <><CheckCircle size={16} /> Finalizar consulta</>
                      )}
                    </Button>
                  </div>
                ) : undefined
              }
            >
              <div className="relative flex flex-col h-[calc(100vh-280px)]">
                {isFinishing && <FinishingOverlay />}

                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg scrollbar-thin"
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-2 group`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          message.role === 'user' ? 'bg-teal-600 dark:bg-teal-700 self-start' : 'bg-slate-600 dark:bg-slate-700'
                        }`}
                        style={message.role === 'user' ? { marginTop: '25px' } : undefined}
                      >
                        {message.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
                      </div>

                      <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {message.role === 'user' && (
                          <div className={`flex items-center gap-1 mb-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <button onClick={() => handleCopyMessage(message.content)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" title="Copiar mensagem">
                              <Copy size={12} className="text-slate-500 dark:text-slate-400" />
                            </button>
                            <button onClick={() => handleResendMessage(message.content)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" title="Reenviar mensagem" disabled={isLoading}>
                              <RotateCcw size={12} className="text-slate-500 dark:text-slate-400" />
                            </button>
                          </div>
                        )}
                        <div
                          className={`inline-block p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-teal-600 dark:bg-teal-700 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {message.role === 'assistant' && message.isTyping ? (
                            <TypingIndicator />
                          ) : message.role === 'assistant' && message.isNew && message.content ? (
                            <TypingEffect text={message.content} onTick={scrollToBottom} />
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                        <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 px-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {!isFinished && !isFinishing && (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                        className="w-9 h-9 bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={17} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard
              title="Possíveis doenças"
              subtitle={!isFinished && diseases.length > 0 ? 'Clique para detalhes · ★ para marcar como provável' : 'Diagnósticos prováveis baseados na conversa'}
            >
              <div className="space-y-3">
                {diseases.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma doença identificada ainda.<br />Continue a conversa para análise.</p>
                  </div>
                ) : (
                  diseases.map((disease, index) => {
                    const prob = normalizeProb(disease.probability);
                    const isMarked = markedDiseaseIndex === index;

                    return (
                      <div
                        key={`${disease.name}-${index}`}
                        className={`p-3 border rounded-lg transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-right cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          isMarked
                            ? 'border-teal-400 dark:border-teal-600 bg-teal-50/50 dark:bg-teal-900/10 ring-1 ring-teal-400/30'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => setDetailDisease(disease)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <AlertCircle size={16} className={`mt-0.5 shrink-0 ${getSeverityColor(disease.severity)}`} />
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{disease.name}</h4>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!isFinished && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setMarkedDiseaseIndex(isMarked ? null : index); }}
                                className={`p-1 rounded transition-colors ${isMarked ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:text-teal-500 dark:text-slate-500 dark:hover:text-teal-400'}`}
                                title={isMarked ? 'Desmarcar como mais provável' : 'Marcar como mais provável'}
                              >
                                <Star size={14} fill={isMarked ? 'currentColor' : 'none'} />
                              </button>
                            )}
                            <Badge color={disease.severity}>{prob}%</Badge>
                          </div>
                        </div>
                        {disease.reasoning && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 ml-6 line-clamp-2">{disease.reasoning}</p>
                        )}
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              disease.severity === 'red' ? 'bg-red-600 dark:bg-red-500' :
                                disease.severity === 'yellow' ? 'bg-yellow-500' :
                                  'bg-green-600 dark:bg-green-500'
                            }`}
                            style={{ width: `${prob}%` }}
                          />
                        </div>
                        {isMarked && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-medium">
                            <Star size={10} fill="currentColor" /> Marcada como mais provável
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </SectionCard>

            {suggestedTreatments.length > 0 && (
              <SectionCard title="Tratamentos sugeridos" subtitle="Possíveis tratamentos ou próximos passos">
                <div className="space-y-2">
                  {suggestedTreatments.map((treatment, index) => (
                    <div key={index} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg animate-in fade-in slide-in-from-right" style={{ animationDelay: `${index * 50}ms` }}>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{treatment}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            <SectionCard title="Informações sugeridas" subtitle="Observações e dados relevantes para o caso">
              <div className="space-y-2">
                {suggestedInfo.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Info size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma informação sugerida ainda.<br />Continue a conversa para receber sugestões.</p>
                  </div>
                ) : (
                  suggestedInfo.map((info, index) => (
                    <div
                      key={index}
                      className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30 animate-in fade-in slide-in-from-right"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-2">
                        <Info size={14} className="text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-slate-700 dark:text-slate-300">{info}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {detailDisease && (
        <DiseaseDetailModal
          disease={detailDisease}
          generalTreatments={suggestedTreatments}
          onClose={() => setDetailDisease(null)}
        />
      )}

      {showConfirmFinish && (
        <ConfirmFinishModal
          onConfirm={handleConfirmFinish}
          onCancel={() => setShowConfirmFinish(false)}
        />
      )}

      {showHistory && <ConsultationHistory onClose={() => setShowHistory(false)} />}
    </div>
  );
}
