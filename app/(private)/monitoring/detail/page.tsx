'use client';

import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

import { MonitoringDetailContent } from '../components/monitoring-detail-content';

import { Header } from '@/app/components/header';

export default function MonitoringDetailPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Detalhes da Internação" showStorage={false} />
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-teal-600" />
            </div>
          }
        >
          <MonitoringDetailContent />
        </Suspense>
      </div>
    </div>
  );
}
