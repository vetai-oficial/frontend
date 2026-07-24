'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { Modal } from '@/app/components/common/modal';
import { DateInput } from '@/app/components/forms/date-input';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SearchSelect } from '@/app/components/forms/search-select';
import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { vaccineDoseSchema, type VaccineDoseFormData } from '@/schemas/vaccine';
import { healthRecordsService } from '@/services/health-records.service';
import { vaccinesService } from '@/services/vaccines.service';
import type { VaccineMetadata } from '@/types/health-record';
import type { Vaccine } from '@/types/vaccine';

interface AddVaccineModalProps {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddVaccineModal({
  patientId,
  onClose,
  onSuccess,
}: AddVaccineModalProps) {
  const [showVaccineDropdown, setShowVaccineDropdown] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [loadingPrevDose, setLoadingPrevDose] = useState(false);
  const [saving, setSaving] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    items: catalogVaccines,
    loading: loadingCatalog,
    search: vaccineSearch,
    setSearch: setVaccineSearch,
  } = usePaginatedResource<Vaccine, { search?: string }>({
    fetcher: vaccinesService.list,
    initialFilters: { search: '' },
    pageSize: 20,
    debounceMs: 300,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VaccineDoseFormData>({
    resolver: yupResolver(vaccineDoseSchema) as Resolver<VaccineDoseFormData>,
    defaultValues: {
      vaccineId: '',
      date: new Date().toISOString().slice(0, 10),
      doseNumber: '1ª Dose',
      batch: '',
      previousDoseDate: '',
      appliedBy: '',
      notes: '',
    },
  });

  const date = watch('date');

  const calcRevaccinationDate = (appDate: string, periodDays?: number): string => {
    if (!appDate || !periodDays) return '';
    const nextDate = new Date(appDate);
    nextDate.setDate(nextDate.getDate() + periodDays);
    return nextDate.toISOString().slice(0, 10);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowVaccineDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectVaccine = async (vaccine: Vaccine) => {
    setSelectedVaccine(vaccine);
    setValue('vaccineId', vaccine.id, { shouldValidate: true });
    setVaccineSearch('');
    setShowVaccineDropdown(false);
    setLoadingPrevDose(true);

    try {
      const last = await healthRecordsService.getLastVaccine(patientId, vaccine.id);
      if (last) {
        const meta = last.metadata as VaccineMetadata;
        setValue('previousDoseDate', last.date.slice(0, 10), { shouldValidate: true });
        const doseMap: Record<string, string> = {
          '1ª Dose': '2ª Dose',
          '2ª Dose': '3ª Dose',
          '3ª Dose': '4ª Dose',
          '4ª Dose': 'Reforço',
        };
        if (meta.dose_number && doseMap[meta.dose_number]) {
          setValue('doseNumber', doseMap[meta.dose_number]!, { shouldValidate: true });
        }
      } else {
        setValue('previousDoseDate', '', { shouldValidate: true });
        setValue('doseNumber', '1ª Dose', { shouldValidate: true });
      }
    } finally {
      setLoadingPrevDose(false);
    }
  };

  const onSubmit = async (data: VaccineDoseFormData) => {
    if (!selectedVaccine) {
      setValue('vaccineId', '', { shouldValidate: true });
      return;
    }

    setSaving(true);
    try {
      await healthRecordsService.create(patientId, {
        type: 'VACCINE',
        date: new Date(data.date).toISOString(),
        ...(data.notes ? { notes: data.notes } : {}),
        metadata: {
          vaccine_id: selectedVaccine.id,
          vaccine_name: selectedVaccine.name,
          vaccine_code: selectedVaccine.code,
          batch: data.batch || undefined,
          dose_number: data.doseNumber,
          revaccination_date:
            calcRevaccinationDate(data.date, selectedVaccine.revaccination_period_days) ||
            undefined,
          previous_dose_date: data.previousDoseDate || undefined,
          applied_by: data.appliedBy || undefined,
        },
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Registrar Vacina"
      description="Selecione uma vacina do catálogo do workspace"
      onClose={onClose}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SearchSelect
          label='Vacina'
          required
          placeholder='Buscar vacina no catálogo...'
          search={vaccineSearch}
          onSearchChange={setVaccineSearch}
          options={catalogVaccines.map((vaccine) => ({
            id: vaccine.id,
            label: vaccine.name,
            description: vaccine.code,
          }))}
          loading={loadingCatalog}
          open={showVaccineDropdown}
          onOpenChange={setShowVaccineDropdown}
          selectedOption={selectedVaccine
            ? {
              id: selectedVaccine.id,
              label: selectedVaccine.name,
              description: selectedVaccine.code,
            }
            : null}
          onSelect={(option) => {
            const vaccine = catalogVaccines.find((item) => item.id === option.id);
            if (!vaccine) return;
            void handleSelectVaccine(vaccine);
          }}
          onClear={() => {
            setSelectedVaccine(null);
            setValue('vaccineId', '', { shouldValidate: true });
            setValue('previousDoseDate', '', { shouldValidate: true });
          }}
          error={errors.vaccineId?.message}
          emptyMessage='Nenhuma vacina no catálogo'
        />

        {loadingPrevDose && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Loader2 size={12} className="animate-spin" /> Buscando dose anterior...
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DateInput
                label="Data de Aplicação"
                value={field.value}
                onChange={field.onChange}
                required
                error={errors.date?.message}
              />
            )}
          />
          <Controller
            name="doseNumber"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Dose"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: '1ª Dose', label: '1ª Dose' },
                  { value: '2ª Dose', label: '2ª Dose' },
                  { value: '3ª Dose', label: '3ª Dose' },
                  { value: '4ª Dose', label: '4ª Dose' },
                  { value: 'Reforço', label: 'Reforço' },
                  { value: 'Dose única', label: 'Dose única' },
                ]}
                required
                error={errors.doseNumber?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="batch"
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label="Lote"
                required
                placeholder="Ex: LOTE-2024-001"
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.batch?.message}
              />
            )}
          />
          <Controller
            name="previousDoseDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label="Data da Dose Anterior"
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="dd/mm/aaaa"
                error={errors.previousDoseDate?.message}
              />
            )}
          />
        </div>

        {selectedVaccine?.revaccination_period_days ? (
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 dark:border-teal-700 dark:bg-teal-900/20">
            <p className="mb-0.5 text-xs font-medium text-teal-700 dark:text-teal-400">
              Próxima Revacinação (calculada automaticamente)
            </p>
            <p className="text-sm font-semibold text-teal-900 dark:text-teal-300">
              {calcRevaccinationDate(date, selectedVaccine.revaccination_period_days)
                ? new Date(
                  calcRevaccinationDate(date, selectedVaccine.revaccination_period_days),
                ).toLocaleDateString('pt-BR')
                : '—'}
            </p>
            <p className="mt-0.5 text-xs text-teal-600 dark:text-teal-500">
              Baseado no período de {selectedVaccine.revaccination_period_days} dias da vacina
            </p>
          </div>
        ) : selectedVaccine ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700/50">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Esta vacina não possui período de revacinação definido no catálogo.
            </p>
          </div>
        ) : null}

        <Controller
          name="appliedBy"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Aplicado por"
              required
              placeholder="Ex: Dr. João Silva"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.appliedBy?.message}
            />
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Observações"
              placeholder="Observações sobre a vacinação"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.notes?.message}
            />
          )}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving} className="bg-teal-600 text-white hover:bg-teal-700">
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
