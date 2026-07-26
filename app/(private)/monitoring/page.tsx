'use client';

import {
  Activity,
  Beaker,
  BedDouble,
  ClipboardList,
  History,
  PawPrint,
} from 'lucide-react';
import { useState } from 'react';

import { BoxesTab } from './components/boxes-tab';
import { ExecutionMapTab } from './components/execution-map-tab';
import { HistoryTab } from './components/history-tab';
import { HospitalizedTab } from './components/hospitalized-tab';
import { ParametersTab } from './components/parameters-tab';
import { TemplatesTab } from './components/templates-tab';

import { Header } from '@/app/components/layout/header';
import { cn } from '@/infra/utils';

type MonitoringTab =
  | 'hospitalized'
  | 'map'
  | 'history'
  | 'boxes'
  | 'parameters'
  | 'templates';

const TABS: Array<{ key: MonitoringTab; label: string; icon: typeof PawPrint }> = [
  { key: 'hospitalized', label: 'Animais Internados', icon: PawPrint },
  { key: 'map', label: 'Mapa de Execução', icon: Activity },
  { key: 'history', label: 'Histórico', icon: History },
  { key: 'boxes', label: 'Boxes', icon: BedDouble },
  { key: 'parameters', label: 'Parâmetros Clínicos', icon: Beaker },
  { key: 'templates', label: 'Modelos de Prescrição', icon: ClipboardList },
];

export default function Monitoring() {
  const [tab, setTab] = useState<MonitoringTab>('hospitalized');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Monitoramento" showStorage={false} />

        <div className="border-b border-slate-200 dark:border-slate-700 mb-6 -mt-2 overflow-x-auto overflow-y-hidden scrollbar-thin">
          <nav className="flex gap-1 min-w-max">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                  tab === key
                    ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600',
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {tab === 'hospitalized' && <HospitalizedTab />}
        {tab === 'map' && <ExecutionMapTab />}
        {tab === 'history' && <HistoryTab />}
        {tab === 'boxes' && <BoxesTab />}
        {tab === 'parameters' && <ParametersTab />}
        {tab === 'templates' && <TemplatesTab />}
      </div>
    </div>
  );
}
