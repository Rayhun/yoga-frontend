'use client';
import { useEffect, useLayoutEffect, useRef } from 'react';
import dayjs from 'dayjs';
import useAuthContext from '@/hooks/useAuthContext';
import { useInbox } from '@/context/InboxContext';
import LoadingWrapper from '../common/loader/Wrapper';
import { FiPaperclip } from 'react-icons/fi';
import Image from 'next/image';
import SystemMessage from './SystemMessage';
import { isSystemMessage, getSystemMessageType } from '@/utils/messagePatterns';
import {
  ATTACHMENT_TYPE,
  getAttachmentDuration,
  getFileIcon,
  resolveAttachmentKind,
} from './chatMedia';
import VoiceNotePlayer from './VoiceNotePlayer';

const Attachment = ({ attachment, isMyMessage = false }) => {
  const url = attachment?.file || attachment?.url || '';
  const kind = resolveAttachmentKind(attachment);
  const fileName = decodeURIComponent(url.split('/').pop().split('?')[0] || 'file');
  const durationSeconds = getAttachmentDuration(attachment);

  if (kind === ATTACHMENT_TYPE.IMAGE) {
    return (
      <a href={url} target="_blank" rel="noreferrer" download className="block mb-2">
        <Image
          src={url}
          alt={fileName}
          width={250}
          height={250}
          className="rounded-lg object-cover border border-gray-200 max-w-[250px] max-h-[250px]"
        />
      </a>
    );
  }

  if (kind === ATTACHMENT_TYPE.VOICE || kind === ATTACHMENT_TYPE.AUDIO) {
    return (
      <VoiceNotePlayer
        url={url}
        durationSeconds={durationSeconds}
        isMyMessage={isMyMessage}
      />
    );
  }

  if (kind === ATTACHMENT_TYPE.VIDEO) {
    return (
      <div className="mb-2">
        <video
          src={url}
          controls
          className="rounded-lg border border-gray-200 max-w-[250px] max-h-[250px]"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <a
      href={url}
      download
      target="_blank"
      rel="noreferrer"
      className="flex items-center space-x-3 p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors duration-200 min-w-[180px] max-w-[280px]"
    >
      <div className="text-2xl">{getFileIcon(url)}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{fileName}</div>
        <div className="text-xs text-gray-500">Tap to download</div>
      </div>
      <FiPaperclip size={16} className="text-gray-400 flex-shrink-0" />
    </a>
  );
};

const Message = ({ isMyMessage, senderName, time, children, attachments = [] }) => (
  <>
    {isMyMessage ? (
      <div className="flex justify-end mb-1">
        <div className="max-w-[70%]">
          <div
            className="rounded-lg rounded-br-sm px-3 py-2 shadow-sm max-w-full relative"
            style={{ backgroundColor: '#DBF8C6' }}
          >
            {attachments.map(att => (
              <Attachment key={att.id || att.file} attachment={att} isMyMessage />
            ))}
            {typeof children === 'string' && children.trim() !== '' && (
              <p className="text-sm leading-relaxed text-black pr-12 font-medium">{children}</p>
            )}
            <div className="absolute bottom-2 right-2">
              <p className="text-xs text-gray-500">{dayjs(time).format('HH:mm')}</p>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="flex justify-start mb-1">
        <div className="max-w-[70%]">
          <div className="bg-white rounded-lg rounded-tl-sm px-3 py-2 shadow-sm border border-gray-200 max-w-full relative">
            {senderName && (
              <p className="text-xs font-semibold text-blue-600 mb-1">{senderName}</p>
            )}
            {attachments.map(att => (
              <Attachment key={att.id || att.file} attachment={att} isMyMessage={false} />
            ))}
            {typeof children === 'string' && children.trim() !== '' && (
              <p className="text-sm leading-relaxed text-gray-800 pr-12 font-medium">{children}</p>
            )}
            <div className="absolute bottom-2 right-2">
              <p className="text-xs text-gray-500">{dayjs(time).format('HH:mm')}</p>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);

const MessagesList = () => {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const knownIdsRef = useRef(new Set());
  const conversationIdRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const animateIdsRef = useRef(new Set());

  const {
    user: {
      profile: { id: loggedInUserID },
    },
  } = useAuthContext();
  const {
    conversations: { active: activeConversation },
    messages: { isLoading: isLoadingMessages, data: messages },
  } = useInbox();

  const conversationId = activeConversation?.id;

  // Reset tracking when switching conversations
  useEffect(() => {
    if (conversationId !== conversationIdRef.current) {
      conversationIdRef.current = conversationId;
      knownIdsRef.current = new Set();
      animateIdsRef.current = new Set();
      isInitialLoadRef.current = true;
    }
  }, [conversationId]);

  // Decide which messages get enter animation (new only — not history)
  if (Array.isArray(messages)) {
    const nextAnimate = new Set();
    messages.forEach(message => {
      const id = message?.id;
      if (id == null) return;
      if (!isInitialLoadRef.current && !knownIdsRef.current.has(id)) {
        nextAnimate.add(id);
      }
    });
    animateIdsRef.current = nextAnimate;
  }

  useLayoutEffect(() => {
    if (isLoadingMessages || !Array.isArray(messages)) return;

    const container = scrollContainerRef.current;
    const end = messagesEndRef.current;
    if (!container || !end) return;

    // History / conversation open: jump to bottom instantly (no staggered scroll fight)
    if (isInitialLoadRef.current) {
      end.scrollIntoView({ behavior: 'auto', block: 'end' });
      messages.forEach(m => {
        if (m?.id != null) knownIdsRef.current.add(m.id);
      });
      isInitialLoadRef.current = false;
      return;
    }

    // Realtime append: only smooth-scroll if user is already near the bottom
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distanceFromBottom < 120;

    messages.forEach(m => {
      if (m?.id != null) knownIdsRef.current.add(m.id);
    });

    if (nearBottom) {
      end.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoadingMessages]);

  return (
    <div
      className="relative min-h-0 flex-1 overflow-hidden"
      style={{ backgroundColor: '#EDE6DE' }}
    >
      <LoadingWrapper isLoading={isLoadingMessages}>
        <div
          ref={scrollContainerRef}
          className={`h-full min-h-0 overflow-y-auto overscroll-contain px-4 py-2 ${
            isInitialLoadRef.current ? 'animate-chatThreadIn' : ''
          }`}
          style={{ scrollBehavior: 'auto' }}
        >
          <div className="space-y-0.5">
            {[...messages].map(message => {
              const messageContent = message.content || message.message || '';

              if (isSystemMessage(message)) {
                return (
                  <SystemMessage
                    key={message.id}
                    message={messageContent}
                    time={message.created_at}
                    type={getSystemMessageType(message)}
                  />
                );
              }

              const shouldAnimate = animateIdsRef.current.has(message.id);

              return (
                <div
                  key={message.id}
                  className={shouldAnimate ? 'animate-chatMessageIn' : undefined}
                >
                  <Message
                    time={message.created_at}
                    senderName={
                      activeConversation?.is_group ? message.sender_name : undefined
                    }
                    isMyMessage={message.sender === loggedInUserID}
                    attachments={message?.attachments}
                  >
                    {messageContent}
                  </Message>
                </div>
              );
            })}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </LoadingWrapper>
    </div>
  );
};

export default MessagesList;
