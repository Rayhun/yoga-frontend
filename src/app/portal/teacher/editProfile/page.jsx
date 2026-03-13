'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useExpertContext } from '@/hooks/useExpert';
import { FiUser, FiEdit3 } from 'react-icons/fi';

// Dynamic import to prevent SSR issues
const ExpertProfileForm = dynamic(() => import('@/components/lms/expert/ExpertProfileForm'), { ssr: false });

const Page = () => {
  const [isClient, setIsClient] = useState(false);
  const { expertData } = useExpertContext();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Modern Header */}
      <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-white dark:from-emerald-950/20 dark:via-green-950/10 dark:to-gray-900 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <FiEdit3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Edit Your Profile</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Update your profile information and showcase your expertise to students
            </p>
          </div>
        </div>
      </div>
      
      {isClient && <ExpertProfileForm selected={expertData} />}
    </div>
  );
};

export default Page;
