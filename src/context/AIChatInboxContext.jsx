'use client';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import useChatSocket from '@/hooks/useChatSocket';
import useAuthContext from '@/hooks/useAuthContext';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';

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
  const streamingTextRef = useRef('');
  const streamingIntervalRef = useRef(null);

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
      const messageText = chatRoomMessage.message;

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
    <InboxContext.Provider
      value={{
        messages,
        connection: chatRoomConnection,
        isAITyping,
        streamingMessage,
        actions: { sendMessage: handleSendMessage },
      }}
    >
      {children}
    </InboxContext.Provider>
  );
}

export default AIChatInboxProvider;
