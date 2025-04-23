import React, { useMemo } from 'react';
import UserProfileAbout from '@/components/common/user/profile/about';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';

const ExpertProfileAbout = ({ data }) => {
  const router = useRouter();
  const onEdit = () => router.push('/portal/teacher/editProfile');

  const isNewUser = useMemo(() => {
    return (
      data?.description &&
      !data?.languages?.length &&
      !data?.tags?.length &&
      !data?.credentials?.length
    );
  }, [data]);

  if (isNewUser)
    return (
      <div className="flex justify-center items-center h-available text-center mt-20">
        <div className="flex flex-col gap-3">
          <h1 className="text-xl font-bold">Welcome to your profile!</h1>
          <p className="text-gray-500">Please complete your profile to get started.</p>
          <Button size="lg" variant="primary" onClick={onEdit}>
            Complete Profile
          </Button>
        </div>
      </div>
    );

  return <UserProfileAbout data={data} isExpertView />;
};

export default ExpertProfileAbout;
