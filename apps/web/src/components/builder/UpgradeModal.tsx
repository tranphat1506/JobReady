import React, { useState } from 'react';
import { X, Database, CreditCard, CheckCircle2, Coins, Loader2, HardDrive } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { buySlot } from '@/actions/store';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  docType?: 'cv' | 'cover_letter' | null;
  onBuySuccess?: () => void;
}

export function UpgradeModal({
  isOpen,
  onClose,
  docType,
  onBuySuccess
}: UpgradeModalProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isBuying, setIsBuying] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-zinc-200">
        <div className="relative pt-12 pb-6 px-8 flex flex-col items-center text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 bg-zinc-100 hover:bg-zinc-200 p-2 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 bg-linear-to-tr from-zinc-100 to-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-200 shadow-sm mb-6 relative">
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
            </div>
            <HardDrive className="w-8 h-8 text-zinc-700" strokeWidth={1.5} />
          </div>

          <h3 className="text-xl font-bold text-zinc-900 mb-2">{t('upgradeModal.title') || 'Hết không gian lưu trữ'}</h3>
          <p className="text-zinc-500 text-sm leading-relaxed mb-6">
            {t('upgradeModal.description') || 'Tài khoản của bạn đã đạt giới hạn lưu trữ tối đa cho phép. Để tiếp tục lưu tài liệu này, bạn có thể mua thêm chỗ trống hoặc nâng cấp tài khoản.'}
          </p>

          <div className="w-full space-y-2.5 text-left bg-zinc-50/50 rounded-2xl p-5 border border-zinc-100 mb-8">
            <div className="flex items-start gap-3 text-sm text-zinc-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>{t('upgradeModal.benefit1') || 'Mở rộng vĩnh viễn không gian lưu trữ cho tài khoản của bạn.'}</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-zinc-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>{t('upgradeModal.benefit2') || 'Lưu lại mọi phiên bản tài liệu một cách an toàn.'}</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-zinc-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>{t('upgradeModal.benefit3') || 'Chỉnh sửa và xuất bản tài liệu không giới hạn số lần.'}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            {docType && (
              <button
                disabled={isBuying}
                onClick={async () => {
                  try {
                    setIsBuying(true);
                    const typeToBuy = docType === 'cv' ? 'cv' : 'cl';
                    await buySlot(typeToBuy);
                    toast.success(t('upgradeModal.buySuccess') || `Mua thành công 1 chỗ trống ${docType === 'cv' ? 'CV' : 'Cover Letter'}`);
                    if (onBuySuccess) onBuySuccess();
                  } catch (e: any) {
                    toast.error(e.message || t('upgradeModal.error') || "Không đủ Credits hoặc có lỗi xảy ra");
                  } finally {
                    setIsBuying(false);
                  }
                }}
                className="w-full py-3.5 px-4 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:hover:shadow-md"
              >
                {isBuying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4 text-yellow-400" />}
                {isBuying ? (t('upgradeModal.processing') || "Đang xử lý...") : (docType === 'cv' ? t('upgradeModal.buySlotCV') : t('upgradeModal.buySlotCL'))}
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                router.push('/dashboard/billing');
              }}
              className="w-full py-3.5 px-4 bg-white text-zinc-700 border border-zinc-200 font-semibold rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all flex items-center justify-center gap-2.5 shadow-sm"
            >
              <CreditCard className="w-4 h-4 text-zinc-500" /> {t('upgradeModal.upgradePlan') || 'Xem các Gói Nâng Cấp'}
            </button>

            <button
              onClick={onClose}
              className="mt-2 text-sm text-zinc-400 hover:text-zinc-600 font-medium transition-colors"
            >
              {t('upgradeModal.later') || 'Để sau'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
