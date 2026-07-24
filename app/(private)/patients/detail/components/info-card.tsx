import type { ReactNode } from 'react';

import { Card } from '@/app/components/common/card';

interface InfoCardProps {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  className?: string;
}

export function InfoCard({ icon, iconBg, label, value, sub, className }: InfoCardProps) {
  return (
    <Card className={`px-3 py-4 flex items-start gap-2.5${className ? ` ${className}` : ''}`}>
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 pl-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        {value}
        {sub && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{sub}</p>}
      </div>
    </Card>
  );
}
