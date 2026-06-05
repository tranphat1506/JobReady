import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, FileText, ChevronRight, ArrowRight, Sparkles, MousePointer2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const PDFPreview = dynamic(() => import('./PDFPreview'), { ssr: false });
import { HTMLHarvardTemplate } from '../html-cv/HTMLHarvardTemplate';
import { HTMLATSSimpleTemplate } from '../html-cv/HTMLATSSimpleTemplate';
import { HTMLCoverLetterTemplate } from '../html-cv/HTMLCoverLetterTemplate';
import { BlockEditorForm } from './BlockEditorForm';
import { CVSchema, CoverLetterSchema } from '@cv-generator/schema';
import { useTranslation } from '@/hooks/useTranslation';
import { saveDocument, getResumeVersions } from '@/actions/documentManagement';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { UpgradeModal } from './UpgradeModal';
import { ErrorCodes } from '@/lib/constants/errors';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface Step5Props {
  result: { cv?: CVSchema; coverLetter?: CoverLetterSchema } | null;
  setResult: (r: { cv?: CVSchema; coverLetter?: CoverLetterSchema } | null) => void;
  onReset: () => void;
  cvTemplate: string;
  clTemplate: string;
  showCV: boolean;
  showCL: boolean;
  cvId?: string | null;
  clId?: string | null;
  onPrev: () => void;
  initialStatus?: string;
}

