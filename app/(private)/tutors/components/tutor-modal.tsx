'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { tutorSchema, type TutorFormData } from '@/schemas/tutor';
import { tutorsService } from '@/services/tutors.service';
import type {
  CreateTutorPayload,
  Tutor,
  UpdateTutorPayload,
} from '@/types/tutor';
import { formatCPF } from '@/utils/validations';

interface TutorModalProps {
  tutor?: Tutor;
  onClose: () => void;
  onSuccess: (tutor: Tutor) => void;
}

export function TutorModal({ tutor, onClose, onSuccess }: TutorModalProps) {
  const isEdit = !!tutor;
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TutorFormData>({
    resolver: yupResolver(tutorSchema),
    defaultValues: {
      name: tutor?.name ?? '',
      cpf: tutor?.cpf ?? '',
      phone: tutor?.phone ?? '',
      email: tutor?.email ?? '',
    },
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const onSubmit = async (data: TutorFormData) => {
    setSaving(true);

    try {
      let result: Tutor;
      if (isEdit) {
        const payload = {
          name: data.name.trim(),
          cpf: data.cpf.trim(),
        } as UpdateTutorPayload;
        if (data.phone?.trim()) payload.phone = data.phone.trim();
        if (data.email?.trim()) payload.email = data.email.trim();
        result = await tutorsService.update(tutor.id, payload);
      } else {
        const payload = {
          name: data.name.trim(),
          cpf: data.cpf.trim(),
        } as CreateTutorPayload;
        if (data.phone?.trim()) payload.phone = data.phone.trim();
        if (data.email?.trim()) payload.email = data.email.trim();
        result = await tutorsService.create(payload);
      }
      onSuccess(result);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200'>
        <div className='flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700'>
          <div>
            <h2 className='text-lg font-bold text-slate-900 dark:text-white'>
              {isEdit ? 'Editar Tutor' : 'Novo Tutor'}
            </h2>
            <p className='text-sm text-slate-500 dark:text-slate-400 mt-0.5'>
              {isEdit ? 'Atualize os dados do tutor' : 'Cadastre um novo tutor'}
            </p>
          </div>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={onClose}
            className='text-slate-500'
          >
            <X size={18} />
          </Button>
        </div>

        <div className='p-5 space-y-4'>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label='Nome'
                required
                type='text'
                value={field.value}
                onChange={field.onChange}
                placeholder='Ex: João Silva'
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            name='cpf'
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label='CPF'
                required
                type='text'
                value={field.value}
                onChange={(e) => field.onChange(formatCPF(e.target.value))}
                placeholder='Ex: 123.456.789-09'
                error={errors.cpf?.message}
              />
            )}
          />

          <Controller
            name='phone'
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label='Telefone'
                required
                type='tel'
                value={field.value}
                onChange={field.onChange}
                placeholder='Ex: (11) 99999-9999'
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label='E-mail'
                required
                type='email'
                value={field.value}
                onChange={field.onChange}
                placeholder='Ex: joao@email.com'
                error={errors.email?.message}
              />
            )}
          />
        </div>

        <div className='flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700'>
          <Button variant='outline' onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className='bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 dark:hover:bg-teal-800 min-w-[100px]'
          >
            {saving ? (
              <Loader2 size={16} className='animate-spin' />
            ) : isEdit ? (
              'Salvar'
            ) : (
              'Cadastrar'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
