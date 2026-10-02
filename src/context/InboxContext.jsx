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
    if (conversationsData) {
      const mappedConversations = conversationsData.map(conversation => ({
        id: conversation.conversation_id,
        is_group: conversation.is_group,
        name: conversation.name,
        message: conversation.last_message,
        time: conversation.last_message_time,
        unread_count: conversation.unread_message_count,
        members_count: conversation.members_count || 0,
        is_coach: conversation.is_coach || false,
        coach_status: conversation.coach_status,
        coach_title: conversation.coach_title,
        other_user_id: conversation.other_user_id,
        can_view_detail: conversation.can_view_detail || false,
        detail_url: conversation.detail_url || null,
      }));

      setConversations(prevState => {
        // Preserve the active conversation if it still exists in the new data
        let activeConversation = prevState.active;
        if (activeConversation) {
          const updatedActive = mappedConversations.find(c => c.id === activeConversation.id);
          if (updatedActive) {
            // Update the active conversation with latest data while preserving the reference
            activeConversation = { ...activeConversation, ...updatedActive };
          } else {
            // If active conversation is not in the list anymore, clear it
            activeConversation = null;
          }
        }

        return {
          ...prevState,
          isLoading: false,
          active: activeConversation,
          data: mappedConversations,
        };
      });
    }
  }, [conversationsData]);

  useEffect(() => {
    if (conversationMessage) {
      const targetConversation = conversationMessage || {};
      
      setConversations(prevState => {
        // Find the existing conversation to preserve its data
        const existingConversation = prevState.data.find(c => c.id === targetConversation.conversation_id);
        
        // Merge existing conversation data with new WebSocket data
        // This ensures we preserve fields like is_coach, coach_status, etc. that might not be in the WebSocket message
        const updatedConversation = existingConversation ? {
          ...existingConversation, // Preserve existing data first
          id: targetConversation.conversation_id,
          is_group: targetConversation.is_group ?? existingConversation.is_group ?? false,
          name: targetConversation.name || existingConversation.name || 'No',
          message: targetConversation.last_message ?? existingConversation.message ?? '',
          time: targetConversation.last_message_time ?? existingConversation.time ?? null,
          unread_count: targetConversation.unread_message_count ?? existingConversation.unread_count ?? 0,
          members_count: targetConversation.members_count ?? existingConversation.members_count ?? 0,
          // Preserve coach-related fields from existing conversation if not in WebSocket message
          is_coach: targetConversation.is_coach ?? existingConversation.is_coach ?? false,
          coach_status: targetConversation.coach_status ?? existingConversation.coach_status ?? null,
          coach_title: targetConversation.coach_title ?? existingConversation.coach_title ?? null,
          other_user_id: targetConversation.other_user_id ?? existingConversation.other_user_id ?? null,
          can_view_detail: targetConversation.can_view_detail ?? existingConversation.can_view_detail ?? false,
          detail_url: targetConversation.detail_url ?? existingConversation.detail_url ?? null,
        } : {
          // If conversation doesn't exist yet, create it with defaults
          id: targetConversation.conversation_id,
          is_group: targetConversation.is_group ?? false,
          name: targetConversation.name || 'No',
          message: targetConversation.last_message ?? '',
          time: targetConversation.last_message_time ?? null,
          unread_count: targetConversation.unread_message_count ?? 0,
          members_count: targetConversation.members_count ?? 0,
          is_coach: targetConversation.is_coach ?? false,
          coach_status: targetConversation.coach_status ?? null,
          coach_title: targetConversation.coach_title ?? null,
          other_user_id: targetConversation.other_user_id ?? null,
          can_view_detail: targetConversation.can_view_detail ?? false,
          detail_url: targetConversation.detail_url ?? null,
        };
        
        const restConversations = prevState.data.filter(i => i.id !== targetConversation.conversation_id);
        
        // Preserve the active conversation if it matches the updated one
        const activeConversation = prevState.active?.id === updatedConversation.id 
          ? { ...prevState.active, ...updatedConversation }
          : prevState.active;
        
        return {
          ...prevState,
          active: activeConversation,
          data: [
            updatedConversation,
            ...restConversations,
          ],
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationMessage]);

  useEffect(() => {
    if (chatRoomMessage) {
      setMessages(prevState => ({ ...prevState, data: [...prevState.data, chatRoomMessage.data] }));
    }
  }, [chatRoomMessage]);

  const setActiveConversation = useCallback(async selected => {
    if (!selected) {
      setConversations(prevState => ({
        ...prevState,
        active: null,
      }));
      setRoomID('');
      setMessages({ isLoading: false, data: [] });
      return;
    }

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
