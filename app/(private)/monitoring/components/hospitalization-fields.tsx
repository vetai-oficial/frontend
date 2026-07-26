'use client';

import { useEffect, useMemo, useState } from 'react';

import { DateInput } from '@/app/components/date-input';
import { InputWithLabel } from '@/app/components/input-with-label';
import { SelectInput } from '@/app/components/select-input';
import { SECTOR_OPTIONS } from '@/constants';
import { useAuth } from '@/infra/auth-context';
import { authService } from '@/services/auth.service';
import type { TeamMember } from '@/types/auth';
import type { HospitalizationSector } from '@/types/monitoring';

export interface HospitalizationFieldsValue {
  sector: HospitalizationSector;
  kennel: string;
  weight: string;
  expectedDischargeDate: string;
  veterinarianId: string;
}

export const EMPTY_HOSPITALIZATION_FIELDS: HospitalizationFieldsValue = {
  sector: 'INPATIENT',
  kennel: '',
  weight: '',
  expectedDischargeDate: '',
  veterinarianId: '',
};

interface HospitalizationFieldsProps {
  value: HospitalizationFieldsValue;
  onChange: (patch: Partial<HospitalizationFieldsValue>) => void;
  disabled?: boolean;
}

export interface HospitalizationFieldsPayload {
  sector: HospitalizationSector;
  kennel: string;
  weight_kg?: number | null;
  expected_discharge_at: string;
  veterinarian_id?: string;
}

// '' em kennel/expected_discharge_at limpa o campo; veterinarian_id omitido
// deixa o backend assumir o usuário autenticado.
export function buildHospitalizationPayload(
  value: HospitalizationFieldsValue,
): HospitalizationFieldsPayload {
  const weight = Number.parseFloat(value.weight.replace(',', '.'));

  return {
    sector: value.sector,
    kennel: value.kennel.trim(),
    weight_kg: Number.isFinite(weight) ? weight : null,
    expected_discharge_at: value.expectedDischargeDate
      ? new Date(`${value.expectedDischargeDate}T12:00:00`).toISOString()
      : '',
    ...(value.veterinarianId
      ? { veterinarian_id: value.veterinarianId }
      : {}),
  };
}

export function HospitalizationFields({
  value,
  onChange,
  disabled,
}: HospitalizationFieldsProps) {
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const members = await authService.listTeam();
        if (!cancelled) setTeam(members);
      } catch {
        // tratado no httpClient
      } finally {
        if (!cancelled) setLoadingTeam(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Se a listagem falhar, o próprio usuário ainda precisa ser selecionável.
  const members = useMemo<TeamMember[]>(() => {
    if (team.length > 0) return team;
    if (!user) return [];
    return [
      { id: user.id, name: user.name, ...(user.crmv ? { crmv: user.crmv } : {}) },
    ];
  }, [team, user]);

  useEffect(() => {
    if (value.veterinarianId || members.length === 0) return;
    const fallback = members.find((m) => m.id === user?.id) ?? members[0];
    if (fallback) onChange({ veterinarianId: fallback.id });
  }, [members, user?.id, value.veterinarianId, onChange]);

  const veterinarianOptions = members.map((member) => ({
    value: member.id,
    label: [
      member.name,
      member.id === user?.id ? '(você)' : '',
      member.crmv ? `— CRMV ${member.crmv}` : '',
    ]
      .filter(Boolean)
      .join(' '),
  }));

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <SelectInput
          label="Setor"
          value={value.sector}
          onChange={(v) => onChange({ sector: v as HospitalizationSector })}
          options={SECTOR_OPTIONS}
          disabled={disabled ?? false}
        />
        <InputWithLabel
          label="Baia"
          type="text"
          value={value.kennel}
          onChange={(e) => onChange({ kennel: e.target.value })}
          placeholder="Ex: C-01"
          maxLength={20}
          disabled={disabled ?? false}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InputWithLabel
          label="Peso (kg)"
          type="number"
          min={0}
          step={0.1}
          value={value.weight}
          onChange={(e) => onChange({ weight: e.target.value })}
          placeholder="Ex: 6.5"
          disabled={disabled ?? false}
        />
        <DateInput
          label="Alta prevista"
          value={value.expectedDischargeDate}
          onChange={(v) => onChange({ expectedDischargeDate: v })}
          disabled={disabled ?? false}
        />
      </div>

      <SelectInput
        label="Veterinário responsável"
        value={value.veterinarianId}
        onChange={(v) => onChange({ veterinarianId: v })}
        options={veterinarianOptions}
        placeholder={loadingTeam ? 'Carregando...' : 'Selecione...'}
        disabled={(disabled ?? false) || loadingTeam}
      />
    </>
  );
}
