'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useInbox } from '@/context/InboxContext';
import LoadingWrapper from '../common/loader/Wrapper';

const ConversationsList = () => {
  const {
    conversations: { isLoading: isLoadingConversations, data: conversationsData, active: activeConversation },
    actions: { setActiveConversation },
  } = useInbox();
  const [searchText, setSearchText] = useState('');

  const filteredConversations = useMemo(
    () => conversationsData.filter(conversation => conversation.name.toLowerCase().includes(searchText)),
    [conversationsData, searchText]
  );

  return (
    <div className="flex max-h-full flex-col overflow-auto p-5">
      <div className="sticky mb-7">
        <input
          type="text"
          className="w-full rounded border border-stroke bg-gray-2 py-2.5 pl-5 pr-10 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark-2"
          placeholder="Search..."
          onChange={e => setSearchText(e.target.value)}
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.25 3C5.3505 3 3 5.3505 3 8.25C3 11.1495 5.3505 13.5 8.25 13.5C11.1495 13.5 13.5 11.1495 13.5 8.25C13.5 5.3505 11.1495 3 8.25 3ZM1.5 8.25C1.5 4.52208 4.52208 1.5 8.25 1.5C11.9779 1.5 15 4.52208 15 8.25C15 11.9779 11.9779 15 8.25 15C4.52208 15 1.5 11.9779 1.5 8.25Z"
              fill="#637381"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.957 11.958C12.2499 11.6651 12.7247 11.6651 13.0176 11.958L16.2801 15.2205C16.573 15.5133 16.573 15.9882 16.2801 16.2811C15.9872 16.574 15.5124 16.574 15.2195 16.2811L11.957 13.0186C11.6641 12.7257 11.6641 12.2508 11.957 11.958Z"
              fill="#637381"
            />
          </svg>
        </button>
      </div>

      {/* Conversations List */}
      <div className="no-scrollbar max-h-full space-y-2.5 overflow-auto">
        <LoadingWrapper isLoading={isLoadingConversations}>
          {filteredConversations.map(conversation => {
            return (
              <div
                key={conversation.id}
                className={`flex cursor-pointer items-center rounded px-4 py-2 ${
                  activeConversation?.id === conversation.id ? 'bg-primary/80 text-white' : 'hover:bg-gray-2'
                }`}
                onClick={() => setActiveConversation(conversation)}
              >
                <div className="relative mr-3.5 h-11 w-full max-w-11 rounded-full">
                  <Image
                    src={conversation.img}
                    alt="profile"
                    className="h-full w-full object-cover object-center"
                    width={44}
                    height={44}
                  />
                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-gray-2 bg-success"></span>
                </div>
                <div className="w-full">
                  <h5 className="text-sm font-medium text-black dark:text-white">{conversation.name}</h5>
                  <p className="text-sm line-clamp-1">{conversation.message}</p>
                </div>
              </div>
            );
          })}
        </LoadingWrapper>
      </div>
    </div>
  );
};

export default ConversationsList;
