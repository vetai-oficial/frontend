'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import {
  HospitalizationFields,
  type HospitalizationFieldsValue,
  buildHospitalizationPayload,
} from './hospitalization-fields';

import { InputWithLabel } from '@/app/components/input-with-label';
import { Modal } from '@/app/components/modal';
import { Button } from '@/components/ui/button';
import { monitoringService } from '@/services/monitoring.service';
import type { Hospitalization } from '@/types/monitoring';

interface EditHospitalizationModalProps {
  hospitalization: Hospitalization;
  onClose: () => void;
  onSuccess: (hospitalization: Hospitalization) => void;
}

function toDateInput(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function toFieldsValue(
  hospitalization: Hospitalization,
): HospitalizationFieldsValue {
  return {
    sector: hospitalization.sector ?? 'INPATIENT',
    kennel: hospitalization.kennel ?? '',
    weight: hospitalization.weight_kg ? String(hospitalization.weight_kg) : '',
    expectedDischargeDate: toDateInput(hospitalization.expected_discharge_at),
    veterinarianId: hospitalization.veterinarian?.id ?? '',
  };
}

export function EditHospitalizationModal({
  hospitalization,
  onClose,
  onSuccess,
}: EditHospitalizationModalProps) {
  const [fields, setFields] = useState(() => toFieldsValue(hospitalization));
  const [reason, setReason] = useState(hospitalization.reason ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const updated = await monitoringService.update(hospitalization.id, {
        ...buildHospitalizationPayload(fields),
        reason: reason.trim(),
      });
      onSuccess(updated);
    } catch {
      // tratado no httpClient
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Dados da internação"
      description="Setor, baia, peso e responsável exibidos no painel"
      onClose={onClose}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <HospitalizationFields
          value={fields}
          onChange={(patch) => setFields((prev) => ({ ...prev, ...patch }))}
          disabled={saving}
        />

        <InputWithLabel
          label="Motivo da internação"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex: Pós-cirúrgico, observação 24h"
          disabled={saving}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 dark:hover:bg-teal-800 min-w-[120px]"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
