import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MasterProfileForm from '@/components/dashboard/MasterProfileForm';
import ProfileSwitcher from '@/components/dashboard/ProfileSwitcher';
import { defaultProfileData } from '@/types/profile';

export const metadata = {
  title: 'Master Profile | JobReady',
};

export default async function ProfilePage({ searchParams }: { searchParams: any }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const params = await Promise.resolve(searchParams);
  const targetId = params?.id;

  // Fetch all profiles
  let { data: profiles } = await supabase
    .from('master_profiles')
    .select('id, name, is_default, user_id, content')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (!profiles || profiles.length === 0) {
    // If not exists, insert a blank one
    const { data: newProfile } = await supabase
      .from('master_profiles')
      .insert({
        user_id: user.id,
        name: 'Default Profile',
        is_default: true,
        content: defaultProfileData
      })
      .select()
      .single();
    
    profiles = newProfile ? [newProfile] : [];
  }

  // Determine active profile
  let activeProfile = null;
  if (targetId) {
    activeProfile = profiles?.find(p => p.id === targetId);
  }
  if (!activeProfile) {
    activeProfile = profiles?.find(p => p.is_default) || profiles?.[0];
  }

  const initialData = activeProfile?.content as any || defaultProfileData;

  return (
    <div className="w-full">
      <ProfileSwitcher 
        profiles={profiles || []} 
        activeProfileId={activeProfile?.id}
      />
      
      {activeProfile && (
        // Add a key to force re-render when switching profiles, 
        // so useForm gets reset with the new initialData
        <div key={activeProfile.id}>
          <MasterProfileForm 
            initialData={initialData} 
            profileId={activeProfile.id} 
          />
        </div>
      )}
    </div>
  );
}
