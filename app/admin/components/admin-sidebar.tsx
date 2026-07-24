'use client';

import { ArrowLeft, LayoutDashboard, Menu, ShieldCheck, Users, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/infra/auth-context';

const items = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/collaborators', label: 'Colaboradores', icon: Users, permission: 'collaborators:view' },
  { href: '/admin/roles', label: 'Papel administrativo', icon: ShieldCheck, permission: 'roles:view' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { can } = useAuth();

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-slate-700 bg-slate-900 p-2 text-white shadow-lg md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`fixed md:relative z-40 flex h-full w-72 flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="rounded-xl bg-teal-500/10 p-2">
            <ShieldCheck className="text-teal-400" size={22} />
          </div>
          <div>
            <p className="font-bold tracking-tight">VetAI Admin</p>
            <p className="text-xs text-slate-400">Área administrativa</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const disabled = item.permission ? !can(item.permission) : false;
            const className = `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              disabled
                ? 'cursor-not-allowed text-slate-600'
                : isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900'
            }`;

            if (disabled) {
              return (
                <span key={item.href} className={className} aria-disabled="true">
                  <Icon size={19} /> {item.label}
                </span>
              );
            }

            return (
              <Link key={item.href} href={item.href} className={className} onClick={() => setIsOpen(false)}>
                <Icon size={19} /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            onClick={() => router.push('/analytics/dashboard')}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-900"
          >
            <ArrowLeft size={18} /> Voltar para o sistema
          </button>
        </div>
      </aside>
    </>
  );
}
