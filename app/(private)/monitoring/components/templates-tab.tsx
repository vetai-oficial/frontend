'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { ClipboardList, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { doseLabel, FREQUENCY_LABELS, PRESCRIPTION_TYPE_MAP } from '../utils';

import { ConfirmModal } from '@/app/components/common/confirm-modal';
import { Modal } from '@/app/components/common/modal';
import { SectionCard } from '@/app/components/data/section-card';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import {
  templateInfoSchema,
  type TemplateInfoFormData,
} from '@/schemas/monitoring';
import { monitoringService } from '@/services/monitoring.service';
import type {
  DoseUnit,
  PrescriptionFrequency,
  PrescriptionTemplate,
  PrescriptionType,
  TemplateItem,
} from '@/types/monitoring';

const EMPTY_ITEM = {
  type: 'MEDICATION' as PrescriptionType,
  name: '',
  dose_value: '',
  dose_unit: '',
  frequency: 'RECURRING' as PrescriptionFrequency,
  interval_hours: '',
  duration_days: '',
  notes: '',
};

interface TemplateFormModalProps {
  template?: PrescriptionTemplate;
  onClose: () => void;
  onSuccess: () => void;
}

function TemplateFormModal({
  template,
  onClose,
  onSuccess,
}: TemplateFormModalProps) {
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<TemplateItem[]>(template?.items ?? []);
  const [draft, setDraft] = useState({ ...EMPTY_ITEM });
  const [itemError, setItemError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TemplateInfoFormData>({
    resolver: yupResolver(templateInfoSchema) as Resolver<TemplateInfoFormData>,
    defaultValues: {
      name: template?.name ?? '',
      description: template?.description ?? '',
    },
  });

  const addItem = () => {
    if (!draft.name.trim()) {
      setItemError('Informe o nome do item');
      return;
    }
    if (
      draft.frequency === 'RECURRING' &&
      (!Number(draft.interval_hours) || !Number(draft.duration_days))
    ) {
      setItemError('Itens recorrentes exigem intervalo e duração');
      return;
    }
    setItemError(null);

    const doseValue = draft.dose_value
      ? Number(draft.dose_value.replace(',', '.'))
      : undefined;

    setItems((prev) => [
      ...prev,
      {
        type: draft.type,
        name: draft.name.trim(),
        frequency: draft.frequency,
        ...(doseValue && draft.dose_unit
          ? { dose_value: doseValue, dose_unit: draft.dose_unit as DoseUnit }
          : {}),
        ...(draft.frequency === 'RECURRING'
          ? {
            interval_hours: Number(draft.interval_hours),
            duration_days: Number(draft.duration_days),
          }
          : {}),
        ...(draft.notes ? { notes: draft.notes } : {}),
      },
    ]);
    setDraft({ ...EMPTY_ITEM });
  };

  const onSubmit = async (data: TemplateInfoFormData) => {
    if (!items.length) {
      setError('Adicione ao menos um item ao modelo');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (template) {
        await monitoringService.updateTemplate(template.id, {
          name: data.name,
          description: data.description || undefined,
          items,
        });
      } else {
        await monitoringService.createTemplate({
          name: data.name,
          ...(data.description ? { description: data.description } : {}),
          items,
        });
      }
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={template ? 'Editar Modelo' : 'Novo Modelo de Prescrição'}
      description="Modelos agilizam a prescrição de quadros clínicos recorrentes"
      onClose={onClose}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label="Nome do modelo"
                required
                placeholder="Ex: Pós-operatório padrão"
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
                placeholder="Opcional"
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.description?.message}
              />
            )}
          />
        </div>

        {items.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Itens do modelo ({items.length})
            </p>
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${PRESCRIPTION_TYPE_MAP[item.type].badge}`}
                    >
                      {PRESCRIPTION_TYPE_MAP[item.type].label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {FREQUENCY_LABELS[item.frequency]}
                    {item.frequency === 'RECURRING'
                      ? ` · a cada ${item.interval_hours}h por ${item.duration_days} dia(s)`
                      : ''}
                    {doseLabel(item) ? ` · ${doseLabel(item)}` : ''}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setItems((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-red-500 hover:text-red-600 shrink-0"
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-dashed border-slate-300 dark:border-slate-600 space-y-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Adicionar item
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectInput
              label="Tipo"
              value={draft.type}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, type: value as PrescriptionType }))
              }
              options={[
                { value: 'MEDICATION', label: 'Medicamento' },
                { value: 'PROCEDURE', label: 'Procedimento' },
                { value: 'FLUID', label: 'Fluidoterapia' },
              ]}
            />
            <SelectInput
              label="Frequência"
              value={draft.frequency}
              onChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  frequency: value as PrescriptionFrequency,
                }))
              }
              options={[
                { value: 'RECURRING', label: 'Recorrente' },
                { value: 'ONCE', label: 'Apenas uma vez' },
                { value: 'AS_NEEDED', label: 'Quando necessário (SOS)' },
              ]}
            />
          </div>
          <InputWithLabel
            label="Nome"
            placeholder="Ex: Dipirona 500mg"
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InputWithLabel
              label="Dose"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 0.5"
              value={draft.dose_value}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, dose_value: e.target.value }))
              }
            />
            <SelectInput
              label="Unidade"
              value={draft.dose_unit}
              onChange={(value) => setDraft((prev) => ({ ...prev, dose_unit: value }))}
              options={[
                { value: '', label: 'Sem dose' },
                { value: 'MG', label: 'mg' },
                { value: 'MCG', label: 'mcg' },
                { value: 'G', label: 'g' },
                { value: 'ML', label: 'ml' },
                { value: 'ML_H', label: 'ml/h' },
                { value: 'TABLET', label: 'comprimido(s)' },
                { value: 'CAPSULE', label: 'cápsula(s)' },
                { value: 'DROP', label: 'gota(s)' },
              ]}
            />
            {draft.frequency === 'RECURRING' && (
              <>
                <InputWithLabel
                  label="A cada (h)"
                  type="number"
                  min="1"
                  placeholder="8"
                  value={draft.interval_hours}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, interval_hours: e.target.value }))
                  }
                />
                <InputWithLabel
                  label="Durante (dias)"
                  type="number"
                  min="1"
                  placeholder="3"
                  value={draft.duration_days}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, duration_days: e.target.value }))
                  }
                />
              </>
            )}
          </div>
          {itemError && <p className="text-sm text-red-500">{itemError}</p>}
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus size={14} />
            Adicionar item
          </Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={saving}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
          >
            Salvar modelo
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function TemplatesTab() {
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PrescriptionTemplate | null>(null);
  const [deleting, setDeleting] = useState<PrescriptionTemplate | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await monitoringService.listTemplates({
        size: 100,
        sort: 'name',
        direction: 'asc',
      });
      setTemplates(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await monitoringService.deleteTemplate(deleting.id);
      setDeleting(null);
      void fetchTemplates();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <SectionCard
      title="Modelos de Prescrição"
      subtitle="Padronize tratamentos para quadros comuns e ganhe agilidade nas internações"
      headerAction={
        <Button
          onClick={() => setShowForm(true)}
          className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700"
        >
          <Plus size={16} />
          Novo modelo
        </Button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-teal-600" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Nenhum modelo cadastrado</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Crie modelos para quadros comuns, como pós-operatório ou gastroenterite.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {template.name}
                  </p>
                  {template.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {template.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditing(template)}
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleting(template)}
                    title="Excluir"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {template.items.slice(0, 3).map((item, index) => (
                  <p
                    key={index}
                    className="text-xs text-slate-600 dark:text-slate-300 truncate"
                  >
                    • {item.name}
                    <span className="text-slate-400 dark:text-slate-500">
                      {' '}
                      — {FREQUENCY_LABELS[item.frequency]}
                      {item.frequency === 'RECURRING'
                        ? `, a cada ${item.interval_hours}h`
                        : ''}
                    </span>
                  </p>
                ))}
                {template.items.length > 3 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    + {template.items.length - 3} item(ns)
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editing) && (
        <TemplateFormModal
          {...(editing ? { template: editing } : {})}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditing(null);
            void fetchTemplates();
          }}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Excluir modelo"
          description={`Tem certeza que deseja excluir o modelo "${deleting.name}"?`}
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
