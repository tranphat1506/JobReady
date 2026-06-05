'use client';

import React, { useState } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { useTranslation } from '@/hooks/useTranslation';
import { Info, X } from 'lucide-react';

interface CreditsClientProps {
  transactions: any[];
  txCount: number;
  txPage: number;
}

export function CreditsClient({
  transactions,
  txCount,
  txPage
}: CreditsClientProps) {
  const { t } = useTranslation();
  const PAGE_SIZE = 15;
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const getActionLabel = (tx: any) => {
    if (tx.message_code) {
      const msgTrans = t(`credits.ledger.desc.${tx.message_code}`);
      if (msgTrans && msgTrans !== `credits.ledger.desc.${tx.message_code}`) {
        return msgTrans;
      }
    }
    return t(`credits.history.action.${tx.transaction_type}`) || tx.transaction_type;
  };

  const txColumns: ColumnDef<any>[] = [
    {
      key: 'message_code',
      label: t('credits.history.columns.task') || 'Loại giao dịch',
      filterQueryKey: 'message_code',
      filterable: true,
      filterOptions: [
        { label: t('credits.ledger.desc.MSG_BUY_CV_SLOT') || 'Mua Slot CV', value: 'MSG_BUY_CV_SLOT' },
        { label: t('credits.ledger.desc.MSG_BUY_CL_SLOT') || 'Mua Slot CL', value: 'MSG_BUY_CL_SLOT' },
        { label: t('credits.ledger.desc.MSG_GENERATE_CV_SUCCESS') || 'Tạo CV', value: 'MSG_GENERATE_CV_SUCCESS' },
        { label: t('credits.ledger.desc.MSG_PARSE_PROFILE_SUCCESS') || 'Trích xuất hồ sơ', value: 'MSG_PARSE_PROFILE_SUCCESS' },
        { label: t('credits.history.action.REFUND') || 'Hoàn tiền', value: 'MSG_GENERATE_CV_REFUND' },
      ],
      render: (tx) => {
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-800">{getActionLabel(tx)}</span>
            <button
              onClick={() => setSelectedTx(tx)}
              className="text-[11px] text-primary hover:text-primary/80 mt-1 flex items-center gap-1 w-fit transition-colors font-medium"
            >
              <Info size={12} /> {t('credits.history.modal.viewDetails') || 'Xem chi tiết'}
            </button>
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      label: t('credits.history.columns.time') || 'Thời gian',
      sortable: true,
      sortQueryKey: 'created_at',
      render: (tx) => (
        <span className="font-medium text-zinc-700">
          {new Date(tx.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      )
    },
    {
      key: 'amount',
      label: t('credits.history.modal.amount') || 'Biến động',
      align: 'right',
      render: (tx) => {
        const isPositive = tx.amount > 0;
        return (
          <span className={`font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? '+' : ''}{tx.amount}
          </span>
        );
      }
    },
    {
      key: 'balance_after',
      label: t('credits.history.columns.balance') || 'Số dư sau GD',
      align: 'right',
      render: (tx) => (
        <span className="font-semibold text-zinc-900">
          {tx.balance_after}
        </span>
      )
    }
  ];

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{t('credits.ledger.title') || 'Lịch sử Credits'}</h1>
        <p className="text-sm text-zinc-500 mt-1.5 font-medium">{t('credits.ledger.subtitle') || 'Theo dõi biến động số dư Credits của bạn.'}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="font-semibold text-zinc-900 text-lg">
            {t('credits.ledger.details') || 'Chi tiết giao dịch'}
          </h3>
        </div>
        <div className="p-0">
          <DataTable
            columns={txColumns}
            data={transactions}
            page={txPage}
            totalPages={Math.ceil((txCount || 0) / PAGE_SIZE)}
            pageQueryKey="page"
            sortByKey="sortBy"
            sortOrderKey="sortOrder"
            emptyMessage={t('credits.history.empty') || 'Chưa có giao dịch nào.'}
            dict={{
              all: t('credits.history.all') || 'Tất cả',
              filterBy: t('credits.history.filterBy') || 'Lọc theo:',
              pageInfo: t('credits.history.pages') || 'Trang {page} / {total}'
            }}
          />
        </div>
      </div>

      {selectedTx && (
        <LedgerTransactionModal 
          tx={selectedTx} 
          onClose={() => setSelectedTx(null)} 
          getActionLabel={getActionLabel} 
          t={t} 
        />
      )}
    </>
  );
}

function LedgerTransactionModal({ tx, onClose, getActionLabel, t }: any) {
  const isPositive = tx.amount > 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
          <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
            {t('credits.ledger.details') || 'Chi tiết giao dịch'}
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {isPositive ? 'CỘNG' : 'TRỪ'} CREDIT
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
            <div>
              <dt className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">{t('credits.history.modal.txCode') || 'Mã Giao Dịch'}</dt>
              <dd className="text-sm font-mono text-zinc-900 truncate" title={tx.id}>{tx.id.split('-')[0]}...</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">{t('credits.history.modal.time') || 'Thời Gian'}</dt>
              <dd className="text-sm text-zinc-900 font-medium">
                {new Date(tx.created_at).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
              </dd>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-zinc-900 mb-3 border-b border-zinc-100 pb-2">Nội dung giao dịch</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-zinc-50">
                <span className="text-sm text-zinc-500">Mã sự kiện:</span>
                <span className="text-sm font-mono font-medium text-zinc-700">{tx.message_code || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-50">
                <span className="text-sm text-zinc-500">Mô tả:</span>
                <span className="text-sm font-semibold text-zinc-900 text-right">{getActionLabel(tx)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-50">
                <span className="text-sm text-zinc-500">Số lượng:</span>
                <span className={`text-base font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isPositive ? '+' : ''}{tx.amount}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-50">
                <span className="text-sm text-zinc-500">Số dư hiện tại:</span>
                <span className="text-sm font-bold text-zinc-900">{tx.balance_after}</span>
              </div>
              {tx.reference_type && (
                <div className="flex justify-between items-center py-2 border-b border-zinc-50">
                  <span className="text-sm text-zinc-500">Loại tham chiếu:</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 bg-zinc-100 text-zinc-600 rounded">
                    {tx.reference_type}
                  </span>
                </div>
              )}
            </div>
          </div>

          {tx.metadata && Object.keys(tx.metadata).length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-zinc-900 mb-3 border-b border-zinc-100 pb-2">Dữ liệu đi kèm (Metadata)</h4>
              <div className="bg-zinc-900 rounded-lg p-3 overflow-x-auto">
                <pre className="text-xs text-zinc-300 font-mono">
                  {JSON.stringify(tx.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
          >
            {t('credits.history.modal.close') || 'Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
}
