'use client';

import React, { useState } from 'react';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';

interface AuditClientProps {
  logs: any[];
  logCount: number;
  logPage: number;
}

export function AuditClient({ logs, logCount, logPage }: AuditClientProps) {
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const PAGE_SIZE = 20;
  const totalPages = Math.ceil((logCount || 0) / PAGE_SIZE);

  const columns: ColumnDef<any>[] = [
    {
      key: 'created_at',
      label: 'Thời gian',
      sortable: true,
      sortQueryKey: 'created_at',
      render: (log) => (
        <span className="font-medium text-zinc-700">
          {new Date(log.created_at).toLocaleString('vi-VN')}
        </span>
      )
    },
    {
      key: 'user_id',
      label: 'User ID',
      render: (log) => (
        <span className="text-xs text-zinc-500 font-mono truncate w-24 inline-block" title={log.user_id}>
          {log.user_id?.split('-')[0]}...
        </span>
      )
    },
    {
      key: 'action',
      label: 'Action (Hành động)',
      render: (log) => {
        let color = 'bg-zinc-100 text-zinc-700 border-zinc-200';
        if (log.action.startsWith('CLIENT_')) color = 'bg-blue-50 text-blue-700 border-blue-200';
        if (log.action.startsWith('SYSTEM_')) color = 'bg-rose-50 text-rose-700 border-rose-200';
        if (log.action.startsWith('APP_')) color = 'bg-purple-50 text-purple-700 border-purple-200';
        
        return (
          <span className={`px-2 py-1 rounded text-xs font-semibold border ${color}`}>
            {log.action}
          </span>
        );
      }
    },
    {
      key: 'ip_address',
      label: 'IP',
      render: (log) => (
        <span className="text-sm font-mono text-zinc-500">
          {log.ip_address || 'N/A'}
        </span>
      )
    },
    {
      key: 'details',
      label: 'Data',
      align: 'right',
      render: (log) => (
        <button 
          onClick={() => setSelectedLog(log)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 transition-colors"
        >
          Xem JSON
        </button>
      )
    }
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-zinc-900 text-lg">System Audit Logs</h3>
            <p className="text-sm text-zinc-500 mt-1">Trang dành cho Dev / Admin để theo dõi thay đổi DB.</p>
          </div>
          <div className="text-sm font-medium text-zinc-500 bg-white px-3 py-1.5 rounded-md border border-zinc-200 shadow-sm">
            Total: <span className="text-zinc-900">{logCount}</span> logs
          </div>
        </div>
        <div className="p-0">
          <DataTable
            columns={columns}
            data={logs}
            page={logPage}
            totalPages={totalPages}
            pageQueryKey="page"
            sortByKey="sortBy"
            sortOrderKey="sortOrder"
            emptyMessage="Chưa có log hệ thống nào."
            dict={{
              all: 'Tất cả',
              filterBy: 'Lọc theo:',
              pageInfo: 'Trang {page} / {total}'
            }}
          />
        </div>
      </div>

      {/* JSON Viewer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 text-lg flex items-center gap-2">
                Chi tiết Log: <span className="px-2 py-1 rounded text-xs font-semibold bg-zinc-100 border border-zinc-200">{selectedLog.action}</span>
              </h3>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex gap-6">
              <div className="flex-1 space-y-2">
                <h4 className="font-medium text-zinc-700 text-sm">Previous State (OLD)</h4>
                <div className="bg-zinc-950 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-[13px] text-zinc-300 font-mono">
                    {selectedLog.old_data ? JSON.stringify(selectedLog.old_data, null, 2) : 'null'}
                  </pre>
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <h4 className="font-medium text-zinc-700 text-sm">New State (NEW)</h4>
                <div className="bg-zinc-950 rounded-lg p-4 overflow-x-auto border border-emerald-500/20">
                  <pre className="text-[13px] text-emerald-400 font-mono">
                    {selectedLog.new_data ? JSON.stringify(selectedLog.new_data, null, 2) : 'null'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
