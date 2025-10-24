'use client';
import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import useAuthContext from '@/hooks/useAuthContext';
import { useInbox } from '@/context/InboxContext';
import LoadingWrapper from '../common/loader/Wrapper';
import { FiPaperclip, FiFileText } from 'react-icons/fi';
import Image from 'next/image';
import SystemMessage from './SystemMessage';
import { isSystemMessage, getSystemMessageType } from '@/utils/messagePatterns';

const Attachment = ({ url }) => {
  const isImage = /\.(jpe?g|png|gif|bmp|webp)(\?.*)?$/i.test(url);
  const isVideo = /\.(mp4|avi|mov|wmv|flv|webm)(\?.*)?$/i.test(url);
  const fileName = url.split('/').pop().split('?')[0];
  
  const getFileIcon = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📋';
      case 'txt':
        return '📃';
      case 'zip':
      case 'rar':
        return '📦';
      case 'mp3':
      case 'wav':
        return '🎵';
      default:
        return '📎';
    }
  };

  if (isImage) {
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

  if (isVideo) {
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
      className="flex items-center space-x-3 p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors duration-200"
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
          <div className="rounded-lg rounded-br-sm px-3 py-2 shadow-sm max-w-full relative" style={{ backgroundColor: '#DBF8C6' }}>
            {/* Show attachments first (above text) */}
            {attachments.map(att => (
              <Attachment key={att.id} url={att.file || att.url} />
            ))}
            {/* Show text message below attachments */}
            {children && (
              <p className="text-sm leading-relaxed text-black pr-12 font-medium">{children}</p>
            )}
            {/* Timestamp inside bubble at bottom right */}
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
            {/* Show sender name in group chat */}
            {senderName && (
              <p className="text-xs font-semibold text-blue-600 mb-1">{senderName}</p>
            )}
            {/* Show attachments first (above text) */}
            {attachments.map(att => (
              <Attachment key={att.id} url={att.file || att.url} />
            ))}
            {/* Show text message below attachments */}
            {children && (
              <p className="text-sm leading-relaxed text-gray-800 pr-12 font-medium">{children}</p>
            )}
            {/* Timestamp inside bubble at bottom right */}
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
  const {
    user: {
      profile: { id: loggedInUserID },
    },
  } = useAuthContext();
  const {
    conversations: { active: activeConversation },
    messages: { isLoading: isLoadingMessages, data: messages },
  } = useInbox();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div 
      className="flex-1 overflow-hidden relative"
      style={{
        backgroundImage: 'url(/images/bg-whatsapp.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <LoadingWrapper isLoading={isLoadingMessages}>
        <div className="h-full overflow-y-auto px-4 py-2 scroll-smooth">
          <div className="space-y-0.5">
            {[...messages].map((message, index) => {
              const messageContent = message.content || message.message || '';
              
              // Check if this should be displayed as a system message
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
              
              // Regular user message
              return (
                <div
                  key={message.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Message
                    time={message.created_at}
                    senderName={activeConversation.is_group ? message.sender_name : undefined}
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
