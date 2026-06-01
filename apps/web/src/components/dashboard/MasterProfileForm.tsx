'use client';

import React, { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MasterProfileSchema, MasterProfileData } from '@/types/profile';
import { createClient } from '@/utils/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  initialData: MasterProfileData;
}

export default function MasterProfileForm({ initialData }: Props) {
  const { t } = useTranslation();
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<MasterProfileData>({
    resolver: zodResolver(MasterProfileSchema as any),
    defaultValues: initialData,
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: 'experience' });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control, name: 'skills' });
  const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({ control, name: 'languages' });

  // ── Avatar upload ────────────────────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    (initialData?.personalInfo as any)?.avatar || null
  );
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const [importText, setImportText] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const handleParseAI = async () => {
    if (!importText && !importFile) return;
    setIsParsing(true);
    setMessage(null);
    try {
      const fd = new FormData();
      if (importFile) fd.append('file', importFile);
      else fd.append('text', importText);
      const res = await fetch('/api/parse-profile', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      reset(await res.json());
      setImportText('');
      setImportFile(null);
      setShowImport(false);
      setMessage({ type: 'success', text: t('profile.importAi.success') || 'Done. Review and save.' });
      setTimeout(() => setMessage(null), 6000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsParsing(false);
    }
  };

  const onSubmit = async (data: MasterProfileData) => {
    setIsSaving(true);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('master_profiles')
        .update({ content: data, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      if (error) throw error;
      setMessage({ type: 'success', text: t('profile.success') || 'Saved.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Shared style atoms ───────────────────────────────────────────────────────
  const inp = [
    'w-full px-0 py-1.5 border-0 border-b border-zinc-300',
    'text-sm text-zinc-900 bg-transparent placeholder-zinc-300',
    'focus:outline-none focus:border-zinc-900 transition-colors',
  ].join(' ');

  const inpBox = [
    'w-full px-2 py-1.5 border border-zinc-300',
    'text-sm text-zinc-900 bg-white placeholder-zinc-300',
    'focus:outline-none focus:border-zinc-900 transition-colors',
  ].join(' ');

  const lbl = 'block text-[10px] font-bold tracking-widest uppercase text-zinc-400 mb-1';
  const errCls = 'text-[10px] text-red-500 mt-0.5';

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 shrink-0">{children}</span>
      <div className="flex-1 border-t border-zinc-200" />
    </div>
  );

  const AddBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 text-[11px] font-bold tracking-widest uppercase text-zinc-400 hover:text-zinc-900 border border-dashed border-zinc-300 hover:border-zinc-600 px-3 py-1.5 transition-colors w-full"
    >
      {label}
    </button>
  );

  const RemoveBtn = ({ onClick }: { onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="text-[10px] font-bold tracking-widest uppercase text-zinc-300 hover:text-red-500 transition-colors"
    >
      {t('profile.actions.remove') || 'Remove'}
    </button>
  );

  return (
    <div className="max-w-2xl pb-24 font-sans">

      {/* ── Document Header ────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-baseline justify-between border-b-2 border-zinc-900 pb-3">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 uppercase">
            {t('profile.title') || 'Hồ Sơ'}
          </h1>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowImport(v => !v)}
              className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              {showImport ? 'Đóng' : 'Import'}
            </button>
          </div>
        </div>

        {/* Toast */}
        {message && (
          <div className={`mt-3 text-[11px] font-medium border-l-2 pl-3 py-1 ${message.type === 'success' ? 'border-zinc-900 text-zinc-600' : 'border-red-500 text-red-500'
            }`}>
            {message.text}
          </div>
        )}

        {/* AI Import panel */}
        {showImport && (
          <div className="mt-4 border border-zinc-200 p-4 bg-zinc-50">
            <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 mb-3">
              Chọn nguồn nhập
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">

              {/* PDF Upload */}
              <label className="cursor-pointer border border-dashed border-zinc-300 bg-white p-3 flex flex-col items-center justify-center min-h-[80px] hover:border-zinc-500 transition-colors text-center">
                {importFile ? (
                  <>
                    <span className="text-[11px] text-zinc-700 font-medium truncate max-w-full px-2">{importFile.name}</span>
                    <button type="button" onClick={(e) => { e.preventDefault(); setImportFile(null); }} className="text-[10px] text-red-400 mt-1 uppercase tracking-wide font-bold">Xóa</button>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Tải CV (PDF)</span>
                    <span className="text-[10px] text-zinc-300 mt-0.5">Click để chọn file</span>
                  </>
                )}
                <input type="file" accept="application/pdf" className="hidden" onChange={(e) => {
                  if (e.target.files?.[0]) { setImportFile(e.target.files[0]); }
                }} />
              </label>

              {/* LinkedIn — coming soon */}
              <div className="relative border border-dashed border-zinc-200 bg-zinc-100 p-3 flex flex-col items-center justify-center min-h-[80px] text-center opacity-60">
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">LinkedIn Profile</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">linkedin.com/in/username</span>
                <input
                  disabled
                  placeholder="Sắp ra mắt…"
                  className="mt-2 w-full px-2 py-1 text-[11px] border border-zinc-300 bg-white text-zinc-400 placeholder-zinc-300 text-center outline-none cursor-not-allowed"
                />
                <span className="absolute top-1.5 right-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Soon</span>
              </div>

            </div>
            <button
              type="button"
              onClick={handleParseAI}
              disabled={!importFile || isParsing}
              className="text-[10px] font-bold tracking-widest uppercase bg-zinc-900 text-white px-4 py-2 hover:bg-zinc-700 transition-colors disabled:opacity-30"
            >
              {isParsing ? 'Đang phân tích…' : (t('profile.importAi.analyzeBtn') || 'Phân tích')}
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* ── Personal ─────────────────────────────────────────────────────── */}
        <div>
          <SectionHeading>{t('profile.sections.personal') || 'Thông tin cá nhân'}</SectionHeading>

          {/* Avatar + fields layout */}
          <div className="flex gap-6 mb-6">
            {/* Avatar */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="w-20 h-20 border border-zinc-200 bg-zinc-50 flex items-center justify-center cursor-pointer hover:border-zinc-400 transition-colors overflow-hidden"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] uppercase tracking-widest text-zinc-300 font-bold text-center leading-tight px-1">Photo</span>
                )}
              </div>
              <button type="button" onClick={() => avatarInputRef.current?.click()} className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors font-bold">
                {avatarPreview ? 'Đổi ảnh' : 'Tải ảnh'}
              </button>
              {avatarPreview && (
                <button type="button" onClick={() => setAvatarPreview(null)} className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors font-bold">Xóa</button>
              )}
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Name + email on the right of avatar */}
            <div className="flex-1 grid grid-cols-1 gap-y-5">
              <div>
                <label className={lbl}>{t('profile.fields.fullName')}</label>
                <input {...register('personalInfo.fullName')} className={inp} />
                {errors.personalInfo?.fullName && <p className={errCls}>{errors.personalInfo.fullName.message}</p>}
              </div>
              <div>
                <label className={lbl}>{t('profile.fields.email')}</label>
                <input type="email" {...register('personalInfo.email')} className={inp} />
                {errors.personalInfo?.email && <p className={errCls}>{errors.personalInfo.email.message}</p>}
              </div>
            </div>
          </div>

          {/* Remaining fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <label className={lbl}>{t('profile.fields.phone')}</label>
              <input {...register('personalInfo.phone')} className={inp} />
            </div>
            <div>
              <label className={lbl}>{t('profile.fields.location')}</label>
              <input {...register('personalInfo.location')} className={inp} />
            </div>
            <div>
              <label className={lbl}>{t('profile.fields.linkedin')}</label>
              <input {...register('personalInfo.linkedin')} className={inp} placeholder="linkedin.com/in/…" />
            </div>
            <div>
              <label className={lbl}>{t('profile.fields.portfolio')}</label>
              <input {...register('personalInfo.portfolio')} className={inp} placeholder="yoursite.com" />
            </div>
            <div className="md:col-span-2">
              <label className={lbl}>{t('profile.fields.summary')}</label>
              <textarea {...register('personalInfo.summary')} rows={3} className={`${inpBox} resize-none mt-1`} placeholder="Tóm tắt bản thân ngắn gọn, chuyên nghiệp…" />
            </div>
          </div>
        </div>

        {/* ── Experience ───────────────────────────────────────────────────── */}
        <div>
          <SectionHeading>{t('profile.sections.experience') || 'Kinh nghiệm'}</SectionHeading>
          {expFields.length === 0 && (
            <p className="text-xs text-zinc-400 mb-3 italic">{t('profile.empty.experience')}</p>
          )}
          <div className="divide-y divide-zinc-100">
            {expFields.map((field, i) => (
              <div key={field.id} className="py-5 first:pt-0">
                <div className="flex justify-end mb-2">
                  <RemoveBtn onClick={() => removeExp(i)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <label className={lbl}>{t('profile.fields.company')}</label>
                    <input {...register(`experience.${i}.company`)} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>{t('profile.fields.role')}</label>
                    <input {...register(`experience.${i}.role`)} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>{t('profile.fields.startDate')}</label>
                    <input {...register(`experience.${i}.startDate`)} className={inp} placeholder="MM/YYYY" />
                  </div>
                  <div>
                    <label className={lbl}>{t('profile.fields.endDate')}</label>
                    <input {...register(`experience.${i}.endDate`)} className={inp} placeholder="MM/YYYY hoặc Present" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register(`experience.${i}.current`)} className="w-3 h-3" />
                      <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">{t('profile.fields.current')}</span>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className={lbl}>{t('profile.fields.description')}</label>
                    <textarea {...register(`experience.${i}.description`)} rows={4} className={`${inpBox} resize-none font-mono text-[12px] leading-relaxed mt-1`} placeholder={"- Làm gì\n- Đạt kết quả gì"} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AddBtn onClick={() => appendExp({ company: '', role: '', startDate: '', endDate: '', current: false, description: '' })} label={t('profile.actions.addExperience') || 'Thêm kinh nghiệm'} />
        </div>

        {/* ── Education ────────────────────────────────────────────────────── */}
        <div>
          <SectionHeading>{t('profile.sections.education') || 'Học vấn'}</SectionHeading>
          {eduFields.length === 0 && (
            <p className="text-xs text-zinc-400 mb-3 italic">{t('profile.empty.education')}</p>
          )}
          <div className="divide-y divide-zinc-100">
            {eduFields.map((field, i) => (
              <div key={field.id} className="py-5 first:pt-0">
                <div className="flex justify-end mb-2">
                  <RemoveBtn onClick={() => removeEdu(i)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <label className={lbl}>{t('profile.fields.school')}</label>
                    <input {...register(`education.${i}.school`)} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>{t('profile.fields.degree')}</label>
                    <input {...register(`education.${i}.degree`)} className={inp} placeholder="VD: Cử nhân" />
                  </div>
                  <div>
                    <label className={lbl}>{t('profile.fields.field')}</label>
                    <input {...register(`education.${i}.field`)} className={inp} placeholder="VD: Khoa học máy tính" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className={lbl}>{t('profile.fields.startDate')}</label>
                      <input {...register(`education.${i}.startDate`)} className={inp} placeholder="YYYY" />
                    </div>
                    <div className="flex-1">
                      <label className={lbl}>{t('profile.fields.endDate')}</label>
                      <input {...register(`education.${i}.endDate`)} className={inp} placeholder="YYYY" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={lbl}>{t('profile.fields.description')}</label>
                    <textarea {...register(`education.${i}.description`)} rows={2} className={`${inpBox} resize-none text-[12px] font-mono mt-1`} placeholder="GPA, Thành tích, Khóa học nổi bật…" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AddBtn onClick={() => appendEdu({ school: '', degree: '', field: '', startDate: '', endDate: '', description: '' })} label={t('profile.actions.addEducation') || 'Thêm học vấn'} />
        </div>

        {/* ── Skills ───────────────────────────────────────────────────────── */}
        <div>
          <SectionHeading>{t('profile.sections.skills') || 'Kỹ năng'}</SectionHeading>
          {skillFields.length === 0 && (
            <p className="text-xs text-zinc-400 mb-3 italic">{t('profile.empty.skills')}</p>
          )}
          <div className="space-y-3">
            {skillFields.map((field, i) => (
              <div key={field.id} className="flex gap-4 items-end">
                <div className="w-2/5">
                  {i === 0 && <label className={lbl}>{t('profile.fields.category')}</label>}
                  <input {...register(`skills.${i}.category`)} className={inp} placeholder="VD: Lập trình" />
                </div>
                <div className="flex-1">
                  {i === 0 && <label className={lbl}>{t('profile.fields.items')}</label>}
                  <input {...register(`skills.${i}.items`)} className={inp} placeholder="React, TypeScript…" />
                </div>
                <RemoveBtn onClick={() => removeSkill(i)} />
              </div>
            ))}
          </div>
          <AddBtn onClick={() => appendSkill({ category: '', items: '' })} label={t('profile.actions.addSkill') || 'Thêm kỹ năng'} />
        </div>

        {/* ── Languages ────────────────────────────────────────────────────── */}
        <div>
          <SectionHeading>{t('profile.sections.languages') || 'Ngoại ngữ'}</SectionHeading>
          {langFields.length === 0 && (
            <p className="text-xs text-zinc-400 mb-3 italic">{t('profile.empty.languages')}</p>
          )}
          <div className="space-y-3">
            {langFields.map((field, i) => (
              <div key={field.id} className="flex gap-4 items-end">
                <div className="w-1/2">
                  {i === 0 && <label className={lbl}>{t('profile.fields.language')}</label>}
                  <input {...register(`languages.${i}.language`)} className={inp} placeholder="VD: Tiếng Anh" />
                </div>
                <div className="flex-1">
                  {i === 0 && <label className={lbl}>{t('profile.fields.proficiency')}</label>}
                  <input {...register(`languages.${i}.proficiency`)} className={inp} placeholder="Thành thạo, Bản ngữ…" />
                </div>
                <RemoveBtn onClick={() => removeLang(i)} />
              </div>
            ))}
          </div>
          <AddBtn onClick={() => appendLang({ language: '', proficiency: '' })} label={t('profile.actions.addLanguage') || 'Thêm ngoại ngữ'} />
        </div>

      </form>

      {/* ── Sticky Save ──────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-sm px-8 py-3 flex justify-end">
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSaving}
          className="text-[10px] font-bold tracking-widest uppercase bg-zinc-900 text-white px-6 py-2.5 hover:bg-zinc-700 transition-colors disabled:opacity-40"
        >
          {isSaving ? t('profile.saving') : t('profile.save')}
        </button>
      </div>

    </div>
  );
}
