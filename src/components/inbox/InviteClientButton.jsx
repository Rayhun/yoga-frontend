'use client';

import { useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Spinner from '@/components/common/loader/Spinner';
import InviteClientModal from '@/components/inbox/InviteClientModal';
import { getExpertCommunityData } from '@/services/private/expert/community';
import queryKeys from '@/utils/query-keys';

const VARIANT_CLASSES = {
  outline:
    'inline-flex items-center gap-1.5 rounded-lg border border-green-600 bg-white px-2.5 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 md:px-3 md:text-sm',
  navbar:
    'inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60',
};

const InviteClientButton = ({ variant = 'outline', className = '', label = 'Invite Client' }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await queryClient.fetchQuery({
        queryKey: [queryKeys.expertCommunityData],
        queryFn: getExpertCommunityData,
      });
      const communityData = response?.data?.data;

      if (communityData?.has_community_circle) {
        router.push('/portal/teacher/community');
      } else {
        setIsModalOpen(true);
      }
    } catch {
      toast.error('Unable to load community data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={`${VARIANT_CLASSES[variant] || VARIANT_CLASSES.outline} ${className}`.trim()}
      >
        {isLoading ? (
          <Spinner size={variant === 'navbar' ? 16 : 14} />
        ) : (
          <FiUserPlus className={variant === 'navbar' ? 'h-4 w-4' : 'h-3.5 w-3.5 md:h-4 md:w-4'} />
        )}
        <span>{label}</span>
      </button>

      <InviteClientModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default InviteClientButton;
