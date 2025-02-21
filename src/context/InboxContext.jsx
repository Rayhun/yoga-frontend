'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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
  actions: {
    setActiveConversation: () => null,
  },
};

export const InboxContext = createContext(initialState);

export const useInbox = () => useContext(InboxContext);

function InboxProvider({ children }) {
  const [conversations, setConversations] = useState(initialState.conversations);
  const [messages, setMessages] = useState(initialState.messages);

  useEffect(() => {
    setTimeout(() => {
      setConversations({
        isLoading: false,
        data: [
          {
            id: 1,
            img: '/images/user/user-03.png',
            name: 'Henry Dholi',
            message: 'I cam across your profile and...',
          },
          {
            id: 2,
            img: '/images/user/user-04.png',
            name: 'Mariya Desoja',
            message: 'I like your confidence 💪',
          },
          {
            id: 3,
            img: '/images/user/user-05.png',
            name: 'Robert Jhon',
            message: 'Can you share your offer?',
          },
          {
            id: 4,
            img: '/images/user/user-01.png',
            name: 'Cody Fisher',
            message: `I'm waiting for you response!`,
          },
          {
            id: 5,
            img: '/images/user/user-02.png',
            name: 'Jenny Wilson',
            message: 'I cam across your profile and...',
          },
        ],
      });
    }, 1000);
  }, []);

  const setActiveConversation = useCallback(selected => {
    setConversations(prevState => ({ ...prevState, active: selected }));
    setMessages(prevState => ({ ...prevState, isLoading: true }));
    setTimeout(() => {
      setMessages({
        isLoading: false,
        data: [],
      });
    }, 1000);
  }, []);

  return (
    <InboxContext.Provider value={{ conversations, messages, actions: { setActiveConversation } }}>
      {children}
    </InboxContext.Provider>
  );
}

export default InboxProvider;
