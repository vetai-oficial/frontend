'use client';

import { Loader2, PawPrint, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  EMPTY_HOSPITALIZATION_FIELDS,
  HospitalizationFields,
  buildHospitalizationPayload,
} from './hospitalization-fields';

import { DateInput } from '@/app/components/date-input';
import { InputWithLabel } from '@/app/components/input-with-label';
import { Modal } from '@/app/components/modal';
import { SelectInput } from '@/app/components/select-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  MONITORING_INTERVAL_OPTIONS,
  SPECIE_LABELS,
  STATUS_OPTIONS,
} from '@/constants';
import { monitoringService } from '@/services/monitoring.service';
import { patientsService } from '@/services/patients.service';
import type {
  CreateHospitalizationPayload,
  Hospitalization,
  HospitalizationStatus,
} from '@/types/monitoring';
import type { Patient } from '@/types/patient';

interface AddPetModalProps {
  onClose: () => void;
  onSuccess: (hospitalization: Hospitalization) => void;
}

export function AddPetModal({ onClose, onSuccess }: AddPetModalProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [status, setStatus] = useState<HospitalizationStatus>('STABLE');
  const [reason, setReason] = useState('');
  const [admittedDate, setAdmittedDate] = useState('');
  const [intervalValue, setIntervalValue] = useState('240');
  const [fields, setFields] = useState(EMPTY_HOSPITALIZATION_FIELDS);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchPatients = useCallback(async (query: string) => {
    setLoadingPatients(true);
    try {
      const response = await patientsService.list({ search: query, size: 8 });
      setPatients(response.data);
    } catch {
      // silently fail
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  useEffect(() => {
    void searchPatients('');
  }, [searchPatients]);

  useEffect(() => {
    const timer = setTimeout(() => void searchPatients(search), 300);
    return () => clearTimeout(timer);
  }, [search, searchPatients]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async () => {
    if (!selectedPatient) {
      setErrors({ patient: 'Selecione um paciente' });
      return;
    }
    setErrors({});
    setSaving(true);

    try {
      const payload: CreateHospitalizationPayload = {
        patient_id: selectedPatient.id,
        status,
        ...buildHospitalizationPayload(fields),
      };
      if (reason.trim()) payload.reason = reason.trim();
      payload.monitoring_interval_minutes = Number(intervalValue);
      if (admittedDate) {
        payload.admitted_at = new Date(`${admittedDate}T12:00:00`).toISOString();
      }
      const hospitalization = await monitoringService.create(payload);
      onSuccess(hospitalization);
    } catch {
      setErrors({ general: 'Erro ao adicionar. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Adicionar ao Monitoramento"
      description="Inicie a internação de um paciente"
      onClose={onClose}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div>
          <Label required className="mb-1.5 block">
            Paciente
          </Label>
          {selectedPatient ? (
            <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                  <PawPrint size={16} className="text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-teal-800 dark:text-teal-300">
                    {selectedPatient.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {SPECIE_LABELS[selectedPatient.specie]}
                    {selectedPatient.breed ? ` • ${selectedPatient.breed}` : ''}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setSelectedPatient(null)}
                className="text-teal-600 hover:text-teal-800 dark:text-teal-400"
              >
                <X size={14} />
              </Button>
            </div>
          ) : (
            <div ref={dropdownRef} className="relative">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar paciente por nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.patient ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                />
              </div>
              {showDropdown && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 max-h-44 overflow-y-auto">
                  {loadingPatients ? (
                    <div className="flex items-center justify-center p-3">
                      <Loader2 size={16} className="animate-spin text-teal-600" />
                    </div>
                  ) : patients.length === 0 ? (
                    <p className="p-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                      Nenhum paciente encontrado
                    </p>
                  ) : (
                    patients.map((patient) => (
                      <Button
                        key={patient.id}
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowDropdown(false);
                          setSearch('');
                        }}
                        className="w-full justify-start px-3 py-2.5 h-auto rounded-none border-b border-slate-100 dark:border-slate-600 last:border-0"
                      >
                        <div className="text-left">
                          <p className="font-medium text-slate-900 dark:text-white">{patient.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {SPECIE_LABELS[patient.specie]}
                          </p>
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          {errors.patient && <p className="text-xs text-red-500 mt-1">{errors.patient}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectInput
            label="Status inicial"
            value={status}
            onChange={(v) => setStatus(v as HospitalizationStatus)}
            options={STATUS_OPTIONS}
          />
          <SelectInput
            label="Frequência de aferição"
            value={intervalValue}
            onChange={setIntervalValue}
            options={MONITORING_INTERVAL_OPTIONS}
          />
        </div>

        <HospitalizationFields
          value={fields}
          onChange={(patch) => setFields((prev) => ({ ...prev, ...patch }))}
        />

        <InputWithLabel
          label="Motivo da internação"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex: Pós-cirúrgico, observação 24h"
        />

        <DateInput
          label="Data de entrada"
          value={admittedDate}
          onChange={setAdmittedDate}
        />

        {errors.general && (
          <p className="text-sm text-red-500 dark:text-red-400">{errors.general}</p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 dark:hover:bg-teal-800 min-w-[120px]"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Adicionar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
