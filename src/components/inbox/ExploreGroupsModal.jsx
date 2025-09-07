'use client';
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { FiUsers, FiPlus, FiSearch, FiX, FiEye, FiCalendar, FiUser, FiMessageCircle } from 'react-icons/fi';
import { explorePublicChats, joinPublicChat } from '@/services/public/chat';
import queryKeys from '@/utils/query-keys';
import LoadingWrapper from '../common/loader/Wrapper';
import Spinner from '../common/loader/Spinner';
import { createUserJoinedMessage } from '@/utils/systemMessages';
import useAuthContext from '@/hooks/useAuthContext';
import { useInbox } from '@/context/InboxContext';

const ExploreGroupsModal = ({ isOpen, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  
  const { user: { profile } } = useAuthContext();
  const { conversations: { active: activeConversation } } = useInbox();

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
    enabled: isOpen, // Only fetch when modal is open
  });

  const joinChatMutation = useMutation({
    mutationFn: joinPublicChat,
    onSuccess: (response) => {
      const { group_name, chat_id, joined_at } = response.data.data;
      const userName = `${profile.first_name} ${profile.last_name}`.trim() || 'You';
      
      // Show WhatsApp-style success message
      toast.success(
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <FiUsers className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="font-semibold text-green-800">Joined Successfully!</div>
            <div className="text-sm text-green-600">{userName} joined &quot;{group_name}&quot;</div>
          </div>
        </div>,
        {
          position: "bottom-center",
          autoClose: 4000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          },
        }
      );
      
      // Refresh the conversations list
      queryClient.invalidateQueries([queryKeys.inboxConversations]);
      
      // Close modal after successful join
      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (error) => {
      toast.error('❌ Failed to join the group. Please try again.');
    },
  });

  const publicChats = publicChatsResponse?.data?.data?.chats || [];
  const pagination = publicChatsResponse?.data?.data?.pagination || {};

  const handleJoinChat = (chatId) => {
    joinChatMutation.mutate(chatId);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of modal content
    const modalContent = document.getElementById('modal-content');
    if (modalContent) {
      modalContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClose = () => {
    setSearchText('');
    setCurrentPage(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden mx-2">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FiUsers className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Explore Groups</h2>
                  <p className="text-sm sm:text-base text-white/80">Discover and join amazing communities</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="relative max-w-md mx-auto">
              <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search groups by name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white text-base sm:text-lg"
              />
              {searchText !== debouncedSearchText && (
                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            
            {/* Search Status */}
            {debouncedSearchText && (
              <div className="mt-3 text-center">
                <span className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs sm:text-sm">
                  <FiSearch className="w-3 h-3 sm:w-4 sm:h-4" />
                  Searching: &quot;{debouncedSearchText}&quot;
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div id="modal-content" className="max-h-[70vh] overflow-y-auto">
            {publicChatsError ? (
              <div className="text-center py-8 sm:py-12 px-4 sm:px-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-red-700 dark:text-red-400 mb-2">
                  Failed to Load Groups
                </h3>
                <p className="text-sm sm:text-base text-red-600 dark:text-red-300 mb-4">
                  {publicChatsError?.message || 'Something went wrong while fetching groups'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-colors font-medium text-sm sm:text-base"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <LoadingWrapper isLoading={isLoadingPublicChats} spinnerSize={32}>
                {publicChats.length > 0 ? (
                  <div className="p-4 sm:p-6">
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {publicChats.map((chat) => (
                        <div
                          key={chat.chat_id}
                          className="group bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                        >
                          {/* Group Header */}
                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2 truncate group-hover:text-primary transition-colors">
                                {chat.group_name}
                              </h3>
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                {chat.group_mode && (
                                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                    {chat.group_mode}
                                  </span>
                                )}
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  chat.visibility === 'public' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                  {chat.visibility}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Group Stats */}
                          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <FiUsers className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{chat.members_count} members</span>
                            </div>
                            {/* <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <FiUser className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Created by {chat.created_by}</span>
                            </div> */}
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{dayjs(chat.created_at).format('MMM DD, YYYY')}</span>
                            </div>
                            
                          </div>

                          {/* Action Button */}
                          <div className="pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-600">
                            {chat.can_join && !chat.is_member ? (
                              <button
                                onClick={() => handleJoinChat(chat.chat_id)}
                                disabled={joinChatMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium group-hover:shadow-md text-sm sm:text-base"
                              >
                                {joinChatMutation.isPending ? (
                                  <Spinner size={16} />
                                ) : (
                                  <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                                Join Group
                              </button>
                            ) : chat.is_member ? (
                              <div className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg font-medium text-sm sm:text-base">
                                <FiUsers className="w-4 h-4 sm:w-5 sm:h-5" />
                                Already Member
                              </div>
                            ) : (
                              <div className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm sm:text-base">
                                <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                                Cannot Join
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 px-4 sm:px-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <FiUsers className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                      No Groups Found
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                      {debouncedSearchText 
                        ? `No groups found matching "${debouncedSearchText}"`
                        : 'No public groups available at the moment'
                      }
                    </p>
                  </div>
                )}
              </LoadingWrapper>
            )}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.has_previous}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border transition-colors font-medium text-sm sm:text-base ${
                        page === currentPage
                          ? 'bg-primary text-white border-primary'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.has_next}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Next
                </button>
              </div>
              <div className="text-center mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {pagination.total_pages} • {pagination.total_count} total groups
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreGroupsModal;
