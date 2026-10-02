'use client';

import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getCommunityColor } from './communityColors';

const copyToClipboard = async text => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const success = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!success) throw new Error('Copy failed');
};

const WhatsNextMessageBox = () => (
  <div className="rounded-xl border border-[#E8DFD0] bg-[#F5EFE6] px-5 py-5 md:px-6 md:py-6">
    <p className="text-sm font-semibold text-gray-900 md:text-base">💡 What&apos;s Next?</p>
    <p className="mt-3 text-sm font-semibold text-gray-900 md:text-base">Your Circle is live!</p>
    <p className="mt-3 text-sm leading-relaxed text-gray-700 md:text-base">
      Share your invitation link with current clients, past clients, your email list, WhatsApp,
      social media, website, or newsletter.
    </p>
    <p className="mt-3 text-sm leading-relaxed text-gray-700 md:text-base">
      Everyone who joins using your link will automatically become a member of your Circle.
    </p>
    <p className="mt-4 text-sm leading-relaxed text-gray-700 md:text-base">
      <span className="font-semibold">⭐ Tip:</span> Let people know they can join NourishDoc for
      just $1 for their first month—it makes it easy for them to get started.
    </p>
  </div>
);

const SharingCardSection = ({ section }) => {
  const [copied, setCopied] = useState(false);
  const actions = section?.actions || {};
  const copyButton = actions.copy_button;
  const inviteUrl = section?.invite_url || '';
  const isLocked = Boolean(section?.is_locked) || !inviteUrl;
  const placeholder =
    section?.invite_url_placeholder || 'Save your Circle title to generate your invite link';

  const handleCopyLink = async () => {
    if (!inviteUrl || isLocked) return;

    try {
      await copyToClipboard(inviteUrl);
      setCopied(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy invite link');
    }
  };

  return (
    <div
      className="rounded-2xl border border-gray-100 p-6 shadow-sm md:p-8"
      style={{
        backgroundColor: getCommunityColor(section?.background_color, '#FFFFFF'),
      }}
    >
      {section?.title ? (
        <h3
          className="mb-2 font-serif text-2xl font-bold md:text-3xl"
          style={{ color: getCommunityColor(section?.title_color, '#111827') }}
        >
          {section.title}
        </h3>
      ) : null}

      {section?.subtitle ? (
        <p
          className="mb-6 text-sm md:text-base"
          style={{ color: getCommunityColor(section?.subtitle_color, '#6B7280') }}
        >
          {section.subtitle}
        </p>
      ) : null}

      {isLocked && section?.locked_message ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {section.locked_message}
        </p>
      ) : null}

      <div className={`flex flex-col gap-3 lg:flex-row ${isLocked ? '' : 'mb-6'}`}>
        <input
          type="text"
          readOnly
          value={inviteUrl}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 md:text-base"
        />
        {copyButton?.label ? (
          <button
            type="button"
            onClick={handleCopyLink}
            disabled={isLocked || copyButton?.disabled}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-white md:text-base"
            style={{
              backgroundColor:
                isLocked || copyButton?.disabled
                  ? undefined
                  : getCommunityColor(copyButton.cta_btn_color, '#1E4D35'),
            }}
          >
            {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
            {copied ? 'Copied!' : copyButton.label}
          </button>
        ) : null}
      </div>

      {isLocked ? null : <WhatsNextMessageBox />}
    </div>
  );
};

export default SharingCardSection;
