'use client';

import {
  ArrowLeft,
  Calendar,
  Loader2,
  Mars,
  PawPrint,
  Pencil,
  Plus,
  Trash2,
  User,
  Venus,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

import { Card } from '@/app/components/card';
import { Header } from '@/app/components/header';
import { PatientModal } from '@/app/components/patient-modal';
import { SectionCard } from '@/app/components/section-card';
import { UploadExamModal } from '@/app/components/upload-exam-modal';
import { Button } from '@/components/ui/button';
import { SPECIE_LABELS } from '@/constants';
import { patientsService } from '@/services/patients.service';
import { tutorsService } from '@/services/tutors.service';
import type { Patient } from '@/types/patient';
import type { Tutor } from '@/types/tutor';

function PatientDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchPatient = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await patientsService.get(id);
      setPatient(data);
      if (data.tutor_id) {
        tutorsService.get(data.tutor_id).then(setTutor).catch(() => null);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetchPatient(); }, [fetchPatient]);

  const handleDelete = async () => {
    if (!patient) return;
    setDeleting(true);
    try {
      await patientsService.delete(patient.id);
      router.push('/patients');
    } catch {
      setDeleting(false);
    }
  };

  const handleEditSuccess = (updated: Patient) => {
    setPatient(updated);
    setShowEditModal(false);
    if (updated.tutor_id) {
      tutorsService.get(updated.tutor_id).then(setTutor).catch(() => null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-20">
        <PawPrint size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Paciente não encontrado.</p>
        <Link href="/patients" className="mt-4 inline-block">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    );
  }

  // Parse date without timezone shift (YYYY-MM-DD → local midnight)
  const parseBirthDate = (iso: string) => {
    const parts = iso.slice(0, 10).split('-').map(Number);
    return new Date(parts[0]!, (parts[1] ?? 1) - 1, parts[2] ?? 1);
  };

  const birthDateObj = patient.birth_date ? parseBirthDate(patient.birth_date) : null;
  const age = birthDateObj
    ? Math.floor((Date.now() - birthDateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <>
      {/* Header row */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{patient.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {SPECIE_LABELS[patient.specie] ?? patient.specie}
            {patient.breed && ` · ${patient.breed}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowEditModal(true)}
            title="Editar"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowDeleteConfirm(true)}
            title="Excluir"
            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
            <PawPrint size={18} className="text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Espécie / Raça</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {SPECIE_LABELS[patient.specie] ?? patient.specie}
            </p>
            {patient.breed && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{patient.breed}</p>
            )}
          </div>
        </Card>

        <Card className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
            <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Nascimento</p>
            {birthDateObj ? (
              <>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {birthDateObj.toLocaleDateString('pt-BR')}
                </p>
                {age !== null && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {age} {age === 1 ? 'ano' : 'anos'}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">Não informado</p>
            )}
          </div>
        </Card>

        <Card className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0">
            {patient.sex === 'MALE' ? (
              <Mars size={18} className="text-blue-600 dark:text-blue-400" />
            ) : patient.sex === 'FEMALE' ? (
              <Venus size={18} className="text-pink-600 dark:text-pink-400" />
            ) : (
              <Mars size={18} className="text-slate-400 dark:text-slate-500" />
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Sexo</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {patient.sex === 'MALE' ? 'Macho' : patient.sex === 'FEMALE' ? 'Fêmea' : 'Não informado'}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
            <User size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Tutor</p>
            {tutor ? (
              <>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{tutor.name}</p>
                {tutor.phone && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tutor.phone}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">Carregando...</p>
            )}
          </div>
        </Card>
      </div>

      {/* Exams section */}
      <SectionCard
        title="Exames"
        subtitle="Gerencie os exames deste paciente"
        headerAction={
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 dark:hover:bg-teal-800 h-9"
          >
            <Plus size={16} /> Adicionar Exame
          </Button>
        }
      >
        <div className="p-4 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Para ver todos os exames deste paciente, acesse a{' '}
            <Link href="/exams" className="text-teal-600 dark:text-teal-400 underline underline-offset-2">
              página de exames
            </Link>.
          </p>
        </div>
      </SectionCard>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir paciente?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Esta ação não pode ser desfeita. <strong>{patient.name}</strong> será removido permanentemente.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : 'Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <PatientModal
          patient={patient}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {showUploadModal && (
        <UploadExamModal
          preselectedPatient={patient}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => setShowUploadModal(false)}
        />
      )}
    </>
  );
}

export default function PatientDetailPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Detalhes do Paciente" showStorage={false} />
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-teal-600" />
          </div>
        }>
          <PatientDetailContent />
        </Suspense>
      </div>
    </div>
  );
}
