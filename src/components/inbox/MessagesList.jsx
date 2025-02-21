'use client';
import { useInbox } from '@/context/InboxContext';
import LoadingWrapper from '../common/loader/Wrapper';

const MessagesList = () => {
  const {
    messages: { isLoading: isLoadingMessages },
  } = useInbox();

  return (
    <div className="h-full">
      <LoadingWrapper isLoading={isLoadingMessages}>
        <div className="no-scrollbar max-h-full space-y-3.5 overflow-auto px-6 py-7.5">
          <div className="max-w-125">
            <p className="mb-2.5 text-sm font-medium">Andri Thomas</p>
            <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2">
              <p>I want to make an appointment tomorrow from 2:00 to 5:00pm?</p>
            </div>
            <p className="text-xs">1:55pm</p>
          </div>
          <div className="ml-auto max-w-125">
            <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3">
              <p className="text-white">Hello, Thomas! I will check the schedule and inform you</p>
            </div>
            <p className="text-right text-xs">1:55pm</p>
          </div>
          <div className="max-w-125">
            <p className="mb-2.5 text-sm font-medium">Andri Thomas</p>
            <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2">
              <p>Ok, Thanks for your reply.</p>
            </div>
            <p className="text-xs">1:55pm</p>
          </div>
          <div className="ml-auto max-w-125">
            <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3">
              <p className="text-white">You are welcome!</p>
            </div>
            <p className="text-right text-xs">1:55pm</p>
          </div>
          <div className="max-w-125">
            <p className="mb-2.5 text-sm font-medium">Andri Thomas</p>
            <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2">
              <p>I want to make an appointment tomorrow from 2:00 to 5:00pm?</p>
            </div>
            <p className="text-xs">1:55pm</p>
          </div>
          <div className="ml-auto max-w-125">
            <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3">
              <p className="text-white">Hello, Thomas! I will check the schedule and inform you</p>
            </div>
            <p className="text-right text-xs">1:55pm</p>
          </div>
          <div className="max-w-125">
            <p className="mb-2.5 text-sm font-medium">Andri Thomas</p>
            <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2">
              <p>Ok, Thanks for your reply.</p>
            </div>
            <p className="text-xs">1:55pm</p>
          </div>
          <div className="ml-auto max-w-125">
            <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3">
              <p className="text-white">You are welcome!</p>
            </div>
            <p className="text-right text-xs">1:55pm</p>
          </div>
        </div>
      </LoadingWrapper>
    </div>
  );
};

export default MessagesList;
