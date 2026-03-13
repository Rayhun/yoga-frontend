'use client';
import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useInbox } from '@/context/InboxContext';
import { getAvailableCoaches, createCoachConversation } from '@/services/private/inbox/conversation';
import queryKeys from '@/utils/query-keys';
import UserAvatar from './UserAvatar';
import LoadingWrapper from '../common/loader/Wrapper';
import Spinner from '../common/loader/Spinner';

const CoachesList = ({ coaches, isLoading, activeSubTab, setActiveSubTab }) => {
  const router = useRouter();
  const {
    conversations: { active: activeConversation },
    actions: { setActiveConversation },
  } = useInbox();
  const queryClient = useQueryClient();
  // Use prop if provided, otherwise use local state
  const [localSubTab, setLocalSubTab] = useState('my-chats');
  const currentSubTab = activeSubTab !== undefined ? activeSubTab : localSubTab;
  const setCurrentSubTab = setActiveSubTab || setLocalSubTab;
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch available coaches for "Find Coaches" tab
  const { data: coachesResponse, isLoading: isLoadingCoaches } = useQuery({
    queryFn: () => getAvailableCoaches({ search: debouncedSearchText.trim() || undefined }),
    queryKey: [queryKeys.availableCoaches, debouncedSearchText],
    enabled: currentSubTab === 'find-coaches',
    refetchOnMount: 'always',
  });

  const availableCoaches = coachesResponse?.data?.data || [];

  // Filter coaches with unread messages
  const unreadCoaches = useMemo(
    () => coaches.filter(coach => coach.unread_count > 0),
    [coaches]
  );

  const totalUnreadCount = useMemo(
    () => unreadCoaches.reduce((sum, coach) => sum + coach.unread_count, 0),
    [unreadCoaches]
  );

  // Filter coaches by search
  const filteredCoaches = useMemo(
    () =>
      coaches.filter(coach =>
        coach.name.toLowerCase().includes(searchText.toLowerCase())
      ),
    [coaches, searchText]
  );

  // Format time ago
  const formatTimeAgo = (time) => {
    if (!time) return '';
    const now = dayjs();
    const messageTime = dayjs(time);
    const diffMinutes = now.diff(messageTime, 'minute');
    const diffHours = now.diff(messageTime, 'hour');
    const diffDays = now.diff(messageTime, 'day');

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageTime.format('MMM DD');
  };

  // Get initials for avatar
  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* My Coaches Header */}
      <div className="px-3 md:px-4 py-3 md:py-4 bg-white border-b border-gray-200">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">My Coaches</h2>
        {/* <button
          onClick={() => setCurrentSubTab('find-coaches')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 md:py-2.5 px-3 md:px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
        >
          <FiPlus className="w-4 h-4 md:w-5 md:h-5" />
          <span>Find a Coach</span>
        </button> */}
      </div>

      {/* Sub-navigation */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setCurrentSubTab('my-chats')}
          className={`flex-1 px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors ${
            currentSubTab === 'my-chats'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          My Chats
        </button>
        <button
          onClick={() => setCurrentSubTab('find-coaches')}
          className={`flex-1 px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors ${
            currentSubTab === 'find-coaches'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Find Coaches
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 md:px-4 py-2 md:py-3 bg-white border-b border-gray-200">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
          <input
            type="text"
            className="w-full rounded-lg bg-gray-100 py-1.5 md:py-2 pl-8 md:pl-10 pr-3 md:pr-4 text-xs md:text-sm outline-none focus:bg-white focus:ring-1 focus:ring-gray-300 transition-all duration-200"
            placeholder="Search coaches..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {currentSubTab === 'my-chats' ? (
          <LoadingWrapper isLoading={isLoading}>
            {/* Unread Messages Section */}
            {totalUnreadCount > 0 && (
              <div className="px-3 md:px-4 py-2 bg-green-50 border-b border-green-100">
                <h3 className="text-xs md:text-sm font-semibold text-green-700">
                  Unread Messages ({totalUnreadCount})
                </h3>
              </div>
            )}

            {/* Coaches List */}
            {filteredCoaches.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredCoaches.map((coach) => {
                  const isCoachActive = activeConversation?.id === coach.id;
                  const hasUnreadMessages = coach.unread_count > 0;

                  return (
                    <div
                      key={coach.id}
                      className={`flex cursor-pointer items-center px-3 md:px-4 py-2 md:py-3 hover:bg-gray-50 transition-colors duration-200 ${
                        isCoachActive ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setActiveConversation(coach)}
                    >
                      <div className="relative mr-2 md:mr-3 flex-shrink-0">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs md:text-sm">
                          {getInitials(coach.name)}
                        </div>
                        {coach.coach_status === 'Available' && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex-1 min-w-0">
                            <h5 className={`text-xs md:text-sm font-medium truncate ${
                              hasUnreadMessages ? 'font-semibold' : 'font-normal'
                            } text-gray-900`}>
                              {coach.name}
                            </h5>
                            <p className="text-xs text-green-600 truncate">
                              {coach?.specialization && (() => {
                                const raw = coach.specialization;
                                const str = Array.isArray(raw) ? raw.join(' ') : String(raw ?? '');
                                const words = str.trim().split(/\s+/).filter(Boolean);
                                const firstTwo = words.slice(0, 2).join(' ');
                                const total = Array.isArray(coach.specialization) ? coach.specialization.length : (words.length || 1);
                                const suffix = total > 1 ? ` (+${total - 1})` : null;
                                if (!firstTwo) return 'Coach';
                                return <>{firstTwo}{suffix}</>;
                              })() || 'Coach'}
                            </p>
                          </div>
                          {hasUnreadMessages && (
                            <div className="ml-2 flex-shrink-0">
                              <div className="bg-green-500 w-4 h-4 md:w-5 md:h-5 rounded-full text-white text-xs flex items-center justify-center font-medium">
                                {coach.unread_count}
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate mb-1">
                          {coach.message || 'No messages yet'}
                        </p>
                        {/* <div className="flex items-center gap-1 md:gap-2 text-xs text-gray-500">
                          {coach.coach_status && (
                            <>
                              <div className={`w-2 h-2 rounded-full ${
                                coach.coach_status === 'Available' ? 'bg-green-500' : 'bg-gray-400'
                              }`}></div>
                              <span>{coach.coach_status}</span>
                            </>
                          )}
                          {coach.time && (
                            <>
                              {coach.coach_status && <span>•</span>}
                              <span>{formatTimeAgo(coach.time)}</span>
                            </>
                          )}
                        </div> */}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiSearch className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  {searchText ? 'No coaches found matching your search.' : 'No coach chats yet. Find a coach to get started!'}
                </p>
              </div>
            )}
          </LoadingWrapper>
        ) : (
          <LoadingWrapper isLoading={isLoadingCoaches}>
            <div className="px-3 md:px-4 py-3 md:py-4">
              <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3">Find a Coach</h3>
              {availableCoaches.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {availableCoaches.map((coach) => (
                    <div
                      key={coach.expert_id}
                      className="flex items-start gap-2 md:gap-3 p-2 md:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs md:text-sm">
                          {getInitials(coach.name)}
                        </div>
                        {coach.status === 'Available' && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs md:text-sm font-semibold text-gray-900">{coach.name}</h4>
                        <div className="mb-1">
                          {coach?.specialization && (() => {
                            const raw = coach.specialization;
                            const list = Array.isArray(raw)
                              ? raw.filter(Boolean)
                              : String(raw ?? '')
                                  .split(',')
                                  .map(item => item.trim())
                                  .filter(Boolean);

                            if (!list.length) return <span className="text-xs text-green-600">Coach</span>;

                            const primary = list[0];
                            const secondary = list[1] || null;
                            const extraCount = list.length > 2 ? list.length - 2 : 0;

                            return (
                              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs text-gray-700">
                                <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] text-green-600">
                                  ★
                                </span>
                                <span>
                                  <span className="font-medium">{primary}</span>
                                  {secondary && <span className="text-gray-500"> ({secondary})</span>}
                                </span>
                                {extraCount > 0 && (
                                  <span className="ml-2 inline-flex flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                                    +{extraCount}
                                  </span>
                                )}
                              </div>
                            );
                          })() || <span className="text-xs text-green-600">Coach</span>}
                        </div>
                        {/* {coach.description && (
                          <div
                            className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed [&_p]:mb-0 [&_p]:last:mb-0 [&_strong]:font-semibold [&_a]:text-green-600 [&_a]:underline [&_a]:break-all"
                            dangerouslySetInnerHTML={{ __html: coach.description }}
                          />
                        )} */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <button
                            onClick={async () => {
                              if (coach.has_existing_chat && coach.conversation_id) {
                                setActiveConversation({
                                  id: coach.conversation_id,
                                  name: coach.name,
                                  is_group: false,
                                  is_coach: true,
                                  coach_title: coach.title,
                                  coach_status: coach.status,
                                });
                              } else {
                                try {
                                  const response = await createCoachConversation(coach.user_id);
                                  const conversationData = response.data.data;
                                  setActiveConversation({
                                    id: conversationData.conversation_id,
                                    name: conversationData.name,
                                    is_group: false,
                                    is_coach: true,
                                    coach_title: conversationData.coach_title,
                                    coach_status: conversationData.coach_status,
                                  });
                                  // Refresh conversations list
                                  queryClient.invalidateQueries([queryKeys.inboxConversations]);
                                } catch (error) {
                                  console.error('Failed to create conversation:', error);
                                }
                              }
                            }}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            {coach.has_existing_chat ? 'Open Chat' : 'Send Message'}
                          </button>
                          <button
                            onClick={() => {
                              if (coach.expert_id) {
                                router.push(`/portal/customer/lms/expert/${coach.expert_id}/profile?active_tab=about`);
                              }
                            }}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
                    <FiSearch className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 px-4">
                    {debouncedSearchText ? 'No coaches found matching your search.' : 'No coaches available at the moment.'}
                  </p>
                </div>
              )}
            </div>
          </LoadingWrapper>
        )}
      </div>
    </div>
  );
};

export default CoachesList;

