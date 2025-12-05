'use client';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/page';
import dynamic from 'next/dynamic';
import { useExpertContext } from '@/hooks/useExpert';

// Dynamic import to prevent SSR issues
const ExpertProfileForm = dynamic(() => import('@/components/lms/expert/ExpertProfileForm'), { ssr: false });

const Page = () => {
  const [isClient, setIsClient] = useState(false);
  const { expertData } = useExpertContext();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      <PageHeader title="Show the World Your Expertise!" />
      {isClient && <ExpertProfileForm selected={expertData} />}
    </div>
  );
};

export default Page;
