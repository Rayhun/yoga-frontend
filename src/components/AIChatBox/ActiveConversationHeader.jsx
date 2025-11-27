'use client';
import { useAIChatInbox } from '@/context/AIChatInboxContext';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';

const ActiveConversationHeader = () => {
  const {
    connection: { isConnected: isSocketConnected, status: connectionStatus },
  } = useAIChatInbox();
  const { get } = useSearchParamUtils();
  const type = get('type') || 'ai_chat';
  return (
    <div className="sticky h-[90px] bg-white flex items-center justify-between border-b border-stroke px-6 py-4.5 dark:border-strokedark">
      <div className="flex items-center min-w-[200px]">
        {/* <div className="mr-4.5 h-13 w-full max-w-13 overflow-hidden rounded-full">
          {activeConversation?.img ? (
            <Image
              src={activeConversation?.img}
              alt="profile"
              className="h-full w-full object-cover object-center"
              width={44}
              height={44}
            />
          ) : (
            <UserAvatar isGroup={activeConversation?.is_group} />
          )}
        </div> */}
        <div>
          <h5 className="font-medium text-black dark:text-white">{type === 'ai_chat' ? 'Your AI Wellness Guide' : 'Help & Support'}</h5>
          <p className="text-sm text-gray-600">How can I support you today?</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: isSocketConnected ? 'green' : 'orange' }}
        />
        <span className="text-sm text-gray-600">{connectionStatus}</span>
      </div>
    </div>
  );
};

export default ActiveConversationHeader;
