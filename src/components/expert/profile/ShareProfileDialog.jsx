'use client';
import { useState, useRef } from 'react';
import Popup from '@/components/common/popup';
import { FiCopy, FiCheck, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ShareProfileDialog = ({ open, onClose, expertEmail, expertId }) => {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const username = expertEmail?.split('@')?.[0] || expertId;

  const profileUrl =
    typeof window !== 'undefined' && username ? `${window.location.origin}/expert/${username}` : '';

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(profileUrl);
      } else {
        const input = inputRef.current;
        input.select();
        input.setSelectionRange(0, 99999);
        const success = document.execCommand('copy');
        if (!success) throw new Error('execCommand failed');
        window.getSelection()?.removeAllRanges();
      }
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleOpenLink = () => {
    window.open(profileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Popup open={open} onClose={onClose} size="sm" heading="Share Your Profile">
      <div className="flex flex-col gap-6 text-left">
        <p className="text-gray-600 text-sm text-center">
          Share your public profile link with clients and on social media to grow your reach.
        </p>

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
          <input
            ref={inputRef}
            type="text"
            readOnly
            value={profileUrl}
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none truncate"
          />
          <button
            onClick={handleOpenLink}
            className="flex-shrink-0 p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
            title="Open in new tab"
          >
            <FiExternalLink size={18} />
          </button>
        </div>

        <button
          onClick={handleCopy}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
            copied
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md'
          }`}
        >
          {copied ? (
            <>
              <FiCheck size={18} />
              Copied!
            </>
          ) : (
            <>
              <FiCopy size={18} />
              Copy Link
            </>
          )}
        </button>
      </div>
    </Popup>
  );
};

export default ShareProfileDialog;
