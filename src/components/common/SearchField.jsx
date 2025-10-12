'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiSend } from 'react-icons/fi';

const ChatWithAI = () => {
  const [inputText, setInputText] = useState('');
  const router = useRouter()

  const handleSendMessage = () => {
    if (inputText) {
      router.push(`/portal/ai-chat?message=${inputText}`)
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
    <div className="w-full">
      <div className="flex gap-4 items-center w-full">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onKeyDown={onKeyDown}
            onChange={onInputChange}
            placeholder="Ask me anything about your wellness..."
            className="h-14 w-full rounded-xl border-2 border-emerald-200 bg-white/80 backdrop-blur-sm px-6 pr-16 text-gray-800 placeholder-gray-500 outline-none focus:border-emerald-400 focus:bg-white focus:shadow-lg transition-all duration-300"
          />
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 hover:scale-105 shadow-md"
            onClick={handleSendMessage}
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
      <div className="mt-3 flex justify-center">
        <Link href={'/portal/ai-chat'} className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium transition-colors">
          Open full chat →
        </Link>
      </div>
    </div>
  );
};

export default ChatWithAI;
