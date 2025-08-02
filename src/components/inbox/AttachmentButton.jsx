import { getPreSignedUrl } from '@/services/private/inbox/conversation';
import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import { FiPaperclip } from 'react-icons/fi';

const AttachmentButton = ({ onComplete }) => {
  const fileInput = useRef(null);
  const { mutateAsync: getUrl, isPending: isLoadingUrl } = useMutation({
    mutationFn: getPreSignedUrl,
  });

  const openFileDialog = () => {
    fileInput.current?.click();
  };

  const handleFileChange = async e => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const response = await getUrl({file});
        const { file_link } = response.data;
        onComplete(file_link);
      } catch (err) {
        console.error(`Upload failed for ${file.name}`, err);
      }
    }
    e.target.value = null;
  };

  return (
    <>
      <button
        type="button"
        onClick={openFileDialog}
        disabled={isLoadingUrl}
        className="h-13 w-13 flex flex-shrink-0 rounded-md justify-center items-center bg-gray-100 text-gray-600 hover:bg-gray-200"
      >
        {isLoadingUrl ? '...' : <FiPaperclip size={20} />}
      </button>
      <input ref={fileInput} type="file" multiple className="hidden" onChange={handleFileChange} />
    </>
  );
};

export default AttachmentButton;
