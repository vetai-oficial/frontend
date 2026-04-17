'use client';

import { Loader2, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { DateInput } from '@/app/components/date-input';
import { Modal } from '@/app/components/modal';
import { SelectInput } from '@/app/components/select-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { healthRecordsService } from '@/services/health-records.service';
import { vaccinesService } from '@/services/vaccines.service';
import type { VaccineMetadata } from '@/types/health-record';
import type { Vaccine } from '@/types/vaccine';

interface AddVaccineModalProps {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddVaccineModal({ patientId, onClose, onSuccess }: AddVaccineModalProps) {
  const [catalogVaccines, setCatalogVaccines] = useState<Vaccine[]>([]);
  const [vaccineSearch, setVaccineSearch] = useState('');
  const [showVaccineDropdown, setShowVaccineDropdown] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingPrevDose, setLoadingPrevDose] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [doseNumber, setDoseNumber] = useState('1ª Dose');
  const [batch, setBatch] = useState('');
  const [previousDoseDate, setPreviousDoseDate] = useState('');
  const [appliedBy, setAppliedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const calcRevaccinationDate = (appDate: string, periodDays?: number): string => {
    if (!appDate || !periodDays) return '';
    const d = new Date(appDate);
    d.setDate(d.getDate() + periodDays);
    return d.toISOString().slice(0, 10);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCatalog = useCallback(async (q: string) => {
    setLoadingCatalog(true);
    try {
      const res = await vaccinesService.list({ search: q || undefined, size: 20 });
      setCatalogVaccines(res.data);
    } catch { /* silently fail */ } finally { setLoadingCatalog(false); }
  }, []);

  useEffect(() => { void fetchCatalog(''); }, [fetchCatalog]);

  useEffect(() => {
    const t = setTimeout(() => void fetchCatalog(vaccineSearch), 300);
    return () => clearTimeout(t);
  }, [vaccineSearch, fetchCatalog]);

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
    setVaccineSearch('');
    setShowVaccineDropdown(false);
    setLoadingPrevDose(true);
    try {
      const last = await healthRecordsService.getLastVaccine(patientId, vaccine.id);
      if (last) {
        const meta = last.metadata as VaccineMetadata;
        setPreviousDoseDate(last.date.slice(0, 10));
        const doseMap: Record<string, string> = {
          '1ª Dose': '2ª Dose', '2ª Dose': '3ª Dose', '3ª Dose': '4ª Dose', '4ª Dose': 'Reforço',
        };
        if (meta.dose_number && doseMap[meta.dose_number]) {
          setDoseNumber(doseMap[meta.dose_number]!);
        }
      } else {
        setPreviousDoseDate('');
        setDoseNumber('1ª Dose');
      }
    } catch { /* silently fail */ } finally { setLoadingPrevDose(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVaccine) { setError('Selecione uma vacina do catálogo'); return; }
    if (!date) { setError('Informe a data de aplicação'); return; }
    setSaving(true);
    try {
      await healthRecordsService.create(patientId, {
        type: 'VACCINE',
        date: new Date(date).toISOString(),
        ...(notes ? { notes } : {}),
        metadata: {
          vaccine_id: selectedVaccine.id,
          vaccine_name: selectedVaccine.name,
          vaccine_code: selectedVaccine.code,
          batch: batch || undefined,
          dose_number: doseNumber,
          revaccination_date: calcRevaccinationDate(date, selectedVaccine.revaccination_period_days) || undefined,
          previous_dose_date: previousDoseDate || undefined,
          applied_by: appliedBy || undefined,
        },
      });
      onSuccess();
    } catch { setError('Erro ao salvar. Tente novamente.'); } finally { setSaving(false); }
  };

  return (
    <Modal title="Registrar Vacina" description="Selecione uma vacina do catálogo do workspace" onClose={onClose} maxWidth="md">
      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
        <div>
          <Label>Vacina <span className="text-red-500">*</span></Label>
          {selectedVaccine ? (
            <div className="mt-1.5 flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-teal-800 dark:text-teal-300">{selectedVaccine.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{selectedVaccine.code}</p>
              </div>
              <Button type="button" variant="link" size="sm" onClick={() => { setSelectedVaccine(null); setPreviousDoseDate(''); }} className="text-xs h-auto p-0">
                Trocar
              </Button>
            </div>
          ) : (
            <div ref={dropdownRef} className="relative mt-1.5">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar vacina no catálogo..."
                  value={vaccineSearch}
                  onChange={(e) => setVaccineSearch(e.target.value)}
                  onFocus={() => setShowVaccineDropdown(true)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              {showVaccineDropdown && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 max-h-44 overflow-y-auto">
                  {loadingCatalog ? (
                    <div className="flex justify-center p-3"><Loader2 size={16} className="animate-spin text-teal-600" /></div>
                  ) : catalogVaccines.length === 0 ? (
                    <p className="p-3 text-sm text-slate-500 dark:text-slate-400 text-center">Nenhuma vacina no catálogo</p>
                  ) : (
                    catalogVaccines.map((v) => (
                      <Button key={v.id} type="button" variant="ghost" onClick={() => { void handleSelectVaccine(v); }} className="w-full justify-between px-3 py-2.5 h-auto rounded-none border-b border-slate-100 dark:border-slate-600 last:border-0">
                        <span className="font-medium text-slate-900 dark:text-white">{v.name}</span>
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{v.code}</span>
                      </Button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {loadingPrevDose && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Loader2 size={12} className="animate-spin" /> Buscando dose anterior...
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <DateInput label="Data de Aplicação" value={date} onChange={setDate} required />
          <SelectInput
            label="Dose"
            value={doseNumber}
            onChange={setDoseNumber}
            options={[
              { value: '1ª Dose', label: '1ª Dose' },
              { value: '2ª Dose', label: '2ª Dose' },
              { value: '3ª Dose', label: '3ª Dose' },
              { value: '4ª Dose', label: '4ª Dose' },
              { value: 'Reforço', label: 'Reforço' },
              { value: 'Dose única', label: 'Dose única' },
            ]}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="vac-batch" required>Lote</Label>
            <Input id="vac-batch" placeholder="Ex: LOTE-2024-001" value={batch} onChange={(e) => setBatch(e.target.value)} className="mt-1.5" />
          </div>
          <DateInput
            label="Data da Dose Anterior"
            value={previousDoseDate}
            onChange={setPreviousDoseDate}
            placeholder="dd/mm/aaaa"
            required
          />
        </div>

        {selectedVaccine?.revaccination_period_days ? (
          <div className="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg">
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400 mb-0.5">Próxima Revacinação (calculada automaticamente)</p>
            <p className="text-sm font-semibold text-teal-900 dark:text-teal-300">
              {calcRevaccinationDate(date, selectedVaccine.revaccination_period_days)
                ? new Date(calcRevaccinationDate(date, selectedVaccine.revaccination_period_days)).toLocaleDateString('pt-BR')
                : '—'}
            </p>
            <p className="text-xs text-teal-600 dark:text-teal-500 mt-0.5">
              Baseado no período de {selectedVaccine.revaccination_period_days} dias da vacina
            </p>
          </div>
        ) : selectedVaccine ? (
          <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
            <p className="text-xs text-slate-500 dark:text-slate-400">Esta vacina não possui período de revacinação definido no catálogo.</p>
          </div>
        ) : null}

        <div>
          <Label htmlFor="vac-applied-by" required>Aplicado por</Label>
          <Input id="vac-applied-by" placeholder="Ex: Dr. João Silva" value={appliedBy} onChange={(e) => setAppliedBy(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="vac-notes">Observações (opcional)</Label>
          <Input id="vac-notes" placeholder="Observações sobre a vacinação" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5" />
        </div>

        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" disabled={saving} className="bg-teal-600 text-white hover:bg-teal-700">
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
