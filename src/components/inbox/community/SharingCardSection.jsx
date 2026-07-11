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

const SharingCardSection = ({ section }) => {
  const [copied, setCopied] = useState(false);
  const referralCode = section?.referral_code;
  const actions = section?.actions || {};
  const copyButton = actions.copy_button;
  const inviteButton = actions.invite_button;
  const inviteUrl = section?.invite_url || '';

  const handleCopyLink = async () => {
    if (!inviteUrl) return;

    try {
      await copyToClipboard(inviteUrl);
      setCopied(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy invite link');
    }
  };

  const handleInviteClients = async () => {
    if (!inviteUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: section?.title || 'Join my community circle',
          text: section?.subtitle || 'Join my community circle on NourishDoc',
          url: inviteUrl,
        });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }

    await handleCopyLink();
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

      <div className="mb-6 flex flex-col gap-3 lg:flex-row">
        <input
          type="text"
          readOnly
          value={inviteUrl}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none md:text-base"
        />
        {copyButton?.label ? (
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-95 md:text-base"
            style={{
              backgroundColor: getCommunityColor(copyButton.cta_btn_color, '#1E4D35'),
            }}
          >
            {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
            {copied ? 'Copied!' : copyButton.label}
          </button>
        ) : null}
      </div>

      {referralCode?.code ? (
        <div className="mb-6">
          {referralCode.label ? (
            <p className="mb-2 text-sm text-gray-600 md:text-base">{referralCode.label}</p>
          ) : null}
          <div
            className="inline-block rounded-lg border border-dashed px-5 py-2.5 font-mono text-base font-bold tracking-wide md:text-lg"
            style={{
              backgroundColor: getCommunityColor(referralCode.background_color, '#F0F7F2'),
              borderColor: getCommunityColor(referralCode.border_color, '#B8D4C3'),
              color: getCommunityColor(referralCode.text_color, '#1E4D35'),
            }}
          >
            {referralCode.code}
          </div>
        </div>
      ) : null}

      {inviteButton?.label ? (
        <button
          type="button"
          onClick={handleInviteClients}
          className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-95 md:text-base"
          style={{
            backgroundColor: getCommunityColor(inviteButton.cta_btn_color, '#E67E22'),
          }}
        >
          {inviteButton.label}
        </button>
      ) : null}
    </div>
  );
};

export default SharingCardSection;
