'use client';
import { useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import Image from 'next/image';
import { useInbox } from '@/context/InboxContext';
import CirclesList from './CirclesList';
import CoachesList from './CoachesList';
import ActiveConversationHeader from './ActiveConversationHeader';
import MessagesList from './MessagesList';
import MessageForm from './MessageForm';
import WelcomeMessage from './WelcomeMessage';

// Coaches Icon Component - Uses woman icon image (no matching icon found)
const CoachesIcon = ({ className = "w-4 h-4 md:w-5 md:h-5" }) => {
  return (
    <Image
      src="/images/icon/woman.png"
      alt="Coaches"
      width={20}
      height={20}
      className={className}
    />
  );
};

const Inbox = () => {
  const {
    conversations: { data: conversationsData, active: activeConversation, isLoading: isLoadingConversations },
  } = useInbox();
  const [activeTab, setActiveTab] = useState('circles'); // 'circles' or 'coaches'
  const [circlesSubTab, setCirclesSubTab] = useState('my-circles'); // For circles sub-navigation
  const [coachesSubTab, setCoachesSubTab] = useState('my-chats'); // For coaches sub-navigation

  // Separate circles and coaches
  // Circles: all conversations EXCEPT coach conversations (is_coach: true)
  const circles = conversationsData.filter(conv => !conv.is_coach);
  // Coaches: only conversations where is_coach is true
  const coaches = conversationsData.filter(conv => conv.is_coach === true);

  return (
    <div className="h-full md:h-[80vh] overflow-hidden">
      <div className="h-full flex flex-col md:flex-row bg-white shadow-lg overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 h-[70vh] md:h-full flex flex-col bg-gray-50 border-r border-gray-200">
          {/* Top Navigation Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setActiveTab('circles')}
              className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 md:py-3 font-medium transition-colors text-xs md:text-sm ${
                activeTab === 'circles'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiUsers className="w-4 h-4 md:w-5 md:h-5" />
              <span>Circles</span>
            </button>
            <button
              onClick={() => setActiveTab('coaches')}
              className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 md:py-3 font-medium transition-colors text-xs md:text-sm ${
                activeTab === 'coaches'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {/* Prefer icon, fallback to image */}
              <CoachesIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span>Coaches</span>
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'circles' ? (
            <CirclesList 
              circles={circles} 
              isLoading={isLoadingConversations}
              activeSubTab={circlesSubTab}
              setActiveSubTab={setCirclesSubTab}
            />
          ) : (
            <CoachesList 
              coaches={coaches} 
              isLoading={isLoadingConversations}
              activeSubTab={coachesSubTab}
              setActiveSubTab={setCoachesSubTab}
            />
          )}
        </div>

        {/* Chat Area */}
        <div className="w-full md:w-2/3 h-[70vh] md:h-full flex flex-col bg-white">
          {activeConversation ? (
            <div className="h-full flex flex-col">
              <ActiveConversationHeader />
              <div className="flex-1 flex flex-col min-h-0">
                <MessagesList />
              </div>
              <MessageForm />
            </div>
          ) : conversationsData.length === 0 && !isLoadingConversations ? (
            <WelcomeMessage activeTab={activeTab} />
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
            <WelcomeMessage 
              activeTab={activeTab} 
              onExploreCircles={() => {
                setActiveTab('circles');
                setCirclesSubTab('discover');
              }}
              onFindCoach={() => {
                setActiveTab('coaches');
                setCoachesSubTab('find-coaches');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
