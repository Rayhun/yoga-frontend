'use client';
import { useState } from 'react';
import { FiPaperclip, FiSend } from 'react-icons/fi';
import { useInbox } from '@/context/InboxContext';
import AttachmentButton from './AttachmentButton';
import { MdDelete } from 'react-icons/md';
import Image from 'next/image';

const Attachments = ({ attachments, removeAttachment }) => {
  return (
    attachments.length > 0 && (
      <div className="absolute top-[-80px] left-[-20px] mt-2 flex space-x-2">
        {attachments.map((url, idx) => {
          const isImage = /\.(jpe?g|png|gif|bmp|webp)$/i.test(url);
          return (
            <div key={idx} className="relative w-15 h-15 rounded overflow-hidden border z-full">
              <button
                onClick={() => removeAttachment(idx)}
                className="absolute top-0 right-0 z-999 rounded-full bg-white p-0.5 text-red-500"
              >
                <MdDelete size={15} />
              </button>

              {isImage ? (
                <Image src={url} width={150} height={150} alt={`attachment-${idx}`} className="object-cover w-full h-full" />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <FiPaperclip size={16} className="text-gray-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    )
  );
};

const MessageForm = () => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const {
    actions: { sendMessage },
  } = useInbox();

  const handleSendMessage = () => {
    if (inputText.trim() !== '' || attachments.length > 0) {
      sendMessage({ message: inputText, attachments });
      setInputText('');
      setAttachments([]);
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

  const removeAttachment = (indexToRemove) => {
    setAttachments(prev => prev.filter((_, i) => i !== indexToRemove));
  };
  

  return (
    <div className="sticky h-[90px] bottom-0 border-t border-stroke bg-white px-6 py-5 dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between space-x-4.5 relative">
        <AttachmentButton onComplete={url => setAttachments(prev => [...prev, url])} />
        <div className="relative w-full">
          <input
            type="text"
            value={inputText}
            onKeyDown={onKeyDown}
            onChange={onInputChange}
            placeholder="Type something here"
            className="h-13 w-full rounded-md border border-stroke bg-gray pl-5 pr-19 text-black placeholder-body outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
          />
        </div>
        <button
          className="flex h-13 w-full max-w-13 items-center justify-center rounded-md bg-primary text-white hover:bg-opacity-90"
          onClick={handleSendMessage}
        >
          <FiSend size={24} />
        </button>

        <Attachments attachments={attachments} removeAttachment={removeAttachment} />
      </div>
    </div>
  );
};

export default MessageForm;
