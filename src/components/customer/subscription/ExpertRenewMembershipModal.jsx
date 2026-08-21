'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiX, FiLock, FiRefreshCw } from 'react-icons/fi';
import { toastApiError } from '@/utils/helpers';
import { createCommunityRenewCheckoutSession } from '@/services/private/expert/community';

function formatEyebrow(template, firstName, fallbackName = 'there') {
  if (!template) return '';
  return template.replace('{first_name}', firstName || fallbackName);
}

const ExpertRenewMembershipModal = ({
  open,
  onClose,
  content,
  firstName,
  communitySlug,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const page = content?.page_2 || {};
  const priceCard = page.price_card || {};
  const benefits = page.benefits || [];

  const handlePay = async () => {
    if (!communitySlug) return;

    setIsSubmitting(true);
    try {
      const { data: response } = await createCommunityRenewCheckoutSession({
        slug: communitySlug,
      });
      const clientSecret = response?.data?.checkout_session_client_secret;
      if (!clientSecret) {
        throw new Error('Checkout session not created');
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`expertRenewCheckout:${communitySlug}`, clientSecret);
      }
      onClose?.();
      router.push(`/payment/renew/${communitySlug}`);
    } catch (error) {
      toastApiError(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 sm:p-8 lg:left-62.5 lg:p-10"
      onClick={e => {
        if (e.target === e.currentTarget && !isSubmitting) onClose?.();
      }}
    >
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]" />

      <div
        className="relative z-10 flex w-full max-w-[420px] max-h-[min(88vh,720px)] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_64px_rgba(28,25,23,0.18)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-[3px] shrink-0 bg-gradient-to-r from-emerald-600 via-lime-500 to-amber-400" />

        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-sm font-medium text-stone-500 transition hover:text-stone-800 disabled:opacity-50"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 disabled:opacity-50"
            aria-label="Close"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-2 sm:px-7">
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-600">
            {formatEyebrow(page.eyebrow_template, firstName, page.eyebrow_fallback_name)}
          </p>

          <h1 className="mt-2 font-serif text-[1.7rem] font-bold leading-[1.15] tracking-tight text-stone-900 sm:text-[1.85rem]">
            {page.headline}
          </h1>

          <p className="mt-3 text-[15px] leading-relaxed text-stone-500">
            {page.subhead}
          </p>

          <ul className="mt-6 space-y-4">
            {benefits.map(benefit => (
              <li key={benefit.title} className="flex gap-3.5">
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-base"
                  aria-hidden
                >
                  {benefit.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold leading-snug text-stone-900">
                    {benefit.title}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-stone-500">
                    {benefit.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0 border-t border-stone-100 bg-white px-5 pb-5 pt-4 sm:px-7 sm:pb-6">
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-stone-100 px-4 py-3.5">
            <div>
              <p className="font-serif text-[1.75rem] font-bold leading-none text-stone-900">
                {priceCard.amount}
              </p>
              <p className="mt-1 text-[13px] text-stone-500">
                {priceCard.label || 'per month membership'}
              </p>
            </div>
            {priceCard.badge ? (
              <span className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                {priceCard.badge}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handlePay}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B4332] px-5 py-3.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#16382a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <FiRefreshCw className="h-4 w-4 animate-spin" />
                <span>{page.button_loading || 'Redirecting…'}</span>
              </>
            ) : (
              <>
                <span>{page.button || 'Pay & renew membership'}</span>
                <span aria-hidden>→</span>
              </>
            )}
          </button>

          <div className="mt-3.5 flex items-center justify-center gap-5 text-[12px] text-stone-400">
            <span className="inline-flex items-center gap-1.5">
              <FiLock className="h-3.5 w-3.5" />
              Secure checkout
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiRefreshCw className="h-3.5 w-3.5" />
              Cancel anytime
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertRenewMembershipModal;
