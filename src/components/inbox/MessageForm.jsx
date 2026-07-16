'use client';
import { useCallback, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { useInbox } from '@/context/InboxContext';
import AttachmentButton from './AttachmentButton';
import VoiceNoteButton from './VoiceNoteButton';
import { MdDelete } from 'react-icons/md';
import { ATTACHMENT_TYPE, buildAttachmentPayload, getExtension, getFileIcon } from './chatMedia';

const Attachments = ({ selectedFiles, removeFile, onClearAll }) => {
  const isImageFile = file => /\.(jpe?g|png|gif|bmp|webp)$/i.test(file.name);

  return (
    selectedFiles.length > 0 && (
      <div className="mb-3 animate-fadeIn">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <button
              onClick={onClearAll}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors duration-200"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {selectedFiles.map((file, idx) => (
              <div
                key={`file-${idx}`}
                className="relative group animate-slideInUp"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {isImageFile(file) ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-green-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${idx}`}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-100 transition-all duration-300 shadow-lg hover:bg-red-600 transform hover:scale-110 z-10"
                    >
                      <MdDelete size={12} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-xs truncate">{file.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-24 h-24 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-3 hover:border-green-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                    <div className="text-3xl mb-1">{getFileIcon(file.name)}</div>
                    <div
                      className="text-xs text-gray-600 text-center truncate w-full font-medium"
                      title={file.name}
                    >
                      {file.name.length > 10 ? file.name.substring(0, 10) + '...' : file.name}
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-100 transition-all duration-300 shadow-lg hover:bg-red-600 transform hover:scale-110 z-10"
                    >
                      <MdDelete size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

const MessageForm = () => {
  const [inputText, setInputText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const {
    actions: { sendMessage },
  } = useInbox();

  const uploadFiles = useCallback(async files => {
    const { getPreSignedUrl } = await import('@/services/private/inbox/conversation');
    const uploadedFiles = [];

    for (const file of files) {
      try {
        const response = await getPreSignedUrl({ file });
        const fileLink = response.data?.file_link || response.file_link;
        if (fileLink) {
          uploadedFiles.push(fileLink);
        }
      } catch (err) {
        console.error(`Upload failed for ${file.name}`, err);
        throw err;
      }
    }

    return uploadedFiles;
  }, []);

  const handleSendMessage = async () => {
    if (inputText.trim() === '' && selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedFiles =
        selectedFiles.length > 0 ? await uploadFiles(selectedFiles) : [];

      const attachments = uploadedFiles.map((fileUrl, index) => {
        const file = selectedFiles[index];
        const ext = getExtension(file?.name || fileUrl);
        let fileType = ATTACHMENT_TYPE.DOCUMENT;
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
          fileType = ATTACHMENT_TYPE.IMAGE;
        }
        return buildAttachmentPayload({ fileUrl, fileType });
      });

      sendMessage({ message: inputText, attachments });
      setInputText('');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendVoice = useCallback(
    async (file, durationSec) => {
      setIsUploading(true);
      try {
        const [fileLink] = await uploadFiles([file]);
        if (!fileLink) {
          throw new Error('Voice note upload failed');
        }
        sendMessage({
          message: '',
          attachments: [
            buildAttachmentPayload({
              fileUrl: fileLink,
              fileType: ATTACHMENT_TYPE.VOICE,
              durationSeconds: durationSec,
            }),
          ],
        });
      } finally {
        setIsUploading(false);
      }
    },
    [sendMessage, uploadFiles]
  );

  const onInputChange = event => {
    setInputText(event.target.value);
  };

  const onKeyDown = event => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const removeFile = indexToRemove => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleFileSelect = files => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
  };

  const showMic = inputText.trim() === '' && selectedFiles.length === 0;

  return (
    <div className="bg-white border-t border-gray-200 relative">
      <div className="p-3">
        <Attachments
          selectedFiles={selectedFiles}
          removeFile={removeFile}
          onClearAll={handleClearAll}
        />
        <div className="bg-gray-100 rounded-2xl p-2">
          <div className="flex items-center space-x-2">
            <AttachmentButton onFileSelect={handleFileSelect} />
            <div className="flex-1">
              <input
                type="text"
                value={inputText}
                onKeyDown={onKeyDown}
                onChange={onInputChange}
                placeholder="Type a message"
                className="w-full bg-white rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            {showMic ? (
              <VoiceNoteButton onSendVoice={handleSendVoice} disabled={isUploading} />
            ) : (
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSendMessage}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiSend size={16} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageForm;
