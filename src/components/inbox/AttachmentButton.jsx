import { getPreSignedUrl } from '@/services/private/inbox/conversation';
import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import { FiPaperclip } from 'react-icons/fi';

const AttachmentButton = ({ onFileSelect }) => {
  const fileInput = useRef(null);

  const openFileDialog = () => {
    fileInput.current?.click();
  };

  const handleFileChange = e => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to Array and pass to parent
    const fileArray = Array.from(files);
    onFileSelect(fileArray);
    
    e.target.value = null;
  };

  return (
    <>
      <button
        type="button"
        onClick={openFileDialog}
        className="h-8 w-8 flex flex-shrink-0 rounded-full justify-center items-center text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-all duration-200 transform hover:scale-110 active:scale-95"
        title="Attach files"
      >
        <FiPaperclip size={18} />
      </button>
      <input ref={fileInput} type="file" multiple className="hidden" onChange={handleFileChange} />
    </>
  );
};

export default AttachmentButton;
