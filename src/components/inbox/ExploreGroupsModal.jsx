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
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Explore Groups</h2>
                  <p className="text-sm sm:text-base text-green-100">Discover and join amazing communities</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <FiSearch className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Search Groups</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Find communities that match your interests</p>
                </div>
              </div>
              {debouncedSearchText && (
                <span className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-200 rounded-full shadow-sm">
                  Searching: &quot;{debouncedSearchText}&quot;
                </span>
              )}
            </div>
            
            <div className="relative max-w-2xl mx-auto">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search groups by name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all dark:bg-gray-700 dark:text-white text-base shadow-sm"
              />
              {searchText !== debouncedSearchText && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div id="modal-content" className="max-h-[70vh] overflow-y-auto">
            {publicChatsError ? (
              <div className="text-center py-12 px-4 sm:px-6">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-3">
                  Failed to Load Groups
                </h3>
                <p className="text-red-600 dark:text-red-300 mb-6 max-w-md mx-auto">
                  {publicChatsError?.message || 'Something went wrong while fetching groups'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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
                          className="group relative p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-primary dark:hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                        >
                          {/* Group Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors truncate">
                                {chat.group_name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2">
                                {chat.group_mode && (
                                  <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-200 rounded-full">
                                    {chat.group_mode}
                                  </span>
                                )}
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  chat.visibility === 'public' 
                                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-200'
                                    : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 dark:from-yellow-900/30 dark:to-amber-900/30 dark:text-yellow-200'
                                }`}>
                                  {chat.visibility}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Group Stats */}
                          <div className="flex items-center gap-6 mb-5 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="font-medium">{chat.members_count} members</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium">{dayjs(chat.created_at).format('MMM DD, YYYY')}</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            {chat.can_join && !chat.is_member ? (
                              <button
                                onClick={() => handleJoinChat(chat.chat_id)}
                                disabled={joinChatMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
                              >
                                {joinChatMutation.isPending ? (
                                  <>
                                    <Spinner size={16} />
                                    <span>Joining...</span>
                                  </>
                                ) : (
                                  <>
                                    <FiPlus className="w-5 h-5" />
                                    <span>Join Group</span>
                                  </>
                                )}
                              </button>
                            ) : chat.is_member ? (
                              <div className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 rounded-xl font-semibold">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Already Member</span>
                              </div>
                            ) : (
                              <div className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                <span>Cannot Join</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 px-4 sm:px-6">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                      <FiUsers className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                      {debouncedSearchText ? 'No Groups Found' : 'No Groups Available'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      {debouncedSearchText 
                        ? `No groups found matching "${debouncedSearchText}". Try a different search term.`
                        : 'No public groups are available at the moment. Check back later!'}
                    </p>
                  </div>
                )}
              </LoadingWrapper>
            )}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.has_previous}
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 disabled:hover:bg-transparent"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 font-semibold text-sm ${
                        page === currentPage
                          ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white border-transparent shadow-lg'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.has_next}
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 disabled:hover:bg-transparent"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="text-center mt-4">
                <span className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 text-gray-700 dark:text-gray-300 rounded-xl">
                  Page {currentPage} of {pagination.total_pages} • {pagination.total_count} total groups
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreGroupsModal;
