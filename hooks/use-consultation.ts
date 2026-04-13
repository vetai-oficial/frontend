'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';

import { getSocket } from '@/infra/socket';
import type { ConsultationDisease } from '@/types/consultation';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean | undefined;
  isNew?: boolean | undefined;
}

interface NewMessagePayload {
  role: 'assistant';
  content: string;
  timestamp: string;
  diseases: ConsultationDisease[];
  suggestedInfo: string[];
  suggestedTreatments: string[];
}

interface ConsultationFinishedPayload {
  summary: string;
  diseases: ConsultationDisease[];
  suggestedTreatments: string[];
  selectedDiseaseName?: string;
}

interface UseConsultationOptions {
  consultationId: string | null;
  initialMessages?: ChatMessage[] | undefined;
}

function sortDiseases(diseases: ConsultationDisease[]): ConsultationDisease[] {
  return [...diseases].sort((a, b) => {
    const pa = a.probability <= 1 ? a.probability * 100 : a.probability;
    const pb = b.probability <= 1 ? b.probability * 100 : b.probability;
    return pb - pa;
  });
}

export function useConsultation({
  consultationId,
  initialMessages,
}: UseConsultationOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [diseases, setDiseases] = useState<ConsultationDisease[]>([]);
  const [suggestedInfo, setSuggestedInfo] = useState<string[]>([]);
  const [suggestedTreatments, setSuggestedTreatments] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const nextIdRef = useRef(initialMessages?.length ?? 0);

  useEffect(() => {
    if (!consultationId) return;

    const socket = getSocket();
    socketRef.current = socket;

    const handleNewMessage = (payload: NewMessagePayload) => {
      nextIdRef.current += 1;

      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => !msg.isTyping);
        return [
          ...withoutTyping,
          {
            id: nextIdRef.current,
            role: 'assistant' as const,
            content: payload.content,
            timestamp: new Date(payload.timestamp),
            isNew: true,
          },
        ];
      });

      if (payload.diseases?.length > 0) setDiseases(sortDiseases(payload.diseases));
      if (payload.suggestedInfo?.length > 0) setSuggestedInfo(payload.suggestedInfo);
      if (payload.suggestedTreatments?.length > 0) setSuggestedTreatments(payload.suggestedTreatments);

      setIsLoading(false);
    };

    const handleFinished = (payload: ConsultationFinishedPayload) => {
      setIsFinished(true);
      setIsFinishing(false);
      setSummary(payload.summary);
      if (payload.diseases?.length > 0) setDiseases(sortDiseases(payload.diseases));
      if (payload.suggestedTreatments?.length > 0) setSuggestedTreatments(payload.suggestedTreatments);
      setIsLoading(false);
    };

    const handleError = (payload: { message: string }) => {
      setError(payload.message);
      setIsFinishing(false);

      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => !msg.isTyping);
        nextIdRef.current += 1;
        return [
          ...withoutTyping,
          {
            id: nextIdRef.current,
            role: 'assistant' as const,
            content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
            timestamp: new Date(),
          },
        ];
      });
      setIsLoading(false);
    };

    const handleAutoFinished = (payload: ConsultationFinishedPayload & { consultationId: string }) => {
      setIsFinished(true);
      setIsFinishing(false);
      setSummary(payload.summary);
      if (payload.diseases?.length > 0) setDiseases(sortDiseases(payload.diseases));
      if (payload.suggestedTreatments?.length > 0) setSuggestedTreatments(payload.suggestedTreatments);
      setIsLoading(false);
      setError('Consulta finalizada automaticamente por inatividade.');
    };

    socket.on('new_message', handleNewMessage);
    socket.on('consultation_finished', handleFinished);
    socket.on('consultation_auto_finished', handleAutoFinished);
    socket.on('error', handleError);

    socket.emit('join_consultation', { consultationId });

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('consultation_finished', handleFinished);
      socket.off('consultation_auto_finished', handleAutoFinished);
      socket.off('error', handleError);
    };
  }, [consultationId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!consultationId || !socketRef.current || isLoading) return;

      setError(null);
      nextIdRef.current += 1;

      const userMessage: ChatMessage = {
        id: nextIdRef.current,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      nextIdRef.current += 1;
      const typingMessage: ChatMessage = {
        id: nextIdRef.current,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isTyping: true,
      };

      setMessages((prev) => [...prev, userMessage, typingMessage]);
      setIsLoading(true);

      socketRef.current.emit('send_message', { consultationId, content });
    },
    [consultationId, isLoading],
  );

  const finishConsultation = useCallback(
    (selectedDiseaseName?: string) => {
      if (!consultationId || !socketRef.current || isLoading) return;
      setIsLoading(true);
      setIsFinishing(true);
      socketRef.current.emit('finish_consultation', {
        consultationId,
        selectedDiseaseName,
      });
    },
    [consultationId, isLoading],
  );

  const resetMessages = useCallback(
    (
      newMessages: ChatMessage[],
      initialDiagnosis?: {
        diseases?: ConsultationDisease[];
        suggestedTreatments?: string[];
        suggestedQuestions?: string[];
      },
    ) => {
      setMessages(newMessages);
      nextIdRef.current = newMessages.length;
      setDiseases(initialDiagnosis?.diseases?.length ? sortDiseases(initialDiagnosis.diseases) : []);
      setSuggestedInfo(initialDiagnosis?.suggestedQuestions ?? []);
      setSuggestedTreatments(initialDiagnosis?.suggestedTreatments ?? []);
      setIsFinished(false);
      setIsFinishing(false);
      setSummary(null);
      setError(null);
    },
    [],
  );

  return {
    messages,
    isLoading,
    isFinishing,
    diseases,
    suggestedInfo,
    suggestedTreatments,
    isFinished,
    summary,
    error,
    sendMessage,
    finishConsultation,
    resetMessages,
  };
}
