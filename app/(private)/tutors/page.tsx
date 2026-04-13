'use client';

import {
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { DataTable } from '@/app/components/data-table';
import { Header } from '@/app/components/header';
import { SectionCard } from '@/app/components/section-card';
import { Button } from '@/components/ui/button';
import { tutorsService } from '@/services/tutors.service';
import type { PaginatedMeta } from '@/types/common';
import type { Tutor, CreateTutorPayload, UpdateTutorPayload } from '@/types/tutor';

// ─── Tutor Modal ─────────────────────────────────────────────────────────────

interface TutorModalProps {
  tutor?: Tutor;
  onClose: () => void;
  onSuccess: (tutor: Tutor) => void;
}

function TutorModal({ tutor, onClose, onSuccess }: TutorModalProps) {
  const isEdit = !!tutor;
  const [name, setName] = useState(tutor?.name ?? '');
  const [phone, setPhone] = useState(tutor?.phone ?? '');
  const [email, setEmail] = useState(tutor?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nome é obrigatório';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);

    try {
      let result: Tutor;
      if (isEdit) {
        const payload = { name: name.trim() } as UpdateTutorPayload;
        if (phone.trim()) payload.phone = phone.trim();
        if (email.trim()) payload.email = email.trim();
        result = await tutorsService.update(tutor.id, payload);
      } else {
        const payload = { name: name.trim() } as CreateTutorPayload;
        if (phone.trim()) payload.phone = phone.trim();
        if (email.trim()) payload.email = email.trim();
        result = await tutorsService.create(payload);
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
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEdit ? 'Editar Tutor' : 'Novo Tutor'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isEdit ? 'Atualize os dados do tutor' : 'Cadastre um novo tutor'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.name ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Telefone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: (11) 99999-9999"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: joao@email.com"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteTutor, setConfirmDeleteTutor] = useState<Tutor | null>(null);

  const fetchTutors = useCallback(async (searchQuery?: string, page = 1) => {
    setLoading(true);
    try {
      const response = await tutorsService.list({ page, size: 10, search: searchQuery });
      setTutors(response.data);
      setMeta(response.meta);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchTutors(); }, [fetchTutors]);

  const handleSearch = (value: string) => {
    setSearch(value);
    void fetchTutors(value);
  };

  const handleCreateSuccess = (tutor: Tutor) => {
    setShowModal(false);
    setTutors((prev) => [tutor, ...prev]);
    setMeta((prev) => prev ? { ...prev, total_elements: prev.total_elements + 1 } : prev);
  };

  const handleEditSuccess = (updated: Tutor) => {
    setShowModal(false);
    setEditingTutor(undefined);
    setTutors((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDelete = async (tutor: Tutor) => {
    setDeletingId(tutor.id);
    try {
      await tutorsService.delete(tutor.id);
      setTutors((prev) => prev.filter((t) => t.id !== tutor.id));
      setMeta((prev) => prev ? { ...prev, total_elements: prev.total_elements - 1 } : prev);
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
      setConfirmDeleteTutor(null);
    }
  };

  const openEdit = (tutor: Tutor) => {
    setEditingTutor(tutor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTutor(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Tutores" showStorage={false} />

        <SectionCard
          title="Tutores cadastrados"
          subtitle={meta ? `${meta.total_elements} tutores no total` : 'Carregando...'}
          headerAction={
            <Button
              onClick={() => { setEditingTutor(undefined); setShowModal(true); }}
              className="bg-teal-600 dark:bg-teal-700 h-10 text-white hover:bg-teal-700 dark:hover:bg-teal-800"
            >
              <Plus size={18} /> Novo Tutor
            </Button>
          }
        >
          <DataTable
            headers={['Tutor', 'Telefone', 'E-mail', 'Cadastrado em', 'Ações']}
            showSearch={true}
            onSearch={handleSearch}
            searchPlaceholder="Buscar por nome..."
          >
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <Loader2 size={24} className="animate-spin text-teal-600 mx-auto" />
                </td>
              </tr>
            ) : tutors.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <User size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {search ? 'Nenhum tutor encontrado.' : 'Nenhum tutor cadastrado ainda.'}
                  </p>
                </td>
              </tr>
            ) : (
              tutors.map((tutor) => (
                <tr
                  key={tutor.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                        <User size={16} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">{tutor.name}</p>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {tutor.phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} className="text-slate-400" />
                        {tutor.phone}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {tutor.email ? (
                      <span className="flex items-center gap-1.5">
                        <Mail size={13} className="text-slate-400" />
                        {tutor.email}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {new Date(tutor.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(tutor)}
                        title="Editar"
                      >
                        <Pencil size={15} className="text-slate-500 dark:text-slate-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setConfirmDeleteTutor(tutor)}
                        title="Excluir"
                        disabled={deletingId === tutor.id}
                      >
                        {deletingId === tutor.id ? (
                          <Loader2 size={15} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={15} className="text-red-500" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </DataTable>
        </SectionCard>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <TutorModal
          {...(editingTutor ? { tutor: editingTutor } : {})}
          onClose={closeModal}
          onSuccess={editingTutor ? handleEditSuccess : handleCreateSuccess}
        />
      )}

      {/* Delete Confirm */}
      {confirmDeleteTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDeleteTutor(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir tutor?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              <strong>{confirmDeleteTutor.name}</strong> será removido permanentemente.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setConfirmDeleteTutor(null)} disabled={!!deletingId}>
                Cancelar
              </Button>
              <Button
                onClick={() => handleDelete(confirmDeleteTutor)}
                disabled={!!deletingId}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deletingId ? <Loader2 size={16} className="animate-spin" /> : 'Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
