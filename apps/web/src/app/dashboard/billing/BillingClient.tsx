'use client';

import React from 'react';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { useTranslation } from '@/hooks/useTranslation';

interface BillingClientProps {
  subscriptions: any[];
  payCount: number;
  payPage: number;
}

export function BillingClient({
  subscriptions,
  payCount,
  payPage
}: BillingClientProps) {
  const { t } = useTranslation();
  const PAGE_SIZE = 10;
  const totalPayPages = Math.ceil((payCount || 0) / PAGE_SIZE);

  const payColumns: ColumnDef<any>[] = [
    {
      key: 'date',
      label: t('credits.billing.columns.date') || 'Ngày',
      sortable: true,
      sortQueryKey: 'start_date',
      render: (sub) => (
        <span className="font-medium text-zinc-700">
          {new Date(sub.start_date).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      key: 'package',
      label: t('credits.billing.columns.package') || 'Gói',
      render: (sub) => (
        <span className="font-semibold text-zinc-900">
          {sub.packages?.name || 'Unknown'}
        </span>
      )
    },
    {
      key: 'amount',
      label: t('credits.billing.columns.amount') || 'Số tiền',
      align: 'right',
      render: (sub) => (
        <span className="font-medium text-zinc-700">
          {sub.packages?.price ? `${sub.packages.price.toLocaleString()}đ` : 'Miễn phí'}
        </span>
      )
    },
    {
      key: 'status',
      label: t('credits.billing.columns.status') || 'Trạng thái',
      align: 'center',
      filterQueryKey: 'payStatus',
      filterable: true,
      filterOptions: [
        { label: t('credits.billing.status.ACTIVE') || 'Hoạt động', value: 'ACTIVE' },
        { label: t('credits.billing.status.EXPIRED') || 'Hết hạn', value: 'EXPIRED' },
        { label: t('credits.billing.status.CANCELLED') || 'Đã hủy', value: 'CANCELLED' }
      ],
      render: (sub) => {
        let color = 'bg-zinc-100 text-zinc-600 border-zinc-200';
        let label = sub.status;
        if (sub.status === 'ACTIVE') {
          color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          label = t('credits.billing.status.ACTIVE') || 'Hoạt động';
        } else if (sub.status === 'EXPIRED') {
          color = 'bg-rose-50 text-rose-700 border-rose-200';
          label = t('credits.billing.status.EXPIRED') || 'Hết hạn';
        } else if (sub.status === 'CANCELLED') {
          label = t('credits.billing.status.CANCELLED') || 'Đã hủy';
        }
        return (
          <div className="flex justify-center">
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${color}`}>
              {label}
            </span>
          </div>
        );
      }
    }
  ];

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{t('credits.billing.title')}</h1>
        <p className="text-sm text-zinc-500 mt-1.5 font-medium">{t('credits.billing.subtitle')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="font-semibold text-zinc-900 text-lg">
            {t('credits.billing.title')}
          </h3>
        </div>
        <div className="p-0">
          <DataTable
            columns={payColumns}
            data={subscriptions}
            page={payPage}
            totalPages={totalPayPages}
            pageQueryKey="payPage"
            sortByKey="paySortBy"
            sortOrderKey="paySortOrder"
            emptyMessage={t('credits.billing.empty') || 'Chưa có giao dịch nào.'}
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
