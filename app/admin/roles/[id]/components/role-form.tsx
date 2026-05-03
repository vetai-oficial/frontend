'use client';

import { Loader2, Save, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SectionCard } from '@/app/components/data/section-card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/infra/auth-context';
import { collaboratorsService } from '@/services/collaborators.service';
import { rolesService } from '@/services/roles.service';
import type { Permission } from '@/types/permissions';
import type { Collaborator, Role } from '@/types/settings';
import {
  ALL_PERMISSIONS,
  PERMISSION_CATEGORIES,
  expandPermissions,
} from '@/utils/permissions';

interface RoleFormProps {
  role?: Role | null;
  mode: 'create' | 'edit';
  onSaved?: (role: Role) => void;
}

export function RoleForm({ role, mode, onSaved }: RoleFormProps) {
  const { can } = useAuth();
  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [permissions, setPermissions] = useState<string[]>(
    role?.permissions ?? [],
  );
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>(
    role?.collaborator_ids ?? [],
  );
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [showCollaboratorOptions, setShowCollaboratorOptions] = useState(false);
  const [loadingCollaborators, setLoadingCollaborators] = useState(true);
  const [saving, setSaving] = useState(false);
  const canEdit = can('roles:edit');
  const readonly = !canEdit;

  useEffect(() => {
    setName(role?.name ?? '');
    setDescription(role?.description ?? '');
    const hasAllPermissions = role?.permissions?.includes('*');
    setPermissions(
      hasAllPermissions ? ALL_PERMISSIONS : (role?.permissions ?? []),
    );
    setCollaboratorIds(role?.collaborator_ids ?? []);
  }, [role]);

  useEffect(() => {
    async function loadCollaborators() {
      setLoadingCollaborators(true);
      try {
        const data = await collaboratorsService.findAll();
        setCollaborators(data.filter((item) => item.status === 'active'));
      } finally {
        setLoadingCollaborators(false);
      }
    }

    void loadCollaborators();
  }, []);

  function togglePermission(permission: string) {
    setPermissions((current) => {
      const next = current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission];
      return expandPermissions(next);
    });
  }

  function toggleCategory(categoryPermissions: readonly string[]) {
    setPermissions((current) => {
      const hasAll = categoryPermissions.every((permission) =>
        current.includes(permission),
      );
      const next = hasAll
        ? current.filter(
            (permission) => !categoryPermissions.includes(permission),
          )
        : Array.from(new Set([...current, ...categoryPermissions]));
      return expandPermissions(next);
    });
  }

  function toggleAll() {
    setPermissions((current) =>
      current.length === ALL_PERMISSIONS.length ? [] : [...ALL_PERMISSIONS],
    );
  }

  function addCollaborator(id: string) {
    setCollaboratorIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
    setCollaboratorSearch('');
    setShowCollaboratorOptions(false);
  }

  function removeCollaborator(id: string) {
    setCollaboratorIds((current) => current.filter((item) => item !== id));
  }

  const selectedCollaborators = collaborators.filter((collaborator) =>
    collaboratorIds.includes(collaborator.id),
  );
  const collaboratorOptions = collaborators.filter((collaborator) => {
    if (collaboratorIds.includes(collaborator.id)) return false;
    const search = collaboratorSearch.trim().toLowerCase();
    if (!search) return true;
    return `${collaborator.name ?? ''} ${collaborator.email}`
      .toLowerCase()
      .includes(search);
  });

  async function submit() {
    if (readonly) return;
    setSaving(true);
    try {
      const payload = {
        name,
        description,
        permissions: permissions as Permission[],
        collaborator_ids: collaboratorIds,
      };
      const saved =
        mode === 'create' || !role?.id
          ? await rolesService.create(payload)
          : await rolesService.update(role.id, payload);
      toast.success(
        mode === 'create'
          ? 'Papel administrativo criado.'
          : 'Papel administrativo atualizado.',
      );
      onSaved?.(saved);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='space-y-6'>
      <SectionCard
        title='Dados do papel administrativo'
        subtitle='Nome e descrição exibidos no administrativo'
      >
        <div className='grid gap-4 md:grid-cols-2'>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder='Nome do papel administrativo'
            disabled={readonly}
          />
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder='Descrição'
            disabled={readonly}
          />
        </div>
      </SectionCard>

      <SectionCard
        title='Permissões'
        subtitle='Marcar edição também libera visualização'
        headerAction={
          <Button
            type='button'
            variant='outline'
            onClick={toggleAll}
            disabled={readonly}
          >
            {permissions.length === ALL_PERMISSIONS.length
              ? 'Limpar todas'
              : 'Selecionar todas'}
          </Button>
        }
      >
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {PERMISSION_CATEGORIES.map((category) => (
            <div
              key={category.key}
              className='rounded-xl border border-slate-200 p-4 dark:border-slate-700'
            >
              <div className='mb-3 flex items-center justify-between gap-3'>
                <h3 className='font-semibold text-slate-900 dark:text-white'>
                  {category.label}
                </h3>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => toggleCategory(category.permissions)}
                  disabled={readonly}
                >
                  {category.permissions.every((permission) =>
                    permissions.includes(permission),
                  )
                    ? 'Limpar'
                    : 'Adicionar'}{' '}
                  categoria
                </Button>
              </div>
              <div className='space-y-2'>
                {category.permissions.map((permission) => (
                  <Checkbox
                    key={permission}
                    label={
                      permission.endsWith(':view') ? 'Visualizar' : 'Editar'
                    }
                    description={permission}
                    checked={permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    disabled={readonly}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title='Colaboradores'
        subtitle='Busque e adicione usuários que receberão este papel administrativo'
      >
        {loadingCollaborators ? (
          <div className='flex justify-center py-8 text-slate-500'>
            <Loader2 className='animate-spin' />
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='relative max-w-xl'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
              <Input
                value={collaboratorSearch}
                onChange={(event) => {
                  setCollaboratorSearch(event.target.value);
                  setShowCollaboratorOptions(true);
                }}
                onFocus={() => setShowCollaboratorOptions(true)}
                placeholder='Buscar colaborador por nome ou e-mail'
                disabled={readonly}
                className='pl-9'
              />
              {showCollaboratorOptions && !readonly && (
                <div className='absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900'>
                  {collaboratorOptions.length === 0 ? (
                    <div className='px-3 py-4 text-center text-sm text-slate-500'>
                      Nenhum colaborador encontrado.
                    </div>
                  ) : (
                    collaboratorOptions.map((collaborator) => (
                      <button
                        key={collaborator.id}
                        type='button'
                        onClick={() => addCollaborator(collaborator.id)}
                        className='flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-teal-50 dark:hover:bg-teal-950/30'
                      >
                        <span className='font-medium text-slate-900 dark:text-white'>
                          {collaborator.name}
                        </span>
                        <span className='text-xs text-slate-500'>
                          {collaborator.email}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className='flex flex-wrap gap-2'>
              {selectedCollaborators.length === 0 ? (
                <span className='text-sm text-slate-500'>
                  Nenhum colaborador adicionado.
                </span>
              ) : (
                selectedCollaborators.map((collaborator) => (
                  <span
                    key={collaborator.id}
                    className='inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200'
                  >
                    {collaborator.name ?? collaborator.email}
                    {!readonly && (
                      <button
                        type='button'
                        onClick={() => removeCollaborator(collaborator.id)}
                        className='rounded-full hover:bg-teal-100 dark:hover:bg-teal-900'
                      >
                        <X className='h-3.5 w-3.5' />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>
        )}
      </SectionCard>

      <div className='flex justify-end'>
        <Button
          onClick={submit}
          disabled={readonly || saving || !name.trim()}
          className='bg-teal-600 text-white hover:bg-teal-700'
        >
          {saving ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Save className='h-4 w-4' />
          )}{' '}
          Salvar papel
        </Button>
      </div>
    </div>
  );
}
