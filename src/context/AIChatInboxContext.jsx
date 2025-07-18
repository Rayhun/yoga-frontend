'use client';
import { createContext, use, useContext, useEffect, useState } from 'react';
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
  actions: {
    setActiveConversation: () => null,
    sendMessage: () => null,
  },
};

export const InboxContext = createContext(initialState);

export const useAIChatInbox = () => useContext(InboxContext);

function AIChatInboxProvider({ children }) {
  const [messages, setMessages] = useState(initialState.messages);
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
    if (chatRoomMessage) {
      setMessages(prevState => ({ ...prevState, data: [...prevState.data, chatRoomMessage] }));
    }
  }, [chatRoomMessage]);

  

  const handleSendMessage = (message) => {
    setMessages(prevState => ({ ...prevState, data: [...prevState.data, { message, isSentByMe: true }] }));
    sendMessageToChatRoom({ message });
  };

  return (
    <InboxContext.Provider
      value={{
        messages,
        connection: chatRoomConnection,
        actions: { sendMessage: handleSendMessage },
      }}
    >
      {children}
    </InboxContext.Provider>
  );
}

export default AIChatInboxProvider;
