'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';
import { FiTrendingUp } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import Spinner from '@/components/common/loader/Spinner';
import { fetchCustomerV2Section } from '@/services/private/customer/v2/home';
import queryKeys from '@/utils/query-keys';
import { isExpertImageUrl } from '@/utils/expert-media';
import AIWellnessCoachModal from '@/components/customer/v2/AIWellnessCoachModal';
import CheckInModal from '@/components/customer/v2/CheckInModal';
import PeriodLogModal from '@/components/customer/v2/PeriodLogModal';
import GuidedSessionModal from '@/components/customer/v2/Relief/GuidedSessionModal';
import SectionInfoModal, {
  CARD_INFO_ICON_POSITION,
  SectionInfoButton,
  useSectionInfoModal,
} from '@/components/customer/v2/SectionInfo';
import {
  buildHomeLayoutGroups,
  chipPaletteClass,
  getEnabledHomeSections,
  hasSectionInfo,
  normalizeMoodOptions,
  sectionHasContent,
} from '@/utils/customer-v2-home';
import {
  HOME_CARD,
  HOME_CARD_INTERACTIVE,
  HOME_BTN_PRIMARY,
  HOME_BTN_OUTLINE,
  HOME_PAGE_SHELL,
  HOME_PAGE_CONTAINER,
  HOME_PAGE_STACK,
  HOME_SECTION_GRID,
  HOME_HEADER,
  HOME_SECTION_LABEL,
  HOME_CARD_BTN_ROW,
} from '@/components/customer/v2/HomeDashboard/homeDashboardUi';

const CARD = HOME_CARD;
const CARD_INTERACTIVE = HOME_CARD_INTERACTIVE;
const BTN_PRIMARY = HOME_BTN_PRIMARY;
const BTN_OUTLINE = HOME_BTN_OUTLINE;

