'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Spinner from '@/components/common/loader/Spinner';
import {
  getDailyTrackingData,
  postDailyTrackingLog,
} from '@/services/private/customer/daily-tracking';
import queryKeys from '@/utils/query-keys';

function normalizeOptions(tracker) {
  if (!tracker) return [];
  const out = [];
  for (let i = 1; i <= 5; i++) {
    const title = tracker[`option_${i}_title`];
    if (title == null || title === '') continue;
    out.push({
      index: i,
      title: String(title),
      description: tracker[`option_${i}_description`] ?? '',
      icon: tracker[`option_${i}_icon`] ?? '🙂',
      journal: Boolean(tracker[`option_${i}_journal`]),
    });
  }
  return out;
}

export default function DailyMoodTuneIn() {
  const [selected, setSelected] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [journalDismissed, setJournalDismissed] = useState(false);

  const { data: axiosResp, isLoading, isError } = useQuery({
    queryKey: [queryKeys.dailyTrackingData],
    queryFn: getDailyTrackingData,
  });

  const inner = axiosResp?.data?.data;
  const tracker = inner?.tracker;
  const journalPrompts = inner?.journal ?? {};

  const options = useMemo(() => normalizeOptions(tracker), [tracker]);
  const moodTitle = tracker?.title ?? 'How are you feeling today?';

  const logMutation = useMutation({
    mutationFn: postDailyTrackingLog,
    onSuccess: () => {
      toast.success('Saved — thanks for checking in.');
      setJournalText('');
      setJournalDismissed(false);
      setSelected(null);
    },
    onError: err => {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.detail ??
        'Could not save. Try again.';
      toast.error(typeof msg === 'string' ? msg : 'Could not save. Try again.');
    },
  });

  const showJournal = selected?.journal === true && !journalDismissed;

  const journalHeading =
    (selected && journalPrompts[`option_${selected.index}`]) ||
    'Anything on your mind today?';

  const handleSelect = opt => {
    setSelected(opt);
    setJournalText('');
    setJournalDismissed(false);
  };

  const handleSave = () => {
    if (!selected) return;
    logMutation.mutate({
      selected_option: selected.index,
      selected_option_text: selected.title,
      selected_option_emoji: selected.icon,
      journal: showJournal ? journalText.trim() : '',
    });
  };

  if (isError || (!isLoading && options.length === 0)) {
    return null;
  }

  return (
    <section
      className="relative mb-10 overflow-hidden rounded-3xl border border-stone-200/90 bg-gradient-to-br from-white via-brownish/40 to-amber-50/30 shadow-[0_12px_40px_-12px_rgba(0,50,20,0.12)]"
      aria-labelledby="daily-mood-heading"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-200/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 px-6 py-9 md:px-10 md:py-11">
        <div className="mb-10 max-w-2xl md:mb-11">
          <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800/80">
            <span className="h-1 w-4 shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            Daily check-in
          </p>
          <h2
            id="daily-mood-heading"
            className="font-serif text-[1.65rem] font-normal leading-snug tracking-tight text-gray-900 md:text-[1.85rem]"
          >
            {moodTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Tap how you feel — it helps us tailor today&apos;s experience for you.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-gray-600">
            <Spinner size={40} thickness={3} />
            <span className="text-sm text-gray-500">Loading your check-in…</span>
          </div>
        ) : (
          <>
            <div
              className="flex flex-wrap justify-center gap-4 px-1 sm:gap-5 md:gap-6"
              role="radiogroup"
              aria-label="Mood options"
            >
              {options.map(opt => {
                const isActive = selected?.index === opt.index;
                return (
                  <button
                    key={opt.index}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => handleSelect(opt)}
                    className={[
                      'group relative flex min-h-[6.25rem] w-[6rem] shrink-0 flex-col items-stretch justify-center gap-2.5 rounded-2xl border px-4 py-4 transition-all duration-200 sm:min-h-[6.5rem] sm:w-[6.75rem] md:w-[7rem]',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f6]',
                      isActive
                        ? 'border-transparent bg-white shadow-[0_8px_24px_-6px_rgba(0,100,0,0.22)] ring-2 ring-primary/85 ring-offset-2 ring-offset-white scale-[1.02]'
                        : 'border-stone-200/90 bg-white/70 shadow-card backdrop-blur-[2px] hover:border-emerald-200/80 hover:bg-white hover:shadow-[0_6px_20px_-8px_rgba(0,0,0,0.1)] active:scale-[0.98]',
                    ].join(' ')}
                  >
                    <span
                      className="flex h-[3.25rem] w-full shrink-0 items-center justify-center sm:h-[3.5rem]"
                      aria-hidden
                    >
                      <span className="inline-flex size-[3.25rem] items-center justify-center text-[2.375rem] leading-none transition-transform duration-200 group-hover:scale-110 sm:size-[3.5rem] sm:text-[2.5rem]">
                        {opt.icon}
                      </span>
                    </span>
                    <span
                      className={`w-full text-center text-[13px] font-semibold tracking-wide sm:text-sm ${isActive ? 'text-gray-900' : 'text-gray-600'}`}
                    >
                      {opt.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className="mt-10 animate-in fade-in slide-in-from-bottom-2 duration-300 md:mt-11">
                <div className="rounded-2xl border border-emerald-100/80 bg-white/85 px-4 py-4 shadow-inner backdrop-blur-sm md:px-6 md:py-5">
                  <div className="flex gap-4">
                    <div
                      className="mt-1 hidden min-h-[3rem] w-1 shrink-0 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600 sm:block"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-800/85">
                        <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.22)]" />
                        For you today
                      </p>
                      <p className="font-serif text-base leading-relaxed text-gray-800 md:text-[1.0625rem] md:leading-relaxed">
                        {selected.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selected && !showJournal && (
              <div className="mt-10 flex justify-end border-t border-stone-200/60 pt-8 md:mt-11 md:pt-8">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={logMutation.isPending}
                  className="inline-flex min-w-[7.5rem] items-center justify-center rounded-full bg-primary px-9 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(0,100,0,0.55)] transition hover:bg-[#005200] hover:shadow-[0_6px_20px_-6px_rgba(0,100,0,0.45)] active:translate-y-px disabled:pointer-events-none disabled:opacity-55"
                >
                  {logMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving…
                    </span>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && showJournal && (
        <div className="relative z-10 border-t border-stone-200/70 bg-white/95 px-6 py-8 backdrop-blur-md md:px-10 md:pb-10 md:pt-9">
          <div className="absolute left-0 top-0 hidden h-full w-1 bg-gradient-to-b from-emerald-500 via-emerald-600 to-teal-600 md:block rounded-r-full" />

          <div className="relative mx-auto max-w-3xl md:pl-4">
            <button
              type="button"
              aria-label="Skip journaling"
              className="absolute -top-1 right-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              onClick={() => setJournalDismissed(true)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h3 className="font-serif pr-12 text-xl font-normal leading-snug text-gray-900 md:text-2xl md:leading-snug">
              {journalHeading}
            </h3>
            <p className="mt-2 max-w-xl text-sm text-gray-500">
              Optional — share only what feels right. You can save without writing anything.
            </p>

            <label htmlFor="daily-journal-input" className="sr-only">
              Journal entry
            </label>
            <textarea
              id="daily-journal-input"
              value={journalText}
              onChange={e => setJournalText(e.target.value)}
              placeholder="Just a line or two is enough..."
              rows={5}
              className="mt-5 w-full resize-y rounded-2xl border border-stone-200 bg-[#fafaf8] px-4 py-3.5 text-[15px] leading-relaxed text-gray-800 shadow-inner placeholder:text-stone-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12 md:text-base"
            />

            <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-xs text-stone-500">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-emerald-600/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Saved privately in My Reflections
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={logMutation.isPending}
                className="inline-flex min-w-[8rem] items-center justify-center rounded-full bg-primary px-10 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(0,100,0,0.55)] transition hover:bg-[#005200] hover:shadow-[0_6px_20px_-6px_rgba(0,100,0,0.45)] active:translate-y-px disabled:pointer-events-none disabled:opacity-55 sm:shrink-0"
              >
                {logMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving…
                  </span>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
