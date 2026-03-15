'use client';
import { useAIFaq } from '@/context/AIFaqContext';

const ActiveConversationHeader = () => {
  const {
    connection: { isConnected: isSocketConnected, status: connectionStatus },
  } = useAIFaq();

  return (
    <div className="sticky h-[90px] bg-white flex items-center justify-between border-b border-stroke px-6 py-4.5 dark:border-strokedark">
      <div className="flex items-center min-w-[200px]">
        <div>
          <h5 className="font-medium text-black dark:text-white">Help & Support</h5>
          <p className="text-sm text-gray-600">How can I help you?</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: isSocketConnected ? 'green' : 'orange' }}
        />
        <span className="text-sm text-gray-600">{connectionStatus}</span>
      </div>
    </div>
  );
};

export default ActiveConversationHeader;
