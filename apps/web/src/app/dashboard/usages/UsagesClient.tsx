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
        { label: t('credits.history.action.parse_master_profile') || 'Trích xuất hồ sơ', value: 'parse_master_profile' },
        { label: t('credits.history.action.REFUND') || 'Hoàn tiền', value: 'REFUND' },
        { label: t('credits.history.action.PENDING_RESERVATION') || 'Đang xử lý', value: 'PENDING_RESERVATION' }
      ],
      render: (log) => (
        <span className="font-semibold text-zinc-800">{getActionLabel(log.transaction_type)}</span>
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
      sortQueryKey: 'amount',
      render: (log) => {
        const amount = log.amount || 0;
        const isPositive = amount > 0;
        
        return (
          <span className={`font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? '+' : ''}{amount}
          </span>
        );
      }
    },
    {
      key: 'balance',
      label: t('credits.history.columns.balance') || 'Số dư sau GD',
      align: 'right',
      render: (log) => (
        <span className="font-bold text-zinc-900">{log.balance_after}</span>
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
