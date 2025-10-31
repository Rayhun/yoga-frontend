'use client';
import { useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import useAuthContext from '@/hooks/useAuthContext';
import LoadingWrapper from '../common/loader/Wrapper';
import Markdown from '../common/Markdown';
import { useAIChatInbox } from '@/context/AIChatInboxContext';

const Message = ({ isMyMessage, senderName, time, isAI, children }) => (
  <>
    {isMyMessage ? (
      <div className="ml-auto max-w-125 w-fit">
        <div className="mb-2.5 rounded-2xl rounded-br-none bg-[rgba(208,254,207,0.62)] px-5 py-3 flex flex-col justify-between items-end gap-1 shadow-sm">
          <p className="text-black whitespace-pre-wrap break-words text-[15px] leading-6">{children}</p>
          <p className="text-right text-[10px] text-gray-500 min-w-[50px]">{dayjs(time).format('hh:mm A')}</p>
        </div>
      </div>
    ) : (
      <div className="max-w-125 w-fit">
        {senderName ? <p className="text-sm mb-1 text-black">{senderName}</p> : null}
        <div className="mb-2.5 rounded-2xl rounded-tl-none bg-white px-5 py-3 flex flex-col justify-between items-end gap-1 shadow-sm">
          {isAI ? (
            <Markdown className="text-black text-[15px] leading-6 break-words" content={children} />
          ) : (
            <p className="text-black whitespace-pre-wrap break-words text-[15px] leading-6">{children}</p>
          )}
          <p className="text-[10px] text-right text-gray-500 min-w-[50px]">{dayjs(time).format('hh:mm A')}</p>
        </div>
      </div>
    )}
  </>
);

const MessagesList = () => {
  const {
    messages: { isLoading: isLoadingMessages, data: messages },
  } = useAIChatInbox();

  const lastMessageRef = useRef(null);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages]);

  return (
    <div className="h-[calc(80vh-180px)] bg-gradient-to-b from-[rgba(239,233,224,0.54)] to-[rgba(239,233,224,0.3)]">
      <LoadingWrapper isLoading={isLoadingMessages}>
        <div className="no-scrollbar max-h-full space-y-3.5 overflow-auto px-6 py-7.5 pb-24">
          {[...messages].map((message, index) => (
            <Message
              key={index}
              time={message?.created_at}
              senderName={undefined}
              isMyMessage={message?.isSentByMe}
              isAI={Boolean(message?.is_ai)}
              attachments={message?.attachments}
            >
              {message?.message}
            </Message>
          ))}
          {/* Last message reference */}
          <div ref={lastMessageRef} id="empty-message" className="!m-0" />
        </div>
      </LoadingWrapper>
    </div>
  );
};

export default MessagesList;
