'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';
import { FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import Spinner from '@/components/common/loader/Spinner';
import { fetchCustomerV2Section } from '@/services/private/customer/v2/home';
import {
  buildHomeLayoutGroups,
  chipPaletteClass,
  getEnabledHomeSections,
  normalizeMoodOptions,
  sectionHasContent,
} from '@/utils/customer-v2-home';
import queryKeys from '@/utils/query-keys';
import { isExpertImageUrl } from '@/utils/expert-media';
import AIWellnessCoachModal from '@/components/customer/v2/AIWellnessCoachModal';
import CheckInModal from '@/components/customer/v2/CheckInModal';
import PeriodLogModal from '@/components/customer/v2/PeriodLogModal';

const CARD =
  'rounded-2xl border border-stone-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.05)]';
const CARD_INTERACTIVE =
  `${CARD} transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)]`;
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

function WellnessScoreRing({ score, size = 120 }) {
  const value = Math.min(100, Math.max(0, Number(score) || 0));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const hasScore = value > 0;

  return (
    <div className={`relative shrink-0 ${hasScore ? 'text-primary' : ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E7E5E4"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={hasScore ? 'currentColor' : '#D6D3D1'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-500">SCORE</span>
      </div>
    </div>
  );
}

function WeeklyProgressBar({ total = 7, active = 0 }) {
  return (
    <div className="mt-5 flex gap-1.5">
      {Array.from({ length: total }, (_, index) => (
        <div
          key={index}
          className={`h-2.5 flex-1 rounded-full transition-colors ${
            index < active ? 'bg-primary' : 'bg-stone-200'
          }`}
        />
      ))}
    </div>
  );
}

function HomeHeader({ home, onAskAi }) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-stone-200/60 bg-gradient-to-br from-white via-brownish to-amber-50/40 px-6 py-7 shadow-sm md:px-8 md:py-8">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-gray-500">{home.greetings}</p>
          <h1 className="mt-1 font-serif text-3xl font-normal tracking-tight text-gray-900 md:text-[2.35rem] md:leading-tight">
            {home.heading}
          </h1>
          {home.subheading ? (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600 md:text-[15px]">
              {home.subheading}
            </p>
          ) : null}
          {home.is_header_chip && home.header_chip ? (
            <span className="mt-4 inline-flex rounded-full border border-amber-200/80 bg-amber-50 px-3.5 py-1.5 text-sm font-medium text-amber-900">
              {home.header_chip}
            </span>
          ) : null}
        </div>
        {home.is_ai_btn ? (
          <button type="button" onClick={onAskAi} className={`${BTN_PRIMARY} shrink-0 self-start lg:self-auto`}>
            <HiSparkles className="h-4 w-4" />
            {home.ai_button?.label || 'Ask AI'}
          </button>
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

function WellnessSummaryCard({ personalized, scored }) {
  const hasPersonalized = Boolean(personalized?.title);
  const hasScored = scored?.score != null;

  if (!hasPersonalized && !hasScored) return null;

  return (
    <SectionShell className="h-full p-5 md:p-6">
      <div className="flex h-full flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
        {hasPersonalized ? (
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
              {personalized.label || 'Personalized for you'}
            </p>
            <h2 className="mt-2 font-serif text-xl leading-snug text-gray-900 md:text-2xl">
              {personalized.title}
            </h2>
            {personalized.trend?.text ? (
              <span
                className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${chipPaletteClass(
                  personalized.trend.palette
                )}`}
              >
                {personalized.trend.icon} {personalized.trend.text}
              </span>
            ) : null}
            {personalized.body ? (
              <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-[15px]">
                {personalized.body}
              </p>
            ) : null}
          </div>
        ) : null}

        {hasPersonalized && hasScored ? (
          <div className="hidden w-px self-stretch bg-stone-200 lg:block" aria-hidden />
        ) : null}

        {hasScored ? (
          <div
            className={`flex w-full flex-col gap-4 ${
              hasPersonalized ? 'lg:w-[min(100%,20rem)] lg:shrink-0' : ''
            }`}
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <WellnessScoreRing score={scored.score} size={hasPersonalized ? 108 : 120} />
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-lg leading-snug text-gray-900 md:text-xl">
                  {scored.title}
                </h3>
                {scored.subtitle ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{scored.subtitle}</p>
                ) : null}
              </div>
            </div>
            {scored.chips?.length ? (
              <div className="flex flex-wrap gap-2">
                {scored.chips.map(chip => (
                  <span
                    key={`${chip.label}-${chip.icon}`}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${chipPaletteClass(
                      chip.palette
                    )}`}
                  >
                    {chip.icon} {chip.label}
                    {chip.trend_indicator ? ` ${chip.trend_indicator}` : ''}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

function PersonalizedCard({ data }) {
  if (!data?.title) return null;
  return (
    <SectionShell className="p-6 md:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
        {data.label || 'Personalized for you'}
      </p>
      <h2 className="mt-3 max-w-2xl font-serif text-2xl leading-snug text-gray-900 md:text-[1.75rem]">
        {data.title}
      </h2>
      {data.trend?.text ? (
        <span
          className={`mt-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${chipPaletteClass(
            data.trend.palette
          )}`}
        >
          {data.trend.icon} {data.trend.text}
        </span>
      ) : null}
      {data.body ? (
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-600 md:text-[15px]">
          {data.body}
        </p>
      ) : null}
    </SectionShell>
  );
}

function ScoredCard({ data, compact = false }) {
  if (data?.score == null) return null;

  return (
    <SectionShell className={`h-full p-5 md:p-6 ${compact ? '' : ''}`}>
      <div className={`flex gap-5 ${compact ? 'flex-col items-center text-center' : 'flex-col sm:flex-row sm:items-center'}`}>
        <WellnessScoreRing score={data.score} size={compact ? 108 : 120} />
        <div className={compact ? '' : 'flex-1'}>
          <h2 className="font-serif text-lg leading-snug text-gray-900 md:text-xl">{data.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{data.subtitle}</p>
        </div>
      </div>
      {data.chips?.length ? (
        <div className={`mt-5 flex flex-wrap gap-2 ${compact ? 'justify-center' : ''}`}>
          {data.chips.map(chip => (
            <span
              key={`${chip.label}-${chip.icon}`}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${chipPaletteClass(
                chip.palette
              )}`}
            >
              {chip.icon} {chip.label}
              {chip.trend_indicator ? ` ${chip.trend_indicator}` : ''}
            </span>
          ))}
        </div>
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
          {typeof data.avatar_icon === 'string' && data.avatar_icon.startsWith('http') ? (
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

function TrendCard({ data, onClick, className = '' }) {
  if (!data?.title) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${CARD_INTERACTIVE} flex h-full w-full items-center gap-4 p-5 text-left ${className}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
        {data.icon_image || <FiTrendingUp className="h-5 w-5 text-primary" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">{data.title}</p>
        <p className="mt-0.5 text-sm text-gray-600">{data.subtitle}</p>
      </div>
      <FiArrowRight className="h-5 w-5 shrink-0 text-primary" />
    </button>
  );
}

function TodayPlanCard({ data, onClick }) {
  if (!data?.title) return null;
  return (
    <SectionShell className="flex h-full flex-col p-6 md:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
          {data.label}
        </p>
        {data.day_badge ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-primary/15">
            {data.day_badge}
          </span>
        ) : null}
      </div>
      <h2 className="mt-4 font-serif text-2xl text-gray-900">{data.title}</h2>
      <p className="mt-2 text-sm text-gray-600">{data.subtitle}</p>
      <div className="mt-auto pt-6">
        <button type="button" onClick={onClick} className={BTN_PRIMARY}>
          {data.btn_text || 'Start Now'}
          <FiArrowRight className="h-4 w-4" />
        </button>
      </div>
    </SectionShell>
  );
}

function ProgressCard({ data }) {
  if (!data?.title) return null;
  const tracker = data.weekly_tracker || {};
  return (
    <SectionShell className="h-full p-6 md:p-7">
      <h2 className="font-serif text-xl text-gray-900 md:text-2xl">{data.title}</h2>
      <p className="mt-2 text-sm text-gray-600">{data.subtitle}</p>
      {data.chips?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {data.chips.map(chip => (
            <span
              key={chip.text}
              className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-gray-700"
            >
              {chip.icon} {chip.text}
            </span>
          ))}
        </div>
      ) : null}
      <WeeklyProgressBar total={tracker.total_segments || 7} active={tracker.active_segments || 0} />
    </SectionShell>
  );
}

function ProgramCard({ data, onClick }) {
  const [imageFailed, setImageFailed] = useState(false);
  const programImage = typeof data?.image === 'string' ? data.image.trim() : '';
  const showImage = isExpertImageUrl(programImage) && !imageFailed;

  if (!data?.title) return null;

  return (
    <SectionShell className="flex h-full flex-col border-primary/15 bg-gradient-to-br from-primary/5 via-white to-amber-50/20 p-5 md:p-6">
      <div className="flex flex-1 gap-4">
        <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-primary/10 sm:h-20 sm:w-20">
          {showImage ? (
            <img
              src={programImage}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl">
              {data.icon || '🌸'}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
            {data.label}
          </p>
          <h2 className="mt-1.5 line-clamp-3 font-serif text-lg leading-snug text-gray-900 md:text-xl">
            {data.title}
          </h2>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button type="button" onClick={onClick} className={BTN_PRIMARY}>
          {data.btn_text || 'Resume'}
          <FiArrowRight className="h-4 w-4" />
        </button>
      </div>
    </SectionShell>
  );
}

function ExploreCard({ data, onClick }) {
  if (!data?.title) return null;
  return (
    <SectionShell className="flex h-full flex-col p-6 md:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
        {data.label}
      </p>
      <h2 className="mt-3 flex-1 font-serif text-xl leading-snug text-gray-900 md:text-2xl">
        {data.title}
      </h2>
      <button type="button" onClick={onClick} className={`${BTN_OUTLINE} mt-5 inline-flex items-center gap-1 self-start`}>
        {data.btn_text || 'Explore'}
        <FiArrowRight className="h-4 w-4" />
      </button>
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
        {data.btn_text || 'See Wins'}
      </button>
    </SectionShell>
  );
}

const SKELETON_HEIGHT = {
  period: 'h-20',
  checkin: 'h-52',
  personalized: 'h-44',
  scored: 'h-52',
  wellness_summary: 'h-56',
  coach: 'h-36',
  trend: 'h-24',
  today_plan: 'h-56',
  progress: 'h-56',
  program: 'h-48',
  explore: 'h-48',
  info: 'h-20',
};

export default function ReturningUserHome({ home }) {
  const router = useRouter();
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiSessionKey, setAiSessionKey] = useState(0);
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

  const goTrends = () => router.push('/portal/customer/checkin/daily_insights');
  const goTodayPlan = () => router.push('/portal/customer/checkin/sleep_tracker');
  const goPrograms = () => router.push('/portal/customer/lms/program');
  const goHomeCoachCircle = coachData => {
    const conversationId = coachData?.id;
    if (!conversationId) {
      router.push('/portal/inbox');
      return;
    }
    router.push(`/portal/inbox?conversation=${conversationId}`);
  };
  const goProgram = programId => {
    if (programId) {
      router.push(`/portal/customer/lms/program/${programId}/details`);
      return;
    }
    goPrograms();
  };

  const handleAskAi = () => {
    setAiSessionKey(key => key + 1);
    setAiModalOpen(true);
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
      case 'personalized':
        return <PersonalizedCard data={sectionData.personalized} />;
      case 'scored':
        return <ScoredCard data={sectionData.scored} />;
      case 'coach':
        return (
          <CoachCard
            data={sectionData.coach}
            onClick={() => goHomeCoachCircle(sectionData.coach)}
          />
        );
      case 'trend':
        return <TrendCard data={sectionData.trend} onClick={goTrends} />;
      case 'today_plan':
        return <TodayPlanCard data={sectionData.today_plan} onClick={goTodayPlan} />;
      case 'progress':
        return <ProgressCard data={sectionData.progress} />;
      case 'program':
        return (
          <ProgramCard
            data={sectionData.program}
            onClick={() => goProgram(sectionData.program?.program_id)}
          />
        );
      case 'explore':
        return <ExploreCard data={sectionData.explore} onClick={goPrograms} />;
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
    if (isLoadingSections && key !== 'info' && !sectionData[key] && key !== 'wellness_summary') {
      return <SectionSkeleton className={SKELETON_HEIGHT[key] || 'h-40'} />;
    }
    if (key === 'wellness_summary') {
      if (isLoadingSections && !sectionData.personalized && !sectionData.scored) {
        return <SectionSkeleton className={SKELETON_HEIGHT.wellness_summary} />;
      }
      const content = (
        <WellnessSummaryCard
          personalized={sectionData.personalized}
          scored={sectionData.scored}
        />
      );
      const hasContent =
        sectionHasContent('personalized', sectionData.personalized, home) ||
        sectionHasContent('scored', sectionData.scored, home);
      if (!content && !hasContent) return null;
      return content;
    }
    const content = renderSectionContent(key);
    if (!content && !sectionHasContent(key, sectionData[key], home)) return null;
    return content;
  };

  return (
    <div className="min-h-full w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 xl:px-8">
        <div className="flex flex-col gap-6 lg:gap-7">
          <HomeHeader home={home} onAskAi={handleAskAi} />

          {layoutGroups.map((group, groupIndex) => {
            if (group.type === 'wellness_summary') {
              const section = renderSection('wellness_summary');
              if (!section) return null;
              return <div key={`wellness-summary-${groupIndex}`}>{section}</div>;
            }

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

          {home.footer_note ? (
            <p className="border-t border-stone-200/80 pt-6 text-center text-sm text-gray-500">
              {home.footer_note}
            </p>
          ) : null}
        </div>
      </div>

      <AIWellnessCoachModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        sessionKey={aiSessionKey}
      />

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
