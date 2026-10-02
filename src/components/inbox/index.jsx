'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiUsers } from 'react-icons/fi';
import Image from 'next/image';
import { useInbox } from '@/context/InboxContext';
import useAuthContext from '@/hooks/useAuthContext';
import { USER_ROLE } from '@/utils/authorization';
import CirclesList from './CirclesList';
import CoachesList from './CoachesList';
import ActiveConversationHeader from './ActiveConversationHeader';
import MessagesList from './MessagesList';
import MessageForm from './MessageForm';
import WelcomeMessage from './WelcomeMessage';

const CoachesIcon = ({ className = 'w-4 h-4 md:w-5 md:h-5' }) => {
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams.get('conversation');
  const openedFromUrlRef = useRef(null);
  const { user } = useAuthContext();
  const {
    conversations: { data: conversationsData, active: activeConversation, isLoading: isLoadingConversations },
    actions: { setActiveConversation },
  } = useInbox();
  const shouldShowCoachesTab = user?.profile?.role !== USER_ROLE.TEACHER;
  const isExpertPortal = user?.profile?.role === USER_ROLE.TEACHER;
  const hasChatGroup = Boolean(user?.profile?.is_chat_group);
  const [activeTab, setActiveTab] = useState('circles');
  const [circlesSubTab, setCirclesSubTab] = useState('my-circles');
  const [coachesSubTab, setCoachesSubTab] = useState('my-chats');

  const circles = conversationsData.filter(conv => !conv.is_coach);
  const coaches = conversationsData.filter(conv => conv.is_coach === true);

  useEffect(() => {
    if (!conversationIdFromUrl) {
      openedFromUrlRef.current = null;
      return;
    }
    if (isLoadingConversations) return;
    if (openedFromUrlRef.current === conversationIdFromUrl) return;

    const matchingConversation = conversationsData.find(
      conversation => String(conversation.id) === String(conversationIdFromUrl)
    );

    openedFromUrlRef.current = conversationIdFromUrl;

    if (matchingConversation) {
      setActiveTab(matchingConversation.is_coach ? 'coaches' : 'circles');
      setActiveConversation(matchingConversation);
    } else {
      setActiveTab('circles');
      setActiveConversation({ id: conversationIdFromUrl });
    }

    router.replace('/portal/inbox', { scroll: false });
  }, [
    conversationIdFromUrl,
    conversationsData,
    isLoadingConversations,
    router,
    setActiveConversation,
  ]);

  const showMobileChat = Boolean(activeConversation);
  const handleMobileBack = () => setActiveConversation(null);

  return (
    <div className="inbox-height flex min-h-0 flex-col overflow-hidden">
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white shadow-lg md:flex-row md:rounded-xl md:border md:border-gray-200">
        {/* Left Sidebar — full width on mobile when no chat is open */}
        <div
          className={`min-h-0 w-full md:w-1/3 md:min-w-[280px] lg:min-w-[320px] flex flex-col border-r border-gray-200 bg-gray-50 ${
            showMobileChat ? 'hidden md:flex' : 'flex h-full'
          }`}
        >
          <div className="flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setActiveTab('circles')}
              className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium transition-colors md:gap-2 md:px-4 md:py-3 md:text-sm ${
                activeTab === 'circles'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiUsers className="h-4 w-4 md:h-5 md:w-5" />
              <span>Circles</span>
            </button>
            {shouldShowCoachesTab && (
              <button
                onClick={() => setActiveTab('coaches')}
                className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium transition-colors md:gap-2 md:px-4 md:py-3 md:text-sm ${
                  activeTab === 'coaches'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <CoachesIcon className="h-4 w-4 md:h-5 md:w-5" />
                <span>Coaches</span>
              </button>
            )}
          </div>

          {activeTab === 'circles' || !shouldShowCoachesTab ? (
            <CirclesList
              circles={circles}
              isLoading={isLoadingConversations}
              activeSubTab={circlesSubTab}
              setActiveSubTab={setCirclesSubTab}
              showDiscover={!isExpertPortal}
              showInviteClient={isExpertPortal && hasChatGroup}
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

        {/* Chat Area — full width on mobile when a conversation is open */}
        <div
          className={`min-h-0 w-full md:w-2/3 flex flex-col bg-white ${
            showMobileChat ? 'flex h-full' : 'hidden md:flex'
          }`}
        >
          {activeConversation ? (
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              <ActiveConversationHeader onBack={handleMobileBack} />
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <MessagesList />
              </div>
              <div className="flex-shrink-0">
                <MessageForm />
              </div>
            </div>
          ) : conversationsData.length === 0 && !isLoadingConversations ? (
            <WelcomeMessage activeTab={activeTab} showDiscover={!isExpertPortal} />
          ) : isLoadingConversations ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-transparent p-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-700">Loading Conversations...</h3>
              <p className="max-w-sm text-center text-gray-500">
                Please wait while we load your conversations
              </p>
            </div>
          ) : (
            <WelcomeMessage
              activeTab={activeTab}
              showDiscover={!isExpertPortal}
              onExploreCircles={
                isExpertPortal
                  ? undefined
                  : () => {
                      setActiveTab('circles');
                      setCirclesSubTab('discover');
                    }
              }
              onFindCoach={
                shouldShowCoachesTab
                  ? () => {
                      setActiveTab('coaches');
                      setCoachesSubTab('find-coaches');
                    }
                  : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
