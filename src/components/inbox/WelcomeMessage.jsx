'use client';
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { FiUsers, FiPlus, FiSearch } from 'react-icons/fi';
import { explorePublicChats, joinPublicChat } from '@/services/public/chat';
import queryKeys from '@/utils/query-keys';
import LoadingWrapper from '../common/loader/Wrapper';
import Spinner from '../common/loader/Spinner';
import SystemMessage from './SystemMessage';

const WelcomeMessage = ({ isFromExplore = false, onBackToChat }) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: publicChatsResponse, isLoading: isLoadingPublicChats, error: publicChatsError } = useQuery({
    queryFn: () => explorePublicChats({ 
      page: currentPage,
      search: debouncedSearchText.trim() || undefined
    }),
    queryKey: [queryKeys.publicChats, currentPage, debouncedSearchText],
    refetchOnMount: 'always',
    retry: 2,
  });

  const joinChatMutation = useMutation({
    mutationFn: joinPublicChat,
    onSuccess: (response) => {
      const { group_name } = response.data.data;
      toast.success(`Successfully joined ${group_name}!`);
      // Refresh the conversations list
      queryClient.invalidateQueries([queryKeys.inboxConversations]);
    },
    onError: (error) => {
      toast.error('Failed to join the group. Please try again.');
    },
  });

  const publicChats = publicChatsResponse?.data?.data?.chats || [];
  const pagination = publicChatsResponse?.data?.data?.pagination || {};

  const handleJoinChat = (chatId) => {
    joinChatMutation.mutate(chatId);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        {isFromExplore && onBackToChat && (
          <div className="flex justify-start mb-4">
            <button
              onClick={onBackToChat}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Chat
            </button>
          </div>
        )}
        <div className="w-24 h-24 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <FiUsers className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isFromExplore ? 'Explore More Groups' : '✨ Welcome to your wellness space!'}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
          {isFromExplore 
            ? 'Discover and join additional groups while keeping your existing conversations. Your current chats are safe and accessible below.'
            : 'Here, you\'ll find circles of women supporting, learning, and growing together.'
          }
        </p>
        {!isFromExplore && (
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mt-2">
            Explore the groups and choose the one that feels like home 💛
          </p>
        )}
      </div>

      {/* Explore Groups Section */}
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiUsers className="w-5 h-5" />
              Explore Groups
            </h2>
            {debouncedSearchText && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                Searching: "{debouncedSearchText}"
              </span>
            )}
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search groups by name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {searchText !== debouncedSearchText && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        {publicChatsError ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-700 dark:text-red-400 mb-2">
              Failed to Load Groups
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-4">
              {publicChatsError?.message || 'Something went wrong while fetching groups'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
                    <LoadingWrapper isLoading={isLoadingPublicChats} spinnerSize={24}>
            {publicChats.length > 0 ? (
              <div className="space-y-4">
                {publicChats.map((chat) => (
                <div
                  key={chat.chat_id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {chat.group_name}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        {chat.group_mode}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        chat.visibility === 'public' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {chat.visibility}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>👥 {chat.members_count} members</span>
                      <span>📅 {dayjs(chat.created_at).format('MMM DD, YYYY')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {chat.can_join && !chat.is_member ? (
                      <button
                        onClick={() => handleJoinChat(chat.chat_id)}
                        disabled={joinChatMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {joinChatMutation.isPending ? (
                          <Spinner size={16} />
                        ) : (
                          <FiPlus className="w-4 h-4" />
                        )}
                        Join Group
                      </button>
                    ) : chat.is_member ? (
                      <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                        Member
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                        Cannot Join
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
                    ) : (
            <div className="text-center py-8">
              <FiUsers className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {debouncedSearchText ? 'No groups found matching your search.' : 'No public groups available at the moment.'}
              </p>
            </div>
          )}
          </LoadingWrapper>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.has_previous}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {pagination.total_pages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.has_next}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeMessage;
