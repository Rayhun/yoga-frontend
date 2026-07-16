'use client';

import { useState } from 'react';
import { FiCheck, FiEye, FiLink2, FiTrendingUp } from 'react-icons/fi';
import { MdOutlinePayments } from 'react-icons/md';
import { toast } from 'react-toastify';

const STAT_ICONS = {
  eye: FiEye,
  check: FiCheck,
  chart: FiTrendingUp,
  money: MdOutlinePayments,
};

const STATUS_STYLES = {
  earning: 'bg-[#E8F5E9] text-[#2E7D32]',
  new: 'bg-[#FFF3E0] text-[#E65100]',
  expired: 'bg-gray-100 text-gray-500',
};

const copyToClipboard = async text => {
  if (!text) throw new Error('Nothing to copy');

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
};

const Avatar = ({ name, avatarUrl }) => {
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="h-9 w-9 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3EDE6] text-xs font-semibold text-[#8B6914]">
      {initials || '?'}
    </div>
  );
};

const ExpertReferralsView = ({ data }) => {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const banner = data.banner || {};
  const inviteUrl = banner?.cta?.invite_url || data.invite_url || '';
  const stats = data.stats || [];
  const table = data.table || {};
  const rows = table.rows || [];

  const handleCopy = async () => {
    try {
      await copyToClipboard(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Referral link copied');
    } catch {
      toast.error('Failed to copy referral link');
    }
  };

  return (
    <div className="flex w-full flex-col gap-5 md:gap-6">
      {/* Invite & Earn banner */}
      <div
        className="flex flex-col gap-5 rounded-2xl px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8"
        style={{ backgroundColor: banner.background_color || '#C17A3C' }}
      >
        <div className="min-w-0 flex-1 sm:pr-6">
          <h1 className="font-serif text-3xl font-semibold text-white sm:text-4xl">
            {banner.title || 'Invite & Earn'}
          </h1>
          {banner.subtitle ? (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/90 sm:text-base">
              {banner.subtitle}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!inviteUrl}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#C17A3C] shadow-sm transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {copied ? <FiCheck className="h-4 w-4" /> : <FiLink2 className="h-4 w-4" />}
          {copied ? 'Copied!' : banner?.cta?.label || 'Copy Referral Link'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => {
          const Icon = STAT_ICONS[stat.icon] || FiEye;
          return (
            <div
              key={stat.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F3EF] text-gray-500">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-serif text-3xl font-semibold tracking-tight text-gray-900">
                {stat.value_display}
              </p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Referrals table */}
      <div className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {(table.headers || []).map(header => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400"
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map(row => (
                  <tr key={row.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={row.name} avatarUrl={row.avatar_url} />
                        <span className="text-sm font-medium text-gray-900">{row.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{row.type}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{row.joined}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                      {row.commission_display}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_STYLES[row.status_key] || STATUS_STYLES.expired
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={(table.headers || []).length || 5}
                    className="px-5 py-12 text-center text-sm text-gray-400"
                  >
                    {table.empty_text || 'No referrals yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpertReferralsView;
