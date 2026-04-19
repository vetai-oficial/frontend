'use client';

import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Card } from './card';

interface DataTableProps {
  headers: string[];
  children: ReactNode;
  showSearch?: boolean;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  centerHeaders?: boolean;
  columnWidths?: string[];
  className?: string;
  maxBodyHeight?: number;
}

export function DataTable({ headers, children, showSearch = false, onSearch, searchPlaceholder = 'Buscar...', actions, centerHeaders = false, columnWidths, className, maxBodyHeight }: DataTableProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <Card className={`overflow-hidden flex flex-col min-h-0${className ? ` ${className}` : ''}`}>
      {(showSearch || actions) && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          {actions && <div>{actions}</div>}
          {showSearch && (
            <div className="relative w-85">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-600"
              />
            </div>
          )}
        </div>
      )}
      <div className="overflow-x-auto overflow-y-auto flex-1" style={maxBodyHeight ? { maxHeight: maxBodyHeight } : undefined}>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 sticky top-0 z-10">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={`p-4 font-medium ${centerHeaders ? 'text-center' : ''} ${!centerHeaders && index === headers.length - 1 ? 'text-right' : ''}`}
                  style={columnWidths?.[index] ? { width: columnWidths[index] } : undefined}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 [&>tr:last-child]:border-b [&>tr:last-child]:border-slate-200 dark:[&>tr:last-child]:border-slate-700">
            {children}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
