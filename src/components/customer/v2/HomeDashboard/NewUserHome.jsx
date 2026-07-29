'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import Spinner from '@/components/common/loader/Spinner';
import { fetchCustomerV2Section } from '@/services/private/customer/v2/home';
import {
  buildHomeLayoutGroups,
  getEnabledHomeSections,
  normalizeMoodOptions,
  sectionHasContent,
} from '@/utils/customer-v2-home';
import queryKeys from '@/utils/query-keys';
import { isExpertImageUrl } from '@/utils/expert-media';
import CheckInModal from '@/components/customer/v2/CheckInModal';
import PeriodLogModal from '@/components/customer/v2/PeriodLogModal';

const CARD =
  'rounded-2xl border border-stone-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.05)]';
const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 hover:shadow-md';
const BTN_OUTLINE =
  'inline-flex items-center justify-center rounded-full border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5';

function SectionShell({ children, className = '' }) {
  return <div className={`${CARD} ${className}`}>{children}</div>;
}

function SectionSkeleton({ className = 'h-40' }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-stone-200/60 bg-white/80 ${className}`}
    >
      <div className="h-full rounded-2xl bg-gradient-to-br from-stone-100/80 via-white to-stone-50/80" />
    </div>
  );
}

function HomeHeader({ home }) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-stone-200/60 bg-gradient-to-br from-white via-brownish to-amber-50/40 px-6 py-7 shadow-sm md:px-8 md:py-8">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div className="relative max-w-2xl">
        <p className="text-sm font-medium text-gray-500">{home.greetings}</p>
        <h1 className="mt-1 font-serif text-3xl font-normal tracking-tight text-gray-900 md:text-[2.35rem] md:leading-tight">
          {home.heading}
        </h1>
        {home.subheading ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600 md:text-[15px]">
            {home.subheading}
          </p>
        ) : null}
      </div>
    </header>
  );
}

function PeriodCard({ data, onClick }) {
  if (!data?.title) return null;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 via-rose-50/80 to-pink-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-5">
      <div className="flex items-start gap-3">
        <span className="mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        </span>
        <div>
          <p className="font-semibold text-gray-900">{data.title}</p>
          <p className="mt-0.5 text-sm text-gray-600">{data.subtitle}</p>
        </div>
      </div>
      <button type="button" onClick={onClick} className={`${BTN_OUTLINE} shrink-0`}>
        {data.btn_text}
      </button>
    </div>
  );
}

function MoodCard({ data, selectedMood, onSelect }) {
  const options = normalizeMoodOptions(data?.tracker);
  if (!options.length) return null;

  return (
    <SectionShell className="h-full bg-gradient-to-br from-amber-50/70 via-white to-orange-50/30 p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
        Daily check-in
      </p>
      <h2 className="mt-2 font-serif text-xl leading-snug text-gray-900 md:text-2xl">
        {data.tracker.title}
      </h2>
      <div className="mt-6 grid grid-cols-5 gap-2 sm:gap-3">
        {options.map(option => {
          const isSelected = selectedMood?.index === option.index;
          return (
            <button
              key={option.index}
              type="button"
              onClick={() => onSelect(option, data.url)}
              className="group flex flex-col items-center gap-2 rounded-xl p-2 transition hover:bg-white/80"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm ring-1 transition group-hover:scale-105 group-hover:shadow-md md:h-14 md:w-14 md:text-2xl ${
                  isSelected ? 'ring-2 ring-primary shadow-md' : 'ring-stone-200/80'
                }`}
              >
                {option.icon}
              </span>
              <span className="text-center text-[11px] font-medium leading-tight text-gray-600 md:text-xs">
                {option.title}
              </span>
            </button>
          );
        })}
      </div>
      {selectedMood?.description ? (
        <p className="mt-4 text-center text-sm font-medium leading-relaxed text-primary">
          {selectedMood.description}
        </p>
      ) : null}
    </SectionShell>
  );
}

function CheckinInfoCard({ data }) {
  if (!data?.title) return null;
  return (
    <SectionShell className="flex h-full flex-col justify-center bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/30 p-5 md:p-6">
      <span className="text-2xl">{data.icon || '💛'}</span>
      <p className="mt-3 font-serif text-lg leading-snug text-gray-900 md:text-xl">{data.title}</p>
      {data.subtitle ? (
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{data.subtitle}</p>
      ) : null}
    </SectionShell>
  );
}

function CoachCard({ data, onClick, className = '' }) {
  if (!data?.title) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-full w-full rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 to-brownish p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md md:p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
          {typeof data.avatar_icon === 'string' && isExpertImageUrl(data.avatar_icon) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.avatar_icon} alt="" className="h-14 w-14 rounded-2xl object-cover" />
          ) : (
            data.avatar_icon || '👩‍⚕️'
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/80">
              {data.eyebrow}
            </p>
            {data.status_badge?.text ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                ● {data.status_badge.text}
              </span>
            ) : null}
          </div>
          <p className="mt-2 font-serif text-lg leading-snug text-gray-900">{data.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">{data.subtitle}</p>
        </div>
        <FiArrowRight className="mt-1 h-5 w-5 shrink-0 text-primary" />
      </div>
    </button>
  );
}

