'use client';

import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import { useQuery } from '@tanstack/react-query';
import { FiSend, FiX } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import Spinner from '@/components/common/loader/Spinner';
import StreamingMarkdown from '@/components/chat/StreamingMarkdown';
import TypingIndicator from '@/components/chat/TypingIndicator';
import AICoachProvider, { useAICoach } from '@/context/AICoachContext';
import useAuthContext from '@/hooks/useAuthContext';
import useStreamText from '@/hooks/useStreamText';
import { getCustomerAiModal } from '@/services/private/customer/v2/home';
import queryKeys from '@/utils/query-keys';

function ChatBubble({ isMine, children, isStreaming, isError }) {
  if (isMine) {
    return (
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-none bg-[rgba(208,254,207,0.62)] px-4 py-3 text-sm text-black">
        <p className="whitespace-pre-wrap break-words">{children}</p>
      </div>
    );
  }

  return (
    <div className="flex max-w-[90%] gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <HiSparkles className="h-4 w-4" />
      </span>
      <div
        className={`rounded-2xl rounded-tl-none px-4 py-3 text-sm ${
          isError
            ? 'border border-warning/30 bg-warning/10 text-black'
            : 'bg-white text-black'
        }`}
      >
        {isError ? (
          <p className="whitespace-pre-wrap break-words">{children}</p>
        ) : (
          <StreamingMarkdown content={children} isStreaming={isStreaming} />
        )}
      </div>
    </div>
  );
}

function AIWellnessCoachModalChat({ modalData, onClose }) {
  const {
    user: {
      profile: { ai_coach_id },
    },
  } = useAuthContext();
  const {
    messages: { data: messages },
    isAITyping,
    streamingMessage,
    streamingIsError,
    connection: { isConnected },
    actions: { sendMessage },
  } = useAICoach();

  const {
    displayText: welcomeDisplayText,
    isTyping: isWelcomeTyping,
    isComplete: isWelcomeComplete,
  } = useStreamText(modalData?.welcome_msg, {
    enabled: Boolean(modalData?.welcome_msg && ai_coach_id),
  });

  const [inputText, setInputText] = useState('');
  const [quickRepliesHidden, setQuickRepliesHidden] = useState(false);
  const bottomRef = useRef(null);

  const header = modalData?.header || {};
  const autoReplies = modalData?.auto_reply || [];
  const hasUserMessages = messages.some(message => message.isSentByMe);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, streamingMessage, isAITyping, isWelcomeTyping, welcomeDisplayText]);

  useEffect(() => {
    if (hasUserMessages) setQuickRepliesHidden(true);
  }, [hasUserMessages]);

  const handleSend = text => {
    const trimmed = (text ?? inputText).trim();
    if (!trimmed || !ai_coach_id) return;
    sendMessage(trimmed);
    setInputText('');
    setQuickRepliesHidden(true);
  };

  const onKeyDown = event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-stroke bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-sm">
            <HiSparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-black">{header.title || 'AI Wellness Coach'}</h2>
            <p className="text-xs text-primary">
              {header.subtitle || 'Powered by Claude · Knows your data'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stroke text-body transition hover:bg-gray"
          aria-label="Close"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      {modalData?.header_msg ? (
        <div className="border-b border-primary/15 bg-primary/5 px-5 py-3 text-xs leading-relaxed text-black">
          {modalData.header_msg}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto bg-[rgba(239,233,224,0.54)] px-5 py-5">
        {!ai_coach_id ? (
          <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-black">
            AI chat is not available on your account yet. Please try again later.
          </p>
        ) : (
          <div className="space-y-4">
            {modalData?.welcome_msg && (isWelcomeTyping || isWelcomeComplete) ? (
              <ChatBubble isStreaming={isWelcomeTyping}>
                {welcomeDisplayText}
              </ChatBubble>
            ) : null}

            {messages.map((message, index) => (
              <ChatBubble
                key={`${message.created_at}-${index}`}
                isMine={message.isSentByMe}
                isError={message.isError}
              >
                {message.message}
              </ChatBubble>
            ))}

            {streamingMessage ? (
              <ChatBubble isStreaming isError={streamingIsError}>
                {streamingMessage}
              </ChatBubble>
            ) : null}

            {(isAITyping && !streamingMessage) || isWelcomeTyping ? <TypingIndicator /> : null}

            {!quickRepliesHidden &&
            !isWelcomeTyping &&
            isWelcomeComplete &&
            !isAITyping &&
            !streamingMessage &&
            autoReplies.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                {autoReplies.map(item => (
                  <button
                    key={item.message}
                    type="button"
                    onClick={() => handleSend(item.message)}
                    disabled={!isConnected || !ai_coach_id}
                    className="rounded-full border border-primary/25 bg-white px-4 py-2.5 text-left text-sm text-primary transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {item.message}
                  </button>
                ))}
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-stroke bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={event => setInputText(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={modalData?.placeholder || 'Ask anything about your wellness...'}
            disabled={!ai_coach_id || !isConnected}
            className="h-12 flex-1 rounded-full border border-stroke bg-gray px-5 text-sm text-black outline-none transition placeholder:text-body focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputText.trim() || !ai_coach_id || !isConnected}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-meta-10"
            aria-label="Send message"
          >
            <FiSend className="h-5 w-5" />
          </button>
        </div>
        {ai_coach_id ? (
          <p className="mt-2 text-center text-[11px] text-body">
            {isConnected ? 'Connected' : 'Connecting…'} · {dayjs().format('hh:mm A')}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function AIWellnessCoachModal({ open, onClose, sessionKey = 0 }) {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: [queryKeys.customerV2AiModal],
    queryFn: getCustomerAiModal,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const modalData = response?.data?.data;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: 'overflow-hidden rounded-3xl',
        sx: { height: { xs: '92vh', sm: 'min(720px, 88vh)' }, maxHeight: '92vh' },
      }}
      sx={{
        zIndex: 1300,
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(28, 36, 52, 0.45)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      {isLoading ? (
        <div className="flex h-[420px] items-center justify-center">
          <Spinner />
        </div>
      ) : isError || !modalData ? (
        <div className="flex h-[320px] flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-body">Could not load AI coach. Please try again.</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/5"
          >
            Close
          </button>
        </div>
      ) : (
        <AICoachProvider key={`ai-coach-modal-${sessionKey}`}>
          <AIWellnessCoachModalChat modalData={modalData} onClose={onClose} />
        </AICoachProvider>
      )}
    </Dialog>
  );
}
