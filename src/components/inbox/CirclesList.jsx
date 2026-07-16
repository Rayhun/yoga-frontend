'use client';
import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import dayjs from 'dayjs';
import { FiSearch } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useInbox } from '@/context/InboxContext';
import { explorePublicChats, joinPublicChat } from '@/services/public/chat';
import queryKeys from '@/utils/query-keys';
import UserAvatar from './UserAvatar';
import LoadingWrapper from '../common/loader/Wrapper';
import Spinner from '../common/loader/Spinner';
import WelcomeMessage from './WelcomeMessage';
import ExploreGroupsModal from './ExploreGroupsModal';
import InviteClientButton from './InviteClientButton';

const CirclesList = ({ circles, isLoading, activeSubTab, setActiveSubTab, showDiscover = true, showInviteClient = false }) => {
  const {
    conversations: { active: activeConversation },
    actions: { setActiveConversation },
  } = useInbox();
  // Use prop if provided, otherwise use local state
  const [localSubTab, setLocalSubTab] = useState('my-circles');
  const currentSubTab = activeSubTab !== undefined ? activeSubTab : localSubTab;
  const setCurrentSubTab = setActiveSubTab || setLocalSubTab;
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExploreModalOpen, setIsExploreModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Debounce search for discover tab
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch public chats for discover tab
  const { data: publicChatsResponse, isLoading: isLoadingPublicChats } = useQuery({
    queryFn: () => explorePublicChats({ 
      page: currentPage,
      search: debouncedSearchText.trim() || undefined
    }),
    queryKey: [queryKeys.publicChats, currentPage, debouncedSearchText],
    refetchOnMount: 'always',
    retry: 2,
    enabled: showDiscover && currentSubTab === 'discover',
  });

  const joinChatMutation = useMutation({
    mutationFn: joinPublicChat,
    onSuccess: (response) => {
      const { group_name } = response.data.data;
      toast.success(`Successfully joined ${group_name}!`);
      queryClient.invalidateQueries([queryKeys.inboxConversations]);
    },
    onError: (error) => {
      toast.error('Failed to join the group. Please try again.');
    },
  });

  const publicChats = publicChatsResponse?.data?.data?.chats || [];

  const handleJoinChat = (chatId) => {
    joinChatMutation.mutate(chatId);
  };

  // Filter circles with unread messages
  const unreadCircles = useMemo(
    () => circles.filter(circle => circle.unread_count > 0),
    [circles]
  );

  const totalUnreadCount = useMemo(
    () => unreadCircles.reduce((sum, circle) => sum + circle.unread_count, 0),
    [unreadCircles]
  );

  // Filter circles by search
  const filteredCircles = useMemo(
    () =>
      circles.filter(circle =>
        circle.name.toLowerCase().includes(searchText.toLowerCase())
      ),
    [circles, searchText]
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

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* My Circles Header */}
      <div className="px-3 md:px-4 py-3 md:py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">My Circles</h2>
          {showInviteClient && <InviteClientButton />}
        </div>
      </div>

      {/* Sub-navigation */}
      {showDiscover && (
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setCurrentSubTab('my-circles')}
          className={`flex-1 px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors ${
            currentSubTab === 'my-circles'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          My Circles
        </button>
        <button
          onClick={() => setCurrentSubTab('discover')}
          className={`flex-1 px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors ${
            currentSubTab === 'discover'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Discover
        </button>
      </div>
      )}

      {/* Search Bar - Only show for My Circles tab */}
      {((currentSubTab === 'my-circles' || !showDiscover) && (
        <div className="px-3 md:px-4 py-2 md:py-3 bg-white border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
            <input
              type="text"
              className="w-full rounded-lg bg-gray-100 py-1.5 md:py-2 pl-8 md:pl-10 pr-3 md:pr-4 text-xs md:text-sm outline-none focus:bg-white focus:ring-1 focus:ring-gray-300 transition-all duration-200"
              placeholder="Search circles..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
        </div>
      ))}

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {(currentSubTab === 'my-circles' || !showDiscover) ? (
          <LoadingWrapper isLoading={isLoading}>
            {/* Unread Messages Section */}
            {totalUnreadCount > 0 && (
              <div className="px-3 md:px-4 py-2 bg-green-50 border-b border-green-100">
                <h3 className="text-xs md:text-sm font-semibold text-green-700">
                  Unread Messages ({totalUnreadCount})
                </h3>
              </div>
            )}

            {/* Circles List */}
            {filteredCircles.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredCircles.map((circle) => {
                  const isCircleActive = activeConversation?.id === circle.id;
                  const hasUnreadMessages = circle.unread_count > 0;

                  return (
                    <div
                      key={circle.id}
                      className={`flex cursor-pointer items-center px-3 md:px-4 py-2 md:py-3 hover:bg-gray-50 transition-colors duration-200 ${
                        isCircleActive ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setActiveConversation(circle)}
                    >
                      <div className="relative mr-2 md:mr-3 h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden bg-green-100 flex items-center justify-center flex-shrink-0">
                        <UserAvatar isGroup={true} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className={`text-xs md:text-sm font-medium truncate ${
                            hasUnreadMessages ? 'font-semibold' : 'font-normal'
                          } text-gray-900`}>
                            {circle.name}
                          </h5>
                          {hasUnreadMessages && (
                            <div className="ml-2 flex-shrink-0">
                              <div className="bg-green-500 w-4 h-4 md:w-5 md:h-5 rounded-full text-white text-xs flex items-center justify-center font-medium">
                                {circle.unread_count}
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate mb-1">
                          {circle.message || 'No messages yet'}
                        </p>
                        <div className="flex items-center gap-1 md:gap-2 text-xs text-gray-500">
                          <span>{circle.members_count || 0} members</span>
                          {circle.time && (
                            <>
                              <span>•</span>
                              <span>{formatTimeAgo(circle.time)}</span>
                            </>
                          )}
                        </div>
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
                  {searchText ? 'No circles found matching your search.' : showDiscover ? 'No circles yet. Create or discover new circles!' : 'No circles yet.'}
                </p>
              </div>
            )}
          </LoadingWrapper>
        ) : (
          <div className="w-full h-full flex flex-col bg-white overflow-auto">
            {/* Search Bar for Discover Tab */}
            <div className="px-3 md:px-4 py-2 md:py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
                <input
                  type="text"
                  className="w-full rounded-lg bg-gray-100 py-1.5 md:py-2 pl-8 md:pl-10 pr-3 md:pr-4 text-xs md:text-sm outline-none focus:bg-white focus:ring-1 focus:ring-gray-300 transition-all duration-200"
                  placeholder="Search circles..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
              </div>
            </div>

            {/* Discover Content */}
            <div className="flex-1 overflow-auto">
              <div className="w-full max-w-4xl mx-auto p-3 md:p-4 lg:p-6">
                <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 mb-3 md:mb-4 lg:mb-6">Discover New Circles</h2>

                <LoadingWrapper isLoading={isLoadingPublicChats}>
                  {publicChats.length > 0 ? (
                    <div className="space-y-2 md:space-y-3">
                      {publicChats.map((chat) => (
                        <div
                          key={chat.chat_id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4 p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">{chat.group_name}</h3>
                            <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">{chat.description || ''}</p>
                            <p className="text-xs text-gray-500">{chat.members_count || 0} members</p>
                          </div>
                          <button
                            onClick={() => handleJoinChat(chat.chat_id)}
                            disabled={joinChatMutation.isPending}
                            className="w-full sm:w-auto px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs md:text-sm lg:text-base whitespace-nowrap"
                          >
                            {joinChatMutation.isPending ? <Spinner size={16} /> : 'Join Circle'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 md:py-8 lg:py-12">
                      <FiSearch className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 mx-auto text-gray-400 mb-3 md:mb-4" />
                      <p className="text-xs md:text-sm lg:text-base text-gray-500 px-4">
                        {debouncedSearchText ? 'No circles found matching your search.' : 'No public circles available at the moment.'}
                      </p>
                    </div>
                  )}
                </LoadingWrapper>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explore Groups Modal */}
      <ExploreGroupsModal
        isOpen={isExploreModalOpen}
        onClose={() => setIsExploreModalOpen(false)}
      />

    </div>
  );
};

export default CirclesList;

