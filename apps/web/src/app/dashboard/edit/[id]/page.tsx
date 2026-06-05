import { getResumeById } from '@/actions/documentManagement';
import { redirect } from 'next/navigation';
import EditClient from './EditClient';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!id) {
    redirect('/dashboard/files');
  }

  try {
    const resumeData = await getResumeById(id);
    
    if (!resumeData) {
      redirect('/dashboard/files');
    }

    return <EditClient resumeData={resumeData} />;
  } catch (error) {
    console.error("Failed to load document:", error);
    redirect('/dashboard/files');
  }
}
