'use client';

import { Trash2 } from 'lucide-react';

interface DeleteBtnProps {
  onDelete: () => void;
}

export function DeleteBtn({ onDelete }: DeleteBtnProps) {
  return (
    <button
      onClick={onDelete}
      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors shrink-0"
    >
      <Trash2 size={14} />
    </button>
  );
}
