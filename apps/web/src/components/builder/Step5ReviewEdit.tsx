import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, FileText, Download } from 'lucide-react';
import PDFPreview from './PDFPreview';
import { HTMLHarvardTemplate } from '../html-cv/HTMLHarvardTemplate';
import { HTMLATSSimpleTemplate } from '../html-cv/HTMLATSSimpleTemplate';
import { HTMLCoverLetterTemplate } from '../html-cv/HTMLCoverLetterTemplate';
import { BlockEditorForm } from './BlockEditorForm';
import { CVSchema, CoverLetterSchema } from '@cv-generator/schema';
import { useTranslation } from '@/hooks/useTranslation';

interface Step5Props {
  result: { cv?: CVSchema; coverLetter?: CoverLetterSchema } | null;
  setResult: (r: { cv?: CVSchema; coverLetter?: CoverLetterSchema } | null) => void;
  onReset: () => void;
  cvTemplate: string;
  clTemplate: string;
  showCV: boolean;
  showCL: boolean;
  onPrev: () => void;
}

export function Step5ReviewEdit({
  result,
  setResult,
  onReset,
  cvTemplate,
  clTemplate,
  showCV,
  showCL,
  onPrev,
}: Step5Props) {
  const { t } = useTranslation();
  // Mock state for active edit block
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [activeDoc, setActiveDoc] = useState<'cv' | 'cover_letter'>(showCV ? 'cv' : 'cover_letter');
  const [zoom, setZoom] = useState<number>(0.85);

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
      } else {
        newCL[activeBlock] = newData;
      }
      setResult({ ...result, coverLetter: newCL });
    }
  };

  return (
    <div className="flex h-full w-full relative overflow-hidden bg-zinc-200">
      {/* Top Floating Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center bg-white rounded-lg shadow-md border-2 border-black p-1 z-30">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 text-black px-4 py-2 hover:bg-zinc-100 font-bold uppercase text-xs transition-colors border-r-2 border-zinc-200"
        >
          <ArrowLeft className="w-4 h-4" /> {t('builder.back') || 'Quay Lại'}
        </button>
        {showCV && showCL && (
          <div className="flex border-r-2 border-zinc-200">
            <button 
              onClick={() => { setActiveDoc('cv'); setActiveBlock(null); }}
              className={`px-4 py-2 text-xs font-bold uppercase ${activeDoc === 'cv' ? 'bg-black text-white' : 'hover:bg-zinc-50 text-black'}`}
            >
              {t('builder.cv') || 'CV'}
            </button>
            <button 
              onClick={() => { setActiveDoc('cover_letter'); setActiveBlock(null); }}
              className={`px-4 py-2 text-xs font-bold uppercase ${activeDoc === 'cover_letter' ? 'bg-black text-white' : 'hover:bg-zinc-50 text-black'}`}
            >
              {t('builder.coverLetter') || 'Cover Letter'}
            </button>
          </div>
        )}
        <div className="px-2">
          {activeDoc === 'cv' && showCV && result?.cv && (
             <PDFPreview type="cv" templateId={cvTemplate} data={result.cv as any} hidePreview={true} />
          )}
          {activeDoc === 'cover_letter' && showCL && result?.coverLetter && (
             <PDFPreview type="cover_letter" templateId={clTemplate} data={result.coverLetter as any} hidePreview={true} />
          )}
        </div>
      </div>

      {/* Floating Drawer for Editing */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-100 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out border-l-2 border-black flex flex-col ${
          activeBlock ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {activeBlock && (
          <>
            <div className="p-4 border-b-2 border-black bg-zinc-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                <h3 className="font-bold uppercase tracking-widest text-sm">{t('builder.edit') || 'Sửa'}: {activeBlock}</h3>
              </div>
              <button 
                onClick={() => setActiveBlock(null)}
                className="text-2xl leading-none font-bold text-zinc-400 hover:text-black px-2"
              >
                &times;
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <BlockEditorForm 
                activeBlock={activeBlock}
                data={activeDoc === 'cv' 
                  ? (activeBlock === 'personal' ? result?.cv?.personal : (result?.cv as any)?.[activeBlock])
                  : (['personal', 'recipient'].includes(activeBlock) ? (result?.coverLetter as any)?.[activeBlock] : (result?.coverLetter as any)?.[activeBlock])
                }
                onChange={handleFormChange}
                sectionTitle={activeDoc === 'cv' ? result?.cv?.sectionTitles?.[activeBlock as keyof typeof result.cv.sectionTitles] : undefined}
                onTitleChange={activeDoc === 'cv' ? handleTitleChange : undefined}
              />
            </div>
            
            <div className="p-4 border-t-2 border-black bg-white">
              <button 
                onClick={() => setActiveBlock(null)}
                className="w-full px-4 py-3 bg-black text-white text-xs font-bold uppercase hover:bg-zinc-800 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5"
              >
                {t('builder.doneEditing') || 'Hoàn tất chỉnh sửa'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Full-Screen Canvas */}
      <div className="w-full h-full flex flex-col items-center overflow-auto relative">
        <div className="p-24 pt-32 flex justify-center min-w-max min-h-max w-full">
          <div 
            className="bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)] relative transition-all duration-200"
            style={{ width: '794px', minHeight: '1123px', transformOrigin: 'top center', transform: `scale(${zoom})` }}
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
      </div>
    </div>
  );
}
