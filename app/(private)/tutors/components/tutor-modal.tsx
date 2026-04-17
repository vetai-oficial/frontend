'use client';

import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { InputWithLabel } from '@/app/components/input-with-label';
import { Button } from '@/components/ui/button';
import { tutorsService } from '@/services/tutors.service';
import type { CreateTutorPayload, Tutor, UpdateTutorPayload } from '@/types/tutor';

interface TutorModalProps {
  tutor?: Tutor;
  onClose: () => void;
  onSuccess: (tutor: Tutor) => void;
}

export function TutorModal({ tutor, onClose, onSuccess }: TutorModalProps) {
  const isEdit = !!tutor;
  const [name, setName] = useState(tutor?.name ?? '');
  const [cpf, setCpf] = useState(tutor?.cpf ?? '');
  const [phone, setPhone] = useState(tutor?.phone ?? '');
  const [email, setEmail] = useState(tutor?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function formatCpf(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nome é obrigatório';
    if (!cpf.trim()) errs.cpf = 'CPF é obrigatório';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);

    try {
      let result: Tutor;
      if (isEdit) {
        const payload = { name: name.trim(), cpf: cpf.trim() } as UpdateTutorPayload;
        if (phone.trim()) payload.phone = phone.trim();
        if (email.trim()) payload.email = email.trim();
        result = await tutorsService.update(tutor.id, payload);
      } else {
        const payload = { name: name.trim(), cpf: cpf.trim() } as CreateTutorPayload;
        if (phone.trim()) payload.phone = phone.trim();
        if (email.trim()) payload.email = email.trim();
        result = await tutorsService.create(payload);
      }
      onSuccess(result);
    } catch {
      setErrors({ general: 'Erro ao salvar. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEdit ? 'Editar Tutor' : 'Novo Tutor'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isEdit ? 'Atualize os dados do tutor' : 'Cadastre um novo tutor'}
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-slate-500">
            <X size={18} />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          <InputWithLabel
            label="Nome"
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Silva"
            error={errors.name}
          />

          <InputWithLabel
            label="CPF"
            required
            type="text"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            placeholder="Ex: 123.456.789-09"
            error={errors.cpf}
          />

          <InputWithLabel
            label="Telefone"
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex: (11) 99999-9999"
          />

          <InputWithLabel
            label="E-mail"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex: joao@email.com"
          />

          {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button
            onClick={() => { void handleSubmit(); }}
            disabled={saving}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 dark:hover:bg-teal-800 min-w-[100px]"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : isEdit ? 'Salvar' : 'Cadastrar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
