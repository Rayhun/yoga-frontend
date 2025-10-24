'use client';
import Image from 'next/image';
import { useInbox } from '@/context/InboxContext';
import UserAvatar from './UserAvatar';

const ActiveConversationHeader = () => {
  const {
    conversations: { active: activeConversation },
    connection: { isConnected: isSocketConnected, status: connectionStatus },
  } = useInbox();

  return (
    <div className="h-16 flex items-center justify-between border-b border-gray-300 px-4 py-3 bg-white">
      <div className="flex items-center min-w-[200px]">
        <div className="mr-3 h-10 w-10 overflow-hidden rounded-full">
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
        <div>
          <h5 className="text-base font-medium text-gray-900">{activeConversation?.name}</h5>
          <p className="text-xs text-gray-500">
            {isSocketConnected ? 'Online' : 'Connecting...'}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          isSocketConnected ? 'bg-green-500' : 'bg-orange-500'
        }`}></div>
        {activeConversation?.is_group && (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default ActiveConversationHeader;
