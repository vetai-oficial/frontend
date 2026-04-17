'use client';

import { FileText, Loader2, Search, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { DateInput } from './date-input';

import { Button } from '@/components/ui/button';
import { patientsService } from '@/services/patients.service';
import { studiesService } from '@/services/studies.service';
import type { Patient } from '@/types/patient';
import type { Study } from '@/types/study';

interface UploadExamModalProps {
  onClose: () => void;
  onSuccess: (study: Study) => void;
  preselectedPatient?: Patient;
}

export function UploadExamModal({
  onClose,
  onSuccess,
  preselectedPatient,
}: UploadExamModalProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    preselectedPatient ?? null,
  );
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [title, setTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (!preselectedPatient) {
      void searchPatients('');
    }
  }, [preselectedPatient, searchPatients]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (patientSearch) void searchPatients(patientSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch, searchPatients]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setError('Apenas arquivos PDF são aceitos.');
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const [dropped] = e.dataTransfer.files;
    if (dropped) handleFileChange(dropped);
  };

  const handleSubmit = async () => {
    if (!selectedPatient) {
      setError('Selecione um paciente.');
      return;
    }
    if (!file) {
      setError('Selecione um arquivo PDF.');
      return;
    }

    if (!title.trim()) {
      setError('Informe o título do exame.');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const study = await studiesService.upload(selectedPatient.id, file, title.trim(), examDate || undefined);
      onSuccess(study);
    } catch {
      setError('Erro ao enviar o exame. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Enviar Exame
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Faça o upload do PDF do exame para análise automática
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-slate-500">
            <X size={18} />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          {!preselectedPatient && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Paciente <span className="text-red-500">*</span>
              </label>
              {selectedPatient ? (
                <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg">
                  <span className="text-sm font-medium text-teal-800 dark:text-teal-300">
                    {selectedPatient.name}
                  </span>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => setSelectedPatient(null)} className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-200">
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div ref={dropdownRef} className="relative">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Buscar paciente por nome..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      onFocus={() => setShowDropdown(true)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  {showDropdown && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {loadingPatients ? (
                        <div className="flex items-center justify-center p-4">
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
                              setPatientSearch('');
                            }}
                            className="w-full justify-start px-3 py-2.5 h-auto rounded-none text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-600 last:border-0"
                          >
                            <span className="font-medium">{patient.name}</span>
                            {patient.breed && (
                              <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                                · {patient.breed}
                              </span>
                            )}
                          </Button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {preselectedPatient && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Paciente
              </label>
              <div className="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg">
                <span className="text-sm font-medium text-teal-800 dark:text-teal-300">
                  {preselectedPatient.name}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Título do exame <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Hemograma Completo"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <DateInput
              label="Data do exame"
              value={examDate}
              onChange={setExamDate}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Arquivo PDF do exame <span className="text-red-500">*</span>
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                  : file
                    ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-900/10'
                    : 'border-slate-300 dark:border-slate-600 hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={24} className="text-teal-600 dark:text-teal-400 shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-teal-800 dark:text-teal-300 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB · Clique para trocar
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={24} className="text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Arraste o PDF aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Apenas arquivos PDF são aceitos
                  </p>
                </>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploading || !selectedPatient || !file || !title.trim()}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 dark:hover:bg-teal-800 min-w-[120px]"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Enviar Exame
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
