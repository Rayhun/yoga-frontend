'use client';
import { useState } from 'react';
import { useInbox } from '@/context/InboxContext';
import Link from 'next/link';

const ChatWithAI = () => {
  const [inputText, setInputText] = useState('');
  const {
    actions: { sendMessage },
  } = useInbox();

  const handleSendMessage = () => {
    if (inputText) {
      sendMessage({ message: inputText });
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
    <div className="bottom-0 left-0 w-full border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
      <div className="pl-1 mb-4 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">AI Coach</h3>
        <Link href={'/#'} className="text-sm text-primary hover:text-primary hover:underline">
          Chat
        </Link>
      </div>
      <div className="flex items-center w-full">
        <input
          type="text"
          value={inputText}
          onKeyDown={onKeyDown}
          onChange={onInputChange}
          placeholder="Type something here..."
          className="h-12 w-full rounded-md border border-stroke bg-gray px-5 text-black placeholder-body outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
        />
      </div>
    </div>
  );
};

export default ChatWithAI;
