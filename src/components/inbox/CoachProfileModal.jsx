'use client';

import { useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import CircularProgress from '@mui/material/CircularProgress';
import { useQuery } from '@tanstack/react-query';
import { FiArrowLeft } from 'react-icons/fi';
import ExpertAvatar, { ExpertEmojiAvatar } from '@/components/common/ExpertAvatar';
import ControllableRichText from '@/components/common/details/ControllableRichText';
import { getCustomerCoachDetail } from '@/services/private/customer/v2/coaches';
import { DEFAULT_EXPERT_EMOJI, isExpertImageUrl } from '@/utils/expert-media';
import queryKeys from '@/utils/query-keys';

const VISIBLE_TAG_COUNT = 3;

function PillTags({ items, className = '' }) {
  if (!items?.length) return null;

  const visible = items.slice(0, VISIBLE_TAG_COUNT);
  const overflow = items.length - visible.length;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {visible.map(item => (
        <span
          key={item.id || item.label}
          className="rounded-full bg-[#E8F3EC] px-3 py-1 text-xs font-medium text-[#1D4D36]"
        >
          {item.label}
        </span>
      ))}
      {overflow > 0 ? (
        <span className="rounded-full bg-[#E8F3EC] px-3 py-1 text-xs font-medium text-[#1D4D36]">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

function ProfileSection({ title, children, className = '' }) {
  if (!children) return null;

  return (
    <section className={`border-t border-stone-200/80 px-5 py-5 ${className}`}>
      {title ? (
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#999999]">
          {title}
        </h3>
      ) : null}
      <div className={title ? 'mt-3' : ''}>{children}</div>
    </section>
  );
}

function buildSubtitle(coach) {
  const parts = [];
  if (coach?.title) parts.push(coach.title);

  const experienceMetric = coach?.metrics?.find(metric => metric.id === 'experience');
  if (experienceMetric?.value) {
    parts.push(`${experienceMetric.value} experience`);
  }

  return parts.join(' · ');
}

export default function CoachProfileModal({ open, coachId, onClose }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKeys.customerV2CoachDetail, coachId],
    queryFn: () => getCustomerCoachDetail(coachId),
    enabled: open && Boolean(coachId),
    staleTime: 60_000,
  });

  const profile = data?.data?.data;
  const coach = profile?.coach;
  const rawHeader = profile?.header_label || 'Coach Profile';
  const headerLabel =
    rawHeader.toUpperCase() === 'COACH PROFILE' ? 'Coach Profile' : rawHeader;

  const subtitle = useMemo(() => buildSubtitle(coach), [coach]);

  const aboutText = coach?.about?.text || '';

  const avatar = coach?.avatar;
  const showEmojiAvatar = avatar && !isExpertImageUrl(avatar);

  const handleClose = () => {
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: 'overflow-hidden rounded-3xl',
        sx: { margin: { xs: 2, sm: 3 }, maxHeight: 'calc(100vh - 32px)' },
      }}
      sx={{
        zIndex: 1400,
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(28, 36, 52, 0.45)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-stone-200/80 px-4 py-3">
        <button
          type="button"
          onClick={handleClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-gray-700 transition hover:bg-stone-50"
          aria-label="Close coach profile"
        >
          <FiArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="font-serif text-lg font-semibold text-gray-900">{headerLabel}</h2>
        <div className="h-9 w-9 shrink-0" aria-hidden />
      </div>

      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center py-12">
          <CircularProgress size={32} sx={{ color: '#1D4D36' }} />
        </div>
      ) : isError || !coach ? (
        <div className="px-5 py-10 text-center text-sm text-gray-600">
          Could not load coach profile. Please try again.
        </div>
      ) : (
        <div className="overflow-y-auto">
          <div
            className="px-5 pb-6 pt-5 text-center"
            style={{
              background: 'linear-gradient(180deg, #F5E6D8 0%, #FAF6F0 55%, #FFFFFF 100%)',
            }}
          >
            <div className="mx-auto flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full ring-2 ring-[#D4B896] bg-white">
              {showEmojiAvatar ? (
                <ExpertEmojiAvatar emoji={avatar} className="text-4xl" />
              ) : (
                <ExpertAvatar
                  src={avatar}
                  name={coach.name}
                  size={88}
                  tone="light"
                  imageClassName="h-full w-full rounded-full object-cover"
                  fallbackClassName="h-full w-full rounded-full"
                  emoji={DEFAULT_EXPERT_EMOJI}
                />
              )}
            </div>
            <h3 className="mt-4 font-serif text-2xl font-semibold leading-snug text-gray-900">
              {coach.name}
            </h3>
            {subtitle ? (
              <p className="mt-1 text-sm text-[#666666]">{subtitle}</p>
            ) : null}
            <PillTags items={coach.tags} className="mt-4 justify-center" />
          </div>

          {coach.about?.is_visible && aboutText ? (
            <ProfileSection title={coach.about.section_title || 'ABOUT'}>
              <div className="prose prose-sm max-w-none text-sm leading-relaxed text-gray-700">
                <ControllableRichText disableLinks numberOfWords={50}>
                  {aboutText}
                </ControllableRichText>
              </div>
            </ProfileSection>
          ) : null}

          {coach.languages?.is_visible && coach.languages?.items?.length ? (
            <ProfileSection title={coach.languages.section_title || 'LANGUAGES'}>
              <PillTags items={coach.languages.items} />
            </ProfileSection>
          ) : null}

          {coach.certifications?.is_visible && coach.certifications?.items?.length ? (
            <ProfileSection title={coach.certifications.section_title || 'CERTIFICATIONS'}>
              <PillTags items={coach.certifications.items} />
            </ProfileSection>
          ) : null}

          {coach.availability?.is_visible ? (
            <ProfileSection title={coach.availability.section_title || 'AVAILABILITY FOR COACHING'}>
              <div className="flex items-start gap-2">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    coach.availability.is_accepting ? 'bg-[#1D4D36]' : 'bg-stone-400'
                  }`}
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {coach.availability.status_text}
                  </p>
                  {coach.availability.helper_text ? (
                    <p className="mt-1 text-sm text-[#999999]">{coach.availability.helper_text}</p>
                  ) : null}
                </div>
              </div>
            </ProfileSection>
          ) : null}
        </div>
      )}
    </Dialog>
  );
}
