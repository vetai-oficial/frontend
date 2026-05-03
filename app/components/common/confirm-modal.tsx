'use client';

import { Modal } from './modal';

import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal title={title} onClose={onClose} maxWidth='sm'>
      <p className='text-sm text-slate-600 dark:text-slate-300 mb-6'>
        {description}
      </p>
      <div className='flex gap-3 justify-end'>
        <Button variant='outline' onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          loading={loading}
          className={
            variant === 'danger'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
