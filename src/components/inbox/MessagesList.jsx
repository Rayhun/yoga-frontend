'use client';
import dayjs from 'dayjs';
import useAuthContext from '@/hooks/useAuthContext';
import { useInbox } from '@/context/InboxContext';
import LoadingWrapper from '../common/loader/Wrapper';

const Message = ({ isMyMessage, senderName, time, children }) => (
  <>
    {isMyMessage ? (
      <div className="ml-auto max-w-125">
        <div className="mb-2.5 rounded-2xl rounded-br-none bg-[rgba(208,254,207,0.62)] px-5 py-3 flex flex-col justify-between items-end gap-1">
          <p className="text-black">{children}</p>
          <p className="text-right text-[10px] text-black/80 min-w-[50px]">{dayjs(time).format('hh:mm A')}</p>
        </div>
      </div>
    ) : (
      <div className="max-w-125">
        {senderName ? <p className="text-sm mb-1 text-black">{senderName}</p> : null}
        <div className="mb-2.5 rounded-2xl rounded-tl-none bg-white px-5 py-3 flex flex-col justify-between items-end gap-1">
          <p className="text-black">{children}</p>
          <p className="text-[10px] text-right text-black/80 min-w-[50px]">
            {dayjs(time).format('hh:mm A')}
          </p>
        </div>
      </div>
    )}
  </>
);

const MessagesList = () => {
  const {
    user: {
      profile: { id: loggedInUserID },
    },
  } = useAuthContext();
  const {
    conversations: { active: activeConversation },
    messages: { isLoading: isLoadingMessages, data: messages },
  } = useInbox();

  return (
    <div className="h-[calc(80vh-180px)] bg-[rgba(239,233,224,0.54)]">
      <LoadingWrapper isLoading={isLoadingMessages}>
        <div className="no-scrollbar max-h-full space-y-3.5 overflow-auto px-6 py-7.5">
          {[...messages].map(message => (
            <Message
              key={message.id}
              time={message.created_at}
              senderName={activeConversation.is_group ? message.sender_name : undefined}
              isMyMessage={message.sender === loggedInUserID}
            >
              {message.content}
            </Message>
          ))}
          <div id="empty-message" className="!m-0" />
        </div>
      </LoadingWrapper>
    </div>
  );
};

export default MessagesList;
