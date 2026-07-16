import { useRef, useState } from 'react';
import { FiPaperclip } from 'react-icons/fi';
import {
  CHAT_DOC_ACCEPT,
  isAllowedChatDoc,
  MAX_CHAT_FILE_BYTES,
} from './chatMedia';

const AttachmentButton = ({ onFileSelect }) => {
  const fileInput = useRef(null);
  const [error, setError] = useState('');

  const openFileDialog = () => {
    setError('');
    fileInput.current?.click();
  };

  const handleFileChange = e => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const accepted = [];
    const rejected = [];

    fileArray.forEach(file => {
      if (!isAllowedChatDoc(file)) {
        rejected.push(`${file.name} (unsupported type)`);
        return;
      }
      if (file.size > MAX_CHAT_FILE_BYTES) {
        rejected.push(`${file.name} (max 25MB)`);
        return;
      }
      accepted.push(file);
    });

    if (accepted.length > 0) {
      onFileSelect(accepted);
    }
    if (rejected.length > 0) {
      setError(
        `Skipped: ${rejected.slice(0, 2).join(', ')}${rejected.length > 2 ? '…' : ''}. Allowed: PDF, DOC, XLS, PPT, TXT, JPG, PNG.`
      );
    } else {
      setError('');
    }

    e.target.value = null;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openFileDialog}
        className="h-8 w-8 flex flex-shrink-0 rounded-full justify-center items-center text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-all duration-200 transform hover:scale-110 active:scale-95"
        title="Attach docs or images (PDF, DOC, XLS, PPT, TXT, JPG, PNG)"
      >
        <FiPaperclip size={18} />
      </button>
      <input
        ref={fileInput}
        type="file"
        multiple
        accept={CHAT_DOC_ACCEPT}
        className="hidden"
        onChange={handleFileChange}
      />
      {error && (
        <div className="absolute bottom-full left-0 mb-2 w-64 rounded-lg bg-red-600 text-white text-xs px-2 py-1 shadow-lg z-20">
          {error}
          <button type="button" className="ml-2 underline" onClick={() => setError('')}>
            dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default AttachmentButton;
