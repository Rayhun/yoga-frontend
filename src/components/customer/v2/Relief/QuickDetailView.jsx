'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getCtaClassName } from '@/utils/customer-v2-relief';
import { saveHydrationLog } from '@/services/private/customer/v2/relief';
import queryKeys from '@/utils/query-keys';
import { ContentPanel, RELIEF_CARD, RELIEF_SECTION_LABEL } from './shared';
import GuidedSessionModal from './GuidedSessionModal';

function EducationalInsightSection({ section }) {
  return (
    <ContentPanel className="bg-gradient-to-br from-white to-emerald-50/20">
      {section.title ? <p className={RELIEF_SECTION_LABEL}>{section.title}</p> : null}
      <div className="mt-4 flex gap-4">
        {section.icon ? (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
            {section.icon}
          </span>
        ) : null}
        <div
          className="prose prose-sm max-w-none text-sm leading-relaxed text-gray-700 [&_strong]:font-bold [&_strong]:text-gray-900"
          dangerouslySetInnerHTML={{ __html: section.body_html }}
        />
      </div>
    </ContentPanel>
  );
}

function OrderedListSection({ section }) {
  const steps = section.steps || [];

  return (
    <section className="space-y-4">
      {section.title ? <p className={RELIEF_SECTION_LABEL}>{section.title}</p> : null}
      <div className="relative space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <article key={step.step_number} className="relative flex gap-4 pb-6">
              {!isLast ? (
                <span
                  className="absolute left-5 top-10 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-primary/30 to-stone-200"
                  aria-hidden
                />
              ) : null}
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-sm ring-4 ring-white">
                {step.step_number}
              </span>
              <div className={`${RELIEF_CARD} min-w-0 flex-1 p-4`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  {step.duration_text ? (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {step.duration_text}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MetricBlocksSection({ section }) {
  const pattern = section.pattern || {};
  const blocks = [pattern.inhale, pattern.hold, pattern.exhale].filter(Boolean);

  return (
    <section className="space-y-4">
      {section.title ? <p className={RELIEF_SECTION_LABEL}>{section.title}</p> : null}
      <div className="grid grid-cols-3 gap-3">
        {blocks.map(block => (
          <div
            key={block.label}
            className={`${RELIEF_CARD} p-5 text-center transition hover:border-primary/20`}
          >
            <p className="text-4xl font-bold text-primary">{block.value}</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {block.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function InteractiveMapSection({ section }) {
  return (
    <section className="space-y-4">
      {section.title ? <p className={RELIEF_SECTION_LABEL}>{section.title}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {(section.points || []).map(point => (
          <article
            key={point.id}
            className={`${RELIEF_CARD} p-4 transition hover:border-primary/20 hover:shadow-md`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-xl">
                {point.icon}
              </span>
              <div>
                <p className="text-xs font-bold uppercase text-primary">{point.code}</p>
                <h3 className="font-semibold text-gray-900">{point.name}</h3>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{point.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContextualAlertSection({ section }) {
  return (
    <section className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50/80 p-5 shadow-sm">
      <div className="flex gap-4">
        {section.icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            {section.icon}
          </span>
        ) : null}
        <div>
          {section.title_label ? (
            <p className="text-sm font-bold text-amber-900">{section.title_label}</p>
          ) : null}
          <p className="mt-1 text-sm leading-relaxed text-amber-950/80">
            {section.body_text || section.body_html}
          </p>
        </div>
      </div>
    </section>
  );
}

function HydrationTrackerSection({ section, selectedCount, onSelectGlass, total, goalPercent }) {
  return (
    <ContentPanel>
      {section.title ? <p className={RELIEF_SECTION_LABEL}>{section.title}</p> : null}

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {selectedCount}
            <span className="text-lg font-medium text-gray-400"> / {total}</span>
          </p>
          <p className="text-sm text-gray-500">glasses logged today</p>
        </div>
        <div className="relative h-16 w-16 shrink-0">
          <svg className="-rotate-90" viewBox="0 0 64 64" width="64" height="64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#E7E5E4" strokeWidth="6" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              className="text-teal-600"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 * (1 - goalPercent / 100)}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg">💧</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2.5 sm:grid-cols-8">
        {Array.from({ length: total }, (_, index) => {
          const filled = index < selectedCount;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectGlass(index + 1)}
              className={`flex aspect-square items-center justify-center rounded-xl border-2 text-lg transition duration-150 ${
                filled
                  ? 'scale-105 border-teal-600 bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-700 shadow-sm'
                  : 'border-stone-200 bg-white text-stone-300 hover:border-teal-300 hover:text-teal-500'
              }`}
              aria-label={`Glass ${index + 1}`}
            >
              💧
            </button>
          );
        })}
      </div>
    </ContentPanel>
  );
}

function renderSection(section, extras = {}) {
  switch (section.card_type) {
    case 'educational_insight':
      return <EducationalInsightSection key={section.section_id} section={section} />;
    case 'ordered_list':
      return <OrderedListSection key={section.section_id} section={section} />;
    case 'metric_blocks':
      return <MetricBlocksSection key={section.section_id} section={section} />;
    case 'interactive_map_cards':
      return <InteractiveMapSection key={section.section_id} section={section} />;
    case 'contextual_alert':
      return <ContextualAlertSection key={section.section_id} section={section} />;
    case 'interactive_glass_tracker':
      return (
        <HydrationTrackerSection
          key={section.section_id}
          section={section}
          selectedCount={extras.selectedGlassCount}
          onSelectGlass={extras.onSelectGlass}
          total={extras.hydrationTotal}
          goalPercent={extras.hydrationGoalPercent}
        />
      );
    default:
      return null;
  }
}

export default function QuickDetailView({ data, category }) {
  const queryClient = useQueryClient();
  const isHydration = category === 'hydration';
  const [guidedSessionOpen, setGuidedSessionOpen] = useState(false);

  const guidedSession = data?.footer_actions?.primary_button?.guided_session || null;

  const initialTracker = useMemo(
    () =>
      (data?.sections || []).find(section => section.card_type === 'interactive_glass_tracker')
        ?.tracker_data || null,
    [data?.sections]
  );

  const [savedTracker, setSavedTracker] = useState(initialTracker);
  const [selectedGlassCount, setSelectedGlassCount] = useState(
    initialTracker?.logged_glasses || 0
  );

  useEffect(() => {
    if (!initialTracker) return;
    setSavedTracker(initialTracker);
    setSelectedGlassCount(initialTracker.logged_glasses || 0);
  }, [initialTracker]);

  const hydrationMutation = useMutation({
    mutationFn: payload => saveHydrationLog(payload),
    onSuccess: response => {
      const tracker = response?.data?.data?.tracker_data;
      const message = response?.data?.message || 'Hydration logged successfully.';
      if (tracker) {
        setSavedTracker(tracker);
        setSelectedGlassCount(tracker.logged_glasses || 0);
      }
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: [queryKeys.customerV2ReliefQuickDetail, category] });
    },
    onError: () => {
      toast.error('Could not save your hydration log. Please try again.');
    },
  });

  if (!data?.header) return null;

  const header = data.header;
  const sections = data.sections || [];
  const hasUnsavedHydrationChanges =
    isHydration && selectedGlassCount !== (savedTracker?.logged_glasses || 0);
  const isGoalComplete = savedTracker?.is_goal_complete;
  const hydrationTotal = initialTracker?.total_glasses || savedTracker?.total_glasses || 8;
  const hydrationGoalPercent = Math.min(
    100,
    Math.round((selectedGlassCount / hydrationTotal) * 100)
  );

  const handleSaveHydration = () => {
    hydrationMutation.mutate({ logged_glasses: selectedGlassCount });
  };

  const primaryButtonLabel = (() => {
    if (!isHydration) return data.footer_actions?.primary_button?.label;
    if (hydrationMutation.isPending) return 'Saving…';
    if (isGoalComplete && !hasUnsavedHydrationChanges) return 'Goal reached 🎉';
    return data.footer_actions?.primary_button?.label || 'Log Hydration Today';
  })();

  const handlePrimaryAction = () => {
    if (isHydration) {
      handleSaveHydration();
      return;
    }

    if (guidedSession?.content_type) {
      setGuidedSessionOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/portal/customer/relief"
        className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm backdrop-blur-sm transition hover:border-primary/30 hover:text-primary"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to Quick Tools
      </Link>

      <header className="relative overflow-hidden rounded-3xl border border-stone-200/60 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 p-6 shadow-sm md:p-7">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        {header.category_label ? (
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
            {header.category_label}
          </p>
        ) : null}
        <div className="relative mt-4 flex items-start gap-4">
          {header.avatar_icon ? (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm ring-1 ring-stone-200/80">
              {header.avatar_icon}
            </span>
          ) : null}
          <div>
            <h1 className="font-serif text-2xl font-normal text-gray-900 md:text-3xl">
              {header.title}
            </h1>
            {header.subtitle ? (
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{header.subtitle}</p>
            ) : null}
          </div>
        </div>
        {header.meta_tags?.length ? (
          <div className="relative mt-5 flex flex-wrap gap-2">
            {header.meta_tags.map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm"
              >
                <span>{tag.icon}</span>
                {tag.text}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div className="space-y-6">
        {sections.map(section =>
          renderSection(section, {
            selectedGlassCount,
            onSelectGlass: setSelectedGlassCount,
            hydrationTotal,
            hydrationGoalPercent,
          })
        )}
      </div>

      {data.footer_actions ? (
        <footer className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {data.footer_actions.secondary_button ? (
            <button
              type="button"
              className={getCtaClassName(data.footer_actions.secondary_button.style_variant)}
            >
              {data.footer_actions.secondary_button.icon
                ? `${data.footer_actions.secondary_button.icon} `
                : ''}
              {data.footer_actions.secondary_button.label}
            </button>
          ) : null}
          {data.footer_actions.primary_button ? (
            <button
              type="button"
              disabled={
                isHydration && (hydrationMutation.isPending || !hasUnsavedHydrationChanges)
              }
              onClick={handlePrimaryAction}
              className={`${getCtaClassName(data.footer_actions.primary_button.style_variant)} min-w-[160px] disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {data.footer_actions.primary_button.icon
                ? `${data.footer_actions.primary_button.icon} `
                : ''}
              {primaryButtonLabel}
            </button>
          ) : null}
        </footer>
      ) : null}

      <GuidedSessionModal
        open={guidedSessionOpen}
        onClose={() => setGuidedSessionOpen(false)}
        session={guidedSession}
        title={header.title}
      />
    </div>
  );
}
