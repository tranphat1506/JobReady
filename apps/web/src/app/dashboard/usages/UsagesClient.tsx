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
      key: 'action_type',
      label: t('credits.history.columns.task') || 'Tác vụ',
      filterQueryKey: 'action',
      filterable: true,
      filterOptions: [
        { label: t('credits.history.action.generate_cv') || 'Tạo CV', value: 'generate_cv' },
        { label: t('credits.history.action.generate_cover_letter') || 'Tạo Cover Letter', value: 'generate_cover_letter' },
        { label: t('credits.history.action.generate_both') || 'Tạo CV & Cover Letter', value: 'generate_both' },
        { label: t('credits.history.action.parse_master_profile') || 'Trích xuất hồ sơ', value: 'parse_master_profile' },
      ],
      render: (log) => {
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-800">{getActionLabel(log.action_type)}</span>
            <button
              onClick={() => setSelectedLog(log)}
              className="text-xs text-primary hover:text-primary/80 mt-1 flex items-center gap-1 w-fit transition-colors"
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
      render: (log) => (
        <span className="font-medium text-zinc-700">
          {new Date(log.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      )
    },
    {
      key: 'status',
      label: t('credits.history.columns.status') || 'Trạng thái',
      render: (log) => {
        if (log.status === 'success') {
          return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">{t('credits.history.status.success') || 'Thành công'}</span>;
        } else if (log.status === 'failed') {
          return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-100 text-rose-800">{t('credits.history.status.failed') || 'Thất bại'}</span>;
        } else {
          return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">{t('credits.history.status.pending') || 'Đang xử lý'}</span>;
        }
      }
    },
    {
      key: 'credits_used',
      label: t('credits.history.columns.credit') || 'Credit',
      align: 'right',
      render: (log) => {
        const amount = log.credits_used || 0;
        return (
          <span className="font-semibold text-zinc-600">
            -{amount}
          </span>
        );
      }
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
        <TransactionTimelineModal
          selectedLog={selectedLog}
          onClose={() => setSelectedLog(null)}
          getActionLabel={getActionLabel}
          t={t}
        />
      )}
    </>
  );
}

function TransactionTimelineModal({ selectedLog, onClose, getActionLabel, t }: any) {
  const [timeline, setTimeline] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTimeline() {
      setIsLoading(true);
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('reference_id', selectedLog.id)
        .order('created_at', { ascending: true });

      setTimeline(data || []);
      setIsLoading(false);
    }
    if (selectedLog?.id) {
      fetchTimeline();
    }
  }, [selectedLog?.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
          <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
            {t('credits.history.modal.title') || 'Chi tiết giao dịch'}
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${selectedLog.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                selectedLog.status === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
              }`}>
              {getActionLabel(selectedLog.action_type)}
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
          </div>

          {/* Ledger Timeline */}
          <div>
            <h4 className="text-sm font-bold text-zinc-900 mb-3 border-b border-zinc-100 pb-2">{t('credits.history.modal.timeline') || 'Biến động số dư'}</h4>
            {isLoading ? (
              <div className="text-sm text-zinc-500 animate-pulse">Đang tải...</div>
            ) : timeline.length === 0 ? (
              <div className="text-sm text-zinc-500">Không có giao dịch kế toán nào.</div>
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-2.75 before:w-0.5 before:bg-zinc-100">
                {timeline.map((tx, idx) => (
                  <div key={tx.id} className="relative flex gap-3">
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-white border-2 border-zinc-200 z-10 text-[10px]">
                      {idx + 1}
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-lg p-3 flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-zinc-700">{tx.transaction_type}</span>
                        <span className={`text-xs font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount} Credits
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-zinc-400">
                          {new Date(tx.created_at).toLocaleTimeString('vi-VN')}
                        </span>
                        <span className="text-[11px] font-medium text-zinc-600">
                          Dư: {tx.balance_after}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message if failed */}
          {selectedLog.error_message && (
            <div>
              <h4 className="text-sm font-bold text-zinc-900 mb-3 border-b border-zinc-100 pb-2">{t('credits.history.modal.reasonError') || 'Chi tiết lỗi'}</h4>
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
                <p className="text-sm text-rose-700 leading-relaxed font-medium">
                  {selectedLog.error_message}
                </p>
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
