'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';

import { DateInput } from '../forms/date-input';
import { FileDropzone } from '../forms/file-dropzone';
import { InputWithLabel } from '../forms/input-with-label';
import { SearchSelect } from '../forms/search-select';

import { Button } from '@/components/ui/button';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { uploadExamSchema, type UploadExamFormData } from '@/schemas/vaccine';
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    items: patients,
    loading: loadingPatients,
    search: patientSearch,
    setSearch: setPatientSearch,
  } = usePaginatedResource<Patient, { search?: string }>({
    fetcher: patientsService.list,
    initialFilters: { search: '' },
    pageSize: 8,
    debounceMs: 300,
    enabled: !preselectedPatient,
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UploadExamFormData>({
    resolver: yupResolver(uploadExamSchema) as Resolver<UploadExamFormData>,
    defaultValues: {
      patientId: preselectedPatient?.id ?? '',
      title: '',
      examDate: new Date().toISOString().slice(0, 10),
    },
  });

  const title = watch('title');
  const examDate = watch('examDate');
  const file = watch('file');

  useEffect(() => {
    if (preselectedPatient) {
      setValue('patientId', preselectedPatient.id);
    }
  }, [preselectedPatient, setValue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setValue('file', selectedFile, { shouldValidate: true });
  };

  const onSubmit = async (data: UploadExamFormData) => {
    setUploading(true);
    try {
      const study = await studiesService.upload(
        data.patientId,
        data.file,
        data.title.trim(),
        data.examDate || undefined,
      );
      onSuccess(study);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='relative w-full max-w-lg animate-in rounded-xl bg-white shadow-2xl fade-in zoom-in-95 duration-200 dark:bg-slate-800'>
        <div className='flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700'>
          <div>
            <h2 className='text-lg font-bold text-slate-900 dark:text-white'>
              Enviar Exame
            </h2>
            <p className='mt-0.5 text-sm text-slate-500 dark:text-slate-400'>
              Faça o upload do PDF do exame para análise automática
            </p>
          </div>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={onClose}
            className='text-slate-500'
          >
            <X size={18} />
          </Button>
        </div>

        <div className='space-y-4 p-5'>
          {!preselectedPatient && (
            <SearchSelect
              label='Paciente'
              required
              placeholder='Buscar paciente por nome...'
              search={patientSearch}
              onSearchChange={setPatientSearch}
              options={patients.map((patient) => ({
                id: patient.id,
                label: patient.name,
                description: patient.breed,
              }))}
              loading={loadingPatients}
              open={showDropdown}
              onOpenChange={setShowDropdown}
              selectedOption={
                selectedPatient
                  ? {
                      id: selectedPatient.id,
                      label: selectedPatient.name,
                      description: selectedPatient.breed,
                    }
                  : null
              }
              onSelect={(option) => {
                const patient = patients.find((item) => item.id === option.id);
                if (!patient) return;
                setSelectedPatient(patient);
                setValue('patientId', patient.id, { shouldValidate: true });
                setPatientSearch('');
              }}
              onClear={() => {
                setSelectedPatient(null);
                setValue('patientId', '', { shouldValidate: true });
              }}
              error={errors.patientId?.message}
              emptyMessage='Nenhum paciente encontrado'
            />
          )}

          {preselectedPatient && (
            <div>
              <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300'>
                Paciente
              </label>
              <div className='rounded-lg border border-teal-200 bg-teal-50 p-3 dark:border-teal-700 dark:bg-teal-900/20'>
                <span className='text-sm font-medium text-teal-800 dark:text-teal-300'>
                  {preselectedPatient.name}
                </span>
              </div>
            </div>
          )}

          <div className='grid grid-cols-2 gap-3'>
            <InputWithLabel
              label='Título do exame'
              required
              value={title}
              onChange={(e) =>
                setValue('title', e.target.value, { shouldValidate: true })
              }
              placeholder='Ex: Hemograma Completo'
              error={errors.title?.message}
            />
            <DateInput
              label='Data do exame'
              value={examDate}
              onChange={(value) =>
                setValue('examDate', value, { shouldValidate: true })
              }
              required
              error={errors.examDate?.message}
            />
          </div>

          <FileDropzone
            label='Arquivo PDF do exame'
            required
            file={file}
            accept='application/pdf'
            helperText='Apenas arquivos PDF são aceitos'
            error={errors.file?.message}
            onFileSelect={handleFileChange}
          />
        </div>

        <div className='flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-700'>
          <Button variant='outline' onClick={onClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            loading={uploading}
            className='min-w-[120px] bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800'
          >
            {uploading ? (
              <>Enviando...</>
            ) : (
              <>
                <Upload size={16} className='mr-2' />
                Enviar Exame
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
