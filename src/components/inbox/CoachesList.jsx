'use client';
import { useMemo, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { FiSearch } from 'react-icons/fi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useInbox } from '@/context/InboxContext';
import { createCoachConversation } from '@/services/private/inbox/conversation';
import {
  getDiscoverCommunityCoaches,
  toggleFollowCoach,
} from '@/services/private/customer/v2/coaches';
import queryKeys from '@/utils/query-keys';
import LoadingWrapper from '../common/loader/Wrapper';
import DiscoverCoachCard from './DiscoverCoachCard';
import HomeCoachSidebarSection from './HomeCoachSidebarSection';

const CoachesList = ({ coaches, isLoading, activeSubTab, setActiveSubTab }) => {
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
  const [activeFilter, setActiveFilter] = useState(null);
  const [followOverrides, setFollowOverrides] = useState({});

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch coaches for "Find Coaches" tab from v2 community discover API
  const { data: coachesResponse, isLoading: isLoadingCoaches } = useQuery({
    queryFn: () =>
      getDiscoverCommunityCoaches({
        search: debouncedSearchText.trim() || undefined,
      }),
    queryKey: [queryKeys.communityCoachesDiscover, debouncedSearchText],
    enabled: currentSubTab === 'find-coaches',
    refetchOnMount: 'always',
  });

  const discoverPayload = coachesResponse?.data?.data;
  const filterItems = (discoverPayload?.filter_bar?.items || []).filter(
    item => item.value !== 'all' && item.id !== 'filter_all'
  );

  const discoverCoaches = useMemo(() => {
    const section =
      discoverPayload?.sections?.find(item => item.section_id === 'expert_profiles_list') ||
      discoverPayload?.sections?.[0];
    return section?.items || [];
  }, [discoverPayload]);

  const followMutation = useMutation({
    mutationFn: expertId => toggleFollowCoach(expertId),
    onSuccess: (response, expertId) => {
      const payload = response?.data?.data;
      setFollowOverrides(prev => ({
        ...prev,
        [expertId]: {
          isFollow: Boolean(payload?.is_follow),
          label: payload?.label || (payload?.is_follow ? 'Following' : '+ Follow'),
        },
      }));
      queryClient.invalidateQueries({ queryKey: [queryKeys.communityCoachesDiscover] });
    },
    onError: () => {
      toast.error('Could not update follow status. Please try again.');
    },
  });

  const getFollowState = coach => {
    const override = followOverrides[coach.id];
    if (override) return override;
    const followButton = coach.actions?.follow_button;
    return {
      isFollow: Boolean(followButton?.is_follow),
      label: followButton?.label || (followButton?.is_follow ? 'Following' : '+ Follow'),
    };
  };

  const handleDiscoverMessage = async coach => {
    const messageAction = coach.actions?.message_button;
    if (!messageAction) return;

    if (messageAction.conversation_id) {
      setActiveConversation({
        id: messageAction.conversation_id,
        name: coach.name,
        is_group: false,
        is_coach: true,
        coach_title: coach.title,
      });
      setCurrentSubTab('my-chats');
      return;
    }

    if (!messageAction.coach_user_id) return;

    try {
      const response = await createCoachConversation(messageAction.coach_user_id);
      const conversationData = response.data.data;
      setActiveConversation({
        id: conversationData.conversation_id,
        name: conversationData.name || coach.name,
        is_group: false,
        is_coach: true,
        coach_title: conversationData.coach_title || coach.title,
        coach_status: conversationData.coach_status,
      });
      queryClient.invalidateQueries({ queryKey: [queryKeys.inboxConversations] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.communityCoachesDiscover] });
      setCurrentSubTab('my-chats');
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('Could not start a conversation. Please try again.');
    }
  };

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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <HomeCoachSidebarSection />

      {/* Sub-navigation */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setCurrentSubTab('my-chats')}
          className={`flex-1 px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors ${
            currentSubTab === 'my-chats'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          My Chats
        </button>
        <button
          onClick={() => setCurrentSubTab('find-coaches')}
          className={`flex-1 px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors ${
            currentSubTab === 'find-coaches'
              ? 'text-primary border-b-2 border-primary'
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
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
            <div className="space-y-4 px-3 py-3 md:px-4 md:py-4">
              {filterItems.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {filterItems.map(filter => {
                    const isActive = activeFilter === filter.value;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() =>
                          setActiveFilter(current =>
                            current === filter.value ? null : filter.value
                          )
                        }
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          isActive
                            ? 'border-primary bg-primary text-white'
                            : 'border-stone-200 bg-white text-gray-600 hover:border-primary/30 hover:text-primary'
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {discoverCoaches.length > 0 ? (
                <div className="space-y-4">
                  {discoverCoaches.map(coach => {
                    const followState = getFollowState(coach);
                    const isPending =
                      followMutation.isPending && followMutation.variables === coach.id;

                    return (
                      <DiscoverCoachCard
                        key={coach.id}
                        coach={coach}
                        isFollowing={followState.isFollow}
                        followLabel={followState.label}
                        isFollowPending={isPending}
                        onFollow={() => followMutation.mutate(coach.id)}
                        onMessage={() => handleDiscoverMessage(coach)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 md:mb-4 md:h-16 md:w-16">
                    <FiSearch className="h-6 w-6 text-gray-400 md:h-8 md:w-8" />
                  </div>
                  <p className="px-4 text-xs text-gray-500 md:text-sm">
                    {debouncedSearchText
                      ? 'No coaches found matching your search.'
                      : 'No coaches available at the moment.'}
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

