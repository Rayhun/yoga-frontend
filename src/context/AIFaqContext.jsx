'use client';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import useChatSocket from '@/hooks/useChatSocket';
import useAuthContext from '@/hooks/useAuthContext';
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
    sendMessage: () => null,
  },
};

export const AIFaqContext = createContext(initialState);

export const useAIFaq = () => useContext(AIFaqContext);

function AIFaqProvider({ children }) {
  const [messages, setMessages] = useState(initialState.messages);
  const [isAITyping, setIsAITyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [streamingIsError, setStreamingIsError] = useState(false);
  const streamCancelRef = useRef(null);

  const {
    user: {
      profile: { ai_faq_id },
    },
  } = useAuthContext();

  const {
    lastJsonMessage: chatRoomMessage,
    connection: chatRoomConnection,
    sendJsonMessage: sendMessageToChatRoom,
  } = useChatSocket(ai_faq_id ? `ai_faq/${ai_faq_id}` : '');

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
    <AIFaqContext.Provider
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
    </AIFaqContext.Provider>
  );
}

export default AIFaqProvider;
