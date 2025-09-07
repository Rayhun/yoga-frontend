'use client';
import { useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import { useInbox } from '@/context/InboxContext';
import ConversationsList from './ConversationsList';
import ActiveConversationHeader from './ActiveConversationHeader';
import MessagesList from './MessagesList';
import MessageForm from './MessageForm';
import WelcomeMessage from './WelcomeMessage';
import ExploreGroupsModal from './ExploreGroupsModal';

const Inbox = () => {
  const {
    conversations: { data: conversationsData, active: activeConversation, isLoading: isLoadingConversations },
  } = useInbox();
  const [isExploreModalOpen, setIsExploreModalOpen] = useState(false);

  const handleExploreModalOpen = () => {
    setIsExploreModalOpen(true);
  };

  const handleExploreModalClose = () => {
    setIsExploreModalOpen(false);
  };

  return (
    <div className="h-full md:h-[80vh] overflow-hidden">
      <div className="h-full flex flex-col md:flex-row rounded-sm border-r border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="w-full md:w-1/4 h-[70vh] md:h-full flex flex-col">
          <div className="sticky h-[110px] sm:h-[130px] border-b border-stroke px-4 sm:px-6 py-4 sm:py-6 dark:border-strokedark">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-medium text-black dark:text-white 2xl:text-xl mb-2">
                  Active Conversations
                  <span className="rounded-md border-[.5px] border-stroke bg-gray-2 px-1.5 sm:px-2 py-0.5 text-sm sm:text-base font-medium text-black dark:border-strokedark dark:bg-boxdark-2 dark:text-white ml-2 sm:ml-3">
                    {conversationsData.length}
                  </span>
                </h3>
                {/* <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {conversationsData.length > 0 
                    ? "Click on a conversation to start chatting or explore more groups"
                    : "No conversations yet. Start by exploring available groups!"
                  }
                </div> */}
              </div>
              {conversationsData.length > 0 && (
                <button
                  onClick={handleExploreModalOpen}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105 ml-2 sm:ml-4 flex-shrink-0"
                  title="Explore and join more groups"
                >
                  <FiUsers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Explore More
                </button>
              )}
            </div>
          </div>

          <ConversationsList />
        </div>
        <div className="w-full md:w-3/4 h-[70vh] md:h-full flex flex-col border-l border-stroke dark:border-strokedark">
          {activeConversation ? (
            <div className="max-h-full">
              <ActiveConversationHeader />
              <MessagesList />
              <MessageForm />
            </div>
          ) : conversationsData.length === 0 && !isLoadingConversations ? (
            <WelcomeMessage />
          ) : isLoadingConversations ? (
            <div className="w-full h-full flex flex-col justify-center items-center p-8">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading Conversations...</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                Please wait while we load your conversations
              </p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center p-8">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Conversation Selected</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                Choose a conversation from the left panel to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Explore Groups Modal */}
      <ExploreGroupsModal 
        isOpen={isExploreModalOpen} 
        onClose={handleExploreModalClose} 
      />
    </div>
  );
};

export default Inbox;
