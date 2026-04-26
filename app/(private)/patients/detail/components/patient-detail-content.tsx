'use client';

import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  ClipboardList,
  Cpu,
  Download,
  Eye,
  FileText,
  Loader2,
  Mars,
  Microscope,
  PawPrint,
  Pencil,
  Pill,
  Plus,
  Scale,
  ShieldCheck,
  Skull,
  StickyNote,
  Syringe,
  Trash2,
  Upload,
  User,
  Venus,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { calcAge, fmtDate, fmtDateTime, parseBirthDate, STUDY_STATUS_COLORS, STUDY_STATUS_LABELS } from '../utils';
import { buildPrescriptionHtml, createPrescriptionBlobUrl, downloadPrescriptionAsPdf } from '../utils/prescription-pdf';
import { AddClinicalNoteModal } from './add-clinical-note-modal';
import { AddNoteModal } from './add-note-modal';
import { AddPrescriptionModal } from './add-prescription-modal';
import { AddVaccineModal } from './add-vaccine-modal';
import { AddWeightModal } from './add-weight-modal';
import { DeleteBtn } from './delete-btn';
import { InfoCard } from './info-card';

import { Card } from '@/app/components/card';
import { ConfirmModal } from '@/app/components/confirm-modal';
import { PatientModal } from '@/app/components/patient-modal';
import { SectionCard } from '@/app/components/section-card';
import { UploadExamModal } from '@/app/components/upload-exam-modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SPECIE_LABELS, STORAGE_KEYS } from '@/constants';
import { documentsService } from '@/services/documents.service';
import { healthRecordsService } from '@/services/health-records.service';
import { patientsService } from '@/services/patients.service';
import { scheduleService } from '@/services/schedule.service';
import { studiesService } from '@/services/studies.service';
import { tutorsService } from '@/services/tutors.service';
import type {
  ClinicalNoteMetadata,
  HealthRecord,
  NoteMetadata,
  PatientDocument,
  PrescriptionMetadata,
  VaccineMetadata,
  WeightMetadata,
} from '@/types/health-record';
import type { Patient } from '@/types/patient';
import type { ScheduleEvent } from '@/types/schedule';
import { EVENT_TYPE_MAP } from '@/types/schedule';
import type { Study } from '@/types/study';
import type { Tutor } from '@/types/tutor';

