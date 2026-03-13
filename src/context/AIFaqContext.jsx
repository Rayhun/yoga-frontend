'use client';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import useChatSocket from '@/hooks/useChatSocket';
import useAuthContext from '@/hooks/useAuthContext';

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
  const streamingTextRef = useRef('');
  const streamingIntervalRef = useRef(null);

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
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  const streamText = (fullText, onComplete) => {
    streamingTextRef.current = '';
    setStreamingMessage('');
    setIsAITyping(true);

    let currentIndex = 0;

    const tokens = fullText.match(/\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\S+|\s+/g) || [];

    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }

    streamingIntervalRef.current = setInterval(() => {
      if (currentIndex < tokens.length) {
        streamingTextRef.current += tokens[currentIndex];
        setStreamingMessage(streamingTextRef.current);
        currentIndex++;
      } else {
        clearInterval(streamingIntervalRef.current);
        setIsAITyping(false);
        setStreamingMessage(null);
        onComplete();
      }
    }, 30);
  };

  useEffect(() => {
    if (chatRoomMessage) {
      // Handle error responses from backend
      if (chatRoomMessage.error) {
        setIsAITyping(false);
        const errorMessage = {
          message: chatRoomMessage.error,
          isSentByMe: false,
          isError: true,
          created_at: new Date().toISOString(),
        };
        setMessages(prevState => ({
          ...prevState,
          data: [...prevState.data, errorMessage],
        }));
        return;
      }

      const messageText = chatRoomMessage.message;

      // Skip if message is undefined or empty
      if (!messageText) {
        return;
      }

      if (!chatRoomMessage.isSentByMe) {
        streamText(messageText, () => {
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
        actions: { sendMessage: handleSendMessage },
      }}
    >
      {children}
    </AIFaqContext.Provider>
  );
}

export default AIFaqProvider;
