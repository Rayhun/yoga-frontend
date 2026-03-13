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
    <div className="flex max-h-full flex-col overflow-auto">
      {/* Search Bar - WhatsApp Style */}
      <div className="sticky bg-white border-b border-gray-200 p-3">
        <div className="relative">
          <input
            type="text"
            className="w-full rounded-lg bg-gray-100 py-2 pl-10 pr-4 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-gray-300 transition-all duration-200"
            placeholder="Search or start new chat"
            onChange={e => setSearchText(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter Tabs - WhatsApp Style */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {FILTERS.map(filter => (
            <button
              key={filter.label}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                activeFilter.key === filter.key
                  ? 'bg-gray-200 text-gray-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List - WhatsApp Style */}
      <div className="no-scrollbar max-h-full overflow-auto">
        <LoadingWrapper isLoading={isLoadingConversations}>
          {filteredConversations.map((conversation) => {
            const isConversationActive = activeConversation?.id === conversation.id;
            const hasUnreadMessages = conversation.unread_count > 0;

            return (
              <div
                key={conversation.id}
                className={`flex cursor-pointer items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200 ${
                  isConversationActive ? 'bg-gray-100' : ''
                }`}
                onClick={() => setActiveConversation(conversation)}
              >
                <div className="relative mr-3 h-12 w-12 rounded-full overflow-hidden">
                  {conversation.img ? (
                    <Image
                      src={conversation.img}
                      alt="profile"
                      className="h-full w-full object-cover object-center"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <UserAvatar isGroup={conversation.is_group} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className={`text-sm font-medium truncate ${
                      hasUnreadMessages ? 'font-semibold' : 'font-normal'
                    } text-gray-900`}>
                      {conversation.name}
                    </h5>
                    <div className="flex items-center space-x-2">
                      {conversation.time && (
                        <p className="text-xs text-gray-500">
                          {dayjs(conversation.time).format('DD/MM/YYYY')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate flex-1">
                      {conversation.message || 'No messages yet'}
                    </p>
                    {hasUnreadMessages && (
                      <div className="ml-2">
                        <div className="bg-green-500 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-medium">
                          {conversation.unread_count}
                        </div>
                      </div>
                    )}
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