export function PatientDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const user = typeof window !== 'undefined'
    ? (() => { try { const s = localStorage.getItem(STORAGE_KEYS.USER); return s ? (JSON.parse(s) as import('@/types/auth').User) : null; } catch { return null; } })()
    : null;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [showAddClinicalNote, setShowAddClinicalNote] = useState(false);
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{ url: string; mimeType: string; fileName: string } | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ onConfirm: () => Promise<void> } | null>(null);
  const [confirmDeleting, setConfirmDeleting] = useState(false);

  const [exams, setExams] = useState<Study[]>([]);
  const [weightRecords, setWeightRecords] = useState<HealthRecord[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<HealthRecord[]>([]);
  const [vaccines, setVaccines] = useState<HealthRecord[]>([]);
  const [notes, setNotes] = useState<HealthRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<HealthRecord[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);

  const [upcomingEvents, setUpcomingEvents] = useState<ScheduleEvent[]>([]);

  const [examsLoading, setExamsLoading] = useState(false);
  const [weightsLoading, setWeightsLoading] = useState(false);
  const [clinicalLoading, setClinicalLoading] = useState(false);
  const [vaccinesLoading, setVaccinesLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerIframeRef = useRef<HTMLIFrameElement>(null);

  const fetchPatient = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await patientsService.get(id);
      setPatient(data);
      if (data.tutor_id) tutorsService.get(data.tutor_id).then(setTutor).catch(() => null);
    } catch { /* silently fail */ } finally { setLoading(false); }
  }, [id]);

  const fetchExams = useCallback(async () => {
    if (!id) return;
    setExamsLoading(true);
    try {
      const res = await studiesService.list({ patient_id: id, size: 5, sort: 'createdAt', direction: 'desc' });
      setExams(res.data);
    } catch { /* silently fail */ } finally { setExamsLoading(false); }
  }, [id]);

  const fetchWeights = useCallback(async () => {
    if (!id) return;
    setWeightsLoading(true);
    try {
      const res = await healthRecordsService.list(id, { type: 'WEIGHT', size: 10, sort: 'date', direction: 'desc' });
      setWeightRecords(res.data);
    } catch { /* silently fail */ } finally { setWeightsLoading(false); }
  }, [id]);

  const fetchClinicalNotes = useCallback(async () => {
    if (!id) return;
    setClinicalLoading(true);
    try {
      const res = await healthRecordsService.list(id, { type: 'CLINICAL_NOTE', size: 20, sort: 'date', direction: 'desc' });
      setClinicalNotes(res.data);
    } catch { /* silently fail */ } finally { setClinicalLoading(false); }
  }, [id]);

  const fetchVaccines = useCallback(async () => {
    if (!id) return;
    setVaccinesLoading(true);
    try {
      const res = await healthRecordsService.list(id, { type: 'VACCINE', size: 50, sort: 'date', direction: 'desc' });
      setVaccines(res.data);
    } catch { /* silently fail */ } finally { setVaccinesLoading(false); }
  }, [id]);

  const fetchNotes = useCallback(async () => {
    if (!id) return;
    setNotesLoading(true);
    try {
      const res = await healthRecordsService.list(id, { type: 'NOTE', size: 20, sort: 'date', direction: 'desc' });
      setNotes(res.data);
    } catch { /* silently fail */ } finally { setNotesLoading(false); }
  }, [id]);

  const fetchPrescriptions = useCallback(async () => {
    if (!id) return;
    setPrescriptionsLoading(true);
    try {
      const res = await healthRecordsService.list(id, { type: 'PRESCRIPTION', size: 50, sort: 'date', direction: 'desc' });
      setPrescriptions(res.data);
    } catch { /* silently fail */ } finally { setPrescriptionsLoading(false); }
  }, [id]);

  const fetchDocuments = useCallback(async () => {
    if (!id) return;
    setDocsLoading(true);
    try {
      const res = await documentsService.list(id);
      setDocuments(res);
    } catch { /* silently fail */ } finally { setDocsLoading(false); }
  }, [id]);

  useEffect(() => { void fetchPatient(); }, [fetchPatient]);

  useEffect(() => {
    if (!patient) return;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const all = scheduleService.list();
    const upcoming = all
      .filter((e) => e.patientName === patient.name && e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 5);
    setUpcomingEvents(upcoming);
  }, [patient]);

  useEffect(() => { void fetchExams(); }, [fetchExams]);
  useEffect(() => { void fetchWeights(); }, [fetchWeights]);
  useEffect(() => { void fetchClinicalNotes(); }, [fetchClinicalNotes]);
  useEffect(() => { void fetchVaccines(); }, [fetchVaccines]);
  useEffect(() => { void fetchNotes(); }, [fetchNotes]);
  useEffect(() => { void fetchPrescriptions(); }, [fetchPrescriptions]);
  useEffect(() => { void fetchDocuments(); }, [fetchDocuments]);

  const handleDelete = async () => {
    if (!patient) return;
    setDeleting(true);
    try {
      await patientsService.delete(patient.id);
      router.push('/patients');
    } catch { setDeleting(false); }
  };

  const handleEditSuccess = (updated: Patient) => {
    setPatient(updated);
    setShowEditModal(false);
    if (updated.tutor_id) tutorsService.get(updated.tutor_id).then(setTutor).catch(() => null);
  };

  const handleDeleteRecord = async (recordId: string, refetch: () => void) => {
    if (!id) return;
    await healthRecordsService.delete(id, recordId);
    refetch();
  };

  const handleUploadDocument = async (file: File) => {
    if (!id) return;
    setUploadingDoc(true);
    try {
      await documentsService.upload(id, file);
      void fetchDocuments();
    } catch { /* silently fail */ } finally { setUploadingDoc(false); }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!id) return;
    await documentsService.delete(id, docId);
    void fetchDocuments();
  };

  const handleViewDocument = async (doc: { id: string; fileName: string; mimeType: string }) => {
    if (!id) return;
    setLoadingDocId(doc.id);
    try {
      const { url, mimeType } = await documentsService.download(id, doc.id);
      const isPdf = mimeType.includes('pdf');
      const isImage = mimeType.startsWith('image/');
      if (isPdf || isImage) {
        setViewingDoc({ url, mimeType, fileName: doc.fileName });
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } catch { /* silently fail */ } finally { setLoadingDocId(null); }
  };

  const closeDocViewer = () => {
    if (viewingDoc) URL.revokeObjectURL(viewingDoc.url);
    setViewingDoc(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setConfirmDeleting(true);
    try {
      await deleteConfirm.onConfirm();
      setDeleteConfirm(null);
    } catch { /* silently fail */ } finally { setConfirmDeleting(false); }
  };

  if (loading) return (
    <div className="flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-2">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-32" />
        </div>
        <Skeleton className="w-9 h-9 rounded-lg" />
        <Skeleton className="w-9 h-9 rounded-lg" />
      </div>
      {/* Info cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      {/* Sections skeleton */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3 py-2">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (!patient) return (
    <div className="text-center py-20">
      <PawPrint size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
      <p className="text-slate-500 dark:text-slate-400">Paciente não encontrado.</p>
      <Link href="/patients" className="mt-4 inline-block">
        <Button variant="outline">Voltar</Button>
      </Link>
    </div>
  );

  const birthDateObj = patient.birth_date ? parseBirthDate(patient.birth_date) : null;

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/patients">
          <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{patient.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {SPECIE_LABELS[patient.specie] ?? patient.specie}{patient.breed && ` · ${patient.breed}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setShowEditModal(true)} title="Editar"><Pencil size={16} /></Button>
          <Button variant="outline" size="icon" onClick={() => setShowDeleteConfirm(true)} title="Excluir" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
        <InfoCard
          iconBg="bg-teal-100 dark:bg-teal-900/40"
          icon={<PawPrint size={16} className="text-teal-600 dark:text-teal-400" />}
          label="Espécie / Raça"
          value={<p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{SPECIE_LABELS[patient.specie] ?? patient.specie}</p>}
          sub={patient.breed}
        />
        <InfoCard
          iconBg="bg-blue-100 dark:bg-blue-900/40"
          icon={<Calendar size={16} className="text-blue-600 dark:text-blue-400" />}
          label="Nascimento"
          value={
            birthDateObj
              ? <p className="text-sm font-semibold text-slate-900 dark:text-white">{birthDateObj.toLocaleDateString('pt-BR')}</p>
              : <p className="text-sm text-slate-400 dark:text-slate-500">Não informado</p>
          }
          sub={birthDateObj ? calcAge(birthDateObj) : undefined}
        />
        <InfoCard
          iconBg="bg-zinc-100 dark:bg-zinc-700/40"
          icon={
            patient.sex === 'MALE' ? <Mars size={16} className="text-blue-600 dark:text-blue-400" />
              : patient.sex === 'FEMALE' ? <Venus size={16} className="text-pink-600 dark:text-pink-400" />
                : <Mars size={16} className="text-slate-400 dark:text-slate-500" />
          }
          label="Sexo"
          value={<p className="text-sm font-semibold text-slate-900 dark:text-white">{patient.sex === 'MALE' ? 'Macho' : patient.sex === 'FEMALE' ? 'Fêmea' : 'Não informado'}</p>}
          sub={patient.castration_date ? `Castrado em ${fmtDate(patient.castration_date)}` : 'Não castrado'}
        />
        <InfoCard
          iconBg="bg-cyan-100 dark:bg-cyan-900/40"
          icon={<Cpu size={16} className="text-cyan-600 dark:text-cyan-400" />}
          label="Microchip"
          value={<p className="text-sm font-semibold text-slate-900 dark:text-white">{patient.microchip ? 'Sim' : 'N/A'}</p>}
          sub={patient.microchip ?? 'Não cadastrado'}
        />
        <InfoCard
          iconBg="bg-slate-100 dark:bg-slate-700"
          icon={<Skull size={16} className="text-slate-500 dark:text-slate-400" />}
          label="Falecimento"
          value={<p className="text-sm font-semibold text-slate-900 dark:text-white">{patient.death_date ? 'Sim' : 'N/A'}</p>}
          sub={patient.death_date ? fmtDate(patient.death_date) : undefined}
        />
        <InfoCard
          iconBg="bg-purple-100 dark:bg-purple-900/40"
          icon={<User size={16} className="text-purple-600 dark:text-purple-400" />}
          label="Tutor"
          className="lg:col-span-2"
          value={
            tutor
              ? <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{tutor.name}</p>
              : <p className="text-sm text-slate-400 dark:text-slate-500">Não informado</p>
          }
          sub={tutor?.phone}
        />
      </div>

      <SectionCard
        title="Próximas Atividades"
        subtitle="Agendamentos futuros para este paciente"
        className="mb-4"
      >
        {upcomingEvents.length === 0 ? (
          <div className="py-6 text-center">
            <CalendarClock size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma atividade agendada.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {upcomingEvents.map((ev) => {
              const typeStyle = EVENT_TYPE_MAP[ev.type];
              const parts = ev.date.split('-');
              const dateLabel = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).toLocaleDateString('pt-BR', {
                weekday: 'short', day: '2-digit', month: 'short',
              });
              return (
                <div key={ev.id} className="flex items-center gap-3 py-3 px-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${typeStyle.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{ev.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {dateLabel} · {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${typeStyle.bg} ${typeStyle.color}`}>
                    {typeStyle.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Exames" subtitle="Exames vinculados a este paciente" className="mb-4"
        headerAction={
          <Button onClick={() => setShowUploadModal(true)} className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 h-9">
            <Plus size={16} /> Adicionar Exame
          </Button>
        }
      >
        {examsLoading ? (
          <div className="flex flex-col gap-2 py-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : exams.length === 0 ? (
            <div className="py-8 text-center">
              <Microscope size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum exame encontrado.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {exams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between py-3 px-1 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                      <Microscope size={15} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{exam.title ?? 'Exame'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{exam.examDate ? fmtDate(exam.examDate) : fmtDate(exam.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STUDY_STATUS_COLORS[exam.status] ?? ''}`}>
                      {STUDY_STATUS_LABELS[exam.status] ?? exam.status}
                    </span>
                    <Link href={`/exams/detail?id=${exam.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><FileText size={14} /></Button>
                    </Link>
                  </div>
                </div>
              ))}
              <div className="pt-3 pb-1 text-center">
                <Link href="/exams" className="text-xs text-teal-600 dark:text-teal-400 hover:underline underline-offset-2">Ver todos os exames →</Link>
              </div>
            </div>
          )}
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <SectionCard title="Histórico de Pesos" subtitle="Acompanhe a evolução do peso"
          headerAction={
            <Button onClick={() => setShowAddWeight(true)} className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 h-9">
              <Plus size={16} /> Registrar Peso
            </Button>
          }
        >
          {weightsLoading ? (
            <div className="flex flex-col gap-2 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="w-7 h-7 rounded-lg" />
                </div>
              ))}
            </div>
          ) : weightRecords.length === 0 ? (
              <div className="py-8 text-center">
                <Scale size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum registro de peso.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {weightRecords.map((rec) => {
                  const meta = rec.metadata as WeightMetadata;
                  return (
                    <div key={rec.id} className="flex items-center justify-between py-3 px-1 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                          <Scale size={15} className="text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{meta.value} {meta.unit === 'KG' ? 'kg' : 'g'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{fmtDate(rec.date)}</p>
                          {rec.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{rec.notes}</p>}
                        </div>
                      </div>
                      <DeleteBtn onDelete={() => setDeleteConfirm({ onConfirm: () => handleDeleteRecord(rec.id, fetchWeights) })} />
                    </div>
                  );
                })}
              </div>
            )}
        </SectionCard>

        <SectionCard title="Registros Clínicos" subtitle="Mais recentes no topo"
          headerAction={
            <Button onClick={() => setShowAddClinicalNote(true)} className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 h-9">
              <Plus size={16} /> Novo Registro
            </Button>
          }
        >
          {clinicalLoading ? (
            <div className="flex flex-col gap-3 py-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-20 ml-auto" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              ))}
            </div>
          ) : clinicalNotes.length === 0 ? (
              <div className="py-8 text-center">
                <FileText size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum registro clínico.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clinicalNotes.map((rec) => {
                  const meta = rec.metadata as ClinicalNoteMetadata;
                  return (
                    <Card key={rec.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{meta.title}</p>
                            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{fmtDate(rec.date)}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{meta.description}</p>
                        </div>
                        <DeleteBtn onDelete={() => setDeleteConfirm({ onConfirm: () => handleDeleteRecord(rec.id, fetchClinicalNotes) })} />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
        </SectionCard>
      </div>

      <div className="space-y-4 mb-4">
        <SectionCard title="Vacinas" subtitle="Histórico de vacinação"
          headerAction={
            <Button onClick={() => setShowAddVaccine(true)} className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 h-9">
              <Plus size={16} /> Registrar Vacina
            </Button>
          }
        >
          {vaccinesLoading ? (
            <div className="flex flex-col gap-2 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : vaccines.length === 0 ? (
              <div className="py-8 text-center">
                <Syringe size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma vacina registrada.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      {['Vacina', 'Data', 'Dose', 'Lote', 'Próx. Revacinação', 'Dose Anterior', 'Aplicado por', ''].map((h) => (
                        <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {vaccines.map((rec) => {
                      const meta = rec.metadata as VaccineMetadata;
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <ShieldCheck size={14} className="text-green-500 shrink-0" />
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{meta.vaccine_name}</p>
                                <p className="text-xs font-mono text-slate-400 dark:text-slate-500">{meta.vaccine_code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{fmtDate(rec.date)}</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">{meta.dose_number}</span>
                          </td>
                          <td className="py-3 px-3 text-xs font-mono text-slate-500 dark:text-slate-400">{meta.batch ?? '—'}</td>
                          <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {meta.revaccination_date ? fmtDate(meta.revaccination_date) : '—'}
                          </td>
                          <td className="py-3 px-12 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {meta.previous_dose_date ? fmtDate(meta.previous_dose_date) : '—'}
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400">{meta.applied_by ?? '—'}</td>
                          <td className="py-3 text-end px-3"><DeleteBtn onDelete={() => setDeleteConfirm({ onConfirm: () => handleDeleteRecord(rec.id, fetchVaccines) })} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </SectionCard>

        <SectionCard title="Receituário" subtitle="Receitas e prescrições"
          headerAction={
            <Button onClick={() => setShowAddPrescription(true)} className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 h-9">
              <Plus size={16} /> Nova Receita
            </Button>
          }
        >
          {prescriptionsLoading ? (
            <div className="flex flex-col gap-3 py-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-24 ml-auto" />
                  </div>
                  <div className="pl-3 border-l-2 border-slate-200 dark:border-slate-700 flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))}
            </div>
          ) : prescriptions.length === 0 ? (
              <div className="py-8 text-center">
                <ClipboardList size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma receita registrada.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((rec) => {
                  const meta = rec.metadata as unknown as PrescriptionMetadata;
                  const latestWeight = weightRecords.length > 0
                    ? (weightRecords[0]!.metadata as WeightMetadata).value
                    : undefined;
                  return (
                    <Card key={rec.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <ClipboardList size={15} className="text-teal-600 dark:text-teal-400 shrink-0" />
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {meta.include_date ? fmtDate(rec.date) : 'Receita'}
                            </span>
                            {!meta.include_date && (
                              <span className="text-xs text-slate-400 dark:text-slate-500">{fmtDate(rec.date)}</span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {(meta.medications ?? []).map((med, i) => (
                              <div key={i} className="pl-3 border-l-2 border-teal-200 dark:border-teal-700">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                  <Pill size={12} className="inline mr-1.5 text-teal-500" />
                                  {med.drug}
                                  {med.form && <span className="text-slate-500 dark:text-slate-400 font-normal"> · {med.form}</span>}
                                  {med.quantity && <span className="text-slate-500 dark:text-slate-400 font-normal"> · {med.quantity}</span>}
                                </p>
                                {med.usage && (
                                  <span className="inline-block text-[10px] font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 rounded px-1.5 py-0.5 mt-0.5">
                                    {med.usage}
                                  </span>
                                )}
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{med.posology}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            title="Visualizar receita"
                            onClick={() => {
                              if (patient && user) {
                                const logoUrl = `${window.location.origin}/logo-white.png`;
                                const html = buildPrescriptionHtml(rec, patient, tutor, user, latestWeight, logoUrl);
                                const url = createPrescriptionBlobUrl(html);
                                setViewingDoc({ url, mimeType: 'text/html', fileName: `Receita - ${patient.name}.pdf` });
                              }
                            }}
                            className="text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                          >
                            <FileText size={14} />
                          </Button>
                          <DeleteBtn onDelete={() => setDeleteConfirm({ onConfirm: () => handleDeleteRecord(rec.id, fetchPrescriptions) })} />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Notas e Observações" subtitle="Observações gerais sobre o paciente"
          headerAction={
            <Button onClick={() => setShowAddNote(true)} className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 h-9">
              <Plus size={16} /> Nova Nota
            </Button>
          }
        >
          {notesLoading ? (
            <div className="flex flex-col gap-3 py-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-yellow-200 dark:border-yellow-800/40 bg-yellow-50/50 dark:bg-yellow-900/10 flex gap-3">
                  <Skeleton className="w-5 h-5 rounded shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-4/5" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : notes.length === 0 ? (
              <div className="py-8 text-center">
                <StickyNote size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma nota registrada.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((rec) => {
                  const meta = rec.metadata as NoteMetadata;
                  return (
                    <Card key={rec.id} className="p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/40">
                      <div className="flex items-start gap-3">
                        <StickyNote size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{meta.text}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{fmtDateTime(rec.created_at)}</p>
                        </div>
                        <DeleteBtn onDelete={() => setDeleteConfirm({ onConfirm: () => handleDeleteRecord(rec.id, fetchNotes) })} />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
        </SectionCard>

        <SectionCard title="Documentos" subtitle="Arquivos e documentos do paciente"
          headerAction={
            <>
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUploadDocument(f); e.target.value = ''; }} />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploadingDoc} className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 h-9">
                {uploadingDoc ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                Enviar Documento
              </Button>
            </>
          }
        >
          {docsLoading ? (
            <div className="flex flex-col gap-2 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="h-3.5 w-48" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="w-7 h-7 rounded-lg" />
                  <Skeleton className="w-7 h-7 rounded-lg" />
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
              <div
                className="py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-center cursor-pointer hover:border-teal-400 dark:hover:border-teal-600 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Clique para enviar um documento</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PDF, imagens, etc.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between py-3 px-1 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <FileText size={15} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{doc.fileName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{fmtDate(doc.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => { void handleViewDocument(doc); }}
                        disabled={loadingDocId === doc.id}
                        className="text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                        title={doc.mimeType.startsWith('image/') || doc.mimeType.includes('pdf') ? 'Visualizar' : 'Baixar'}
                      >
                        {loadingDocId === doc.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : doc.mimeType.startsWith('image/') || doc.mimeType.includes('pdf')
                            ? <Eye size={14} />
                            : <Download size={14} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteConfirm({ onConfirm: () => handleDeleteDocument(doc.id) })}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </SectionCard>
      </div>

      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80">
          <div className="flex items-center justify-between px-4 py-3 bg-teal-700 dark:bg-teal-800 shrink-0">
            <p className="text-white font-medium text-sm truncate">{viewingDoc.fileName}</p>
            <div className="flex items-center gap-1 shrink-0">
              {viewingDoc.mimeType === 'text/html' ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Baixar PDF"
                  disabled={downloadingPdf}
                  onClick={() => {
                    setDownloadingPdf(true);
                    fetch(viewingDoc.url)
                      .then((r) => r.text())
                      .then((html) => downloadPrescriptionAsPdf(html, viewingDoc.fileName))
                      .finally(() => setDownloadingPdf(false));
                  }}
                  className="text-teal-100 hover:text-white hover:bg-teal-600 dark:hover:bg-teal-700"
                >
                  {downloadingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                </Button>
              ) : (
                <a
                  href={viewingDoc.url}
                  download={viewingDoc.fileName}
                  title="Baixar"
                  className="inline-flex items-center justify-center rounded-md h-7 w-7 text-teal-100 hover:text-white hover:bg-teal-600 dark:hover:bg-teal-700 transition-colors"
                >
                  <Download size={16} />
                </a>
              )}
              <Button variant="ghost" size="icon-sm" onClick={closeDocViewer} className="text-teal-100 hover:text-white hover:bg-teal-600 dark:hover:bg-teal-700">
                <X size={18} />
              </Button>
            </div>
          </div>
          {viewingDoc.mimeType.startsWith('image/') ? (
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
              <img src={viewingDoc.url} alt={viewingDoc.fileName} className="max-w-full max-h-full object-contain rounded" />
            </div>
          ) : (
            <iframe ref={viewerIframeRef} src={viewingDoc.url} className="flex-1 w-full border-0" title={viewingDoc.fileName} />
          )}
        </div>
      )}

      {deleteConfirm && (
        <ConfirmModal
          title="Excluir registro?"
          description="Esta ação não pode ser desfeita. O registro será removido permanentemente."
          confirmLabel="Excluir"
          loading={confirmDeleting}
          onConfirm={() => { void handleConfirmDelete(); }}
          onClose={() => setDeleteConfirm(null)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Excluir paciente?"
          description={`Esta ação não pode ser desfeita. ${patient.name} será removido permanentemente.`}
          confirmLabel="Excluir"
          loading={deleting}
          onConfirm={() => { void handleDelete(); }}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}

      {showEditModal && <PatientModal patient={patient} onClose={() => setShowEditModal(false)} onSuccess={handleEditSuccess} />}
      {showUploadModal && <UploadExamModal preselectedPatient={patient} onClose={() => setShowUploadModal(false)} onSuccess={() => { setShowUploadModal(false); void fetchExams(); }} />}
      {showAddWeight && <AddWeightModal patientId={patient.id} onClose={() => setShowAddWeight(false)} onSuccess={() => { setShowAddWeight(false); void fetchWeights(); }} />}
      {showAddClinicalNote && <AddClinicalNoteModal patientId={patient.id} onClose={() => setShowAddClinicalNote(false)} onSuccess={() => { setShowAddClinicalNote(false); void fetchClinicalNotes(); }} />}
      {showAddVaccine && <AddVaccineModal patientId={patient.id} onClose={() => setShowAddVaccine(false)} onSuccess={() => { setShowAddVaccine(false); void fetchVaccines(); }} />}
      {showAddNote && <AddNoteModal patientId={patient.id} onClose={() => setShowAddNote(false)} onSuccess={() => { setShowAddNote(false); void fetchNotes(); }} />}
      {showAddPrescription && <AddPrescriptionModal patientId={patient.id} onClose={() => setShowAddPrescription(false)} onSuccess={() => { setShowAddPrescription(false); void fetchPrescriptions(); }} />}
    </>
  );
}
