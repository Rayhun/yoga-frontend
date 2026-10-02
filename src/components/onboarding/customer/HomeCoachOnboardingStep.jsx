'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import ExpertAvatar, { ExpertEmojiAvatar } from '@/components/common/ExpertAvatar';
import { isExpertImageUrl } from '@/utils/expert-media';

function renderTitle(title) {
  if (!title) return null;
  const parts = title.split(/(Home Coach)/i);
  if (parts.length === 1) {
    return <span>{title}</span>;
  }
  return parts.map((part, index) =>
    /^home coach$/i.test(part) ? (
      <span key={index} className="text-primary">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

export default function HomeCoachOnboardingStep({
  data,
  stepIndex = 0,
  totalSteps = 0,
  canGoBack = false,
  onBack,
  isSubmitting,
  onSubmit,
}) {
  const header = data?.header || {};
  const coaches =
    data?.sections?.find(section => section.section_id === 'coach_selection_list')?.items ||
    data?.sections?.[0]?.items ||
    [];
  const [selectedCoachId, setSelectedCoachId] = useState(null);

  const progressPercent =
    totalSteps > 0 && stepIndex > 0 ? Math.min(100, (stepIndex / totalSteps) * 100) : 100;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900 md:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-green-700 dark:bg-green-900/40 dark:text-green-300">
            <span>✦ Last step</span>
          </div>
          {totalSteps > 0 ? (
            <p className="shrink-0 text-sm font-medium tabular-nums text-gray-600 dark:text-gray-300">
              ({stepIndex}/{totalSteps})
            </p>
          ) : null}
        </div>

        <div className="mb-5 h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-1 rounded-full bg-green-500 transition-[width] duration-300 dark:bg-green-400"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800/90">
          {header.eyebrow || 'HOME COACH'}
        </p>
        <h1 className="mt-3 font-serif text-2xl leading-tight text-gray-900 md:text-[1.75rem]">
          {renderTitle(header.title || 'Choose your Home Coach')}
        </h1>
        {header.subtitle ? (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-600 md:text-[15px]">
            {header.subtitle.replace(/It's included\./i, '').trim()}
            {/it's included/i.test(header.subtitle) ? (
              <>
                {' '}
                <span className="font-semibold text-primary">It&apos;s included.</span>
              </>
            ) : null}
          </p>
        ) : null}

        <div className="mt-6 space-y-3 md:mt-8 md:space-y-4">
          {coaches.map(coach => {
            const isSelected = selectedCoachId === coach.id;
            const showEmoji = coach.avatar_icon && !isExpertImageUrl(coach.avatar_icon);

            return (
              <button
                key={coach.id}
                type="button"
                onClick={() => setSelectedCoachId(coach.id)}
                className={`relative w-full rounded-2xl border bg-white p-4 text-left transition md:p-5 ${
                  isSelected
                    ? 'border-primary shadow-[0_0_0_1px_rgba(0,100,0,0.15)]'
                    : 'border-stone-200 hover:border-stone-300 dark:border-gray-700 dark:bg-gray-900'
                }`}
              >
                <span
                  className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    isSelected ? 'border-primary bg-primary' : 'border-stone-300 bg-white'
                  }`}
                >
                  {isSelected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                </span>

                <div className="flex gap-4 pr-8">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-50 ring-1 ring-stone-200">
                    {showEmoji ? (
                      <ExpertEmojiAvatar emoji={coach.avatar_icon} className="text-2xl" />
                    ) : (
                      <ExpertAvatar
                        src={coach.avatar_icon}
                        name={coach.name}
                        size={56}
                        imageClassName="h-full w-full rounded-full object-cover"
                        fallbackClassName="h-full w-full rounded-full text-sm"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {coach.name}
                    </h2>
                    {coach.specialty ? (
                      <p className="mt-0.5 text-sm font-medium text-amber-800/85">{coach.specialty}</p>
                    ) : null}
                    {coach.tags?.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {coach.tags.map(tag => (
                          <span
                            key={tag.id || tag.label}
                            className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className={`mt-6 flex items-center gap-3 ${canGoBack ? 'justify-between' : 'justify-end'}`}>
          {canGoBack ? (
            <Button type="button" variant="secondary" onClick={onBack} disabled={isSubmitting}>
              Back
            </Button>
          ) : null}
          <Button
            onClick={() => onSubmit(selectedCoachId)}
            disabled={!selectedCoachId || isSubmitting}
            isLoading={isSubmitting}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
