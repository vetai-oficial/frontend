'use client';

import { AlertCircle, Bot, Send, User, Copy, RotateCcw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { Badge } from '@/app/components/badge';
import { Header } from '@/app/components/header';
import { SectionCard } from '@/app/components/section-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface Disease {
  id: number;
  name: string;
  probability: number;
  severity: 'red' | 'yellow' | 'green';
  reasoning?: string;
}

interface SuggestedQuestion {
  id: number;
  question: string;
}

function TypingEffect({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 20);

      return () => clearTimeout(timeout);
    } else if (onComplete && currentIndex === text.length) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <p className="text-sm whitespace-pre-wrap">{displayedText}</p>;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

export default function Consultation() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'Olá! Sou o assistente de IA da VetAI. Como posso ajudá-lo com sua consulta veterinária hoje?',
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [possibleDiseases, setPossibleDiseases] = useState<Disease[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const updateDiseasesWithTransition = (newDiseases: Disease[]) => {
    const diseasesWithIds = newDiseases.map((disease, index) => ({
      ...disease,
      id: index + 1,
    }));

    setPossibleDiseases(diseasesWithIds);
  };

  const updateQuestionsWithTransition = (newQuestions: string[]) => {
    const questionsWithIds = newQuestions.map((question, index) => ({
      id: index + 1,
      question,
    }));

    setSuggestedQuestions(questionsWithIds);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    const typingMessage: Message = {
      id: updatedMessages.length + 1,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na comunicação com a API');
      }

      const data = await response.json();

      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => !msg.isTyping);
        return [
          ...withoutTyping,
          {
            id: prev.length,
            role: 'assistant' as const,
            content: data.message,
            timestamp: new Date(),
            isTyping: false,
          },
        ];
      });

      if (data.diseases && data.diseases.length > 0) {
        updateDiseasesWithTransition(data.diseases);
      }

      if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
        updateQuestionsWithTransition(data.suggestedQuestions);
      }
    } catch (_error) {
      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => !msg.isTyping);
        return [
          ...withoutTyping,
          {
            id: prev.length,
            role: 'assistant' as const,
            content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleResendMessage = async (content: string) => {
    if (isLoading) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Adicionar mensagem temporária com efeito de digitação
    const typingMessage: Message = {
      id: updatedMessages.length + 1,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na comunicação com a API');
      }

      const data = await response.json();

      // Remover mensagem de digitação e adicionar resposta real
      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => !msg.isTyping);
        return [
          ...withoutTyping,
          {
            id: prev.length,
            role: 'assistant' as const,
            content: data.message,
            timestamp: new Date(),
            isTyping: false,
          },
        ];
      });

      // Atualizar doenças e perguntas com transição suave
      if (data.diseases && data.diseases.length > 0) {
        updateDiseasesWithTransition(data.diseases);
      }

      if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
        updateQuestionsWithTransition(data.suggestedQuestions);
      }
    } catch (_error) {
      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => !msg.isTyping);
        return [
          ...withoutTyping,
          {
            id: prev.length,
            role: 'assistant' as const,
            content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: 'red' | 'yellow' | 'green') => {
    const colors = {
      red: 'text-red-600 dark:text-red-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      green: 'text-green-600 dark:text-green-400',
    };
    return colors[severity];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Consulta" showStorage={false} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SectionCard
              title="Chat com Assistente IA"
              subtitle="Converse com o assistente para diagnóstico auxiliar"
            >
              <div className="flex flex-col h-[calc(100vh-280px)]">
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
                          message.role === 'user'
                            ? 'bg-teal-600 dark:bg-teal-700 self-start'
                            : 'bg-slate-600 dark:bg-slate-700'
                        }`}
                        style={message.role === 'user' ? { marginTop: '25px' } : undefined}
                      >
                        {message.role === 'user' ? (
                          <User size={18} className="text-white" />
                        ) : (
                          <Bot size={18} className="text-white" />
                        )}
                      </div>

                      <div
                        className={`flex-1 max-w-[80%] ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {message.role === 'user' && (
                          <div className={`flex items-center gap-1 mb-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <button
                              onClick={() => handleCopyMessage(message.content)}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                              title="Copiar mensagem"
                            >
                              <Copy size={12} className="text-slate-500 dark:text-slate-400" />
                            </button>
                            <button
                              onClick={() => handleResendMessage(message.content)}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                              title="Reenviar mensagem"
                              disabled={isLoading}
                            >
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
                          ) : message.role === 'assistant' && message.content ? (
                            <TypingEffect text={message.content} />
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                        <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 px-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {message.timestamp.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

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
                      disabled={isLoading}
                      className="w-9 h-9 bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={17} />
                    </Button>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard
              title="Possíveis doenças"
              subtitle="Diagnósticos prováveis baseados na conversa"
            >
              <div className="space-y-3">
                {possibleDiseases.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Nenhuma doença identificada ainda.
                      <br />
                      Continue a conversa para análise.
                    </p>
                  </div>
                ) : (
                  possibleDiseases.map((disease, index) => (
                    <div
                      key={disease.id}
                      className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-right"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle
                            size={16}
                            className={`mt-0.5 ${getSeverityColor(disease.severity)}`}
                          />
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {disease.name}
                          </h4>
                        </div>
                        <Badge color={disease.severity}>{disease.probability}%</Badge>
                      </div>
                      {disease.reasoning && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 ml-6">
                          {disease.reasoning}
                        </p>
                      )}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            disease.severity === 'red'
                              ? 'bg-red-600 dark:bg-red-500'
                              : disease.severity === 'yellow'
                                ? 'bg-yellow-500'
                                : 'bg-green-600 dark:bg-green-500'
                          }`}
                          style={{ width: `${disease.probability}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Perguntas sugeridas"
              subtitle="Clique para adicionar ao chat"
            >
              <div className="space-y-2">
                {suggestedQuestions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Nenhuma pergunta sugerida ainda.
                      <br />
                      Continue a conversa para receber sugestões.
                    </p>
                  </div>
                ) : (
                  suggestedQuestions.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => handleSuggestedQuestion(item.question)}
                      disabled={isLoading}
                      className="w-full text-left p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 ease-in-out group disabled:opacity-50 disabled:cursor-not-allowed animate-in fade-in slide-in-from-right"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <p className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-teal-700 dark:group-hover:text-teal-400">
                        {item.question}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
