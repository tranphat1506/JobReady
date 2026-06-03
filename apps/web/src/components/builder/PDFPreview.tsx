'use client';
import React, { useEffect, useState } from 'react';
import { usePDF, Font } from '@react-pdf/renderer';
import { TemplateRegistry, CoverLetterRegistry } from '@cv-generator/renderer';
import { CVSchema, CoverLetterSchema } from '@cv-generator/schema';
import { FileText, Download, ExternalLink, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

Font.register({
  family: 'Lora',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/lora/v37/0QI6MX1D_JOuGQbT0gvTJPa787weuyJG.ttf' },
    { src: 'https://fonts.gstatic.com/s/lora/v37/0QI6MX1D_JOuGQbT0gvTJPa787z5vCJG.ttf', fontWeight: 'bold' },
    { src: 'https://fonts.gstatic.com/s/lora/v37/0QI8MX1D_JOuMw_hLdO6T2wV9KnW-MoFkqg.ttf', fontStyle: 'italic' },
    { src: 'https://fonts.gstatic.com/s/lora/v37/0QI8MX1D_JOuMw_hLdO6T2wV9KnW-C0Ckqg.ttf', fontWeight: 'bold', fontStyle: 'italic' }
  ]
});
interface PDFPreviewProps {
  type: 'cv' | 'cover_letter';
  templateId: string;
  data: any;
  hidePreview?: boolean;
}

export default function PDFPreview({ type, templateId, data, hidePreview }: PDFPreviewProps) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  let templateObj: any = null;

  if (type === 'cv') {
    templateObj = TemplateRegistry.getTemplate(templateId);
  } else {
    templateObj = CoverLetterRegistry.getTemplate(templateId);
  }

  if (!templateObj) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-xl border border-red-200">{t('builder.templateNotFound') || 'Template not found'}: {templateId}</div>;
  }

  // Create the document instance
  const documentElement = templateObj.render(data as any);

  const [instance, updateInstance] = usePDF({ document: documentElement });

  // Force update when templateId or data changes
  useEffect(() => {
    updateInstance(documentElement);
  }, [templateId, data, updateInstance]);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      if (instance.url) {
        const link = document.createElement('a');
        link.href = instance.url;
        link.download = `${type}_${templateId}.pdf`;
        link.click();
      } else {
        throw new Error(t('builder.invalidDocType') || 'Loại tài liệu không hợp lệ');
      }
    } catch (err: any) {
      console.error(err);
      alert((t('builder.errorOccurred') || 'Có lỗi xảy ra: ') + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (hidePreview) {
    return (
      <button 
        onClick={handleDownload} 
        disabled={isGenerating || instance.loading}
        className="flex items-center justify-center gap-2 px-4 py-2 hover:bg-zinc-100 text-black font-bold text-xs uppercase transition-colors disabled:opacity-50"
      >
        {isGenerating || instance.loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('builder.processing') || 'Đang xử lý'}
          </span>
        ) : (
          <><Download className="w-4 h-4" /> {t('builder.download') || 'Tải'} {type === 'cv' ? 'CV' : t('builder.letter') || 'Thư'} (PDF)</>
        )}
      </button>
    );
  }

  const title = type === 'cv' ? 'Curriculum Vitae' : 'Cover Letter';
  const subtitle = type === 'cv' ? `Template: ${templateObj.config.name || templateId}` : `${t('builder.template') || 'Mẫu'}: ${templateObj.config.name || templateId}`;

  return (
    <div className="bg-white rounded-2xl border-2 border-zinc-200 p-6 flex flex-col items-center text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all group hover:-translate-y-1">
      <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-black transition-colors">
        {instance.loading ? (
          <Loader2 className="w-8 h-8 text-zinc-400 animate-spin group-hover:text-white" />
        ) : (
          <FileText className="w-8 h-8 text-black group-hover:text-white transition-colors" />
        )}
      </div>

      <h3 className="text-xl font-bold uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-xs text-zinc-500 font-medium mb-6">{subtitle}</p>

      {instance.loading ? (
        <div className="w-full space-y-3">
          <div className="h-10 bg-zinc-100 rounded-lg animate-pulse w-full"></div>
          <div className="h-10 bg-zinc-100 rounded-lg animate-pulse w-full"></div>
        </div>
      ) : instance.error ? (
        <div className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg w-full">
          {t('builder.errorOccurred') || 'Có lỗi xảy ra khi tạo PDF.'}
        </div>
      ) : (
        <div className="w-full space-y-3">
          <a
            href={instance.url!}
            download={`${type}_${templateId}.pdf`}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-black text-white rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-zinc-800 transition-colors"
          >
            <Download className="w-4 h-4" /> {t('builder.download') || 'Tải Xuống'} PDF
          </a>
          <a
            href={instance.url!}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white text-black rounded-lg font-bold text-sm uppercase tracking-wider border-2 border-black hover:bg-zinc-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> {t('builder.viewFullscreen') || 'Xem Toàn Màn Hình'}
          </a>
        </div>
      )}
    </div>
  );
}
