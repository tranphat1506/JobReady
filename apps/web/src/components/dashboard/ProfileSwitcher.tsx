'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Plus, MoreVertical, Copy, Star, Trash2, Edit2 } from 'lucide-react';
import { defaultProfileData } from '@/types/profile';

interface ProfileSwitcherProps {
  profiles: any[];
  activeProfileId: string;
}

export default function ProfileSwitcher({ profiles, activeProfileId }: ProfileSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { t } = useTranslation();
  
  const [isCreating, setIsCreating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const activeProfile = profiles.find(p => p.id === activeProfileId);

  const switchProfile = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', id);
    router.push(`?${params.toString()}`);
    setOpenMenuId(null);
  };

  const createProfile = async () => {
    setIsCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newProfile, error } = await supabase
      .from('master_profiles')
      .insert({
        user_id: user.id,
        name: `Profile ${profiles.length + 1}`,
        is_default: profiles.length === 0,
        content: defaultProfileData
      })
      .select()
      .single();

    if (!error && newProfile) {
      switchProfile(newProfile.id);
      router.refresh();
    }
    setIsCreating(false);
  };

  const duplicateProfile = async (profile: any) => {
    const { data: newProfile, error } = await supabase
      .from('master_profiles')
      .insert({
        user_id: profile.user_id,
        name: `${profile.name} (Copy)`,
        is_default: false,
        content: profile.content
      })
      .select()
      .single();

    if (!error && newProfile) {
      switchProfile(newProfile.id);
      router.refresh();
    }
    setOpenMenuId(null);
  };

  const setAsDefault = async (profileId: string) => {
    // 1. Set all to false
    await supabase.from('master_profiles').update({ is_default: false }).eq('user_id', profiles[0].user_id);
    // 2. Set target to true
    await supabase.from('master_profiles').update({ is_default: true }).eq('id', profileId);
    router.refresh();
    setOpenMenuId(null);
  };

  const renameProfile = async (profileId: string, currentName: string) => {
    const newName = window.prompt('Nhập tên mới cho profile:', currentName);
    if (newName && newName.trim() !== '' && newName !== currentName) {
      await supabase.from('master_profiles').update({ name: newName.trim() }).eq('id', profileId);
      router.refresh();
    }
    setOpenMenuId(null);
  };

  const deleteProfile = async (profileId: string) => {
    if (profiles.length <= 1) {
      alert('Bạn phải giữ lại ít nhất 1 profile.');
      return;
    }
    if (window.confirm('Bạn có chắc muốn xóa profile này?')) {
      await supabase.from('master_profiles').delete().eq('id', profileId);
      if (activeProfileId === profileId) {
        const remaining = profiles.find(p => p.id !== profileId);
        if (remaining) switchProfile(remaining.id);
      }
      router.refresh();
    }
    setOpenMenuId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex-1">
        <h2 className="text-sm font-bold text-zinc-900 mb-2">Hồ sơ hiện tại</h2>
        <div className="flex flex-wrap gap-2">
          {profiles.map((p) => {
            const isActive = p.id === activeProfileId;
            return (
              <div key={p.id} className="relative">
                <button
                  onClick={() => switchProfile(p.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    isActive 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  {p.is_default && <Star size={14} className={isActive ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'} />}
                  {p.name}
                  
                  <div 
                    className={`ml-1 p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity ${isActive ? 'hover:bg-primary/80' : 'hover:bg-zinc-100'}`}
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === p.id ? null : p.id); }}
                  >
                    <MoreVertical size={14} />
                  </div>
                </button>

                {openMenuId === p.id && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                    <button onClick={() => renameProfile(p.id, p.name)} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                      <Edit2 size={14} /> Đổi tên
                    </button>
                    {!p.is_default && (
                      <button onClick={() => setAsDefault(p.id)} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                        <Star size={14} /> Đặt làm mặc định
                      </button>
                    )}
                    <button onClick={() => duplicateProfile(p)} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                      <Copy size={14} /> Nhân bản (Duplicate)
                    </button>
                    {profiles.length > 1 && (
                      <button onClick={() => deleteProfile(p.id)} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                        <Trash2 size={14} /> Xóa
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          <button 
            onClick={createProfile}
            disabled={isCreating}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-dashed border-zinc-300 text-zinc-500 hover:border-primary hover:text-primary transition-colors bg-zinc-50 hover:bg-primary/5 disabled:opacity-50"
            title="Tạo hồ sơ mới"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
      
      {/* Click outside overlay to close menu */}
      {openMenuId && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}
