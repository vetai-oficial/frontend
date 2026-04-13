'use client';

import { Loader2, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { SPECIE_LABELS } from '@/constants';
import { patientsService } from '@/services/patients.service';
import { tutorsService } from '@/services/tutors.service';
import type { Patient, CreatePatientPayload, Sex, UpdatePatientPayload } from '@/types/patient';
import type { Tutor } from '@/types/tutor';

const SPECIES = Object.entries(SPECIE_LABELS) as [string, string][];

interface PatientModalProps {
  patient?: Patient;
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
}

export function PatientModal({ patient, onClose, onSuccess }: PatientModalProps) {
  const isEdit = !!patient;

  const [name, setName] = useState(patient?.name ?? '');
  const [specie, setSpecie] = useState(patient?.specie ?? '');
  const [breed, setBreed] = useState(patient?.breed ?? '');
  const [birthDate, setBirthDate] = useState(
    patient?.birth_date ? patient.birth_date.slice(0, 10) : '',
  );
  const [sex, setSex] = useState(patient?.sex ?? '');

  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [tutorSearch, setTutorSearch] = useState('');
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [showTutorDropdown, setShowTutorDropdown] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchTutors = useCallback(async (query: string) => {
    setLoadingTutors(true);
    try {
      const response = await tutorsService.list({ search: query, size: 8 });
      setTutors(response.data);
    } catch {
      // silently fail
    } finally {
      setLoadingTutors(false);
    }
  }, []);

  // Load tutors on open and pre-load patient tutor if editing
  useEffect(() => {
    void searchTutors('');
    if (patient?.tutor_id) {
      tutorsService.get(patient.tutor_id).then((t) => setSelectedTutor(t)).catch(() => null);
    }
  }, [patient, searchTutors]);

  useEffect(() => {
    const timer = setTimeout(() => void searchTutors(tutorSearch), 300);
    return () => clearTimeout(timer);
  }, [tutorSearch, searchTutors]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTutorDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nome é obrigatório';
    if (!specie) errs.specie = 'Espécie é obrigatória';
    if (!selectedTutor && !isEdit) errs.tutor = 'Tutor é obrigatório';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);

    try {
      let result: Patient;
      if (isEdit) {
        const payload = {
          name: name.trim(),
          specie: specie as Patient['specie'],
          tutor_id: selectedTutor?.id ?? patient.tutor_id,
        } as UpdatePatientPayload;
        if (breed.trim()) payload.breed = breed.trim();
        if (birthDate) payload.birth_date = birthDate;
        if (sex) payload.sex = sex as Sex;
        result = await patientsService.update(patient.id, payload);
      } else {
        const payload = {
          name: name.trim(),
          specie: specie as Patient['specie'],
          tutor_id: selectedTutor!.id,
        } as CreatePatientPayload;
        if (breed.trim()) payload.breed = breed.trim();
        if (birthDate) payload.birth_date = birthDate;
        if (sex) payload.sex = sex as Sex;
        result = await patientsService.create(payload);
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
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEdit ? 'Editar Paciente' : 'Novo Paciente'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isEdit ? 'Atualize os dados do paciente' : 'Cadastre um novo pet'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Rex"
              className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.name ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Species */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Espécie <span className="text-red-500">*</span>
            </label>
            <select
              value={specie}
              onChange={(e) => setSpecie(e.target.value)}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.specie ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
            >
              <option value="">Selecione a espécie</option>
              {SPECIES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.specie && <p className="text-xs text-red-500 mt-1">{errors.specie}</p>}
          </div>

          {/* Breed + Sex side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Raça
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Ex: Labrador"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Sexo
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Não informado</option>
                <option value="MALE">Macho</option>
                <option value="FEMALE">Fêmea</option>
              </select>
            </div>
          </div>

          {/* Birth date */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Data de nascimento
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 scheme-light dark:scheme-dark cursor-pointer"
            />
          </div>

          {/* Tutor search */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Tutor {!isEdit && <span className="text-red-500">*</span>}
            </label>
            {selectedTutor ? (
              <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-teal-800 dark:text-teal-300">{selectedTutor.name}</p>
                  {selectedTutor.email && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedTutor.email}</p>
                  )}
                </div>
                <button type="button" onClick={() => setSelectedTutor(null)} className="text-teal-600 hover:text-teal-800 dark:text-teal-400">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div ref={dropdownRef} className="relative">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar tutor por nome..."
                    value={tutorSearch}
                    onChange={(e) => setTutorSearch(e.target.value)}
                    onFocus={() => setShowTutorDropdown(true)}
                    className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.tutor ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                  />
                </div>
                {showTutorDropdown && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 max-h-44 overflow-y-auto">
                    {loadingTutors ? (
                      <div className="flex items-center justify-center p-3">
                        <Loader2 size={16} className="animate-spin text-teal-600" />
                      </div>
                    ) : tutors.length === 0 ? (
                      <p className="p-3 text-sm text-slate-500 dark:text-slate-400 text-center">Nenhum tutor encontrado</p>
                    ) : (
                      tutors.map((tutor) => (
                        <button
                          key={tutor.id}
                          type="button"
                          onClick={() => { setSelectedTutor(tutor); setShowTutorDropdown(false); setTutorSearch(''); }}
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors border-b border-slate-100 dark:border-slate-600 last:border-0"
                        >
                          <p className="font-medium text-slate-900 dark:text-white">{tutor.name}</p>
                          {tutor.email && <p className="text-xs text-slate-500 dark:text-slate-400">{tutor.email}</p>}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            {errors.tutor && <p className="text-xs text-red-500 mt-1">{errors.tutor}</p>}
          </div>

          {errors.general && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.general}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
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
