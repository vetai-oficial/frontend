'use client';

import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  History,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  PawPrint,
  Phone,
  Plus,
  Trash2,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { AddAppointmentModal } from './add-appointment-modal';
import { AddPaymentModal } from './add-payment-modal';

import { Card } from '@/app/components/card';
import { ConfirmModal } from '@/app/components/confirm-modal';
import { Header } from '@/app/components/header';
import { SectionCard } from '@/app/components/section-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SPECIE_LABELS } from '@/constants';
import { appointmentsService } from '@/services/appointments.service';
import { paymentsService } from '@/services/payments.service';
import { tutorsService } from '@/services/tutors.service';
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_COLORS,
  APPOINTMENT_TYPE_LABELS,
  type Appointment,
} from '@/types/appointment';
import type { Patient } from '@/types/patient';
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  type Payment,
} from '@/types/payment';
import type { Tutor } from '@/types/tutor';

function fmtDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const s = dateStr.split('T')[0]!;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString('pt-BR');
}

function fmtCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function TutorDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  const [pets, setPets] = useState<Patient[]>([]);
  const [petsLoading, setPetsLoading] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [paidPayments, setPaidPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ type: 'appointment' | 'payment'; id: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [confirmMarkPaid, setConfirmMarkPaid] = useState<Payment | null>(null);
  const [markingPaid, setMarkingPaid] = useState(false);

  const fetchTutor = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await tutorsService.get(id);
      setTutor(data);
    } catch {
      router.push('/tutors');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const fetchPets = useCallback(async () => {
    if (!id) return;
    setPetsLoading(true);
    try {
      const res = await tutorsService.listPatients(id, { size: 100 });
      setPets(res.data);
    } catch {
      // silently fail
    } finally {
      setPetsLoading(false);
    }
  }, [id]);

  const fetchAppointments = useCallback(async () => {
    if (!id) return;
    setAppointmentsLoading(true);
    try {
      const res = await appointmentsService.list({ tutor_id: id, size: 100, sort: 'date' });
      setAppointments(res.data);
    } catch {
      // silently fail
    } finally {
      setAppointmentsLoading(false);
    }
  }, [id]);

  const fetchPayments = useCallback(async () => {
    if (!id) return;
    setPaymentsLoading(true);
    try {
      const res = await paymentsService.list({ tutor_id: id, size: 100 });
      setPendingPayments(res.data.filter((p) => p.status === 'PENDING'));
      setPaidPayments(res.data.filter((p) => p.status !== 'PENDING'));
    } catch {
      // silently fail
    } finally {
      setPaymentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchTutor();
    void fetchPets();
    void fetchAppointments();
    void fetchPayments();
  }, [fetchTutor, fetchPets, fetchAppointments, fetchPayments]);

  const handleDeleteAppointment = async () => {
    if (!confirmDelete || confirmDelete.type !== 'appointment') return;
    setDeleting(true);
    try {
      await appointmentsService.delete(confirmDelete.id);
      setAppointments((prev) => prev.filter((a) => a.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!confirmDelete || confirmDelete.type !== 'payment') return;
    setDeleting(true);
    try {
      await paymentsService.delete(confirmDelete.id);
      setPendingPayments((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      setPaidPayments((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!confirmMarkPaid) return;
    setMarkingPaid(true);
    try {
      const updated = await paymentsService.update(confirmMarkPaid.id, {
        status: 'PAID',
        paid_at: new Date().toISOString().split('T')[0]!,
      });
      setPendingPayments((prev) => prev.filter((p) => p.id !== confirmMarkPaid.id));
      setPaidPayments((prev) => [updated, ...prev]);
      setConfirmMarkPaid(null);
    } catch {
      // silently fail
    } finally {
      setMarkingPaid(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'SCHEDULED' && a.date >= new Date().toISOString().split('T')[0]!,
  );
  const pastAppointments = appointments.filter(
    (a) => a.status !== 'SCHEDULED' || a.date < new Date().toISOString().split('T')[0]!,
  );

  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Header title="Detalhes do Tutor" showStorage={false} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (!tutor) return null;

  const petNameById = (patientId?: string) =>
    pets.find((p) => p.id === patientId)?.name ?? '—';

  return (
    <div className="space-y-6">
      <Header title="Detalhes do Tutor" showStorage={false} />

      {/* Back + actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/tutors"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar para tutores
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEditModal(true)}
          className="gap-1.5"
        >
          <Pencil size={14} />
          Editar
        </Button>
      </div>

      {/* Info cards */}
      <SectionCard title={tutor.name} subtitle="Informações do tutor">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoItem icon={<User size={16} className="text-teal-600 dark:text-teal-400" />} iconBg="bg-teal-50 dark:bg-teal-900/30" label="CPF" value={fmtCpf(tutor.cpf)} />
          <InfoItem icon={<Phone size={16} className="text-blue-600 dark:text-blue-400" />} iconBg="bg-blue-50 dark:bg-blue-900/30" label="Telefone" value={tutor.phone ?? '—'} />
          <InfoItem icon={<Mail size={16} className="text-purple-600 dark:text-purple-400" />} iconBg="bg-purple-50 dark:bg-purple-900/30" label="E-mail" value={tutor.email ?? '—'} />
          <InfoItem icon={<MapPin size={16} className="text-rose-600 dark:text-rose-400" />} iconBg="bg-rose-50 dark:bg-rose-900/30" label="Endereço" value={tutor.address ?? '—'} />
        </div>
      </SectionCard>

      {/* Pets */}
      <SectionCard
        title={<span className="flex items-center gap-2"><PawPrint size={18} />Pets</span>}
        subtitle={`${pets.length} pet${pets.length !== 1 ? 's' : ''} cadastrado${pets.length !== 1 ? 's' : ''}`}
      >
        {petsLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}</div>
        ) : pets.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">Nenhum pet cadastrado para este tutor.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pets.map((pet) => (
              <Link
                key={pet.id}
                href={`/patients/detail?id=${pet.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                  <PawPrint size={16} className="text-teal-600 dark:text-teal-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white text-sm truncate group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">{pet.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{SPECIE_LABELS[pet.specie]}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Agendamentos */}
      <SectionCard
        title={<span className="flex items-center gap-2"><CalendarClock size={18} />Atividades Agendadas</span>}
        subtitle={`${upcomingAppointments.length} próxima${upcomingAppointments.length !== 1 ? 's' : ''}`}
        headerAction={
          <Button
            size="sm"
            onClick={() => setShowAddAppointment(true)}
            className="gap-1.5 bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 dark:hover:bg-teal-800"
          >
            <Plus size={14} />
            Novo agendamento
          </Button>
        }
      >
        {appointmentsLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}</div>
        ) : upcomingAppointments.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">Nenhum agendamento futuro.</p>
        ) : (
          <div className="space-y-2">
            {upcomingAppointments.map((appt) => (
              <AppointmentRow
                key={appt.id}
                appointment={appt}
                petName={petNameById(appt.patient_id)}
                onDelete={() => setConfirmDelete({ type: 'appointment', id: appt.id })}
              />
            ))}
          </div>
        )}

        {pastAppointments.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 select-none flex items-center gap-1.5 mb-2">
              <History size={14} />
              {pastAppointments.length} atividade{pastAppointments.length !== 1 ? 's' : ''} passada{pastAppointments.length !== 1 ? 's' : ''}
            </summary>
            <div className="space-y-2">
              {pastAppointments.map((appt) => (
                <AppointmentRow
                  key={appt.id}
                  appointment={appt}
                  petName={petNameById(appt.patient_id)}
                  onDelete={() => setConfirmDelete({ type: 'appointment', id: appt.id })}
                  muted
                />
              ))}
            </div>
          </details>
        )}
      </SectionCard>

      {/* Pagamentos pendentes */}
      <SectionCard
        title={<span className="flex items-center gap-2"><CreditCard size={18} />Pagamentos Pendentes</span>}
        subtitle={pendingPayments.length > 0 ? `Total: ${fmtCurrency(totalPending)}` : 'Nenhum pendente'}
        headerAction={
          <Button
            size="sm"
            onClick={() => setShowAddPayment(true)}
            className="gap-1.5 bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 dark:hover:bg-teal-800"
          >
            <Plus size={14} />
            Registrar cobrança
          </Button>
        }
      >
        {paymentsLoading ? (
          <div className="space-y-2">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}</div>
        ) : pendingPayments.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">Nenhum pagamento pendente.</p>
        ) : (
          <div className="space-y-2">
            {pendingPayments.map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                petName={petNameById(payment.patient_id)}
                onMarkPaid={() => setConfirmMarkPaid(payment)}
                onDelete={() => setConfirmDelete({ type: 'payment', id: payment.id })}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {/* Histórico de compras */}
      <SectionCard
        title={<span className="flex items-center gap-2"><History size={18} />Histórico de Compras</span>}
        subtitle={`${paidPayments.length} registro${paidPayments.length !== 1 ? 's' : ''}`}
      >
        {paymentsLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}</div>
        ) : paidPayments.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">Nenhum histórico de compras.</p>
        ) : (
          <div className="space-y-2">
            {paidPayments.map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                petName={petNameById(payment.patient_id)}
                onDelete={() => setConfirmDelete({ type: 'payment', id: payment.id })}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {/* Modals */}
      {showEditModal && tutor && (
        <TutorEditModal
          tutor={tutor}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updated) => { setTutor(updated); setShowEditModal(false); }}
        />
      )}

      {showAddAppointment && id && (
        <AddAppointmentModal
          tutorId={id}
          pets={pets}
          onClose={() => setShowAddAppointment(false)}
          onSuccess={(appt) => {
            setAppointments((prev) => [appt, ...prev]);
            setShowAddAppointment(false);
          }}
        />
      )}

      {showAddPayment && id && (
        <AddPaymentModal
          tutorId={id}
          pets={pets}
          onClose={() => setShowAddPayment(false)}
          onSuccess={(payment) => {
            if (payment.status === 'PENDING') {
              setPendingPayments((prev) => [payment, ...prev]);
            } else {
              setPaidPayments((prev) => [payment, ...prev]);
            }
            setShowAddPayment(false);
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title={confirmDelete.type === 'appointment' ? 'Excluir agendamento' : 'Excluir pagamento'}
          description="Esta ação não pode ser desfeita. Deseja continuar?"
          confirmLabel="Excluir"
          loading={deleting}
          onConfirm={() => { void (confirmDelete.type === 'appointment' ? handleDeleteAppointment() : handleDeletePayment()); }}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {confirmMarkPaid && (
        <ConfirmModal
          title="Confirmar pagamento"
          description={`Marcar cobrança de ${fmtCurrency(confirmMarkPaid.amount)} como pago?`}
          confirmLabel="Confirmar pagamento"
          variant="default"
          loading={markingPaid}
          onConfirm={() => { void handleMarkPaid(); }}
          onClose={() => setConfirmMarkPaid(null)}
        />
      )}
    </div>
  );
}

function InfoItem({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <Card className="px-3 py-4 flex items-start gap-2.5">
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 pl-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{value}</p>
      </div>
    </Card>
  );
}

function AppointmentRow({
  appointment,
  petName,
  onDelete,
  muted = false,
}: {
  appointment: Appointment;
  petName: string;
  onDelete: () => void;
  muted?: boolean;
}) {
  const typeColors = APPOINTMENT_TYPE_COLORS[appointment.type];
  const statusColors = APPOINTMENT_STATUS_COLORS[appointment.status];
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 ${muted ? 'opacity-60' : ''}`}>
      <div className={`w-2 h-2 rounded-full shrink-0 ${typeColors.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{appointment.title}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${typeColors.bg} ${typeColors.text}`}>
            {APPOINTMENT_TYPE_LABELS[appointment.type]}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors.bg} ${statusColors.text}`}>
            {APPOINTMENT_STATUS_LABELS[appointment.status]}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><Calendar size={11} />{fmtDate(appointment.date)} às {appointment.start_time}</span>
          {appointment.patient_id && <span className="flex items-center gap-1"><PawPrint size={11} />{petName}</span>}
        </div>
      </div>
      <button
        onClick={onDelete}
        className="text-slate-400 hover:text-red-500 transition-colors p-1 shrink-0"
        aria-label="Excluir agendamento"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function PaymentRow({
  payment,
  petName,
  onMarkPaid,
  onDelete,
}: {
  payment: Payment;
  petName: string;
  onMarkPaid?: () => void;
  onDelete?: () => void;
}) {
  const statusColors = PAYMENT_STATUS_COLORS[payment.status];
  const isOverdue = payment.status === 'PENDING' && payment.due_date < new Date().toISOString().split('T')[0]!;
  const itemsSummary = payment.items.length > 0
    ? payment.items.map((i) => `${i.quantity > 1 ? `${i.quantity}× ` : ''}${i.name}`).join(', ')
    : payment.notes ?? '—';

  return (
    <div className={`p-3 rounded-lg border ${isOverdue ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{fmtCurrency(payment.amount)}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors.bg} ${statusColors.text}`}>
              {PAYMENT_STATUS_LABELS[payment.status]}
            </span>
            {isOverdue && <span className="text-xs text-red-600 dark:text-red-400 font-medium">Vencido</span>}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{itemsSummary}</p>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
            <span className="flex items-center gap-1"><Calendar size={11} />Vence: {fmtDate(payment.due_date)}</span>
            {payment.paid_at && <span>Pago: {fmtDate(payment.paid_at)}</span>}
            {payment.patient_id && <span className="flex items-center gap-1"><PawPrint size={11} />{petName}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          {payment.status === 'PENDING' && onMarkPaid && (
            <button
              onClick={onMarkPaid}
              className="text-slate-400 hover:text-green-600 transition-colors p-1"
              aria-label="Marcar como pago"
            >
              <CheckCircle2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-slate-400 hover:text-red-500 transition-colors p-1"
              aria-label="Excluir cobrança"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      {payment.items.length > 1 && (
        <details className="mt-2">
          <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none">
            Ver {payment.items.length} itens
          </summary>
          <div className="mt-1.5 space-y-0.5 pl-2 border-l-2 border-slate-200 dark:border-slate-600">
            {payment.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{item.quantity > 1 ? `${item.quantity}× ` : ''}{item.name}</span>
                <span>{fmtCurrency(item.quantity * item.unit_price)}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function TutorEditModal({
  tutor,
  onClose,
  onSuccess,
}: {
  tutor: Tutor;
  onClose: () => void;
  onSuccess: (t: Tutor) => void;
}) {
  const [name, setName] = useState(tutor.name);
  const [cpf, setCpf] = useState(tutor.cpf);
  const [phone, setPhone] = useState(tutor.phone ?? '');
  const [email, setEmail] = useState(tutor.email ?? '');
  const [address, setAddress] = useState(tutor.address ?? '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function formatCpf(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nome é obrigatório';
    if (!cpf.trim()) errs.cpf = 'CPF é obrigatório';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const result = await tutorsService.update(tutor.id, {
        name: name.trim(),
        cpf: cpf.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(address.trim() ? { address: address.trim() } : {}),
      });
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
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Editar Tutor</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Atualize os dados do tutor</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-slate-500">
            <X size={18} />
          </Button>
        </div>
        <div className="p-5 space-y-4">
          <FormField label="Nome" required error={errors.name}>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: João Silva" className={inputClass} />
          </FormField>
          <FormField label="CPF" required error={errors.cpf}>
            <input type="text" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} placeholder="Ex: 123.456.789-09" className={inputClass} />
          </FormField>
          <FormField label="Telefone">
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: (11) 99999-9999" className={inputClass} />
          </FormField>
          <FormField label="E-mail">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: joao@email.com" className={inputClass} />
          </FormField>
          <FormField label="Endereço">
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ex: Rua das Flores, 123 - SP" className={inputClass} />
          </FormField>
          {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button
            onClick={() => { void handleSubmit(); }}
            disabled={saving}
            className="bg-teal-600 dark:bg-teal-700 text-white hover:bg-teal-700 dark:hover:bg-teal-800 min-w-[100px]"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

const inputClass = 'w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm';

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
