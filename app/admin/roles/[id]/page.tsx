'use client';

import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { RoleForm } from './components/role-form';

import { Header } from '@/app/components/layout/header';
import { rolesService } from '@/services/roles.service';
import type { Role } from '@/types/settings';

export default function RoleDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const isNew = params.id === 'new';

  useEffect(() => {
    async function load() {
      if (isNew) return;
      setLoading(true);
      try {
        setRole(await rolesService.findOne(params.id));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [params.id, isNew]);

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 pb-12'>
      <Header
        title={
          isNew
            ? 'Novo papel administrativo'
            : 'Detalhes do papel administrativo'
        }
        showStorage={false}
      />
      {loading ? (
        <div className='flex justify-center py-20 text-slate-500'>
          <Loader2 className='animate-spin' />
        </div>
      ) : (
        <RoleForm
          mode={isNew ? 'create' : 'edit'}
          role={role}
          onSaved={(role) => {
            if (isNew) router.push(`/admin/roles/${role.id}`);
          }}
        />
      )}
    </div>
  );
}
