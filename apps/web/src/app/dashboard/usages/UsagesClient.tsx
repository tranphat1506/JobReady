'use client';

import React, { useState } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { CheckCircle2, XCircle, X, Info } from 'lucide-react';
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
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

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
      render: (log) => {
        const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-800">{getActionLabel(log.transaction_type)}</span>
            {hasMetadata && (
              <button 
                onClick={() => setSelectedLog(log)}
                className="text-xs text-primary hover:text-primary/80 mt-1 flex items-center gap-1 w-fit transition-colors"
              >
                <Info size={12} /> {t('credits.history.modal.viewDetails') || 'Xem chi tiết'}
              </button>
            )}
          </div>
        );
      }
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

    {/* Transaction Details Modal */}
    {selectedLog && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
              {t('credits.history.modal.title') || 'Chi tiết giao dịch'}
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                selectedLog.transaction_type === 'REFUND' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-primary/10 text-primary'
              }`}>
                {getActionLabel(selectedLog.transaction_type)}
              </span>
            </h3>
            <button 
              onClick={() => setSelectedLog(null)}
              className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="p-5 overflow-y-auto space-y-6">
            {/* Core Transaction Details */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
              <div>
                <dt className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">{t('credits.history.modal.txCode') || 'Mã Giao Dịch'}</dt>
                <dd className="text-sm font-mono text-zinc-900 truncate" title={selectedLog.id}>{selectedLog.id.split('-')[0]}...</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">{t('credits.history.modal.time') || 'Thời Gian'}</dt>
                <dd className="text-sm text-zinc-900 font-medium">
                  {new Date(selectedLog.created_at).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">{t('credits.history.modal.amount') || 'Biến Động'}</dt>
                <dd className={`text-sm font-bold ${selectedLog.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedLog.amount > 0 ? '+' : ''}{selectedLog.amount} {t('credits.history.modal.credits') || 'Credits'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">{t('credits.history.modal.balanceAfter') || 'Số Dư Sau Giao Dịch'}</dt>
                <dd className="text-sm text-zinc-900 font-bold">{selectedLog.balance_after} {t('credits.history.modal.credits') || 'Credits'}</dd>
              </div>
            </div>

            {/* Metadata Context */}
            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-zinc-900 mb-3 border-b border-zinc-100 pb-2">{t('credits.history.modal.metadata') || 'Dữ liệu đi kèm (Metadata)'}</h4>
                
                {/* Highlight specifically Reason/Error if exists */}
                {selectedLog.metadata.reason && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-lg">
                    <p className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">{t('credits.history.modal.reasonError') || 'Lý do hoàn tiền / Lỗi'}</p>
                    <p className="text-sm text-rose-700 leading-relaxed font-medium">
                      {selectedLog.metadata.reason}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {Object.entries(selectedLog.metadata)
                    .filter(([key]) => key !== 'reason') // Skip reason as it's highlighted above
                    .map(([key, value]) => {
                    const formattedKey = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        <dt className="text-xs font-semibold text-zinc-500">{formattedKey}</dt>
                        <dd className="text-sm text-zinc-900 bg-white border border-zinc-200 px-3 py-2 rounded-md break-words">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </dd>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Reference info */}
            {selectedLog.reference_id && (
              <div className="pt-4 border-t border-zinc-100">
                <p className="text-xs text-zinc-400 font-mono">
                  {t('credits.history.modal.reference') || 'Tham chiếu hệ thống:'} {selectedLog.reference_type} ({selectedLog.reference_id})
                </p>
              </div>
            )}
          </div>
          
          <div className="px-5 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end shrink-0">
            <button 
              onClick={() => setSelectedLog(null)}
              className="px-4 py-2 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
            >
              {t('credits.history.modal.close') || 'Đóng'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
