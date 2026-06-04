'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface ColumnDef<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  filterable?: boolean;
  filterOptions?: { label: string; value: string }[];
  filterQueryKey?: string; // e.g. 'logStatus'
  sortable?: boolean;
  sortQueryKey?: string; // e.g. 'created_at'
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  emptyMessage?: string;
  page?: number;
  totalPages?: number;
  pageQueryKey?: string; // e.g. 'logPage'
  sortByKey?: string;    // e.g. 'logSortBy'
  sortOrderKey?: string; // e.g. 'logSortOrder'
  dict?: {
    all?: string;
    filterBy?: string;
    pageInfo?: string;
  };
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = 'Không có dữ liệu',
  page,
  totalPages,
  pageQueryKey = 'page',
  sortByKey = 'sortBy',
  sortOrderKey = 'sortOrder',
  dict
}: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSortBy = searchParams.get(sortByKey);
  const currentSortOrder = searchParams.get(sortOrderKey);

  const handleFilterChange = (queryKey: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(queryKey, value);
    } else {
      params.delete(queryKey);
    }
    // Reset page to 1 when filter changes
    params.set(pageQueryKey, '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (queryKey: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (currentSortBy === queryKey) {
      if (currentSortOrder === 'asc') {
        params.set(sortOrderKey, 'desc');
      } else if (currentSortOrder === 'desc') {
        params.delete(sortByKey);
        params.delete(sortOrderKey);
      } else {
        params.set(sortOrderKey, 'asc');
      }
    } else {
      params.set(sortByKey, queryKey);
      params.set(sortOrderKey, 'desc'); // default to desc on first click
    }

    params.set(pageQueryKey, '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const getPageLink = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(pageQueryKey, newPage.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Render empty state inside the table body instead of returning early
  // so that the header and filters are always visible.

  const filterableColumns = columns.filter(col => col.filterable && col.filterOptions && col.filterQueryKey);

  return (
    <div className="bg-white border border-zinc-200 shadow-sm flex flex-col rounded-lg">

      {/* Filters Toolbar */}
      {filterableColumns.length > 0 && (
        <div className="px-6 py-4 border-b border-zinc-100 flex flex-wrap items-center gap-4 bg-zinc-50/50 rounded-t-lg">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> {dict?.filterBy || 'Lọc theo:'}
          </span>
          {filterableColumns.map(col => (
            <div key={col.key} className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-700">{col.label}</span>
              <div className="relative inline-flex items-center">
                <select
                  className={`appearance-none bg-white border ${searchParams.has(col.filterQueryKey!) ? 'border-primary/40 bg-primary/5 text-primary' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'} text-xs font-semibold rounded-md pl-3 pr-8 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm`}
                  value={searchParams.get(col.filterQueryKey!) || ''}
                  onChange={(e) => handleFilterChange(col.filterQueryKey!, e.target.value)}
                >
                  <option value="">{dict?.all || 'Tất cả'}</option>
                  {col.filterOptions!.map(opt => (
                    <option key={opt.value} value={opt.value} className="text-zinc-900 font-medium">{opt.label}</option>
                  ))}
                </select>
                <div className="absolute right-2.5 pointer-events-none flex flex-col -space-y-1">
                  <span className={`text-[8px] leading-none ${searchParams.has(col.filterQueryKey!) ? 'text-primary' : 'text-zinc-400'}`}>▲</span>
                  <span className={`text-[8px] leading-none ${searchParams.has(col.filterQueryKey!) ? 'text-primary' : 'text-zinc-400'}`}>▼</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-xs text-zinc-600 uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-4 font-semibold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  <div className={`flex items-center gap-2 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    {col.sortable && col.sortQueryKey ? (
                      <button
                        onClick={() => handleSortChange(col.sortQueryKey!)}
                        className={`flex items-center gap-1 hover:text-zinc-900 transition-colors ${currentSortBy === col.sortQueryKey ? 'text-zinc-900' : ''}`}
                      >
                        <span>{col.label}</span>
                        <div className="flex flex-col space-y-0.5 ml-1">
                          <span className={`text-[8px] leading-none ${currentSortBy === col.sortQueryKey && currentSortOrder === 'asc' ? 'text-primary' : 'text-zinc-300'}`}>▲</span>
                          <span className={`text-[8px] leading-none ${currentSortBy === col.sortQueryKey && currentSortOrder === 'desc' ? 'text-primary' : 'text-zinc-300'}`}>▼</span>
                        </div>
                      </button>
                    ) : (
                      <span>{col.label}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {(!data || data.length === 0) ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <p className="text-sm text-zinc-500 font-medium">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-zinc-50 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                    >
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages !== undefined && totalPages > 1 && page !== undefined && (
        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <span className="text-xs font-medium text-zinc-500">
            {(dict?.pageInfo || 'Trang {page} / {total}')
              .replace('{page}', page.toString())
              .replace('{total}', totalPages.toString())}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={getPageLink(page - 1)} className="p-1.5 rounded border border-zinc-200 text-zinc-600 bg-white hover:bg-zinc-100 transition-colors shadow-sm">
                <ChevronLeft className="w-4 h-4" />
              </Link>
            ) : (
              <div className="p-1.5 rounded border border-zinc-200 text-zinc-300 bg-zinc-50"><ChevronLeft className="w-4 h-4" /></div>
            )}
            {page < totalPages ? (
              <Link href={getPageLink(page + 1)} className="p-1.5 rounded border border-zinc-200 text-zinc-600 bg-white hover:bg-zinc-100 transition-colors shadow-sm">
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="p-1.5 rounded border border-zinc-200 text-zinc-300 bg-zinc-50"><ChevronRight className="w-4 h-4" /></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
