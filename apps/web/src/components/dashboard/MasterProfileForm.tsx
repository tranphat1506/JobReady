'use client';

import React, { useState, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MasterProfileSchema, MasterProfileData } from '@/types/profile';
import { createClient } from '@/utils/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { PDFParse } from 'pdf-parse';
import { Sparkles, Save, Upload, X } from 'lucide-react';
import AvatarCropperModal from './AvatarCropperModal';

if (typeof window !== 'undefined') {
  PDFParse.setWorker('https://cdn.jsdelivr.net/npm/pdf-parse@2.4.5/dist/pdf-parse/web/pdf.worker.min.mjs');
}

interface Props {
  initialData: MasterProfileData;
}

// ── Shared UI Atoms (Matched to project theme) ────────────────────────────
const inpBox = "w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900 bg-white placeholder-zinc-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm";
const lbl = "block text-xs font-semibold text-zinc-700 mb-1.5";
const cardCls = "bg-white rounded-xl border border-zinc-200 p-6 mb-6 relative shadow-sm";

const SectionHeading = ({ children, onAdd, addLabel }: { children: React.ReactNode, onAdd?: () => void, addLabel?: string }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-bold tracking-tight text-zinc-900">{children}</h2>
    {onAdd && (
      <button type="button" onClick={onAdd} className="text-xs font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm">
        {addLabel || '+ Add'}
      </button>
    )}
  </div>
);

const RemoveBtn = ({ onClick, label }: { onClick: () => void, label?: string }) => {
  const { t } = useTranslation();
  return (
    <button type="button" onClick={onClick} className="absolute top-4 right-4 text-xs font-semibold text-zinc-400 hover:text-red-500 transition-colors">
      {label || t('profile.actions.remove')}
    </button>
  );
};

// ── Pill Input Component ──────────────────────────────────────────────────
const PillInput = ({ value = [], onChange, placeholder }: { value: string[], onChange: (v: string[]) => void, placeholder?: string }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim().replace(/^,|,$/g, '');
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => onChange(value.filter(t => t !== tag));

  return (
    <div className="w-full bg-white border border-zinc-300 rounded-lg p-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all min-h-10.5 shadow-sm">
      <div className="flex flex-wrap gap-1.5 items-center">
        {value.map((tag, i) => (
          <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-xs font-medium border border-zinc-200">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 text-zinc-400 hover:text-zinc-900"><X size={12} /></button>
          </span>
        ))}
        <input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? (placeholder || "...") : "..."}
          className="flex-1 min-w-25 bg-transparent text-sm text-zinc-900 placeholder-zinc-400 border-none outline-none focus:ring-0 px-1 py-0.5"
        />
      </div>
    </div>
  );
};

