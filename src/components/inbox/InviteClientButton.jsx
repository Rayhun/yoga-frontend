'use client';

import { FiUserPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import useAuthContext from '@/hooks/useAuthContext';

const VARIANT_CLASSES = {
  outline:
    'inline-flex items-center gap-1.5 rounded-lg border border-green-600 bg-white px-2.5 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 md:px-3 md:text-sm',
  navbar:
    'inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60',
};

const InviteClientButton = ({ variant = 'outline', className = '', label = 'Invite Client' }) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const hasChatGroup = Boolean(user?.profile?.is_chat_group);

  const handleClick = () => {
    if (hasChatGroup) {
      router.push('/portal/teacher/community');
    } else {
      router.push('/portal/teacher/community/create');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${VARIANT_CLASSES[variant] || VARIANT_CLASSES.outline} ${className}`.trim()}
    >
      <FiUserPlus className={variant === 'navbar' ? 'h-4 w-4' : 'h-3.5 w-3.5 md:h-4 md:w-4'} />
      <span>{label}</span>
    </button>
  );
};

export default InviteClientButton;
