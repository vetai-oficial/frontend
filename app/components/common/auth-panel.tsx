'use client';

import { Activity, Microscope, PawPrint, Stethoscope, Users } from 'lucide-react';
import Link from 'next/link';

import { Counter } from '@/app/components/common/counter';

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
}

const STATS: StatItem[] = [
  { icon: Users, value: 2500, suffix: '+', label: 'Veterinários ativos' },
  { icon: Microscope, value: 18000, suffix: '+', label: 'Exames analisados' },
  { icon: Stethoscope, value: 45000, suffix: '+', label: 'Consultas realizadas' },
  { icon: PawPrint, value: 32000, suffix: '+', label: 'Pets registrados' },
];

interface AuthPanelProps {
  title: string;
  description: string;
  gradient?: string;
}

export function AuthPanel({
  title,
  description,
  gradient = 'from-teal-600 via-teal-700 to-emerald-800',
}: AuthPanelProps) {
  return (
    <div
      className={`hidden lg:flex lg:w-1/2 bg-linear-to-br ${gradient} relative overflow-hidden`}
    >
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(\'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=2070&auto=format&fit=crop\')',
        }}
      />

      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 animate-pulse" />
      <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-white/5 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-white/5 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 flex flex-col justify-between px-12 xl:px-16 py-12 w-full">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Activity className="text-white" size={22} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            VetAI
          </span>
        </Link>

        <div>
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            {title}
          </h2>
          <p className="text-teal-100/90 text-lg leading-relaxed max-w-md">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-10">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors"
                >
                  <Icon size={20} className="text-teal-200 mb-2" />
                  <div className="text-2xl font-bold text-white">
                    <Counter target={stat.value} duration={2000} suffix={stat.suffix} />
                  </div>
                  <p className="text-xs text-teal-200/80 mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-teal-200/70 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Criptografia de ponta a ponta
          </div>
          <div className="flex items-center gap-2 text-teal-200/70 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '500ms' }} />
            LGPD Compliant
          </div>
        </div>
      </div>
    </div>
  );
}
