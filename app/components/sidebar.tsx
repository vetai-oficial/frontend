'use client';

import {
  Activity,
  Settings,
  LogOut,
  LayoutDashboard,
  Microscope,
  PawPrint,
  Pill,
  SquareActivity,
  MessageCircleQuestionMark,
  Menu,
  Syringe,
  Users,
  X,
  CalendarDays,
  CreditCard,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { STORAGE_KEYS } from '@/constants';
import { removeToken } from '@/infra/http-client';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  function handleLogout() {
    removeToken();
    localStorage.removeItem(STORAGE_KEYS.USER);
    router.push('/login');
  }

  const menuItems = [
    { href: '/analytics/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/exams', icon: Microscope, label: 'Exames' },
    { href: '/patients', icon: PawPrint, label: 'Pacientes' },
    { href: '/tutors', icon: Users, label: 'Tutores' },
    { href: '/vaccines', icon: Syringe, label: 'Vacinas' },
    { href: '/medicines', icon: Pill, label: 'Medicações' },
    { href: '/schedule', icon: CalendarDays, label: 'Agendamentos' },
    { href: '/payments', icon: CreditCard, label: 'Pagamentos' },
    { href: '/catalog', icon: BookOpen, label: 'Catálogo' },
    { href: '/monitoring', icon: SquareActivity, label: 'Monitoramento' },
    { href: '/consultation', icon: MessageCircleQuestionMark, label: 'Consulta' },
    { href: '/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg"
      >
        {isOpen ? <X size={24} className="text-slate-900 dark:text-white" /> : <Menu size={24} className="text-slate-900 dark:text-white" />}
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      <aside className={`fixed md:relative w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full z-40 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } md:flex`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Activity className="text-teal-600 mr-2" />
          <span className="font-bold text-lg tracking-tight">VetAI</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={20} /> {item.label}
                {item.label === 'Consulta' && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                    BETA
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg w-full">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>
    </>
  );
}
