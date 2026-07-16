'use client';

import Link from 'next/link';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_COMMUNITY_COLORS,
  getCommunityColor,
} from '@/components/inbox/community/communityColors';
import { executeCommunityAction, toAppPath } from '@/services/private/expert/community';
import JoinCircleBrandingPanel from '@/components/join/JoinCircleBrandingPanel';

const JoinCircleFeaturesSection = ({ section }) => {
  const items = section?.items || [];
  if (!items.length) return null;

  return (
    <div className="w-full lg:text-left">
      {section.title ? (
        <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 lg:text-left">
          {section.title}
        </p>
      ) : null}

      <ul className="space-y-3.5">
        {items.map((item, index) => (
          <li key={item.bold_text || index} className="flex items-start gap-3">
            {item.icon ? (
              <span
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                style={{ backgroundColor: DEFAULT_COMMUNITY_COLORS.iconBackground }}
              >
                {item.icon}
              </span>
            ) : null}
            <p className="min-w-0 flex-1 pt-0.5 text-left text-sm leading-relaxed text-gray-600">
              {item.bold_text ? (
                <span className="font-semibold text-gray-800">{item.bold_text} </span>
              ) : null}
              {item.normal_text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const JoinCirclePrivacyBanner = ({ banner }) => {
  if (!banner?.text) return null;

  return (
    <div
      className="w-full rounded-xl border px-4 py-3.5 text-center text-sm leading-relaxed lg:text-left"
      style={{
        backgroundColor: getCommunityColor(banner.background_color, '#FFF8E7'),
        borderColor: getCommunityColor(banner.border_color, '#F5D78E'),
        color: getCommunityColor(banner.text_color, '#6B5B3E'),
      }}
    >
      {banner.icon ? <span className="mr-1.5">{banner.icon}</span> : null}
      {banner.text}
    </div>
  );
};

const JoinCircleView = ({ pageData, slug }) => {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  if (!pageData) return null;

  const whatsInsideSection = pageData.sections?.find(
    section => section.section_id === 'whats_inside' || section.card_type === 'features_list'
  );
  const footerActions = pageData.footer_actions;
  const primaryButton = footerActions?.primary_button;
  const secondaryAction = footerActions?.secondary_action;
  const ctaColor = getCommunityColor(
    primaryButton?.background_color,
    DEFAULT_COMMUNITY_COLORS.ctaButton
  );

  const handleJoin = async () => {
    const method = (primaryButton?.method || 'post').toLowerCase();

    if (primaryButton?.is_stripe && primaryButton?.stripe_url) {
      router.push(`/payment/join/${slug}`);
      return;
    }

    // Backend sends method: "get" for free join → open onboard UI
    if (method === 'get') {
      const joinPath =
        toAppPath(primaryButton?.frontend_url) || `/auth/join/${slug}`;
      router.push(joinPath);
      return;
    }

    const token = Cookies.get('token');
    const joinPath =
      toAppPath(primaryButton?.frontend_url) || `/auth/join/${slug}`;

    if (!token) {
      router.push(joinPath);
      return;
    }

    if (!primaryButton?.backend_url && !primaryButton?.url) return;

    try {
      setIsJoining(true);
      await executeCommunityAction({
        url: primaryButton.backend_url || primaryButton.url,
        method,
      });
      router.push('/portal/inbox');
    } catch {
      setIsJoining(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 lg:h-screen lg:min-h-0 lg:overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-green-200 opacity-20 mix-blend-multiply blur-xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-emerald-200 opacity-20 mix-blend-multiply blur-xl delay-1000" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-teal-200 opacity-20 mix-blend-multiply blur-xl delay-500" />
      </div>

      <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-white/40 bg-white shadow-2xl">
        <div className="flex min-h-[600px] flex-col lg:max-h-[calc(100vh-2rem)] lg:flex-row">
          {/* Left — full-height green branding panel */}
          <div className="w-full lg:flex lg:w-1/2 lg:flex-col">
            <JoinCircleBrandingPanel
              header={pageData.header}
              metricsRow={pageData.metrics_row}
            />
          </div>

          {/* Right — full-height white content panel */}
          <div className="flex w-full flex-1 items-center justify-center bg-white p-6 sm:p-8 lg:w-1/2 lg:justify-start lg:p-12">
            <div className="w-full max-w-[300px] space-y-5 sm:max-w-[320px] lg:max-w-md">
              <JoinCircleFeaturesSection section={whatsInsideSection} />

              <JoinCirclePrivacyBanner banner={pageData.privacy_banner} />

              <div className="space-y-2.5 pt-1">
                {primaryButton?.label ? (
                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="w-full rounded-xl px-6 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                    style={{ backgroundColor: ctaColor }}
                  >
                    {isJoining ? 'Joining...' : primaryButton.label}
                  </button>
                ) : null}

                {footerActions?.hint_text && !primaryButton?.is_stripe ? (
                  <p className="text-center text-xs text-gray-400">{footerActions.hint_text}</p>
                ) : null}

                {secondaryAction ? (
                  <p className="text-center text-sm text-gray-500">
                    {secondaryAction.text}{' '}
                    <Link
                      href="/auth/login"
                      className="font-semibold text-green-700 underline-offset-2 hover:text-green-800 hover:underline"
                    >
                      {secondaryAction.link_label || 'Log in'}
                    </Link>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinCircleView;
