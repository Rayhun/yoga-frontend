import React, { useMemo } from 'react';
import UserProfileAbout from '@/components/common/user/profile/about';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';

const ExpertProfileAbout = ({ data }) => {
  const router = useRouter();
  const onEdit = () => router.push('/portal/teacher/editProfile');

  const isNewUser = useMemo(() => {
    return (
      !data?.description &&
      !data?.languages?.length &&
      !data?.coaching_areas?.length &&
      !data?.certifications?.length
    );
  }, [data]);

  if (isNewUser)
    return (
      <div className="min-h-[calc(100vh-28rem)] bg-white rounded-lg shadow-md flex justify-center items-center text-center">
        <div className="flex flex-col gap-3 border border-2 border-gray-200 p-20 rounded-2xl">
          <h1 className="text-xl font-bold">Welcome to your profile!</h1>
          <p className="text-gray-500">Please complete your profile to get started.</p>
          <Button size="lg" variant="primary" onClick={onEdit}>
            Create Your Profile
          </Button>
        </div>
      </div>
    );

  return <UserProfileAbout data={data} isExpertView />;
};

export default ExpertProfileAbout;
