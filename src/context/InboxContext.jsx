'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useChatSocket from '@/hooks/useChatSocket';
import { getMyConversationMessages, getMyConversations } from '@/services/private/inbox/conversation';
import queryKeys from '@/utils/query-keys';

const initialState = {
  conversations: {
    isLoading: true,
    data: [],
    active: null,
  },
  messages: {
    isLoading: true,
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

export const useInbox = () => useContext(InboxContext);

function InboxProvider({ children }) {
  const [roomID, setRoomID] = useState('');
  const [conversations, setConversations] = useState(initialState.conversations);
  const [messages, setMessages] = useState(initialState.messages);

  const { lastJsonMessage: conversationMessage } = useChatSocket(`conversation`);

  const {
    lastJsonMessage: chatRoomMessage,
    connection: chatRoomConnection,
    sendJsonMessage: sendMessageToChatRoom,
  } = useChatSocket(roomID ? `conversation/${roomID}` : '');

  const { isFetching: isLoadingConversations, data: conversationsResponse } = useQuery({
    queryFn: getMyConversations,
    queryKey: [queryKeys.inboxConversations],
    refetchOnMount: 'always',
  });

  const conversationsData = conversationsResponse?.data?.data;

  useEffect(() => {
    setConversations(prevState => ({
      ...prevState,
      isLoading: false,
      data:
        conversationsData?.map(conversation => ({
          id: conversation.conversation_id,
          is_group: conversation.is_group,
          name: conversation.name,
          message: conversation.last_message,
          time: conversation.last_message_time,
          unread_count: conversation.unread_message_count,
        })) || [],
    }));
  }, [conversationsData]);

  useEffect(() => {
    if (conversationMessage) {
      const targetConversation = conversationMessage || {};
      const restConversations = conversations.data.filter(i => i.id !== targetConversation.conversation_id);
      setConversations(prevState => ({
        ...prevState,
        data: [
          {
            id: targetConversation.conversation_id,
            is_group: targetConversation.is_group,
            name: targetConversation.name || 'No',
            message: targetConversation.last_message,
            time: targetConversation.last_message_time,
            unread_count: targetConversation.unread_message_count,
          },
          ...restConversations,
        ],
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationMessage]);

  useEffect(() => {
    if (chatRoomMessage) {
      setMessages(prevState => ({ ...prevState, data: [...prevState.data, chatRoomMessage.data] }));
    }
  }, [chatRoomMessage]);

  useEffect(() => {
    const emptyMessage = document.getElementById('empty-message');
    emptyMessage?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.data]);

  const setActiveConversation = useCallback(async selected => {
    setConversations(prevState => ({
      ...prevState,
      active: selected,
      data: prevState.data.map(i => (i.id === selected.id ? { ...i, unread_count: 0 } : i)),
    }));
    setRoomID(selected.id);
    setMessages(prevState => ({ ...prevState, isLoading: true }));

    try {
      const { data: response } = await getMyConversationMessages({ id: selected.id });
      setMessages({ isLoading: false, data: response?.data || [] });
    } catch (error) {
      setMessages({ isLoading: false, data: [] });
      toast.error('Something went wrong in fetching conversation messages');
    }
  }, []);

  return (
    <InboxContext.Provider
      value={{
        conversations: { ...conversations, isLoading: isLoadingConversations || conversations.isLoading },
        messages,
        connection: chatRoomConnection,
        actions: { setActiveConversation, sendMessage: sendMessageToChatRoom },
      }}
    >
      {children}
    </InboxContext.Provider>
  );
}

export default InboxProvider;