function GettingStartedCard({ data, onStepClick }) {
  if (!data?.steps?.length) return null;
  const percentage = Math.min(100, Math.max(0, Number(data.percentage) || 0));

  return (
    <SectionShell className="p-6 md:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
            {data.label || 'Getting started'}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {data.stepsCompleted ?? 0} of {data.totalSteps ?? data.steps.length} steps complete
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {percentage}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <ul className="mt-6 space-y-3">
        {data.steps.map((step, index) => {
          const isDone = step.status === 'done';
          const isClickable = !isDone && step.step_id;
          const content = (
            <>
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${
                  isDone
                    ? 'bg-primary text-white'
                    : 'border border-stone-200 bg-white text-stone-400'
                }`}
              >
                {isDone ? <FiCheck className="h-4 w-4" /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`font-medium ${isDone ? 'text-gray-500 line-through' : 'text-gray-900'}`}
                >
                  {step.text}
                </p>
                {step.hint ? (
                  <p className="mt-0.5 text-sm text-gray-500">{step.hint}</p>
                ) : null}
              </div>
              {!isDone && isClickable ? (
                <FiArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
              ) : null}
            </>
          );

          if (isClickable) {
            return (
              <li key={step.step_id || step.text}>
                <button
                  type="button"
                  onClick={() => onStepClick(step)}
                  className="flex w-full items-start gap-3 rounded-xl border border-stone-200/80 bg-stone-50/50 p-4 text-left transition hover:border-primary/30 hover:bg-primary/5"
                >
                  {content}
                </button>
              </li>
            );
          }

          return (
            <li
              key={step.step_id || step.text}
              className="flex items-start gap-3 rounded-xl border border-stone-100 bg-white p-4"
            >
              {content}
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

function AutoTrackerCard({ data }) {
  if (!data?.metrics?.length) return null;
  const status = data.status || {};

  return (
    <SectionShell className="p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-gray-900 md:text-2xl">{data.title}</h2>
          {data.subtitle ? (
            <p className="mt-1.5 text-sm text-gray-600">{data.subtitle}</p>
          ) : null}
        </div>
        {status.label ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-gray-600">
            {status.icon} {status.label}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data.metrics.map(metric => (
          <div
            key={metric.title}
            className={`flex items-center gap-3 rounded-xl border p-4 ${
              metric.is_locked
                ? 'border-stone-200/80 bg-stone-50/50'
                : 'border-primary/15 bg-primary/5'
            }`}
          >
            <span className="text-2xl">{metric.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">{metric.title}</p>
              <p className="text-xs text-gray-500">{metric.source}</p>
            </div>
            <span className="shrink-0 text-xs font-medium text-gray-500">
              {metric.action_text}
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function FeatureSectionCard({ data }) {
  if (!data?.items?.length) return null;

  return (
    <SectionShell className="p-6 md:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
        Unlock as you go
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {data.items.map(item => {
          const lock = item.lock_status || {};
          return (
            <div
              key={item.title}
              className="flex flex-col rounded-xl border border-stone-200/80 bg-gradient-to-br from-white to-stone-50/80 p-5"
            >
              <span className="text-2xl">{item.icon}</span>
              {item.eyebrow ? (
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  {item.eyebrow}
                </p>
              ) : null}
              <p className="mt-1 font-serif text-lg leading-snug text-gray-900">{item.title}</p>
              {lock.text ? (
                <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {lock.icon} {lock.text}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

function InfoCard({ data, onClick }) {
  if (!data?.text) return null;
  return (
    <SectionShell className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
      <div className="flex items-center gap-4">
        {data.avatars?.length ? (
          <div className="flex -space-x-2">
            {data.avatars.map(avatar => (
              <span
                key={avatar}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-sm ring-2 ring-white"
              >
                {avatar}
              </span>
            ))}
          </div>
        ) : null}
        <p className="text-sm font-medium text-gray-800 md:text-[15px]">{data.text}</p>
      </div>
      <button type="button" onClick={onClick} className={`${BTN_PRIMARY} shrink-0`}>
        {data.btn_text || 'Say hi'}
      </button>
    </SectionShell>
  );
}

const SKELETON_HEIGHT = {
  period: 'h-20',
  checkin: 'h-52',
  checkin_info: 'h-52',
  coach: 'h-36',
  getting_started: 'h-64',
  auto_tracker: 'h-72',
  feature: 'h-56',
  info: 'h-20',
};

export default function NewUserHome({ home }) {
  const router = useRouter();
  const [periodModalOpen, setPeriodModalOpen] = useState(false);
  const [periodLogUrl, setPeriodLogUrl] = useState(null);
  const [periodWizardKey, setPeriodWizardKey] = useState(0);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkinWizardUrl, setCheckinWizardUrl] = useState(null);
  const [checkinWizardKey, setCheckinWizardKey] = useState(0);
  const [selectedMood, setSelectedMood] = useState(null);

  const enabledSections = useMemo(() => getEnabledHomeSections(home), [home]);

  const sectionQueries = useQueries({
    queries: enabledSections
      .filter(section => section.url)
      .map(section => ({
        queryKey: [queryKeys.customerV2HomeSection, section.key, section.url],
        queryFn: () => fetchCustomerV2Section(section.url),
        enabled: Boolean(section.url),
        staleTime: 60_000,
      })),
  });

  const sectionData = useMemo(() => {
    const map = {};
    let queryIndex = 0;
    enabledSections.forEach(section => {
      if (!section.url) return;
      map[section.key] = sectionQueries[queryIndex]?.data?.data?.data;
      queryIndex += 1;
    });
    return map;
  }, [enabledSections, sectionQueries]);

  const isLoadingSections = sectionQueries.some(query => query.isLoading);

  const handlePeriodLog = () => {
    const url = sectionData.period?.log_url;
    if (!url) return;
    setPeriodLogUrl(url);
    setPeriodWizardKey(key => key + 1);
    setPeriodModalOpen(true);
  };

  const handleMoodSelect = (option, wizardUrl) => {
    if (!wizardUrl) return;
    setSelectedMood(option);
    setCheckinWizardUrl(wizardUrl);
    setCheckinWizardKey(key => key + 1);
    setCheckinModalOpen(true);
  };

  const handleCheckinModalClose = () => {
    setCheckinModalOpen(false);
    setSelectedMood(null);
  };

  const goHomeCoachCircle = coachData => {
    const conversationId = coachData?.id;
    if (!conversationId) {
      router.push('/portal/inbox');
      return;
    }
    router.push(`/portal/inbox?conversation=${conversationId}`);
  };

  const handleGettingStartedStep = step => {
    if (step.step_id === 'cycle_phase') {
      handlePeriodLog();
      return;
    }
    if (step.step_id === 'focus') {
      router.push('/portal/customer/checkin/monthly_goal');
    }
  };

  const layoutGroups = useMemo(
    () => buildHomeLayoutGroups(home, { isLoading: isLoadingSections, sectionData }),
    [home, isLoadingSections, sectionData]
  );

  const renderSectionContent = key => {
    switch (key) {
      case 'period':
        return <PeriodCard data={sectionData.period} onClick={handlePeriodLog} />;
      case 'checkin':
        return (
          <MoodCard
            data={sectionData.checkin}
            selectedMood={selectedMood}
            onSelect={handleMoodSelect}
          />
        );
      case 'checkin_info':
        return <CheckinInfoCard data={sectionData.checkin_info} />;
      case 'coach':
        return (
          <CoachCard
            data={sectionData.coach}
            onClick={() => goHomeCoachCircle(sectionData.coach)}
          />
        );
      case 'getting_started':
        return (
          <GettingStartedCard
            data={sectionData.getting_started}
            onStepClick={handleGettingStartedStep}
          />
        );
      case 'auto_tracker':
        return <AutoTrackerCard data={sectionData.auto_tracker} />;
      case 'feature':
        return <FeatureSectionCard data={sectionData.feature} />;
      case 'info':
        return (
          <InfoCard
            data={home.info_section_data}
            onClick={() => router.push('/portal/inbox')}
          />
        );
      default:
        return null;
    }
  };

  const renderSection = key => {
    if (isLoadingSections && key !== 'info' && !sectionData[key]) {
      return <SectionSkeleton className={SKELETON_HEIGHT[key] || 'h-40'} />;
    }
    const content = renderSectionContent(key);
    if (!content && !sectionHasContent(key, sectionData[key], home)) return null;
    return content;
  };

  return (
    <div className="min-h-full w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 xl:px-8">
        <div className="flex flex-col gap-6 lg:gap-7">
          <HomeHeader home={home} />

          {layoutGroups.map((group, groupIndex) => {
            if (group.type === 'full') {
              const key = group.keys[0];
              const section = renderSection(key);
              if (!section) return null;
              return <div key={`${key}-${groupIndex}`}>{section}</div>;
            }

            const spanClass = group.keys.length === 1 ? 'md:col-span-2' : '';
            const cells = group.keys
              .map(key => {
                const section = renderSection(key);
                if (!section) return null;
                return (
                  <div key={key} className={spanClass}>
                    {section}
                  </div>
                );
              })
              .filter(Boolean);
            if (!cells.length) return null;
            return (
              <div
                key={`grid-${groupIndex}-${group.keys.join('-')}`}
                className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:gap-6"
              >
                {cells}
              </div>
            );
          })}

          {isLoadingSections && layoutGroups.length === 0 ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : null}
        </div>
      </div>

      <PeriodLogModal
        open={periodModalOpen}
        onClose={() => setPeriodModalOpen(false)}
        logUrl={periodLogUrl}
        wizardKey={periodWizardKey}
      />

      <CheckInModal
        open={checkinModalOpen}
        onClose={handleCheckinModalClose}
        wizardUrl={checkinWizardUrl}
        wizardKey={checkinWizardKey}
        selectedMood={selectedMood}
      />
    </div>
  );
}
