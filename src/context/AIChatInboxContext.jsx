'use client';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import useChatSocket from '@/hooks/useChatSocket';
import useAuthContext from '@/hooks/useAuthContext';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import { getAiChatFriendlyErrorMessage } from '@/utils/ai-chat-errors';
import { streamAiChatText } from '@/utils/ai-chat-stream';

const initialState = {
  messages: {
    isLoading: false,
    data: [],
  },
  connection: {
    isConnected: false,
    status: '',
  },
  isAITyping: false,
  streamingMessage: null,
  streamingIsError: false,
  actions: {
    setActiveConversation: () => null,
    sendMessage: () => null,
  },
};

export const InboxContext = createContext(initialState);

export const useAIChatInbox = () => useContext(InboxContext);

function AIChatInboxProvider({ children }) {
  const [messages, setMessages] = useState(initialState.messages);
  const [isAITyping, setIsAITyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [streamingIsError, setStreamingIsError] = useState(false);
  const streamCancelRef = useRef(null);

  const { get } = useSearchParamUtils();
  const type = get('type') || 'ai_chat';

  const {
    user: {
      profile: { ai_coach_id, ai_faq_id },
    },
  } = useAuthContext();

  const roomID = type === 'ai_chat' ? ai_coach_id : ai_faq_id;

  useEffect(() => {
    setMessages(initialState.messages);
  }, [type]);

  const {
    lastJsonMessage: chatRoomMessage,
    connection: chatRoomConnection,
    sendJsonMessage: sendMessageToChatRoom,
  } = useChatSocket(roomID ? `ai_chat/${roomID}` : '');

  useEffect(() => {
    return () => {
      streamCancelRef.current?.();
    };
  }, []);

  const streamAssistantMessage = (fullText, onComplete, { isError = false } = {}) => {
    streamCancelRef.current?.();
    setStreamingMessage('');
    setStreamingIsError(isError);
    setIsAITyping(true);

    streamCancelRef.current = streamAiChatText({
      fullText,
      onTokenUpdate: setStreamingMessage,
      onTypingStart: () => setIsAITyping(true),
      onTypingEnd: () => setIsAITyping(false),
      onComplete: () => {
        setStreamingMessage(null);
        setStreamingIsError(false);
        streamCancelRef.current = null;
        onComplete?.();
      },
    });
  };

  useEffect(() => {
    if (chatRoomMessage) {
      if (chatRoomMessage.error) {
        const friendlyError = getAiChatFriendlyErrorMessage(chatRoomMessage.error);
        streamAssistantMessage(
          friendlyError,
          () => {
            setMessages(prevState => ({
              ...prevState,
              data: [
                ...prevState.data,
                {
                  message: friendlyError,
                  isSentByMe: false,
                  isError: true,
                  created_at: new Date().toISOString(),
                },
              ],
            }));
          },
          { isError: true }
        );
        return;
      }

      const messageText = chatRoomMessage.message;
      if (!messageText) return;

      if (!chatRoomMessage.isSentByMe) {
        streamAssistantMessage(messageText, () => {
          setMessages(prevState => ({
            ...prevState,
            data: [...prevState.data, chatRoomMessage],
          }));
        });
      } else {
        setMessages(prevState => ({
          ...prevState,
          data: [...prevState.data, chatRoomMessage],
        }));
      }
    }
  }, [chatRoomMessage]);

  const handleSendMessage = message => {
    const userMessage = {
      message,
      isSentByMe: true,
      created_at: new Date().toISOString(),
    };

    setMessages(prevState => ({
      ...prevState,
      data: [...prevState.data, userMessage],
    }));

    setIsAITyping(true);
    sendMessageToChatRoom({ message });
  };

  return (
    <InboxContext.Provider
      value={{
        messages,
        connection: chatRoomConnection,
        isAITyping,
        streamingMessage,
        streamingIsError,
        actions: { sendMessage: handleSendMessage },
      }}
    >
      {children}
    </InboxContext.Provider>
  );
}

export default AIChatInboxProvider;
