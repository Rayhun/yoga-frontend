'use client';
import { useInbox } from '@/context/InboxContext';
import ConversationsList from './ConversationsList';
import ActiveConversationHeader from './ActiveConversationHeader';
import MessagesList from './MessagesList';
import MessageForm from './MessageForm';

const Inbox = () => {
  const {
    conversations: { data: conversationsData, active: activeConversation },
  } = useInbox();

  return (
    <div className="h-[78vh] overflow-hidden">
      <div className="h-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:flex">
        <div className="hidden h-full flex-col xl:flex xl:w-1/4">
          <div className="sticky border-b border-stroke px-6 py-7.5 dark:border-strokedark">
            <h3 className="text-lg font-medium text-black dark:text-white 2xl:text-xl">
              Active Conversations
              <span className="rounded-md border-[.5px] border-stroke bg-gray-2 px-2 py-0.5 text-base font-medium text-black dark:border-strokedark dark:bg-boxdark-2 dark:text-white 2xl:ml-4">
                {conversationsData.length}
              </span>
            </h3>
          </div>
          <ConversationsList />
        </div>
        <div className="flex h-full flex-col border-l border-stroke dark:border-strokedark xl:w-3/4">
          {activeConversation ? (
            <>
              <ActiveConversationHeader />
              <MessagesList />
              <MessageForm />
            </>
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <p>Select any conversation to see messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
