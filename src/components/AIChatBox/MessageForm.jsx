'use client';
import { useEffect, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import useSearchParamUtils from '@/hooks/useSearchParamUtils';
import { useAIChatInbox } from '@/context/AIChatInboxContext';

const MessageForm = () => {
  const { get, remove } = useSearchParamUtils();

  const [inputText, setInputText] = useState(() => get('message') || '');
  const type = get('type') || 'ai_chat';

  useEffect(() => {
    if (get('message')) remove('message');
  });

  const {
    actions: { sendMessage },
  } = useAIChatInbox();

  const placeholder = type === 'ai_chat' ? 'Ask anything about your practice...' : 'How can I help?';

  const handleSendMessage = () => {
    if (inputText) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const onInputChange = event => {
    setInputText(event.target.value);
  };

  const onKeyDown = event => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="sticky h-[90px] bottom-0 border-t border-stroke bg-white px-6 py-5 dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between space-x-4.5 relative">
        <div className="relative w-full">
          <input
            type="text"
            value={inputText}
            onKeyDown={onKeyDown}
            onChange={onInputChange}
            placeholder={placeholder}
            className="h-13 w-full rounded-full border border-stroke bg-gray pl-5 pr-19 text-black placeholder-body outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
          />
        </div>
        <button
          className={`flex h-13 w-full max-w-13 items-center justify-center rounded-full text-white shadow ${inputText ? 'bg-primary hover:bg-opacity-90' : 'bg-gray-300 cursor-not-allowed'}`}
          onClick={handleSendMessage}
          disabled={!inputText}
        >
          <FiSend size={22} />
        </button>
      </div>
    </div>
  );
};

export default MessageForm;
