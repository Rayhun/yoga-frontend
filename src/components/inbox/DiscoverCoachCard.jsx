'use client';

import { FiMessageCircle } from 'react-icons/fi';
import ExpertAvatar, { ExpertEmojiAvatar } from '@/components/common/ExpertAvatar';
import {
  DEFAULT_EXPERT_EMOJI,
  decodeHtmlEntities,
  isExpertImageUrl,
} from '@/utils/expert-media';

export default function DiscoverCoachCard({
  coach,
  onFollow,
  onMessage,
  isFollowing = false,
  followLabel = '+ Follow',
  isFollowPending = false,
}) {
  const headerColor = coach.header_color_hex || '#006400';
  const avatar = coach.avatar_icon;
  const showEmojiAvatar = avatar && !isExpertImageUrl(avatar);
  const messageLabel = coach.actions?.message_button?.label || 'Message';
  const bioText = coach.bio_text ? decodeHtmlEntities(coach.bio_text) : '';

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
      <div
        className="flex items-center gap-3 px-4 py-4 text-white"
        style={{ backgroundColor: headerColor }}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 ring-2 ring-white/25">
          {showEmojiAvatar ? (
            <ExpertEmojiAvatar emoji={avatar} className="text-2xl" />
          ) : (
            <ExpertAvatar
              src={avatar}
              name={coach.name}
              size={48}
              tone="dark"
              imageClassName="h-full w-full rounded-full object-cover"
              fallbackClassName="h-full w-full rounded-full"
              emoji={DEFAULT_EXPERT_EMOJI}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-base font-bold leading-tight">{coach.name}</h4>
          {coach.title ? (
            <p className="mt-0.5 truncate text-sm font-normal text-white/90">{coach.title}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {coach.tags?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {coach.tags.map(tag => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {bioText ? <p className="text-sm leading-relaxed text-gray-600">{bioText}</p> : null}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onFollow}
            disabled={isFollowPending}
            className={`flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isFollowing
                ? 'border-primary bg-primary text-white hover:bg-primary/90'
                : 'border-primary bg-white text-primary hover:bg-primary/5'
            }`}
          >
            {isFollowPending ? 'Saving…' : followLabel}
          </button>
          <button
            type="button"
            onClick={onMessage}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <FiMessageCircle className="h-4 w-4 shrink-0" />
            {messageLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
