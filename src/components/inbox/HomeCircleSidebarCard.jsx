'use client';

import ExpertAvatar, { ExpertEmojiAvatar } from '@/components/common/ExpertAvatar';
import {
  DEFAULT_EXPERT_EMOJI,
  isExpertImageUrl,
} from '@/utils/expert-media';

/** Home coach sidebar card — peach → cream → warm sand gradient */
const HOME_COACH_CARD = {
  surfaceStyle: {
    background: 'linear-gradient(155deg, #FBF1EC 0%, #FDF3ED 45%, #F3ECDC 100%)',
    boxShadow: '0 8px 24px rgba(180, 130, 90, 0.14)',
    border: '1px solid #F3E1D4',
  },
  badge:
    'inline-flex items-center gap-1.5 rounded-full border border-[#C9B08A]/70 bg-[#F1E8D9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8B7344]',
  avatarRing: 'ring-2 ring-[#D4B896] bg-white',
  avatarBadge: 'bg-[#E8D4A8] ring-2 ring-[#F3ECDC]',
  name: 'font-serif text-lg font-semibold leading-snug text-gray-900 md:text-xl',
  subtitle: 'mt-0.5 line-clamp-2 text-sm text-[#666666]',
  meta: 'mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#999999]',
  btnSecondary:
    'rounded-full bg-[#EDEDED] px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-[#E2E2E2]',
  btnPrimary:
    'rounded-full bg-[#1D4D36] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#163d2b] hover:shadow-md',
};

function extractCoachIdFromUrl(url) {
  if (!url) return null;
  const match = String(url).match(/coach\/detail\/([^/]+)/i);
  return match?.[1] || null;
}

function extractConversationIdFromUrl(url) {
  if (!url) return null;
  const match = String(url).match(/conversations\/(\d+)\/messages/i);
  return match?.[1] || null;
}

export default function HomeCircleSidebarCard({ card, onMessage, onViewProfile }) {
  if (!card?.is_visible || !card?.data) return null;

  const { badge, circle_info: info, actions } = card.data;
  const avatar = info?.avatar_image || info?.avatar_icon;
  const showEmojiAvatar = avatar && !isExpertImageUrl(avatar);
  const badgeIcon = info?.avatar_badge_image || info?.avatar_badge_icon;

  const handleViewProfile = () => {
    const coachId = extractCoachIdFromUrl(actions?.secondary_button?.url);
    if (coachId && onViewProfile) {
      onViewProfile(coachId);
      return;
    }
    if (actions?.secondary_button?.url) {
      window.open(actions.secondary_button.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleMessage = () => {
    const frontendUrl = actions?.primary_button?.frontend_url;
    const conversationId = extractConversationIdFromUrl(actions?.primary_button?.url);
    if (onMessage) {
      onMessage({ frontendUrl, conversationId });
      return;
    }
    if (frontendUrl) {
      window.location.assign(frontendUrl);
    }
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50 px-3 py-3 md:px-4 md:py-4">
      <article
        className="rounded-[1.25rem] p-4 md:rounded-3xl md:p-5"
        style={HOME_COACH_CARD.surfaceStyle}
      >
        {badge?.text ? (
          <div className={`mb-3 ${HOME_COACH_CARD.badge}`}>
            {badge.icon ? <span className="text-[11px]">{badge.icon}</span> : null}
            <span>{badge.text}</span>
          </div>
        ) : null}

        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div
              className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full md:h-16 md:w-16 ${HOME_COACH_CARD.avatarRing}`}
            >
              {showEmojiAvatar ? (
                <ExpertEmojiAvatar emoji={avatar} className="text-2xl md:text-3xl" />
              ) : (
                <ExpertAvatar
                  src={avatar}
                  name={info?.host_name}
                  size={64}
                  tone="light"
                  imageClassName="h-full w-full rounded-full object-cover"
                  fallbackClassName="h-full w-full rounded-full"
                  emoji={DEFAULT_EXPERT_EMOJI}
                />
              )}
            </div>
            {badgeIcon ? (
              <span
                className={`absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full text-sm ${HOME_COACH_CARD.avatarBadge}`}
              >
                {isExpertImageUrl(badgeIcon) ? (
                  <ExpertAvatar
                    src={badgeIcon}
                    name=""
                    size={20}
                    imageClassName="h-full w-full rounded-full object-cover"
                    fallbackClassName="text-xs"
                    emoji={info?.avatar_badge_icon || '🌿'}
                  />
                ) : (
                  badgeIcon
                )}
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className={HOME_COACH_CARD.name}>{info?.host_name || info?.title}</h3>
            {info?.host_title ? <p className={HOME_COACH_CARD.subtitle}>{info.host_title}</p> : null}
            <div className={HOME_COACH_CARD.meta}>
              {info?.member_count_text ? <span>{info.member_count_text}</span> : null}
              {info?.status?.status_text ? (
                <>
                  {info?.member_count_text ? <span>•</span> : null}
                  <span
                    className={
                      info.status.is_active ? 'font-medium text-[#1D4D36]' : 'text-[#999999]'
                    }
                  >
                    {info.status.status_text}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {actions?.secondary_button?.label ? (
            <button
              type="button"
              onClick={handleViewProfile}
              className={`flex-1 ${HOME_COACH_CARD.btnSecondary}`}
            >
              {actions.secondary_button.label}
            </button>
          ) : null}
          {actions?.primary_button?.label ? (
            <button
              type="button"
              onClick={handleMessage}
              disabled={
                !actions?.primary_button?.frontend_url && !actions?.primary_button?.url
              }
              className={`flex-1 inline-flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50 ${HOME_COACH_CARD.btnPrimary}`}
            >
              {actions.primary_button.icon ? <span>{actions.primary_button.icon}</span> : null}
              {actions.primary_button.label}
            </button>
          ) : null}
        </div>
      </article>
    </div>
  );
}
