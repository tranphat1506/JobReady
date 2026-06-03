import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MasterProfileForm from '@/components/dashboard/MasterProfileForm';
import { defaultProfileData } from '@/types/profile';

export const metadata = {
  title: 'Master Profile | JobReady',
};

export default async function ProfilePage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch or create master profile
  let { data: profile } = await supabase
    .from('master_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    // If not exists, insert a blank one
    const { data: newProfile } = await supabase
      .from('master_profiles')
      .insert({
        user_id: user.id,
        content: defaultProfileData,
      })
      .select()
      .single();
    
    profile = newProfile;
  }

  // Fallback to default if content is empty or malformed
  const initialData = profile?.content || defaultProfileData;

  return (
    <div className="w-full">
      <MasterProfileForm initialData={initialData} />
    </div>
  );
}