function SectionShell({ children, className = '', sectionData, onInfoOpen, onClick }) {
  const showInfo = hasSectionInfo(sectionData);
  const useFlexCol = /\bflex-col\b/.test(className);
  const interactive = typeof onClick === 'function';

  return (
    <div
      className={`relative ${CARD} ${className}`}
      onClick={onClick}
      onKeyDown={
        interactive
          ? event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick(event);
              }
            }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {showInfo ? (
        <SectionInfoButton
          sectionData={sectionData}
          onOpen={onInfoOpen}
          className={CARD_INFO_ICON_POSITION}
        />
      ) : null}
      <div
        className={`min-w-0 ${showInfo ? 'pr-9 sm:pr-10' : ''} ${
          useFlexCol ? 'flex min-h-0 flex-1 flex-col' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
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
    <header className={HOME_HEADER}>
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl lg:-right-24 lg:-top-24 lg:h-72 lg:w-72 lg:bg-primary/12"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-amber-200/30 blur-3xl lg:h-56 lg:w-56"
        aria-hidden
      />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div className="max-w-2xl lg:max-w-3xl">
          <p className="text-sm font-medium text-gray-500 lg:text-[15px]">{home.greetings}</p>
          <h1 className="mt-1 font-serif text-3xl font-normal tracking-tight text-gray-900 md:text-[2.35rem] md:leading-tight lg:text-4xl lg:leading-[1.15] xl:text-[2.75rem]">
            {home.heading}
          </h1>
          {home.subheading ? (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600 md:text-[15px] lg:mt-3 lg:text-base lg:leading-relaxed">
              {home.subheading}
            </p>
          ) : null}
          {home.is_header_chip && home.header_chip ? (
            <span className="mt-4 inline-flex rounded-full border border-amber-200/80 bg-amber-50 px-3.5 py-1.5 text-sm font-medium text-amber-900 lg:mt-5 lg:px-4 lg:py-2">
              {home.header_chip}
            </span>
          ) : null}
        </div>
        {home.is_ai_btn ? (
          <button
            type="button"
            onClick={onAskAi}
            className={`${BTN_PRIMARY} shrink-0 self-start shadow-primary/20 lg:self-auto lg:shadow-lg lg:shadow-primary/25`}
          >
            <HiSparkles className="h-4 w-4 lg:h-5 lg:w-5" />
            {home.ai_button?.label || 'Ask AI'}
          </button>
        ) : null}
      </div>
    </header>
  );
}

function PeriodCard({ data, onClick, onInfoOpen }) {
  if (!data?.title) return null;
  const showInfo = hasSectionInfo(data);

  return (
    <div className="relative rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 via-rose-50/80 to-pink-50/50 px-5 py-4 md:px-6 md:py-5 lg:rounded-3xl lg:border-rose-100/80 lg:px-8 lg:py-6 lg:shadow-[0_4px_24px_rgba(244,63,94,0.08)]">
      {showInfo ? (
        <SectionInfoButton
          sectionData={data}
          onOpen={onInfoOpen}
          className={CARD_INFO_ICON_POSITION}
        />
      ) : null}
      <div className={showInfo ? 'pr-9 sm:pr-10' : undefined}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{data.title}</p>
              <p className="mt-0.5 text-sm text-gray-600">{data.subtitle}</p>
            </div>
          </div>
          <button type="button" onClick={onClick} className={`${BTN_OUTLINE} shrink-0`}>
            {data.btn_text}
          </button>
        </div>
      </div>
    </div>
  );
}

function MoodCard({ data, selectedMood, onSelect, onInfoOpen }) {
  const options = normalizeMoodOptions(data?.tracker);
  if (!options.length) return null;

  return (
    <SectionShell
      className="h-full bg-gradient-to-br from-amber-50/70 via-white to-orange-50/30 p-5 md:p-6 lg:p-8"
      sectionData={data}
      onInfoOpen={onInfoOpen}
    >
      <p className={`${HOME_SECTION_LABEL} text-primary/80`}>
        Daily check-in
      </p>
      <h2 className="mt-2 font-serif text-xl leading-snug text-gray-900 md:text-2xl lg:mt-3 lg:text-[1.65rem]">
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

function PersonalizedCard({ data, onInfoOpen }) {
  if (!data?.title) return null;
  return (
    <SectionShell
      className="h-full bg-gradient-to-br from-primary/[0.04] via-white to-amber-50/40 p-6 md:p-7 lg:p-8 lg:ring-1 lg:ring-primary/10"
      sectionData={data}
      onInfoOpen={onInfoOpen}
    >
      <p className={`${HOME_SECTION_LABEL} text-primary/80`}>
        {data.label || 'Personalized for you'}
      </p>
      <h2 className="mt-3 font-serif text-xl leading-snug text-gray-900 md:text-2xl lg:mt-4 lg:text-[1.65rem] lg:leading-snug">
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

function ScoredCard({ data, compact = false, onInfoOpen }) {
  if (data?.score == null) return null;

  return (
    <SectionShell
      className="h-full p-5 md:p-6 lg:p-8 lg:bg-gradient-to-br lg:from-white lg:via-primary/[0.03] lg:to-stone-50/50"
      sectionData={data}
      onInfoOpen={onInfoOpen}
    >
      <div
        className={`flex gap-5 lg:items-center lg:gap-6 ${
          compact ? 'flex-col items-center text-center' : 'flex-col sm:flex-row sm:items-center'
        }`}
      >
        <div className="shrink-0 lg:scale-105 lg:origin-center">
          <WellnessScoreRing score={data.score} size={compact ? 108 : 120} />
        </div>
        <div className={compact ? '' : 'flex-1 lg:min-w-0'}>
          <h2 className="font-serif text-lg leading-snug text-gray-900 md:text-xl lg:text-[1.35rem]">
            {data.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600 lg:mt-2 lg:text-[15px]">
            {data.subtitle}
          </p>
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

function CoachCard({ data, onClick, onInfoOpen, className = '' }) {
  if (!data?.title) return null;
  const showInfo = hasSectionInfo(data);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-full w-full rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 to-brownish p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md md:p-6 lg:rounded-3xl lg:p-8 lg:shadow-[0_4px_24px_rgba(115,95,162,0.12)] lg:hover:shadow-[0_8px_32px_rgba(115,95,162,0.16)] ${className}`}
    >
      {showInfo ? (
        <SectionInfoButton
          sectionData={data}
          onOpen={onInfoOpen}
          className={CARD_INFO_ICON_POSITION}
        />
      ) : null}
      <div
        className={`flex items-start gap-4 ${showInfo ? 'pr-9 sm:pr-10' : ''}`}
      >
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
          <p className="mt-2 font-serif text-lg leading-snug text-gray-900 lg:text-xl">{data.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600 lg:text-[15px]">{data.subtitle}</p>
        </div>
        {data.action?.arrow_icon ? (
          <span
            className="mt-1 shrink-0 self-start text-lg font-medium text-primary"
            style={data.action.arrow_color_hex ? { color: data.action.arrow_color_hex } : undefined}
          >
            {data.action.arrow_icon}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function TrendCard({ data, onClick, onInfoOpen, className = '' }) {
  if (!data?.title) return null;
  const showInfo = hasSectionInfo(data);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-full w-full ${CARD_INTERACTIVE} p-5 text-left lg:rounded-3xl lg:p-6 ${className}`}
    >
      {showInfo ? (
        <SectionInfoButton
          sectionData={data}
          onOpen={onInfoOpen}
          className={CARD_INFO_ICON_POSITION}
        />
      ) : null}
      <div
        className={`flex w-full min-w-0 items-center gap-4 ${showInfo ? 'pr-9 sm:pr-10' : ''}`}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
          {data.icon_image || <FiTrendingUp className="h-5 w-5 text-primary" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">{data.title}</p>
          <p className="mt-0.5 text-sm text-gray-600">{data.subtitle}</p>
        </div>
        {data.action?.arrow_icon ? (
          <span
            className="shrink-0 text-lg font-medium text-primary"
            style={data.action.arrow_color_hex ? { color: data.action.arrow_color_hex } : undefined}
          >
            {data.action.arrow_icon}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function TodayPlanCard({ data, onClick, onInfoOpen }) {
  if (!data?.title) return null;
  return (
    <SectionShell
      className={`${CARD_INTERACTIVE} flex h-full cursor-pointer flex-col border-primary/10 bg-gradient-to-br from-white via-primary/[0.04] to-amber-50/30 p-6 md:p-7 lg:p-8 lg:ring-1 lg:ring-primary/10`}
      sectionData={data}
      onInfoOpen={onInfoOpen}
      onClick={onClick}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className={`${HOME_SECTION_LABEL} text-gray-400`}>
          {data.label}
        </p>
        {data.day_badge ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-primary/15">
            {data.day_badge}
          </span>
        ) : null}
      </div>
      <h2 className="mt-4 font-serif text-2xl text-gray-900 lg:text-[1.75rem]">{data.title}</h2>
      <p className="mt-2 text-sm text-gray-600 lg:text-[15px]">{data.subtitle}</p>
      <div className={`${HOME_CARD_BTN_ROW} lg:pt-8`}>
        <span className={BTN_PRIMARY}>
          {data.btn_text || 'Start Now'}
        </span>
      </div>
    </SectionShell>
  );
}

function ProgressCard({ data, onInfoOpen }) {
  if (!data?.title) return null;
  const tracker = data.weekly_tracker || {};
  const outcomeLabel = data.outcome_label;
  return (
    <SectionShell className="h-full p-6 md:p-7 lg:p-8" sectionData={data} onInfoOpen={onInfoOpen}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-serif text-xl text-gray-900 md:text-2xl lg:text-[1.65rem]">{data.title}</h2>
        {outcomeLabel && data.outcome_status && data.outcome_status !== 'insufficient_data' ? (
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {outcomeLabel}
          </span>
        ) : null}
      </div>
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

function ProgramCard({ data, onClick, onInfoOpen }) {
  const [imageFailed, setImageFailed] = useState(false);
  const programImage = typeof data?.image === 'string' ? data.image.trim() : '';
  const showImage = isExpertImageUrl(programImage) && !imageFailed;

  if (!data?.title) return null;

  return (
    <SectionShell
      className="flex h-full flex-col border-primary/15 bg-gradient-to-br from-primary/5 via-white to-amber-50/20 p-5 md:p-6 lg:p-8"
      sectionData={data}
      onInfoOpen={onInfoOpen}
    >
      <div className="flex min-h-0 flex-1 gap-4 lg:gap-5">
        <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-primary/10 sm:h-20 sm:w-20 lg:h-[5.5rem] lg:w-[5.5rem] lg:rounded-3xl lg:shadow-md">
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
          <h2 className="mt-1.5 line-clamp-3 font-serif text-lg leading-snug text-gray-900 md:text-xl lg:line-clamp-2 lg:text-[1.35rem]">
            {data.title}
          </h2>
        </div>
      </div>

      <div className={HOME_CARD_BTN_ROW}>
        <button type="button" onClick={onClick} className={BTN_PRIMARY}>
          {data.btn_text || 'Resume'}
        </button>
      </div>
    </SectionShell>
  );
}

function ExploreCard({ data, onClick, onInfoOpen }) {
  if (!data?.title) return null;
  return (
    <SectionShell className="flex h-full flex-col p-6 md:p-7 lg:p-8" sectionData={data} onInfoOpen={onInfoOpen}>
      <p className={`${HOME_SECTION_LABEL} text-gray-400`}>{data.label}</p>
      <h2 className="mt-3 flex-1 font-serif text-xl leading-snug text-gray-900 md:text-2xl lg:mt-4 lg:text-[1.5rem]">
        {data.title}
      </h2>
      <div className={HOME_CARD_BTN_ROW}>
        <button type="button" onClick={onClick} className={`${BTN_OUTLINE} inline-flex items-center gap-1`}>
          {data.btn_text || 'Explore'}
        </button>
      </div>
    </SectionShell>
  );
}

function InfoCard({ data, onClick, onInfoOpen }) {
  if (!data?.text) return null;
  return (
    <SectionShell
      className="border-amber-100/60 bg-gradient-to-r from-amber-50/40 via-white to-primary/[0.04] p-5 md:p-6 lg:rounded-3xl lg:px-8 lg:py-5"
      sectionData={data}
      onInfoOpen={onInfoOpen}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          {data.avatars?.length ? (
            <div className="flex shrink-0 -space-x-2">
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
          <p className="min-w-0 text-sm font-medium leading-snug text-gray-800 md:text-[15px] lg:text-base">
            {data.text}
          </p>
        </div>
        <div className="flex shrink-0 justify-end sm:justify-center">
          <button type="button" onClick={onClick} className={BTN_PRIMARY}>
            {data.btn_text || 'See Wins'}
          </button>
        </div>
      </div>
    </SectionShell>
  );
}

const SKELETON_HEIGHT = {
  period: 'h-20',
  checkin: 'h-52',
  personalized: 'h-44',
  scored: 'h-52',
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
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const { infoModalData, openSectionInfo, closeSectionInfo, isSectionInfoOpen } =
    useSectionInfoModal();
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
  const openTodayPlanSession = () => {
    const guidedSession = sectionData.today_plan?.guided_session;
    if (guidedSession?.content_type && guidedSession?.link) {
      setActiveSession({
        content_type: guidedSession.content_type,
        link: guidedSession.link,
        title: guidedSession.title || sectionData.today_plan?.title,
      });
      setSessionModalOpen(true);
      return;
    }
    router.push('/portal/customer/checkin/sleep_tracker');
  };
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
        return (
          <PeriodCard data={sectionData.period} onClick={handlePeriodLog} onInfoOpen={openSectionInfo} />
        );
      case 'checkin':
        return (
          <MoodCard
            data={sectionData.checkin}
            selectedMood={selectedMood}
            onSelect={handleMoodSelect}
            onInfoOpen={openSectionInfo}
          />
        );
      case 'personalized':
        return <PersonalizedCard data={sectionData.personalized} onInfoOpen={openSectionInfo} />;
      case 'scored':
        return <ScoredCard data={sectionData.scored} onInfoOpen={openSectionInfo} />;
      case 'coach':
        return (
          <CoachCard
            data={sectionData.coach}
            onClick={() => goHomeCoachCircle(sectionData.coach)}
            onInfoOpen={openSectionInfo}
          />
        );
      case 'trend':
        return <TrendCard data={sectionData.trend} onClick={goTrends} onInfoOpen={openSectionInfo} />;
      case 'today_plan':
        return (
          <TodayPlanCard
            data={sectionData.today_plan}
            onClick={openTodayPlanSession}
            onInfoOpen={openSectionInfo}
          />
        );
      case 'progress':
        return <ProgressCard data={sectionData.progress} onInfoOpen={openSectionInfo} />;
      case 'program':
        return (
          <ProgramCard
            data={sectionData.program}
            onClick={() => goProgram(sectionData.program?.program_id)}
            onInfoOpen={openSectionInfo}
          />
        );
      case 'explore':
        return <ExploreCard data={sectionData.explore} onClick={goPrograms} onInfoOpen={openSectionInfo} />;
      case 'info':
        return (
          <InfoCard
            data={home.info_section_data}
            onClick={() => router.push('/portal/inbox')}
            onInfoOpen={openSectionInfo}
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
    <div className={HOME_PAGE_SHELL}>
      <div className={HOME_PAGE_CONTAINER}>
        <div className={HOME_PAGE_STACK}>
          <HomeHeader home={home} onAskAi={handleAskAi} />

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
                className={HOME_SECTION_GRID}
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
            <p className="border-t border-stone-200/80 pt-6 text-center text-sm text-gray-500 lg:pt-8 lg:text-[15px]">
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

      <GuidedSessionModal
        open={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        session={activeSession}
        title={activeSession?.title}
      />

      <SectionInfoModal
        open={isSectionInfoOpen}
        data={infoModalData}
        onClose={closeSectionInfo}
      />
    </div>
  );
}
