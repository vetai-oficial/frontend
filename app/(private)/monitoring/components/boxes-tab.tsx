'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { BedDouble, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { ConfirmModal } from '@/app/components/common/confirm-modal';
import { Modal } from '@/app/components/common/modal';
import { SectionCard } from '@/app/components/data/section-card';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { boxSchema, type BoxFormData } from '@/schemas/monitoring';
import { monitoringService } from '@/services/monitoring.service';
import type { Box } from '@/types/monitoring';

interface BoxFormModalProps {
  box?: Box;
  onClose: () => void;
  onSuccess: () => void;
}

function BoxFormModal({ box, onClose, onSuccess }: BoxFormModalProps) {
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BoxFormData>({
    resolver: yupResolver(boxSchema) as Resolver<BoxFormData>,
    defaultValues: {
      name: box?.name ?? '',
      description: box?.description ?? '',
    },
  });

  const onSubmit = async (data: BoxFormData) => {
    setSaving(true);
    try {
      if (box) {
        await monitoringService.updateBox(box.id, {
          name: data.name,
          description: data.description || undefined,
        });
      } else {
        await monitoringService.createBox({
          name: data.name,
          ...(data.description ? { description: data.description } : {}),
        });
      }
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={box ? 'Editar Box' : 'Novo Box'} onClose={onClose} maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Nome"
              required
              placeholder="Ex: Box 01"
              value={field.value}
              onChange={field.onChange}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Descrição"
              placeholder="Ex: Gatil — ala silenciosa"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.description?.message}
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

export function BoxesTab() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Box | null>(null);
  const [deleting, setDeleting] = useState<Box | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBoxes = useCallback(async () => {
    setLoading(true);
    try {
      setBoxes(await monitoringService.listBoxes());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBoxes();
  }, [fetchBoxes]);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await monitoringService.deleteBox(deleting.id);
      setDeleting(null);
      void fetchBoxes();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <SectionCard
      title="Boxes de Internação"
      subtitle="Cadastre e acompanhe a ocupação dos boxes da sua clínica"
      headerAction={
        <Button
          onClick={() => setShowForm(true)}
          className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
        >
          <Plus size={16} />
          Novo box
        </Button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-teal-600" />
        </div>
      ) : boxes.length === 0 ? (
        <div className="text-center py-12">
          <BedDouble size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Nenhum box cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {boxes.map((box) => (
            <div
              key={box.id}
              className={`p-4 rounded-xl border transition-colors ${
                box.occupied
                  ? 'border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-900/10'
                  : 'border-green-200 dark:border-green-900/50 bg-green-50/40 dark:bg-green-900/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <BedDouble
                    size={18}
                    className={
                      box.occupied
                        ? 'text-red-500 shrink-0'
                        : 'text-green-500 shrink-0'
                    }
                  />
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {box.name}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditing(box)}
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleting(box)}
                    disabled={box.occupied}
                    title={box.occupied ? 'Box ocupado' : 'Excluir'}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              {box.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {box.description}
                </p>
              )}
              <p
                className={`text-xs font-medium mt-2 ${
                  box.occupied
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                {box.occupied
                  ? `Ocupado — ${box.occupant?.patient_name ?? ''}`
                  : 'Livre'}
              </p>
            </div>
          ))}
        </div>
      )}

      {(showForm || editing) && (
        <BoxFormModal
          {...(editing ? { box: editing } : {})}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditing(null);
            void fetchBoxes();
          }}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Excluir box"
          description={`Tem certeza que deseja excluir o box "${deleting.name}"?`}
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
