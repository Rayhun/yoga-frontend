'use client';
import ActiveConversationHeader from './ActiveConversationHeader';
import MessagesList from './MessagesList';
import MessageForm from './MessageForm';

const AIFaqChatBox = () => {
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

export default AIFaqChatBox;
