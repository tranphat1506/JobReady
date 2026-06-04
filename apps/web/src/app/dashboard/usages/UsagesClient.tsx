'use client';

import React from 'react';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface UsagesClientProps {
  logs: any[];
  logCount: number;
  logPage: number;
}

export function UsagesClient({
  logs,
  logCount,
  logPage
}: UsagesClientProps) {
  const { t } = useTranslation();
  const PAGE_SIZE = 10;

  const getActionLabel = (action: string) => {
    return t(`credits.history.action.${action}`) || action;
  };

  const logColumns: ColumnDef<any>[] = [
    {
      key: 'task',
      label: t('credits.history.columns.task') || 'Tác vụ',
      filterQueryKey: 'action',
      filterable: true,
      filterOptions: [
        { label: t('credits.history.action.generate_cv') || 'Tạo CV', value: 'generate_cv' },
        { label: t('credits.history.action.generate_cover_letter') || 'Tạo Cover Letter', value: 'generate_cover_letter' },
        { label: t('credits.history.action.generate_both') || 'Tạo CV & Cover Letter', value: 'generate_both' },
        { label: t('credits.history.action.parse_master_profile') || 'Trích xuất hồ sơ', value: 'parse_master_profile' }
      ],
      render: (log) => (
        <span className="font-semibold text-zinc-800">{getActionLabel(log.action_type)}</span>
      )
    },
    {
      key: 'createdAt',
      label: t('credits.history.columns.time') || 'Thời gian',
      sortable: true,
      sortQueryKey: 'created_at',
      render: (log) => (
        <span className="font-medium text-zinc-700">
          {new Date(log.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      )
    },
    {
      key: 'credit',
      label: t('credits.history.columns.credit') || 'Credit',
      align: 'right',
      sortable: true,
      sortQueryKey: 'credits_used',
      render: (log) => {
        const isError = log.status === 'failed';
        const credits = log.credits_used || 0;

        if (isError) {
          return <span className="font-medium text-zinc-400">0</span>;
        }

        return (
          <span className="font-semibold text-rose-600">
            -{credits}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: t('credits.history.columns.status') || 'Trạng thái',
      align: 'center',
      filterQueryKey: 'status',
      filterable: true,
      filterOptions: [
        { label: t('credits.history.status.success') || 'Thành công', value: 'success' },
        { label: t('credits.history.status.failed') || 'Thất bại', value: 'failed' }
      ],
      render: (log) => (
        <div className="flex justify-center" title={log.error_message || ''}>
          {log.status === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{t('credits.history.title') || 'Lịch sử sử dụng AI'}</h1>
        <p className="text-sm text-zinc-500 mt-1.5 font-medium">{t('credits.history.subtitle') || 'Theo dõi lịch sử gọi AI và chi phí Credit tương ứng.'}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
        <h3 className="font-semibold text-zinc-900 text-lg">
          {t('credits.history.title')}
        </h3>
      </div>
      <div className="p-0">
        <DataTable
          columns={logColumns}
          data={logs}
          page={logPage}
          totalPages={Math.ceil((logCount || 0) / PAGE_SIZE)}
          pageQueryKey="logPage"
          sortByKey="logSortBy"
          sortOrderKey="logSortOrder"
          emptyMessage={t('credits.history.empty') || 'Chưa có dữ liệu.'}
          dict={{
            all: t('credits.history.all') || 'Tất cả',
            filterBy: t('credits.history.filterBy') || 'Lọc theo:',
            pageInfo: t('credits.history.pages') || 'Trang {page} / {total}'
          }}
        />
      </div>
    </div>
    </>
  );
}
