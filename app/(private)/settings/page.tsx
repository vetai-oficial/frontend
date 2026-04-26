'use client';

import { Loader2, Lock, Mail, Shield, Trash2, User, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Header } from '@/app/components/header';
import { InputWithLabel } from '@/app/components/input-with-label';
import { SectionCard } from '@/app/components/section-card';
import { Switch } from '@/app/components/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { STORAGE_KEYS } from '@/constants';
import { authService } from '@/services/auth.service';
import type { User as UserType } from '@/types/auth';
import type { Collaborator } from '@/types/settings';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reports: true,
  });

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    crmv: '',
    phone: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    uf: '',
    cep: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      try {
        const user = JSON.parse(stored) as UserType;
        setProfile({
          name: user.name ?? '',
          email: user.email ?? '',
          crmv: user.crmv ?? '',
          phone: user.phone ?? '',
          street: user.address?.street ?? '',
          number: user.address?.number ?? '',
          neighborhood: user.address?.neighborhood ?? '',
          city: user.address?.city ?? '',
          uf: user.address?.uf ?? '',
          cep: user.address?.cep ?? '',
        });
      } catch { /* ignore */ }
    }
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        name: profile.name,
        crmv: profile.crmv,
        phone: profile.phone,
        address: {
          street: profile.street,
          number: profile.number,
          neighborhood: profile.neighborhood,
          city: profile.city,
          uf: profile.uf,
          cep: profile.cep,
        },
      });
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        const prev = JSON.parse(stored) as UserType;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ ...prev, ...updated }));
      }
      toast.success('Perfil atualizado com sucesso!');
    } catch {
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');

  const handleAddCollaborator = () => {
    if (!newCollaboratorEmail.trim()) return;
    setNewCollaboratorEmail('');
  };

  const handleRemoveCollaborator = (id: number) => {
    if (confirm('Tem certeza que deseja remover este colaborador?')) {
      setCollaborators(collaborators.filter((c) => c.id !== id));
    }
  };

  const inputCls = 'mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Configurações" showStorage={false} />

        <div className="max-w-8xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <SectionCard
                title="Perfil do Veterinário"
                subtitle="Gerencie suas informações pessoais e profissionais"
                headerAction={
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-teal-600 dark:bg-teal-700 h-10 text-white hover:text-white hover:bg-teal-700 dark:hover:bg-teal-800"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <User size={18} />}
                    Salvar Alterações
                  </Button>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWithLabel
                    label="Nome Completo"
                    type="text"
                    value={profile.name}
                    tooltip="Nome completo do veterinário responsável"
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                  <InputWithLabel
                    label="CRMV"
                    type="text"
                    value={profile.crmv}
                    onChange={(e) => setProfile({ ...profile, crmv: e.target.value })}
                    tooltip="Conselho Regional de Medicina Veterinária"
                  />
                  <InputWithLabel
                    label="E-mail"
                    type="email"
                    value={profile.email}
                    tooltip="Endereço de e-mail"
                    disabled
                    onChange={() => {}}
                  />
                  <InputWithLabel
                    label="Telefone"
                    type="tel"
                    value={profile.phone}
                    tooltip="Número de telefone para contato"
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Endereço da Clínica</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rua / Logradouro</label>
                        <input
                          type="text"
                          value={profile.street}
                          onChange={(e) => setProfile({ ...profile, street: e.target.value })}
                          placeholder="Ex: Rua das Flores"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Número</label>
                        <input
                          type="text"
                          value={profile.number}
                          onChange={(e) => setProfile({ ...profile, number: e.target.value })}
                          placeholder="Ex: 123"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bairro</label>
                      <input
                        type="text"
                        value={profile.neighborhood}
                        onChange={(e) => setProfile({ ...profile, neighborhood: e.target.value })}
                        placeholder="Ex: Centro"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cidade</label>
                      <input
                        type="text"
                        value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        placeholder="Ex: São Paulo"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">UF</label>
                      <input
                        type="text"
                        value={profile.uf}
                        maxLength={2}
                        onChange={(e) => setProfile({ ...profile, uf: e.target.value.toUpperCase() })}
                        placeholder="Ex: SP"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">CEP</label>
                      <input
                        type="text"
                        value={profile.cep}
                        onChange={(e) => setProfile({ ...profile, cep: e.target.value })}
                        placeholder="Ex: 01001-000"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Colaboradores"
                subtitle="Gerencie o acesso de outros profissionais"
              >
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={newCollaboratorEmail}
                      onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddCollaborator(); }}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddCollaborator}
                      className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 text-white"
                    >
                      <UserPlus size={18} />
                      Adicionar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {collaborators.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <p className="text-sm">Nenhum colaborador adicionado ainda.</p>
                      </div>
                    ) : (
                      collaborators.map((collaborator) => (
                        <div
                          key={collaborator.id}
                          className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900 dark:text-white">{collaborator.name}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                                {collaborator.role}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{collaborator.email}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Adicionado em {collaborator.addedAt}</p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => handleRemoveCollaborator(collaborator.id)}
                            className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard title="Plano Atual" subtitle="Gerencie sua assinatura e armazenamento">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-lg gap-4">
                  <div>
                    <p className="font-bold text-teal-800 dark:text-teal-300 text-lg">Plano Pro</p>
                    <p className="text-sm text-teal-600 dark:text-teal-400">10 GB de armazenamento</p>
                    <p className="text-sm text-teal-600 dark:text-teal-400">Próxima renovação: 15/12/2025</p>
                  </div>
                  <Button variant="outline" className="border-teal-600 dark:border-teal-500 text-teal-700 dark:text-teal-400 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-900/30">
                    Gerenciar assinatura
                  </Button>
                </div>
              </SectionCard>

              <SectionCard title="Notificações" subtitle="Configure como você deseja receber notificações">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="text-slate-600 dark:text-slate-400" size={20} />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Notificações por e-mail</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Receba atualizações importantes por e-mail</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Segurança" subtitle="Proteja sua conta e dados">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-3 h-12">
                    <Lock size={20} />
                    Alterar senha
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 h-12">
                    <Shield size={20} />
                    Autenticação 2FA
                  </Button>
                </div>
              </SectionCard>

              <SectionCard title="Zona de Perigo" subtitle="Ações irreversíveis">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
                    Exportar dados
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
                    Excluir conta
                  </Button>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
