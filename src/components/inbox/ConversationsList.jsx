'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { useInbox } from '@/context/InboxContext';
import LoadingWrapper from '../common/loader/Wrapper';
import dayjs from 'dayjs';

const FILTERS = [
  {
    label: 'All',
    key: '',
    fn: i => i,
  },
  {
    label: 'Unread',
    key: 'unread',
    fn: i => i.unread_count > 0,
  },
];

const ConversationsList = () => {
  const {
    conversations: { isLoading: isLoadingConversations, data: conversationsData, active: activeConversation },
    actions: { setActiveConversation },
  } = useInbox();
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [searchText, setSearchText] = useState('');

  const filteredConversations = useMemo(
    () =>
      conversationsData
        .filter(activeFilter?.fn)
        .filter(conversation => conversation.name.toLowerCase().includes(searchText.toLowerCase())),
    [activeFilter?.fn, conversationsData, searchText]
  );

  return (
    <div className="flex max-h-full flex-col overflow-auto p-5">
      <div className="sticky mb-3">
        <input
          type="text"
          className="w-full rounded border border-stroke mb-3 bg-gray-2 py-2.5 pl-5 pr-10 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark-2"
          placeholder="Search..."
          onChange={e => setSearchText(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map(filter => (
            <Chip
              key={filter.label}
              label={filter.label}
              className={`cursor-pointer ${
                activeFilter.key === filter.key
                  ? '!bg-primary !text-white hover:!bg-primary hover:!text-white'
                  : ''
              }`}
              onClick={() => setActiveFilter(filter)}
            />
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="no-scrollbar max-h-full space-y-2.5 overflow-auto">
        <LoadingWrapper isLoading={isLoadingConversations}>
          {filteredConversations.map(conversation => {
            const isConversationActive = activeConversation?.id === conversation.id;
            const hasUnreadMessages = conversation.unread_count > 0;

            return (
              <div
                key={conversation.id}
                className={`flex cursor-pointer items-center rounded px-4 py-2 ${
                  isConversationActive ? 'bg-primary/80 text-white' : 'hover:bg-gray-2'
                }`}
                onClick={() => setActiveConversation(conversation)}
                style={{
                  fontWeight: !isConversationActive && hasUnreadMessages > 0 ? 'bold' : 'normal',
                }}
              >
                <div className="relative mr-3.5 h-11 w-full max-w-11 rounded-full">
                  {conversation.img ? (
                    <Image
                      src={conversation.img}
                      alt="profile"
                      className="h-full w-full object-cover object-center"
                      width={44}
                      height={44}
                    />
                  ) : (
                    <Avatar className="w-full h-full" />
                  )}
                </div>
                <div className="w-full">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-sm line-clamp-1 text-black dark:text-white">{conversation.name}</h5>
                    {conversation.time ? (
                      <p className="text-[10px]">{dayjs(conversation.time).format('hh:mm A')}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm line-clamp-1">{conversation.message}</p>
                    {hasUnreadMessages && !isConversationActive > 0 ? (
                      <div className="bg-primary w-5 h-5 p-0.5 rounded-full text-white text-[10px] flex items-center justify-center">
                        {conversation.unread_count}
                      </div>
                    ) : null}
                  </div>
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
