import { Loader2 } from 'lucide-react';

export function FinishingOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg">
      <Loader2 size={40} className="animate-spin text-teal-600 mb-4" />
      <p className="text-lg font-semibold text-slate-900 dark:text-white">
        Salvando dados da consulta...
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Gerando resumo e diagnósticos finais
      </p>
    </div>
  );
}
