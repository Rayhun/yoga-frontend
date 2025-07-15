'use client';
import { useInbox } from '@/context/InboxContext';
import ActiveConversationHeader from './ActiveConversationHeader';
import MessagesList from './MessagesList';
import MessageForm from './MessageForm';

const AIChatBox = () => {
  const {
    conversations: { data: conversationsData, active: activeConversation },
    actions: { setActiveConversation },
  } = useInbox();

  return (
    <div className="h-full md:h-[80vh] overflow-hidden">
      <div className="max-h-full">
        <ActiveConversationHeader />
        <MessagesList />
        <MessageForm />
      </div>
    </div>
  );
};

export default AIChatBox;
