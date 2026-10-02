'use client';
import { useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import LoadingWrapper from '../common/loader/Wrapper';
import { useAIChatInbox } from '@/context/AIChatInboxContext';
import StreamingMarkdown from '../chat/StreamingMarkdown';
import TypingIndicator from '../chat/TypingIndicator';

const Message = ({ isMyMessage, senderName, time, children, isStreaming, isError }) => (
  <>
    {isMyMessage ? (
      <div className="ml-auto max-w-125 w-fit">
        <div className="mb-2.5 rounded-2xl rounded-br-none bg-[rgba(208,254,207,0.62)] px-5 py-3 flex flex-col justify-between items-end gap-1">
          <div className="w-full overflow-hidden">
            <p className="text-black whitespace-pre-wrap break-words">{children}</p>
          </div>
          {time && (
            <p className="text-right text-[10px] text-black/80 min-w-[50px]">
              {dayjs(time).format('hh:mm A')}
            </p>
          )}
        </div>
      </div>
    ) : (
      <div className="max-w-125 w-fit min-w-[200px]">
        {senderName && <p className="text-sm mb-1 text-black">{senderName}</p>}
        <div className={`mb-2.5 rounded-2xl rounded-tl-none px-5 py-3 flex flex-col justify-between items-end gap-1 overflow-hidden ${isError ? 'bg-warning/10 border border-warning/30' : 'bg-white'}`}>
          <div className="w-full overflow-hidden">
            {isError ? (
              <p className="text-black whitespace-pre-wrap break-words">{children}</p>
            ) : (
              <StreamingMarkdown content={children} isStreaming={isStreaming} />
            )}
          </div>

          {time && !isStreaming && (
            <p className="text-[10px] text-right text-black/80 min-w-[50px]">
              {dayjs(time).format('hh:mm A')}
            </p>
          )}
        </div>
      </div>
    )}
  </>
);

const MessagesList = () => {
  const {
    messages: { isLoading: isLoadingMessages, data: messages },
    isAITyping,
    streamingMessage,
    streamingIsError,
  } = useAIChatInbox();

  const lastMessageRef = useRef(null);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, streamingMessage, isAITyping]);

  return (
    <div className="h-[calc(80vh-180px)] bg-[rgba(239,233,224,0.54)]">
      <LoadingWrapper isLoading={isLoadingMessages}>
        <div className="no-scrollbar max-h-full space-y-3.5 overflow-auto px-6 py-7.5">
          {messages.map((message, index) => (
            <Message
              key={index}
              time={message?.created_at}
              senderName={undefined}
              isMyMessage={message?.isSentByMe}
              isError={message?.isError}
            >
              {message?.message}
            </Message>
          ))}

          {streamingMessage && (
            <Message isMyMessage={false} isStreaming isError={streamingIsError}>
              {streamingMessage}
            </Message>
          )}

          {isAITyping && !streamingMessage && <TypingIndicator />}

          <div ref={lastMessageRef} id="empty-message" className="!m-0" />
        </div>
      </LoadingWrapper>
    </div>
  );
};

export default MessagesList;
