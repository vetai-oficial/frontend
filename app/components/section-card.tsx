import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export function SectionCard({ title, subtitle, children, className = '', headerAction }: SectionCardProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 ${className}`}>
      <div className={`mb-4 ${headerAction ? 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0' : ''}`}>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {headerAction && <div className="w-full sm:w-auto">{headerAction}</div>}
      </div>
      {children}
    </div>
  );
}
