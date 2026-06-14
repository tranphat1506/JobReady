import React from 'react';
import { X, RefreshCw, CheckCircle2, TrendingUp } from 'lucide-react';
import { MatchAnalysis } from '@cv-generator/schema';

interface MatchAnalysisModalProps {
  analysis: MatchAnalysis;
  onClose: () => void;
  onRescore: () => void;
  isRescoring: boolean;
  t: (key: string) => string;
}

export function MatchAnalysisModal({ analysis, onClose, onRescore, isRescoring, t }: MatchAnalysisModalProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 border-green-500 bg-green-50';
    if (score >= 40) return 'text-yellow-600 border-yellow-500 bg-yellow-50';
    return 'text-red-600 border-red-500 bg-red-50';
  };
  const getScoreBarColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const circleColorClass = analysis.matchScore >= 70 ? 'border-green-500 text-green-600' :
    analysis.matchScore >= 40 ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white max-w-3xl w-full rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t('builder.analysisTitle') || 'PHÂN TÍCH ĐỘ PHÙ HỢP'}</h2>
            <h1 className="text-xl font-bold text-zinc-900">{t('matchAnalysis.jdMatchReport') || 'JD Match Report'}</h1>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Summary Row */}
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-stretch">
            <div className={`flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 ${circleColorClass} shrink-0`}>
              <span className="text-3xl font-bold">{analysis.matchScore}%</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">{t('matchAnalysis.atsScore') || 'Điểm ATS'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 flex flex-col justify-center">
                <span className="text-xs text-zinc-500 font-medium mb-1">{t('matchAnalysis.status') || 'Trạng thái'}</span>
                {analysis.isRelevant ? (
                  <span className="text-sm font-bold text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> {t('matchAnalysis.passed') || 'Đạt yêu cầu'}</span>
                ) : (
                  <span className="text-sm font-bold text-red-600 flex items-center gap-1"><X className="w-4 h-4"/> {t('matchAnalysis.failed') || 'Chưa đạt'}</span>
                )}
              </div>
              <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 flex flex-col justify-center">
                <span className="text-xs text-zinc-500 font-medium mb-1">{t('matchAnalysis.analyzedPosition') || 'Vị trí phân tích'}</span>
                <span className="text-sm font-bold text-zinc-900 truncate">{analysis.jobLevel || t('matchAnalysis.unspecified') || 'Chưa xác định'}</span>
              </div>
              <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 flex flex-col justify-center">
                <span className="text-xs text-zinc-500 font-medium mb-1">{t('matchAnalysis.matchedKeywords') || 'Từ khóa khớp'}</span>
                <span className="text-sm font-bold text-zinc-900">{analysis.keywordMatch || 'N/A'}</span>
              </div>
              <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 flex flex-col justify-center">
                <span className="text-xs text-zinc-500 font-medium mb-1">{t('matchAnalysis.missingSkills') || 'Kỹ năng thiếu'}</span>
                <span className="text-sm font-bold text-red-600">
                  {analysis.missingSkillsDetails?.critical?.length || 0} {t('matchAnalysis.critical') || 'quan trọng'}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-200" />

          {/* Breakdown Bars */}
          {analysis.breakdown && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">{t('matchAnalysis.scoreByCriteria') || 'ĐIỂM THEO TIÊU CHÍ'}</h3>
              <div className="space-y-4">
                {[
                  { label: t('matchAnalysis.technicalSkills') || 'Kỹ năng kỹ thuật', data: analysis.breakdown.skills },
                  { label: t('matchAnalysis.experience') || 'Kinh nghiệm', data: analysis.breakdown.experience },
                  { label: t('matchAnalysis.keywordsLanguage') || 'Từ khóa & ngôn ngữ', data: analysis.breakdown.keywords },
                  { label: t('matchAnalysis.educationCertifications') || 'Học vấn & chứng chỉ', data: analysis.breakdown.education }
                ].map((item, i) => item.data && (
                  <div key={i}>
                    <div className="flex justify-between mb-1 text-sm font-semibold text-zinc-800">
                      <span>{item.label}</span>
                      <span className={getScoreColor(item.data.score).split(' ')[0]}>{item.data.score}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getScoreBarColor(item.data.score)}`} style={{ width: `${item.data.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="h-px bg-zinc-200" />

          {/* Missing Skills */}
          {((analysis.missingSkillsDetails?.critical?.length ?? 0) > 0 || (analysis.missingSkillsDetails?.niceToHave?.length ?? 0) > 0 || (analysis.suggestedAdditions?.length ?? 0) > 0) && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">{t('matchAnalysis.skillsToImprove') || 'KỸ NĂNG CẦN BỔ SUNG / GỢI Ý'}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {analysis.missingSkillsDetails?.critical?.map((s: string, i: number) => (
                  <span key={`crit-${i}`} className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-sm font-semibold rounded-full" title={t('matchAnalysis.mandatoryByJd') || "Bắt buộc theo JD"}>
                    {s}
                  </span>
                ))}
                {analysis.missingSkillsDetails?.niceToHave?.map((s: string, i: number) => (
                  <span key={`nth-${i}`} className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 text-sm font-semibold rounded-full" title={t('matchAnalysis.niceToHave') || "Nice-to-have"}>
                    {s}
                  </span>
                ))}
                {analysis.suggestedAdditions?.map((s: {skill: string, reason: string}, i: number) => (
                  <span key={`sug-${i}`} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold rounded-full cursor-help" title={s.reason}>
                    {s.skill}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 text-xs font-medium text-zinc-500">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> {t('matchAnalysis.mandatoryByJd') || 'Bắt buộc theo JD'}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> {t('matchAnalysis.niceToHave') || 'Nice-to-have'}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> {t('matchAnalysis.aiSuggestions') || 'Gợi ý thêm từ AI'}</div>
              </div>
            </div>
          )}

          <div className="h-px bg-zinc-200" />

          {/* AI Feedback */}
          {analysis.structuredFeedback && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">{t('matchAnalysis.aiFeedback') || 'NHẬN XÉT TỪ AI'}</h3>
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4 text-sm font-medium text-zinc-800 italic rounded-r-lg">
                {analysis.structuredFeedback.summary}
              </div>
              <ul className="space-y-2 text-sm text-zinc-700">
                {analysis.structuredFeedback.strengths?.map((s: string, i: number) => (
                  <li key={`str-${i}`} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
                {analysis.structuredFeedback.improvements?.map((s: string, i: number) => (
                  <li key={`imp-${i}`} className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Fallback for legacy feedback */}
          {!analysis.structuredFeedback && analysis.feedback && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">{t('matchAnalysis.aiFeedback') || 'NHẬN XÉT TỪ AI'}</h3>
              <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-4 border border-zinc-200 rounded-lg">
                {analysis.feedback}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-zinc-300 rounded-lg text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors">
            {t('matchAnalysis.close') || 'Đóng'}
          </button>
          <button 
            onClick={onRescore} 
            disabled={isRescoring}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isRescoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {t('builder.recalculateATS') || 'Tính lại ATS'}
          </button>
        </div>
      </div>
    </div>
  );
}