export function Step5ReviewEdit({
  result,
  setResult,
  onReset,
  cvTemplate,
  clTemplate,
  showCV,
  showCL,
  cvId,
  clId,
  onPrev,
  initialStatus = 'completed',
}: Step5Props) {
  const { t, language } = useTranslation();
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const router = useRouter();
  // Mock state for active edit block
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [activeDoc, setActiveDoc] = useState<'cv' | 'cover_letter'>(showCV ? 'cv' : (showCL ? 'cover_letter' : 'cv'));
  const [zoom, setZoom] = useState<number>(0.85);
  const [showMatchAnalysis, setShowMatchAnalysis] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [status, setStatus] = useState<string>(initialStatus);

  // Version History State
  const [showVersions, setShowVersions] = useState<boolean>(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState<boolean>(false);

  // Upgrade Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeDocType, setUpgradeDocType] = useState<'cv' | 'cover_letter' | null>(null);

  // Document Names
  const [cvName, setCvName] = useState<string>(
    result?.cv ? (result.cv as any).personal?.fullName ? `CV - ${(result.cv as any).personal.fullName}${(result.cv as any).personal.jobTitle ? ` - ${(result.cv as any).personal.jobTitle}` : ''}` : 'Untitled CV' : ''
  );
  const [clName, setClName] = useState<string>(
    result?.coverLetter ? (result.coverLetter as any).personal?.fullName ? `Cover Letter - ${(result.coverLetter as any).personal.fullName}${(result.coverLetter as any).personal.jobTitle ? ` - ${(result.coverLetter as any).personal.jobTitle}` : ''}` : 'Untitled Cover Letter' : ''
  );

  // Free Drag to pan state
  const canvasRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setZoom(z => Math.min(2, z + 0.1));
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          setZoom(z => Math.max(0.4, z - 0.1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        if (e.deltaY < 0) setZoom(z => Math.min(2, z + 0.1));
        else setZoom(z => Math.max(0.4, z - 0.1));
      } else {
        setPan(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }));
      }
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.cv-canvas-content')) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleBlockClick = (id: string) => {
    setActiveBlock(id);

    // Load current block data into editor
    const sourceData = activeDoc === 'cv' ? result?.cv : result?.coverLetter;
    if (!sourceData) return;
    const data = sourceData as any;

    // We do NOT need local state for form values anymore because BlockEditorForm handles its own local state.
    // We just set active block.
  };

  const handleTitleChange = (newTitle: string) => {
    if (!activeBlock || activeDoc !== 'cv' || !result?.cv) return;
    const newCv = { ...result.cv } as any;
    if (!newCv.sectionTitles) newCv.sectionTitles = {};
    newCv.sectionTitles[activeBlock] = newTitle;
    setResult({ ...result, cv: newCv });
    setHasChanges(true);
  };

  const handleFormChange = (newData: any) => {
    if (!activeBlock) return;

    if (activeDoc === 'cv' && result?.cv) {
      const newCv = { ...result.cv } as any;
      if (activeBlock === 'personal') {
        newCv.personal = newData;
      } else {
        newCv[activeBlock] = newData;
      }
      setResult({ ...result, cv: newCv });
    } else if (activeDoc === 'cover_letter' && result?.coverLetter) {
      const newCL = { ...result.coverLetter } as any;
      if (['personal', 'recipient'].includes(activeBlock)) {
        newCL[activeBlock] = newData;
      } else if (activeBlock === 'body') {
        newCL.opening = newData?.opening;
        newCL.bodyParagraphs = newData?.bodyParagraphs;
        newCL.closing = newData?.closing;
      } else {
        newCL[activeBlock] = newData;
      }
      setResult({ ...result, coverLetter: newCL });
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let newCvId = cvId;
      let newClId = clId;

      if (showCV && result?.cv) {
        const savedId = await saveDocument(result.cv, 'cv', cvName, undefined, undefined, cvTemplate, 'completed', cvId || undefined);
        if (!cvId && savedId) newCvId = savedId;
      }
      if (showCL && result?.coverLetter) {
        const savedId = await saveDocument(result.coverLetter, 'cover_letter', clName, undefined, undefined, clTemplate, 'completed', clId || undefined);
        if (!clId && savedId) newClId = savedId;
      }

      setStatus('completed');
      setHasChanges(false);
      toast.success(t('builder.saveSuccess'));

      // If this was a brand-new draft (no existing ID), redirect to the new edit page
      if (!cvId && !clId) {
        const newId = newCvId || newClId;
        if (newId) {
          router.push(`/dashboard/edit/${newId}`);
        }
      } else {
        // Already on the edit page — just refresh server data silently
        router.refresh();
      }
    } catch (error: any) {
      if (error.message === ErrorCodes.LIMIT_REACHED || error.message?.includes('limit_reached')) {
        setUpgradeDocType(activeDoc === 'cv' ? 'cv' : 'cover_letter');
        setShowUpgradeModal(true);
      } else {
        toast.error(error.message || t('builder.saveError'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full w-full relative overflow-hidden bg-zinc-100">
      {/* Top Floating Header Wrapper */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 w-[90%] max-w-5xl">
        <div className="flex flex-1 items-center bg-white rounded-xl shadow-md border border-zinc-200 p-1.5 w-full justify-between">
          <div className="flex items-center">
            <button
              onClick={onPrev}
              className="flex items-center gap-2 text-zinc-600 px-4 py-2 hover:bg-zinc-100 rounded-lg font-semibold text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> {t('builder.back') || 'Quay Lại'}
            </button>
            {showCV && showCL && (
              <div className="flex border-l border-zinc-200 pl-1 ml-1 gap-1">
                <button
                  onClick={() => { setActiveDoc('cv'); setActiveBlock(null); }}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeDoc === 'cv' ? 'bg-primary text-white shadow-sm' : 'hover:bg-zinc-100 text-zinc-600'}`}
                >
                  {t('builder.cv') || 'CV'}
                </button>
                <button
                  onClick={() => { setActiveDoc('cover_letter'); setActiveBlock(null); }}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeDoc === 'cover_letter' ? 'bg-primary text-white shadow-sm' : 'hover:bg-zinc-100 text-zinc-600'}`}
                >
                  {t('builder.coverLetter') || 'Cover Letter'}
                </button>
              </div>
            )}
            {result?.cv?.matchAnalysis && (
              <div className="px-2 border-l border-zinc-200 ml-1 flex items-center">
                <button
                  onClick={() => setShowMatchAnalysis(true)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-50 transition-colors rounded-lg group"
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 ${result.cv.matchAnalysis.matchScore >= 70 ? 'border-green-500 text-green-600' :
                      result.cv.matchAnalysis.matchScore >= 40 ? 'border-yellow-500 text-yellow-600' :
                        'border-red-500 text-red-600'
                    }`}>
                    <span className="text-xs font-bold">{result.cv.matchAnalysis.matchScore}</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-zinc-900 leading-none group-hover:text-primary transition-colors">ATS Match</span>
                    <span className="text-[10px] text-zinc-500 mt-1 leading-none">{t('builder.clickToView') || 'Xem chi tiết'}</span>
                  </div>
                </button>
              </div>
            )}

            {/* Version History Button (Temporarily Disabled) */}
          </div>

          {/* Right side: Name, Save, Download */}
          <div className="flex items-center gap-2 pr-1">
            <button
              onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-600 transition-colors uppercase"
            >
              {language}
            </button>
            <div className="flex items-center border border-zinc-200 bg-zinc-50 rounded-lg overflow-hidden h-9 w-48 sm:w-64">
              <input
                type="text"
                value={activeDoc === 'cv' ? cvName : clName}
                onChange={(e) => {
                  activeDoc === 'cv' ? setCvName(e.target.value) : setClName(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full h-full bg-transparent px-3 text-sm font-semibold text-zinc-800 focus:outline-none placeholder:font-normal"
                placeholder="Tên tài liệu..."
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || (!hasChanges && status !== 'draft')}
              className={`flex items-center justify-center h-9 px-4 gap-2 rounded-lg font-semibold text-sm transition-opacity ${(hasChanges || status === 'draft') ? 'bg-primary text-white hover:opacity-90 shadow-sm' : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                }`}
            >
              {isSaving && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              )}
              <span className="hidden sm:inline">{t('builder.saveToDashboard') || 'Lưu'}</span>
            </button>

            {activeDoc === 'cv' && showCV && result?.cv && (
              <div className="h-9">
                {status === 'draft' ? (
                  <button disabled title="Lưu tài liệu để tải xuống PDF" className="flex items-center justify-center h-9 px-4 gap-2 bg-zinc-200 text-zinc-500 rounded-lg font-semibold text-sm cursor-not-allowed">PDF</button>
                ) : (
                  <PDFPreview type="cv" templateId={cvTemplate} data={result.cv as any} hidePreview={true} />
                )}
              </div>
            )}
            {activeDoc === 'cover_letter' && showCL && result?.coverLetter && (
              <div className="h-9">
                {status === 'draft' ? (
                  <button disabled title="Lưu tài liệu để tải xuống PDF" className="flex items-center justify-center h-9 px-4 gap-2 bg-zinc-200 text-zinc-500 rounded-lg font-semibold text-sm cursor-not-allowed">PDF</button>
                ) : (
                  <PDFPreview type="cover_letter" templateId={clTemplate} data={result.coverLetter as any} hidePreview={true} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Edit Hint at Bottom */}
      {!activeBlock && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-zinc-200 shadow-md animate-in fade-in slide-in-from-bottom-2">
            <MousePointer2 className="w-4 h-4 text-primary" />
            {t('builder.editHint') || 'Nhấp trực tiếp vào tài liệu để chỉnh sửa'}
          </div>
        </div>
      )}

      {/* Floating Drawer for Editing */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-100 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out border-l border-zinc-200 flex flex-col ${activeBlock ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {activeBlock && (
          <>
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="font-semibold text-zinc-900 text-sm">{t('builder.edit') || 'Sửa'}: <span className="capitalize">{activeBlock}</span></h3>
              </div>
              <button
                onClick={() => setActiveBlock(null)}
                className="text-2xl leading-none font-medium text-zinc-400 hover:text-red-500 px-2 transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <BlockEditorForm
                activeBlock={activeBlock}
                data={activeDoc === 'cv'
                  ? (activeBlock === 'personal' ? result?.cv?.personal : (result?.cv as any)?.[activeBlock])
                  : (['personal', 'recipient'].includes(activeBlock) ? (result?.coverLetter as any)?.[activeBlock] : (
                    activeBlock === 'body'
                      ? { opening: result?.coverLetter?.opening, bodyParagraphs: result?.coverLetter?.bodyParagraphs, closing: result?.coverLetter?.closing }
                      : (result?.coverLetter as any)?.[activeBlock]
                  ))
                }
                onChange={handleFormChange}
                sectionTitle={activeDoc === 'cv' ? result?.cv?.sectionTitles?.[activeBlock as keyof typeof result.cv.sectionTitles] : undefined}
                onTitleChange={activeDoc === 'cv' ? handleTitleChange : undefined}
                docType={activeDoc === 'cv' ? 'cv' : 'cover_letter'}
              />
            </div>

            <div className="p-4 border-t border-zinc-200 bg-white">
              <button
                onClick={() => setActiveBlock(null)}
                className="w-full px-4 py-3 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                {t('builder.doneEditing') || 'Hoàn tất chỉnh sửa'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Full-Screen Free Panning Canvas */}
      <div
        ref={canvasRef}
        className={`w-full h-full overflow-hidden relative bg-zinc-200 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="absolute top-1/2 left-1/2 transition-transform duration-75"
          style={{ transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px))` }}
        >
          <div
            className="bg-white shadow-xl cv-canvas-content transition-transform duration-200 select-none rounded-sm overflow-hidden border border-zinc-200"
            style={{ width: '794px', minHeight: '1123px', transformOrigin: 'center center', transform: `scale(${zoom})` }}
          >
            {activeDoc === 'cv' && result?.cv ? (
              cvTemplate === 'harvard' ? (
                <HTMLHarvardTemplate
                  data={result.cv as any}
                  activeBlock={activeBlock}
                  onBlockClick={handleBlockClick}
                />
              ) : cvTemplate === 'ats-simple' ? (
                <HTMLATSSimpleTemplate
                  data={result.cv as any}
                  activeBlock={activeBlock}
                  onBlockClick={handleBlockClick}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="font-bold uppercase tracking-widest text-sm">{t('builder.htmlNotSupported') || 'Chưa hỗ trợ HTML cho mẫu'} {cvTemplate}</p>
                </div>
              )
            ) : activeDoc === 'cover_letter' && result?.coverLetter ? (
              <HTMLCoverLetterTemplate
                data={result.coverLetter as any}
                activeBlock={activeBlock}
                onBlockClick={handleBlockClick}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-bold uppercase tracking-widest text-sm">{t('builder.noData') || 'Không có dữ liệu'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zoom Toolbar */}
      <div className="fixed bottom-8 right-8 bg-black text-white px-3 py-2 flex items-center gap-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] z-20">
        <button
          onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}
          className="w-6 h-6 flex items-center justify-center hover:bg-zinc-800 font-bold"
        >
          -
        </button>
        <span className="text-xs font-bold w-12 text-center tracking-widest">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(z => Math.min(2, z + 0.1))}
          className="w-6 h-6 flex items-center justify-center hover:bg-zinc-800 font-bold"
        >
          +
        </button>
      </div>

      {/* Match Analysis Modal */}
      {showMatchAnalysis && result?.cv?.matchAnalysis && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative">
            <button
              onClick={() => setShowMatchAnalysis(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black font-bold text-xl leading-none"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold uppercase tracking-widest mb-6">{t('builder.matchAnalysis') || 'Phân tích độ phù hợp (JD Match)'}</h2>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-200">
              <div className={`text-4xl font-bold ${result.cv.matchAnalysis.matchScore >= 70 ? 'text-green-600' : result.cv.matchAnalysis.matchScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                {result.cv.matchAnalysis.matchScore}%
              </div>
              <div>
                <div className="font-bold text-sm uppercase tracking-widest">{t('builder.matchStatus') || 'Trạng thái'}: {result.cv.matchAnalysis.isRelevant ? (t('builder.relevant') || 'Đạt yêu cầu') : (t('builder.irrelevant') || 'Chưa đạt')}</div>
                <div className="text-xs text-zinc-500 mt-1">{t('builder.matchScoreDesc') || 'Điểm số do AI đánh giá dựa trên Job Description.'}</div>
              </div>
            </div>

            {result.cv.matchAnalysis.missingSkills && result.cv.matchAnalysis.missingSkills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">{t('builder.missingSkills') || 'Kỹ năng cần bổ sung'}</h3>
                <div className="flex flex-wrap gap-2">
                  {result.cv.matchAnalysis.missingSkills.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.cv.matchAnalysis.feedback && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">{t('builder.aiFeedback') || 'Lời khuyên từ AI'}</h3>
                <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-4 border border-zinc-200">
                  {result.cv.matchAnalysis.feedback}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Version History Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-zinc-200 flex flex-col ${showVersions ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-zinc-900 text-sm">{t('builder.versionHistoryTitle') || 'Lịch sử phiên bản'}</h3>
          <button
            onClick={() => setShowVersions(false)}
            className="text-2xl leading-none font-medium text-zinc-400 hover:text-red-500 px-2 transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoadingVersions ? (
            <div className="text-center text-zinc-500 py-8 text-sm animate-pulse">{t('builder.versionLoading') || 'Đang tải lịch sử...'}</div>
          ) : versions.length === 0 ? (
            <div className="text-center text-zinc-500 py-8 text-sm">{t('builder.noVersions') || 'Chưa có phiên bản nào'}</div>
          ) : (
            versions.map((v) => (
              <div key={v.id} className="border border-zinc-200 rounded-lg p-4 bg-white hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-sm text-zinc-900">{t('builder.version') || 'Phiên bản'} {v.version_number}</span>
                    <div className="text-xs text-zinc-500 mt-1">
                      {new Date(v.created_at).toLocaleString(language === 'en' ? 'en-US' : 'vi-VN')}
                    </div>
                  </div>
                  {v.score && (
                    <div className="text-xs font-bold px-2 py-1 bg-green-50 text-green-700 rounded-md">
                      {t('builder.score') || 'Điểm'}: {v.score}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    const contentWithMatch = { ...v.content };
                    if (v.match_analysis) {
                      contentWithMatch.matchAnalysis = v.match_analysis;
                    }
                    if (activeDoc === 'cv') {
                      setResult({ ...result, cv: contentWithMatch });
                    } else {
                      setResult({ ...result, coverLetter: contentWithMatch });
                    }
                    setHasChanges(true);
                    setShowVersions(false);
                    toast.success(`${t('builder.restoreSuccess') || 'Đã khôi phục phiên bản'} ${v.version_number}`);
                  }}
                  className="mt-3 w-full text-xs font-semibold px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md transition-colors"
                >
                  {t('builder.restore') || 'Khôi phục'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        docType={upgradeDocType}
        onBuySuccess={() => {
          setShowUpgradeModal(false);
          handleSave(); // Automatically retry saving
        }}
      />
    </div>
  );
}
