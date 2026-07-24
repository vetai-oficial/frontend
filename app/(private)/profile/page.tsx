'use client';

import { Lock, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import { SectionCard } from '@/app/components/data/section-card';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { STORAGE_KEYS } from '@/constants';
import type { User as AuthUser } from '@/types/auth';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    crmv: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (!storedUser) return;

    try {
      const user = JSON.parse(storedUser) as AuthUser;
      setProfile({
        name: user.name ?? '',
        email: user.email ?? '',
        crmv: user.crmv ?? '',
      });
    } catch {
      setProfile({ name: '', email: '', crmv: '' });
    }
  }, []);

  return (
    <div className="space-y-6">
      <Header title="Perfil" showStorage={false} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Perfil do usuário"
          subtitle="Gerencie suas informações pessoais e profissionais"
          headerAction={
            <Button className="bg-teal-600 text-white hover:bg-teal-700">
              <User size={18} /> Salvar alterações
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputWithLabel
              label="Nome completo"
              type="text"
              value={profile.name}
              tooltip="Nome completo do profissional"
              onChange={(event) => setProfile({ ...profile, name: event.target.value })}
            />
            <InputWithLabel
              label="CRMV"
              type="text"
              value={profile.crmv}
              tooltip="Conselho Regional de Medicina Veterinária"
              onChange={(event) => setProfile({ ...profile, crmv: event.target.value })}
            />
            <InputWithLabel
              label="E-mail"
              type="email"
              value={profile.email}
              tooltip="Endereço de e-mail da conta"
              onChange={(event) => setProfile({ ...profile, email: event.target.value })}
              containerClassName="md:col-span-2"
            />
          </div>
        </SectionCard>

        <SectionCard title="Segurança" subtitle="Proteja sua conta pessoal">
          <div className="space-y-3">
            <Button variant="outline" className="h-12 w-full justify-start gap-3">
              <Lock size={20} /> Alterar senha
            </Button>
            <Button variant="outline" className="h-12 w-full justify-start gap-3">
              <Shield size={20} /> Autenticação 2FA
            </Button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
