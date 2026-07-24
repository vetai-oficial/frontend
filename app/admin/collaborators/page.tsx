'use client';

import { Loader2, Send, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Modal } from '@/app/components/common/modal';
import { DataTable, type DataTableColumn } from '@/app/components/data/data-table';
import { SectionCard } from '@/app/components/data/section-card';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/infra/auth-context';
import { collaboratorsService } from '@/services/collaborators.service';
import { rolesService } from '@/services/roles.service';
import type { Collaborator, Role } from '@/types/settings';

export default function AdminCollaborators() {
  const { can } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const canEdit = can('collaborators:edit');

  async function load() {
    setLoading(true);
    try {
      const [collaboratorsData, rolesData] = await Promise.all([
        collaboratorsService.findAll(),
        rolesService.findAll(),
      ]);
      setCollaborators(collaboratorsData);
      setRoles(rolesData);
      setRoleId((current) => current || rolesData[0]?.id || '');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function invite() {
    if (!email.trim() || !roleId) return;
    setSaving(true);
    try {
      await collaboratorsService.invite({ email: email.trim(), role_id: roleId });
      toast.success('Convite enviado.');
      setEmail('');
      setRoleId(roles[0]?.id || '');
      setIsInviteOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function updateRole(collaboratorId: string, nextRoleId: string) {
    await collaboratorsService.updateRole(collaboratorId, nextRoleId);
    toast.success('Papel administrativo atualizado.');
    await load();
  }

  const columns: DataTableColumn<Collaborator>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (c) => (
        <span className="font-medium text-slate-900 dark:text-white">{c.name ?? 'Convite pendente'}</span>
      ),
    },
    {
      key: 'email',
      header: 'E-mail',
      render: (c) => <span className="text-sm text-slate-500">{c.email}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <span className="text-sm">{c.status === 'pending' ? 'Pendente' : 'Ativo'}</span>
      ),
    },
    {
      key: 'role',
      header: 'Papel administrativo',
      render: (c) => {
        if (c.status === 'active') {
          return (
            <select
              value={c.role_id ?? ''}
              onChange={(e) => updateRole(c.id, e.target.value)}
              disabled={!canEdit}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="" disabled>Selecione</option>
              {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          );
        }
        return <span className="text-sm text-slate-500">{c.role_name ?? '-'}</span>;
      },
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 pb-12">
      <Header
        title="Colaboradores"
        showStorage={false}
        headerAction={
          canEdit ? (
            <Button onClick={() => setIsInviteOpen(true)} className="bg-teal-600 text-white hover:bg-teal-700">
              <UserPlus className="h-4 w-4" /> Convidar colaborador
            </Button>
          ) : undefined
        }
      />

      <SectionCard title="Equipe" subtitle="Colaboradores ativos e convites pendentes">
        {loading ? (
          <div className="flex justify-center py-10 text-slate-500"><Loader2 className="animate-spin" /></div>
        ) : (
          <DataTable
            columns={columns}
            data={collaborators}
            getRowKey={(c) => c.id}
            emptyState="Nenhum colaborador encontrado."
          />
        )}
      </SectionCard>

      {isInviteOpen && (
        <Modal
          title="Convidar colaborador"
          description="Defina o papel administrativo antes de enviar o convite"
          maxWidth="sm"
          onClose={() => setIsInviteOpen(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                E-mail
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                disabled={saving}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Papel administrativo
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                disabled={saving}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsInviteOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={invite} disabled={saving || !email.trim() || !roleId} className="bg-teal-600 text-white hover:bg-teal-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Enviar convite
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
