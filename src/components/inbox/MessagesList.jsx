'use client';
import dayjs from 'dayjs';
import useAuthContext from '@/hooks/useAuthContext';
import { useInbox } from '@/context/InboxContext';
import LoadingWrapper from '../common/loader/Wrapper';

const Message = ({ isMyMessage, time, children }) => (
  <>
    {isMyMessage ? (
      <div className="ml-auto max-w-125">
        <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3">
          <p className="text-white">{children}</p>
        </div>
        <p className="text-right text-xs">{dayjs(time).format('hh:mm A')}</p>
      </div>
    ) : (
      <div className="max-w-125">
        <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2">
          <p>{children}</p>
        </div>
        <p className="text-xs">{dayjs(time).format('hh:mm A')}</p>
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
    messages: { isLoading: isLoadingMessages, data: messages },
  } = useInbox();

  return (
    <div className="h-[68%]">
      <LoadingWrapper isLoading={isLoadingMessages}>
        <div className="no-scrollbar max-h-full space-y-3.5 overflow-auto px-6 py-7.5">
          {[...messages].map(message => (
            <Message
              key={message.id}
              time={message.created_at}
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
