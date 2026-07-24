'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/infra/utils';

export interface ModalProps {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const MAX_WIDTH_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({
  title,
  description,
  children,
  onClose,
  maxWidth = 'md',
  className,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col',
          MAX_WIDTH_MAP[maxWidth],
          className,
        )}
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="ml-4 shrink-0 text-slate-500"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}
