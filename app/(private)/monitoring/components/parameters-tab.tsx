'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Beaker, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { ConfirmModal } from '@/app/components/common/confirm-modal';
import { Modal } from '@/app/components/common/modal';
import { SectionCard } from '@/app/components/data/section-card';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import {
  clinicalParameterSchema,
  type ClinicalParameterFormData,
} from '@/schemas/monitoring';
import { monitoringService } from '@/services/monitoring.service';
import type { ClinicalParameter } from '@/types/monitoring';

interface ParameterFormModalProps {
  parameter?: ClinicalParameter;
  onClose: () => void;
  onSuccess: () => void;
}

function ParameterFormModal({
  parameter,
  onClose,
  onSuccess,
}: ParameterFormModalProps) {
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicalParameterFormData>({
    resolver: yupResolver(
      clinicalParameterSchema,
    ) as Resolver<ClinicalParameterFormData>,
    defaultValues: {
      name: parameter?.name ?? '',
      unit: parameter?.unit ?? '',
    },
  });

  const onSubmit = async (data: ClinicalParameterFormData) => {
    setSaving(true);
    try {
      if (parameter) {
        await monitoringService.updateParameter(parameter.id, {
          name: data.name,
          unit: data.unit || undefined,
        });
      } else {
        await monitoringService.createParameter({
          name: data.name,
          ...(data.unit ? { unit: data.unit } : {}),
        });
      }
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={parameter ? 'Editar Parâmetro' : 'Novo Parâmetro Clínico'}
      onClose={onClose}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Nome"
              required
              placeholder="Ex: Glicemia"
              value={field.value}
              onChange={field.onChange}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          name="unit"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Unidade"
              placeholder="Ex: mg/dL (opcional)"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.unit?.message}
            />
          )}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={saving}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function ParametersTab() {
  const [parameters, setParameters] = useState<ClinicalParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ClinicalParameter | null>(null);
  const [deleting, setDeleting] = useState<ClinicalParameter | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchParameters = useCallback(async () => {
    setLoading(true);
    try {
      setParameters(await monitoringService.listParameters());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchParameters();
  }, [fetchParameters]);

  const toggleActive = async (parameter: ClinicalParameter) => {
    await monitoringService.updateParameter(parameter.id, {
      active: !parameter.active,
    });
    void fetchParameters();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await monitoringService.deleteParameter(deleting.id);
      setDeleting(null);
      void fetchParameters();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <SectionCard
      title="Parâmetros Clínicos"
      subtitle="Defina o que a equipe registra na evolução dos pacientes (temperatura, apetite, hidratação...)"
      headerAction={
        <Button
          onClick={() => setShowForm(true)}
          className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
        >
          <Plus size={16} />
          Novo parâmetro
        </Button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-teal-600" />
        </div>
      ) : parameters.length === 0 ? (
        <div className="text-center py-12">
          <Beaker size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Nenhum parâmetro cadastrado</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {parameters.map((parameter) => (
            <div
              key={parameter.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {parameter.name}
                  {parameter.unit && (
                    <span className="text-slate-400 dark:text-slate-500 font-normal">
                      {' '}
                      ({parameter.unit})
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => void toggleActive(parameter)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                    parameter.active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}
                  title="Clique para alternar"
                >
                  {parameter.active ? 'Ativo' : 'Inativo'}
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditing(parameter)}
                  title="Editar"
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeleting(parameter)}
                  title="Excluir"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editing) && (
        <ParameterFormModal
          {...(editing ? { parameter: editing } : {})}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditing(null);
            void fetchParameters();
          }}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Excluir parâmetro"
          description={`Tem certeza que deseja excluir "${deleting.name}"?`}
          confirmLabel="Excluir"
          variant="danger"
          loading={deleteLoading}
          onConfirm={() => void handleDelete()}
          onClose={() => setDeleting(null)}
        />
      )}
    </SectionCard>
  );
}
