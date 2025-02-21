'use client';
import Image from 'next/image';
import { useInbox } from '@/context/InboxContext';

const ActiveConversationHeader = () => {
  const {
    conversations: { active: activeConversation },
  } = useInbox();
  return (
    <div className="sticky flex items-center justify-between border-b border-stroke px-6 py-4.5 dark:border-strokedark">
      <div className="flex items-center">
        <div className="mr-4.5 h-13 w-full max-w-13 overflow-hidden rounded-full">
          <Image
            src={activeConversation?.img}
            alt="avatar"
            className="h-full w-full object-cover object-center"
            width={52}
            height={52}
          />
        </div>
        <div>
          <h5 className="font-medium text-black dark:text-white">{activeConversation?.name}</h5>
          <p className="text-sm">Reply to message</p>
        </div>
      </div>
    </div>
  );
};

export default ActiveConversationHeader;
