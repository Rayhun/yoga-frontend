'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiInfo } from 'react-icons/fi';
import { useInbox } from '@/context/InboxContext';
import UserAvatar from './UserAvatar';

const ActiveConversationHeader = ({ onBack }) => {
  const router = useRouter();
  const {
    conversations: { active: activeConversation },
    connection: { isConnected: isSocketConnected },
  } = useInbox();

  const handleViewDetail = () => {
    if (activeConversation?.detail_url) {
      router.push(activeConversation.detail_url);
    }
  };

  return (
    <div className="flex h-16 items-center justify-between border-b border-gray-300 bg-white px-3 py-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 md:hidden"
            aria-label="Back to conversations"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
        ) : null}
        <div className="mr-3 h-10 w-10 shrink-0 overflow-hidden rounded-full">
          {activeConversation.img ? (
            <Image
              src={activeConversation.img}
              alt="profile"
              className="h-full w-full object-cover object-center"
              width={40}
              height={40}
            />
          ) : (
            <UserAvatar isGroup={activeConversation?.is_group} />
          )}
        </div>
        <div className="min-w-0">
          <h5 className="truncate text-base font-medium text-gray-900">{activeConversation?.name}</h5>
          <p className="text-xs text-gray-500">
            {isSocketConnected ? 'Online' : 'Connecting...'}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center space-x-2">
        <div
          className={`h-2 w-2 rounded-full ${
            isSocketConnected ? 'bg-green-500' : 'bg-orange-500'
          }`}
        ></div>
        {activeConversation?.can_view_detail && activeConversation?.detail_url ? (
          <button
            type="button"
            onClick={handleViewDetail}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="View circle details"
          >
            <FiInfo className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ActiveConversationHeader;
