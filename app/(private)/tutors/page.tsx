'use client';

import {
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { useState } from 'react';

import { TutorModal } from './components/tutor-modal';

import { DataTable } from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import { tutorsService } from '@/services/tutors.service';
import type { Tutor } from '@/types/tutor';

export default function TutorsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteTutor, setConfirmDeleteTutor] = useState<Tutor | null>(null);

  const {
    items: tutors,
    meta,
    loading,
    search,
    setSearch,
    prependItem,
    replaceItem,
    removeItem,
  } = usePaginatedResource<Tutor, { search?: string }>({
    fetcher: tutorsService.list,
    initialFilters: { search: '' },
    pageSize: 10,
    debounceMs: 300,
  });

  const handleCreateSuccess = (tutor: Tutor) => {
    setShowModal(false);
    prependItem(tutor);
  };

  const handleEditSuccess = (updated: Tutor) => {
    setShowModal(false);
    setEditingTutor(undefined);
    replaceItem((t) => t.id === updated.id, updated);
  };

  const handleDelete = async (tutor: Tutor) => {
    setDeletingId(tutor.id);
    try {
      await tutorsService.delete(tutor.id);
      removeItem((t) => t.id === tutor.id);
    } catch {
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
            headers={['Tutor', 'CPF', 'Telefone', 'E-mail', 'Cadastrado em', 'Ações']}
            showSearch={true}
            onSearch={setSearch}
            searchPlaceholder="Buscar por nome..."
          >
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  <Loader2 size={24} className="animate-spin text-teal-600 mx-auto" />
                </td>
              </tr>
            ) : tutors.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
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
                    {tutor.cpf ?? <span className="text-slate-400 dark:text-slate-500">—</span>}
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

      {showModal && (
        <TutorModal
          {...(editingTutor ? { tutor: editingTutor } : {})}
          onClose={closeModal}
          onSuccess={editingTutor ? handleEditSuccess : handleCreateSuccess}
        />
      )}

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
                onClick={() => { void handleDelete(confirmDeleteTutor); }}
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