// ── Nested Experience Roles Component ─────────────────────────────────────
const ExperienceRoles = ({ control, register, nestIndex }: any) => {
  const { fields, remove, append } = useFieldArray({ control, name: `experience.${nestIndex}.roles` });
  const { t } = useTranslation();
  return (
    <div className="mt-4 border-l-2 border-zinc-200 pl-4 space-y-4">
      {fields.map((item, k) => (
        <div key={item.id} className="relative bg-zinc-50/50 rounded-xl p-4 border border-zinc-200">
          {fields.length > 1 && (
            <button type="button" onClick={() => remove(k)} className="absolute top-3 right-3 text-zinc-400 hover:text-red-500 font-bold text-xs"><X size={14} /></button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={lbl}>{t('profile.fields.position')}</label>
              <input {...register(`experience.${nestIndex}.roles.${k}.title`)} className={inpBox} />
            </div>
            <div>
              <label className={lbl}>{t('profile.fields.startDate')}</label>
              <input {...register(`experience.${nestIndex}.roles.${k}.startDate`)} className={inpBox} placeholder="MM/YYYY" />
            </div>
            <div>
              <label className={lbl}>{t('profile.fields.endDate')}</label>
              <input {...register(`experience.${nestIndex}.roles.${k}.endDate`)} className={inpBox} placeholder="MM/YYYY" />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" {...register(`experience.${nestIndex}.roles.${k}.current`)} className="w-4 h-4 rounded text-primary border-zinc-300 focus:ring-primary" />
                <span className="text-xs text-zinc-700 font-semibold">{t('profile.fields.current')}</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className={lbl}>{t('profile.fields.description')}</label>
              <textarea {...register(`experience.${nestIndex}.roles.${k}.description`)} rows={3} className={`${inpBox} resize-none font-mono text-[12px]`} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => append({ title: '', startDate: '', endDate: '', description: '', current: false })} className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 mt-2 transition-colors">
        + {t('profile.fields.position')}
      </button>
    </div>
  );
};

// ── Nested Project Links Component ─────────────────────────────────────────
const ProjectLinks = ({ control, register, nestIndex }: any) => {
  const { fields, remove, append } = useFieldArray({ control, name: `projects.${nestIndex}.links` });

  return (
    <div className="md:col-span-2 mt-4 space-y-3">
      <SectionHeading onAdd={() => append({ name: '', url: '' })} addLabel="+ Link">Links</SectionHeading>
      {fields.map((field: any, k) => (
        <div key={field.id} className="flex gap-3 items-start">
          <input {...register(`projects.${nestIndex}.links.${k}.name`)} defaultValue={field.name} placeholder="Platform (e.g. GitHub, Demo)" className={`${inpBox} w-1/3! md:w-1/4!`} />
          <input {...register(`projects.${nestIndex}.links.${k}.url`)} defaultValue={field.url} placeholder="https://" className={`${inpBox} w-auto! flex-1 min-w-0`} />
          <button type="button" onClick={() => remove(k)} className="text-zinc-400 hover:text-red-500 mt-2 shrink-0"><X size={16} /></button>
        </div>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
export default function MasterProfileForm({ initialData }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('personal');

  const { register, control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<MasterProfileData>({
    resolver: zodResolver(MasterProfileSchema as any),
    defaultValues: initialData,
  });

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({ control, name: 'personal.links' });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: 'experience' });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control, name: 'projects' });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control, name: 'skills' });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control, name: 'certifications' });
  const { fields: awdFields, append: appendAwd, remove: removeAwd } = useFieldArray({ control, name: 'awards' });

  // Avatar upload
  const [avatarPreview, setAvatarPreview] = useState<string | null>((initialData?.personal as any)?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageToCrop(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    setAvatarFile(croppedFile);
    setAvatarPreview(previewUrl);
    setImageToCrop(null);
  };

  // AI Import
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
      if (importFile) {
        const buffer = new Uint8Array(await importFile.arrayBuffer());
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        await parser.destroy();
        fd.append('text', pdfData.text);
      } else {
        fd.append('text', importText);
      }

      const res = await fetch('/api/parse-profile', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.messageCode ? t(data.messageCode) : (data.error || 'Failed to parse');
        throw new Error(errorMessage);
      }

      reset(data);
      setImportText('');
      setImportFile(null);
      setShowImport(false);
      setMessage({ type: 'success', text: t('profile.importAi.success') });
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

      let finalAvatarUrl = avatarPreview;

      // Upload actual file to Supabase Storage if user selected a new image
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) {
          throw new Error(`Lỗi tải ảnh lên: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        finalAvatarUrl = urlData.publicUrl;
      }

      if (finalAvatarUrl) {
        data.personal.avatar = finalAvatarUrl;
      }

      const { data: updatedRows, error } = await supabase
        .from('master_profiles')
        .update({ content: data, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select();

      if (error) throw error;
      if (!updatedRows || updatedRows.length === 0) {
        throw new Error('Lỗi: Không thể cập nhật dữ liệu. Vui lòng kiểm tra lại RLS Policy trên Supabase (Cần cấp quyền UPDATE).');
      }

      setMessage({ type: 'success', text: t('profile.success') || 'Saved.' });
      reset(data);
      setAvatarFile(null);
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: t('profile.sections.personal') },
    { id: 'skills', label: t('profile.sections.skills') },
    { id: 'experience', label: t('profile.sections.experience') },
    { id: 'projects', label: t('profile.sections.projects') },
    { id: 'education', label: t('profile.sections.education') },
    { id: 'certifications', label: t('profile.sections.certifications') },
  ];

  return (
    <div className="font-sans flex flex-col h-full max-w-5xl">

      {/* Header & Horizontal Tabs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{t('profile.title')}</h1>
            <p className="text-sm text-zinc-500">{t('profile.subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowImport(!showImport)}
              className="flex items-center gap-2 bg-white text-zinc-700 font-semibold text-sm py-2 px-4 rounded-lg border border-zinc-300 hover:bg-zinc-50 transition-all shadow-sm"
            >
              <Sparkles size={16} className="text-primary" /> {showImport ? t('profile.actions.remove') : t('profile.importAi.title')}
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving || (!isDirty && !avatarFile)}
              className="flex items-center gap-2 bg-primary text-white font-semibold text-sm py-2 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
            >
              <Save size={16} /> {isSaving ? t('profile.saving') : t('profile.save')}
            </button>
          </div>
        </div>

        {/* AI Import Panel */}
        {showImport && (
          <div className="mb-6 bg-zinc-50 rounded-sm p-6 border border-zinc-200 border-l-4 border-l-zinc-900">
            <h3 className="font-bold tracking-widest uppercase text-[11px] text-zinc-900 mb-4">{t('profile.importAi.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="cursor-pointer border border-dashed border-zinc-300 bg-white rounded-sm p-6 flex flex-col items-center justify-center text-center hover:bg-zinc-50 transition-all">
                {importFile ? (
                  <>
                    <span className="text-sm text-zinc-900 font-medium truncate w-full px-2">{importFile.name}</span>
                    <button type="button" onClick={(e) => { e.preventDefault(); setImportFile(null); }} className="text-[10px] text-red-500 mt-2 uppercase font-bold">{t('profile.actions.remove')}</button>
                  </>
                ) : (
                  <>
                    <Upload className="text-zinc-400 mb-2" size={24} />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">{t('profile.importAi.uploadPdf')}</span>
                  </>
                )}
                <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && setImportFile(e.target.files[0])} />
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={t('profile.importAi.pastePlaceholder')}
                className="w-full bg-white border border-zinc-300 rounded-sm p-4 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-all resize-none min-h-30"
              />
            </div>
            <button type="button" onClick={handleParseAI} disabled={(!importFile && !importText) || isParsing} className="bg-zinc-900 text-white font-bold uppercase tracking-widest text-[11px] px-6 py-2 rounded-sm hover:bg-zinc-800 transition-colors disabled:opacity-50">
              {isParsing ? t('profile.importAi.analyzing') : t('profile.importAi.analyzeBtn')}
            </button>
          </div>
        )}

        {/* Toast */}
        {message && (
          <div className={`mb-6 p-4 rounded-sm text-sm font-medium border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="flex overflow-x-auto border-b border-zinc-200 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1">

        {/* TAB: PERSONAL */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <div className={cardCls}>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <div onClick={() => avatarInputRef.current?.click()} className="w-24 h-36 rounded-sm border border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center cursor-pointer hover:border-zinc-500 transition-colors overflow-hidden">
                    {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-[10px] text-center uppercase tracking-widest text-zinc-400 font-bold leading-relaxed">Upload<br />4x6</span>}
                  </div>
                  {avatarPreview && <button type="button" onClick={() => { setAvatarPreview(null); setAvatarFile(null); }} className="text-[10px] uppercase tracking-widest text-red-500 font-bold">{t('profile.actions.remove')}</button>}
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={lbl}>{t('profile.fields.fullName')}</label>
                    <input {...register('personal.fullName')} className={inpBox} />
                  </div>
                  <div><label className={lbl}>{t('profile.fields.jobTitle')}</label><input {...register('personal.jobTitle')} className={inpBox} /></div>
                  <div><label className={lbl}>{t('profile.fields.email')}</label><input type="email" {...register('personal.email')} className={inpBox} /></div>
                  <div><label className={lbl}>{t('profile.fields.phone')}</label><input {...register('personal.phone')} className={inpBox} /></div>
                  <div><label className={lbl}>{t('profile.fields.location')}</label><input {...register('personal.location')} className={inpBox} /></div>
                  <div className="md:col-span-2"><label className={lbl}>{t('profile.fields.portfolio')}</label><input {...register('personal.portfolio')} className={inpBox} /></div>

                  <div className="md:col-span-2 mt-4">
                    <SectionHeading onAdd={() => appendLink({ name: '', url: '' })} addLabel="+ Link">Links</SectionHeading>
                    <div className="space-y-3">
                      {linkFields.map((field: any, i) => (
                        <div key={field.id} className="flex gap-3 items-start">
                          <input {...register(`personal.links.${i}.name`)} defaultValue={field.name} placeholder="Platform (e.g. GitHub)" className={`${inpBox} w-1/3! md:w-1/4!`} />
                          <input {...register(`personal.links.${i}.url`)} defaultValue={field.url} placeholder="https://" className={`${inpBox} w-auto! flex-1 min-w-0`} />
                          <button type="button" onClick={() => removeLink(i)} className="text-zinc-400 hover:text-red-500 mt-2 shrink-0"><X size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={cardCls}>
              <label className={lbl}>{t('profile.fields.careerGoals')}</label>
              <textarea {...register('careerGoals')} rows={4} className={`${inpBox} resize-none font-mono text-sm leading-relaxed`} />
            </div>
          </div>
        )}

        {/* TAB: SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <SectionHeading onAdd={() => appendSkill({ name: '' })} addLabel={t('profile.actions.addSkill')}>{t('profile.sections.skills')}</SectionHeading>
            <div className={cardCls}>
              <p className="text-sm text-zinc-500 mb-6">{t('profile.fields.items')}</p>
              <div className="flex flex-wrap gap-2">
                {skillFields.map((field, i) => (
                  <div key={field.id} className="flex items-center bg-zinc-50 border border-zinc-300 rounded-lg pr-1">
                    <input {...register(`skills.${i}.name`)} className="px-3 py-2 bg-transparent text-sm font-medium text-zinc-800 outline-none w-32 md:w-auto rounded-l-lg focus:ring-2 focus:ring-primary/20 transition-all" placeholder="..." />
                    <button type="button" onClick={() => removeSkill(i)} className="text-zinc-400 hover:text-red-500 p-2"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <SectionHeading onAdd={() => appendExp({ companyName: '', roles: [{ title: '', startDate: '', endDate: '' }] })} addLabel={t('profile.actions.addExperience')}>{t('profile.sections.experience')}</SectionHeading>
            {expFields.map((field, i) => (
              <div key={field.id} className={cardCls}>
                <RemoveBtn onClick={() => removeExp(i)} />
                <div className="mb-4">
                  <label className={lbl}>{t('profile.fields.company')}</label>
                  <input {...register(`experience.${i}.companyName`)} className="text-lg font-bold bg-transparent border-b border-transparent focus:border-zinc-400 focus:outline-none w-full pb-1" />
                </div>

                <ExperienceRoles control={control} register={register} nestIndex={i} />

                <div className="mt-5 pt-5 border-t border-zinc-200">
                  <label className={lbl}>{t('profile.fields.items')}</label>
                  <Controller control={control} name={`experience.${i}.appliedSkills` as const} render={({ field: { onChange, value } }) => <PillInput value={(value as string[]) || []} onChange={onChange} />} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <SectionHeading onAdd={() => appendProj({ name: '' })} addLabel={t('profile.actions.addProject')}>{t('profile.sections.projects')}</SectionHeading>
            {projFields.map((field, i) => (
              <div key={field.id} className={cardCls}>
                <RemoveBtn onClick={() => removeProj(i)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div><label className={lbl}>{t('profile.fields.projectName')}</label><input {...register(`projects.${i}.name`)} className={inpBox} /></div>
                  <div><label className={lbl}>{t('profile.fields.role')}</label><input {...register(`projects.${i}.role`)} className={inpBox} /></div>
                  <div className="md:col-span-2"><label className={lbl}>{t('profile.fields.description')}</label><textarea {...register(`projects.${i}.description`)} rows={3} className={`${inpBox} resize-none font-mono text-[12px]`} /></div>
                  <ProjectLinks control={control} register={register} nestIndex={i} />
                </div>

                <div className="pt-4 border-t border-zinc-200">
                  <label className={lbl}>{t('profile.fields.items')}</label>
                  <Controller control={control} name={`projects.${i}.appliedSkills` as const} render={({ field: { onChange, value } }) => <PillInput value={(value as string[]) || []} onChange={onChange} />} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: EDUCATION */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <SectionHeading onAdd={() => appendEdu({ institution: '', degree: '' })} addLabel={t('profile.actions.addEducation')}>{t('profile.sections.education')}</SectionHeading>
            {eduFields.map((field, i) => (
              <div key={field.id} className={cardCls}>
                <RemoveBtn onClick={() => removeEdu(i)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div><label className={lbl}>{t('profile.fields.institution')}</label><input {...register(`education.${i}.institution`)} className={inpBox} /></div>
                  <div><label className={lbl}>{t('profile.fields.degree')}</label><input {...register(`education.${i}.degree`)} className={inpBox} /></div>
                  <div><label className={lbl}>{t('profile.fields.startDate')}</label><input {...register(`education.${i}.startDate`)} className={inpBox} /></div>
                  <div><label className={lbl}>{t('profile.fields.endDate')}</label><input {...register(`education.${i}.endDate`)} className={inpBox} /></div>
                  <div className="md:col-span-2">
                    <label className={lbl}>{t('profile.fields.description')}</label>
                    <Controller 
                      control={control} 
                      name={`education.${i}.description` as const} 
                      render={({ field: { onChange, value } }) => (
                        <textarea 
                          rows={2} 
                          className={`${inpBox} resize-none`} 
                          value={Array.isArray(value) ? value.join('\n') : (value || '')}
                          onChange={e => onChange(e.target.value.split('\n'))}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: CERTIFICATIONS & OTHERS */}
        {activeTab === 'certifications' && (
          <div className="space-y-8">

            <div>
              <SectionHeading onAdd={() => appendCert({ name: '' })} addLabel={t('profile.actions.addCertification')}>{t('profile.sections.certifications')}</SectionHeading>
              {certFields.map((field, i) => (
                <div key={field.id} className={cardCls}>
                  <RemoveBtn onClick={() => removeCert(i)} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div><label className={lbl}>{t('profile.fields.certName')}</label><input {...register(`certifications.${i}.name`)} className={inpBox} /></div>
                    <div><label className={lbl}>{t('profile.fields.issuer')}</label><input {...register(`certifications.${i}.issuer`)} className={inpBox} /></div>
                    <div><label className={lbl}>{t('profile.fields.date')}</label><input {...register(`certifications.${i}.date`)} className={inpBox} /></div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <SectionHeading onAdd={() => appendAwd({ title: '' })} addLabel={t('profile.actions.addAward')}>{t('profile.sections.awards')}</SectionHeading>
              {awdFields.map((field, i) => (
                <div key={field.id} className={cardCls}>
                  <RemoveBtn onClick={() => removeAwd(i)} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div><label className={lbl}>{t('profile.fields.awardTitle')}</label><input {...register(`awards.${i}.title`)} className={inpBox} /></div>
                    <div><label className={lbl}>{t('profile.fields.issuer')}</label><input {...register(`awards.${i}.issuer`)} className={inpBox} /></div>
                    <div><label className={lbl}>{t('profile.fields.date')}</label><input {...register(`awards.${i}.date`)} className={inpBox} /></div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </form>

      {imageToCrop && (
        <AvatarCropperModal
          imageSrc={imageToCrop}
          onComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
        />
      )}
    </div>
  );
}
