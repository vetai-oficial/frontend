'use client';

import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Card } from '../common/card';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  headers?: string[];
  children?: ReactNode;
  columns?: DataTableColumn<T>[];
  data?: T[];
  getRowKey?: (row: T, index: number) => string;
  emptyState?: ReactNode;
  showSearch?: boolean;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  centerHeaders?: boolean;
  columnWidths?: string[];
  className?: string;
}

export function DataTable<T>({
  headers,
  children,
  columns,
  data,
  getRowKey,
  emptyState = 'Nenhum registro encontrado.',
  showSearch = false,
  onSearch,
  searchPlaceholder = 'Buscar...',
  actions,
  centerHeaders = false,
  columnWidths,
  className,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');
  const tableHeaders = columns?.map((column) => column.header) ?? headers ?? [];
  const colSpan = Math.max(tableHeaders.length, 1);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <Card
      className={`overflow-hidden flex flex-col${className ? ` ${className}` : ''}`}
    >
      {(showSearch || actions) && (
        <div className='p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0'>
          {actions && <div>{actions}</div>}
          {showSearch && (
            <div className='relative w-85'>
              <Search
                className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
                size={18}
              />
              <input
                type='text'
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className='w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-600'
              />
            </div>
          )}
        </div>
      )}
      <div className='overflow-x-auto flex-1'>
        <table className='w-full text-left text-sm'>
          <thead className='bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500'>
            <tr>
              {tableHeaders.map((header, index) => {
                const column = columns?.[index];
                const align = column?.align;

                return (
                  <th
                    key={index}
                    className={`p-4 font-medium ${centerHeaders || align === 'center' ? 'text-center' : ''} ${align === 'right' || (!centerHeaders && !align && index === tableHeaders.length - 1) ? 'text-right' : ''}`}
                    style={
                      column?.width || columnWidths?.[index]
                        ? { width: column?.width ?? columnWidths?.[index] }
                        : undefined
                    }
                  >
                    {header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-200 dark:divide-slate-700 [&>tr:last-child]:border-b [&>tr:last-child]:border-slate-200 dark:[&>tr:last-child]:border-slate-700'>
            {columns && data ? (
              data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <tr
                    key={getRowKey?.(row, rowIndex) ?? rowIndex}
                    className='hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`p-4 ${column.align === 'center' ? 'text-center' : ''} ${column.align === 'right' ? 'text-right' : ''}`}
                      >
                        {column.render?.(row, rowIndex) ??
                          String(
                            (row as Record<string, unknown>)[column.key] ?? '',
                          )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={colSpan}
                    className='p-8 text-center text-sm text-slate-500 dark:text-slate-400'
                  >
                    {emptyState}
                  </td>
                </tr>
              )
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
