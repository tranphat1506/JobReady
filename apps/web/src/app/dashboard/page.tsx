import DashboardClient from './DashboardClient';
import { checkMasterProfileEmpty } from '@/actions/documentManagement';

export const metadata = {
  title: 'Dashboard - JobReady',
  description: 'AI Resume Builder Dashboard',
};

export default async function DashboardPage() {
  // Server-Side Fetching to avoid client-side useEffect DB queries
  const isProfileEmpty = await checkMasterProfileEmpty();
  const hasMasterProfile = !isProfileEmpty;

  return <DashboardClient hasMasterProfile={hasMasterProfile} />;
}
