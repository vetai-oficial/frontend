'use client';

import { FileText, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { FieldShell } from '../forms/field-shell';

interface FileDropzoneProps {
  label: string;
  required?: boolean;
  file?: File | undefined;
  accept?: string;
  helperText?: string;
  error?: string | undefined;
  onFileSelect: (file: File | null) => void;
}

export function FileDropzone({
  label,
  required,
  file,
  accept,
  helperText,
  error,
  onFileSelect,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <FieldShell label={label} required={required} error={error}>
      <div
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
            : file
              ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-900/10'
              : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700/50'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          onFileSelect(event.dataTransfer.files?.[0] ?? null);
        }}
      >
        <input
          ref={inputRef}
          type='file'
          accept={accept}
          className='hidden'
          onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
        />

        {file ? (
          <div className='flex items-center justify-center gap-3'>
            <FileText
              size={24}
              className='shrink-0 text-teal-600 dark:text-teal-400'
            />
            <div className='min-w-0 text-left'>
              <p className='truncate text-sm font-medium text-teal-800 dark:text-teal-300'>
                {file.name}
              </p>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                {(file.size / 1024 / 1024).toFixed(2)} MB · Clique para trocar
              </p>
            </div>
          </div>
        ) : (
          <>
            <Upload
              size={24}
              className='mx-auto mb-2 text-slate-400 dark:text-slate-500'
            />
            <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
              Arraste o arquivo aqui ou clique para selecionar
            </p>
            {helperText && (
              <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                {helperText}
              </p>
            )}
          </>
        )}
      </div>
    </FieldShell>
  );
}
