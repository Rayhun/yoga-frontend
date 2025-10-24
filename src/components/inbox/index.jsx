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
      <div className="h-full flex flex-col md:flex-row bg-white shadow-lg overflow-hidden">
        {/* Conversations Sidebar - WhatsApp Style */}
        <div className="w-full md:w-1/3 h-[70vh] md:h-full flex flex-col bg-white border-r border-gray-200 rounded-l-2xl shadow-lg">
          {/* Header */}
          <div className="h-16 bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">Chats</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExploreModalOpen}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors duration-200"
                title="Explore and join more groups"
              >
                <FiUsers className="w-5 h-5" />
              </button>
            </div>
          </div>

          <ConversationsList />
        </div>

        {/* Chat Area - WhatsApp Style */}
        <div className="w-full md:w-2/3 h-[70vh] md:h-full flex flex-col bg-white rounded-r-2xl shadow-lg">
          {activeConversation ? (
            <div className="h-full flex flex-col">
              <ActiveConversationHeader />
              <div className="flex-1 flex flex-col min-h-0">
                <MessagesList />
              </div>
              <MessageForm />
            </div>
          ) : conversationsData.length === 0 && !isLoadingConversations ? (
            <WelcomeMessage />
          ) : isLoadingConversations ? (
            <div className="w-full h-full flex flex-col justify-center items-center p-8 bg-transparent">
              <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Loading Conversations...</h3>
              <p className="text-gray-500 text-center max-w-sm">
                Please wait while we load your conversations
              </p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center p-8 bg-transparent">
              <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Conversation Selected</h3>
              <p className="text-gray-500 text-center max-w-sm">
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
