'use client';

import Link from 'next/link';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { LuLightbulb, LuLock, LuShield, LuVideo } from 'react-icons/lu';
import {
  DEFAULT_COMMUNITY_COLORS,
  getCommunityColor,
} from '@/components/inbox/community/communityColors';
import { executeCommunityAction, toAppPath } from '@/services/private/expert/community';
import JoinCircleBrandingPanel from '@/components/join/JoinCircleBrandingPanel';
import JoinCircleCheckoutFlow from '@/components/join/JoinCircleCheckoutFlow';

const FEATURE_ICON_MAP = {
  lightbulb: LuLightbulb,
  '💡': LuLightbulb,
  video: LuVideo,
  camera: LuVideo,
  '🎥': LuVideo,
  shield: LuShield,
  lock: LuLock,
  '🔒': LuLock,
  '🎓': LuShield,
};

const JoinCircleFeaturesSection = ({ section }) => {
  const items = section?.items || [];
  if (!items.length) return null;

  return (
    <div className="w-full">
      {section.title ? (
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            {section.title}
          </p>
          <div className="mt-2 h-px w-full bg-gray-200" />
        </div>
      ) : null}

      <ul className="space-y-5">
        {items.map((item, index) => {
          const Icon = FEATURE_ICON_MAP[item.icon];

          return (
            <li key={item.bold_text || index} className="flex items-start gap-3.5">
              <span
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: DEFAULT_COMMUNITY_COLORS.iconBackground }}
              >
                {Icon ? (
                  <Icon className="h-5 w-5 text-[#1E4D35]" strokeWidth={1.75} />
                ) : item.icon ? (
                  <span className="text-base">{item.icon}</span>
                ) : null}
              </span>
              <p className="min-w-0 flex-1 pt-1.5 text-left text-[15px] leading-relaxed text-gray-500">
                {item.bold_text ? (
                  <span className="font-semibold text-[#1E4D35]">{item.bold_text} </span>
                ) : null}
                {item.normal_text}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const JoinCirclePrivacyBanner = ({ banner }) => {
  if (!banner?.text) return null;

  const iconKey = banner.icon;
  const LockIcon = FEATURE_ICON_MAP[iconKey] || LuLock;

  return (
    <div
      className="flex w-full items-start gap-3 rounded-2xl px-4 py-3.5 text-sm leading-relaxed"
      style={{
        backgroundColor: getCommunityColor(banner.background_color, '#F6E6D8'),
        color: getCommunityColor(banner.text_color, '#6B5344'),
      }}
    >
      <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#C17A3C]" strokeWidth={2} />
      <p>{banner.text}</p>
    </div>
  );
};

const JoinCircleView = ({ pageData, slug }) => {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [showJoinFlow, setShowJoinFlow] = useState(false);

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

  const joinFlowContent = pageData.join_flow_content;

  if (showJoinFlow && joinFlowContent) {
    return (
      <JoinCircleCheckoutFlow
        slug={slug}
        content={joinFlowContent}
        onBackToInvite={() => setShowJoinFlow(false)}
      />
    );
  }

  const handleJoin = async () => {
    const method = (primaryButton?.method || 'post').toLowerCase();

    if (primaryButton?.is_stripe && joinFlowContent) {
      setShowJoinFlow(true);
      return;
    }

    if (primaryButton?.is_stripe && primaryButton?.stripe_url) {
      router.push(`/payment/join/${slug}`);
      return;
    }

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
    <div className="relative flex min-h-screen items-center justify-center bg-[#F4F1EC] p-4 lg:h-screen lg:min-h-0 lg:overflow-hidden">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_20px_50px_rgba(30,77,53,0.12)]">
        <div className="flex min-h-[600px] flex-col lg:max-h-[calc(100vh-2rem)] lg:flex-row">
          <div className="w-full lg:flex lg:w-1/2 lg:flex-col">
            <JoinCircleBrandingPanel
              header={pageData.header}
              metricsRow={pageData.metrics_row}
            />
          </div>

          <div className="flex w-full flex-1 items-center justify-center bg-white p-6 sm:p-8 lg:w-1/2 lg:p-12">
            <div className="w-full max-w-[360px] space-y-6 sm:max-w-[400px]">
              <JoinCircleFeaturesSection section={whatsInsideSection} />

              <JoinCirclePrivacyBanner banner={pageData.privacy_banner} />

              <div className="space-y-3 pt-1">
                {primaryButton?.label ? (
                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="w-full rounded-full px-6 py-3.5 text-base font-semibold text-white shadow-[0_8px_20px_rgba(30,77,53,0.28)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                    style={{ backgroundColor: ctaColor }}
                  >
                    {isJoining ? 'Joining...' : primaryButton.label}
                  </button>
                ) : null}

                {secondaryAction ? (
                  <p className="text-center text-sm text-gray-500">
                    {secondaryAction.text}{' '}
                    <Link
                      href="/auth/login"
                      className="font-semibold text-gray-800 hover:text-[#1E4D35]"
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
