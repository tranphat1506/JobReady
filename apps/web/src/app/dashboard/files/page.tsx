'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FileText, Trash2, Edit2, Copy, Search, FolderKanban, FilePlus2, Loader2, AlertCircle, Clock } from 'lucide-react';
import { getDocuments, renameDocument, deleteDocument, duplicateDocument, SavedDocument } from '@/actions/documentManagement';
import toast from 'react-hot-toast';
import Link from 'next/link';

function getDraftTimeLeft(updatedAt: string): string {
  const expiresAt = new Date(new Date(updatedAt).getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  if (diffMs <= 0) return '0 phút';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}g ${minutes}p`;
  return `${minutes} phút`;
}

export default function FilesPage() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'cv' | 'cover_letter'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await getDocuments();
      setDocuments(data);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;
    try {
      await renameDocument(editingId, editName);
      toast.success(t('files.renameSuccess') || 'Đã đổi tên thành công');
      setEditingId(null);
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đổi tên');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteDocument(deletingId);
      toast.success(t('files.deleteSuccess') || 'Đã xoá tài liệu');
      setDeletingId(null);
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi xoá tài liệu');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      toast.loading(t('files.duplicating') || 'Đang nhân bản...', { id: 'dup' });
      await duplicateDocument(id);
      toast.success(t('files.duplicateSuccess') || 'Nhân bản thành công', { id: 'dup' });
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi nhân bản', { id: 'dup' });
    }
  };

  const filteredDocs = documents.filter(doc => {
    if (filter !== 'all' && doc.type !== filter) return false;
    if (search && !doc.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const hasDrafts = filteredDocs.some(d => d.status === 'draft');

  return (
    <div className="flex flex-col h-full bg-zinc-50/50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-8 py-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-primary" /> {t('files.title') || 'Quản lý tài liệu'}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{t('files.subtitle') || 'Lưu trữ và chỉnh sửa các CV, Cover Letter của bạn.'}</p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
        >
          <FilePlus2 className="w-4 h-4" /> {t('files.createNew') || 'Tạo mới'}
        </Link>
      </div>

      {/* Toolbar */}
      <div className="px-8 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/50 border-b border-zinc-100">
        <div className="flex bg-zinc-100 p-1 rounded-lg w-full sm:w-auto">
          {(['all', 'cv', 'cover_letter'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-semibold rounded-md capitalize transition-colors ${
                filter === f ? 'bg-white text-primary shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {f === 'all' ? (t('files.filterAll') || 'Tất cả') : f === 'cv' ? 'CV' : 'Cover Letter'}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('files.search') || 'Tìm kiếm tài liệu...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-medium text-sm">{t('files.loading') || 'Đang tải tài liệu...'}</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl bg-white">
            <FileText className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-semibold text-zinc-600 mb-1">{t('files.emptyTitle') || 'Không tìm thấy tài liệu nào'}</p>
            <p className="text-sm">{t('files.emptyDesc') || 'Hãy thử tìm kiếm khác hoặc tạo mới một tài liệu.'}</p>
          </div>
        ) : (
          <>
            {/* Draft notice */}
            {hasDrafts && (
              <div className="mb-5 flex items-start gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{t('files.draftNotice') || '* Các tài liệu ở trạng thái Nháp (DRAFT) sẽ tự động bị xoá sau 24 giờ. Bấm vào để "Lưu" và hoàn tất.'}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredDocs.map((doc) => {
                const isDraft = doc.status === 'draft';
                return (
                  <div key={doc.id} className={`group flex flex-col bg-white border rounded-xl overflow-hidden transition-all ${isDraft ? 'border-orange-200 hover:border-orange-400' : 'border-zinc-200 hover:border-primary/50 hover:shadow-md'}`}>

                    {/* Preview Mockup */}
                    <Link href={`/dashboard/edit/${doc.id}`} className="block">
                      <div className={`h-32 border-b p-4 relative overflow-hidden flex items-start justify-center ${isDraft ? 'bg-orange-50 border-orange-100' : 'bg-zinc-50 border-zinc-100'}`}>
                        <div className="w-3/4 h-[120%] bg-white border border-zinc-200 rounded shadow-sm p-2 flex flex-col gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <div className="w-1/2 h-2 bg-zinc-300 rounded-sm"></div>
                          <div className="w-full h-1 bg-zinc-200 rounded-sm mt-1"></div>
                          <div className="w-full h-1 bg-zinc-200 rounded-sm"></div>
                          <div className="w-3/4 h-1 bg-zinc-200 rounded-sm"></div>
                        </div>
                        {/* Type badge */}
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-zinc-600 uppercase tracking-widest border border-zinc-200 shadow-sm flex items-center gap-1">
                          {doc.type === 'cv' ? 'CV' : 'Cover Letter'}
                          {doc.template_id && <span className="text-zinc-400 border-l border-zinc-300 pl-1 ml-0.5">{doc.template_id}</span>}
                        </div>
                        {/* ATS Score */}
                        {doc.resume_versions && doc.resume_versions[0]?.score != null && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm border border-zinc-200">
                            <span className={`w-1.5 h-1.5 rounded-full ${doc.resume_versions[0].score >= 70 ? 'bg-green-500' : doc.resume_versions[0].score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                            <span className={doc.resume_versions[0].score >= 70 ? 'text-green-600' : doc.resume_versions[0].score >= 40 ? 'text-yellow-600' : 'text-red-600'}>
                              {doc.resume_versions[0].score} ATS
                            </span>
                          </div>
                        )}
                        {/* Draft time left badge */}
                        {isDraft && (
                          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded text-[10px] font-semibold text-orange-700">
                            <Clock className="w-3 h-3" />
                            {getDraftTimeLeft(doc.updated_at)}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info + Actions */}
                    <div className="p-4 flex flex-col gap-2">
                      {editingId === doc.id ? (
                        <form onSubmit={handleRename} className="flex gap-2">
                          <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm font-semibold border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <button type="submit" className="text-xs bg-primary text-white px-2 rounded font-semibold hover:opacity-90">{t('files.save') || 'Lưu'}</button>
                          <button type="button" onClick={() => setEditingId(null)} className="text-xs bg-zinc-100 text-zinc-600 px-2 rounded font-semibold hover:bg-zinc-200">{t('files.cancel') || 'Huỷ'}</button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-2">
                          {/* Click name to rename — completed only */}
                          {!isDraft ? (
                            <button
                              onClick={() => { setEditingId(doc.id); setEditName(doc.name); }}
                              className="font-semibold text-zinc-900 text-sm truncate flex-1 min-w-0 text-left hover:text-primary transition-colors"
                              title={`${doc.name} — nhấp để đổi tên`}
                            >
                              {doc.name}
                            </button>
                          ) : (
                            <h3 className="font-semibold text-zinc-900 text-sm truncate flex-1 min-w-0" title={doc.name}>{doc.name}</h3>
                          )}
                          {isDraft && (
                            <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">DRAFT</span>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-zinc-400">
                        {new Date(doc.updated_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>

                      {/* Action buttons */}
                      {!editingId && (
                        <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-100 mt-1">
                          {/* Edit file button — both draft and completed go to editor */}
                          <Link
                            href={`/dashboard/edit/${doc.id}`}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-600 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> {t('files.edit') || 'Sửa'}
                          </Link>
                          {!isDraft && (
                            <button
                              onClick={() => handleDuplicate(doc.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-600 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                            >
                              <Copy className="w-3 h-3" /> {t('files.duplicate') || 'Nhân bản'}
                            </button>
                          )}
                          <button
                            onClick={() => setDeletingId(doc.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-600 hover:text-red-500 hover:bg-red-50 rounded transition-colors ml-auto"
                          >
                            <Trash2 className="w-3 h-3" /> {t('files.delete') || 'Xoá'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">{t('files.deleteConfirmTitle') || 'Xác nhận xoá'}</h3>
            </div>
            <p className="text-sm text-zinc-600 mb-6">{t('files.deleteConfirmDesc') || 'Bạn có chắc chắn muốn xoá tài liệu này không? Hành động này không thể hoàn tác.'}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingId(null)} className="px-4 py-2 font-semibold text-sm text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors">
                {t('files.cancel') || 'Huỷ'}
              </button>
              <button onClick={handleDelete} className="px-4 py-2 font-semibold text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors">
                {t('files.deleteConfirmBtn') || 'Xoá Tài Liệu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
