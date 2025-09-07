'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import dayjs from 'dayjs';
import Chip from '@mui/material/Chip';
import { useInbox } from '@/context/InboxContext';
import UserAvatar from './UserAvatar';
import LoadingWrapper from '../common/loader/Wrapper';

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
  {
    label: 'Groups',
    key: 'groups',
    fn: i => i.is_group,
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
    <div className="flex max-h-full flex-col overflow-auto p-6">
      <div className="sticky mb-4">
        <input
          type="text"
          className="w-full rounded-lg border border-stroke mb-4 bg-gray-2 py-3 pl-5 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
          placeholder="Search conversations..."
          onChange={e => setSearchText(e.target.value)}
        />
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map(filter => (
            <Chip
              key={filter.label}
              label={filter.label}
              className={`cursor-pointer transition-all duration-200 ${
                activeFilter.key === filter.key
                  ? '!bg-primary !text-white hover:!bg-primary/90 shadow-sm'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveFilter(filter)}
            />
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="no-scrollbar max-h-full space-y-3 overflow-auto">
        <LoadingWrapper isLoading={isLoadingConversations}>
          {filteredConversations.map(conversation => {
            const isConversationActive = activeConversation?.id === conversation.id;
            const hasUnreadMessages = conversation.unread_count > 0;

            return (
              <div
                key={conversation.id}
                className={`flex cursor-pointer items-center rounded-lg px-4 py-3 transition-all duration-200 ${
                  isConversationActive 
                    ? 'bg-primary/80 text-white shadow-sm' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveConversation(conversation)}
                style={{
                  fontWeight: !isConversationActive && hasUnreadMessages > 0 ? '600' : 'normal',
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
                    <UserAvatar isGroup={conversation.is_group} />
                  )}
                </div>
                <div className="w-full min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h5 className="text-sm font-semibold truncate text-left">{conversation.name}</h5>
                    {hasUnreadMessages && !isConversationActive ? (
                      <div className="bg-primary w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center flex-shrink-0">
                        {conversation.unread_count}
                      </div>
                    ) : null}
                  </div>
                  <div className="mb-1">
                    <p className="text-xs line-clamp-1 text-gray-600 dark:text-gray-400">
                      {conversation.message || 'No messages yet'}
                    </p>
                  </div>
                  <div className="flex items-center justify-end">
                    {conversation.time ? (
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        {dayjs(conversation.time).format('hh:mm A')}
                      </p>
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
