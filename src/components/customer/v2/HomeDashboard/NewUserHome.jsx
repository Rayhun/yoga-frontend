'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import Spinner from '@/components/common/loader/Spinner';
import { fetchCustomerV2Section } from '@/services/private/customer/v2/home';
import queryKeys from '@/utils/query-keys';
import { isExpertImageUrl } from '@/utils/expert-media';
import CheckInModal from '@/components/customer/v2/CheckInModal';
import PeriodLogModal from '@/components/customer/v2/PeriodLogModal';
import SectionInfoModal, {
  CARD_INFO_ICON_POSITION,
  SectionInfoButton,
  useSectionInfoModal,
} from '@/components/customer/v2/SectionInfo';
import {
  buildHomeLayoutGroups,
  getEnabledHomeSections,
  hasSectionInfo,
  normalizeMoodOptions,
  sectionHasContent,
} from '@/utils/customer-v2-home';
import {
  HOME_CARD,
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
const BTN_PRIMARY = HOME_BTN_PRIMARY;
const BTN_OUTLINE = HOME_BTN_OUTLINE;

function SectionShell({ children, className = '', sectionData, onInfoOpen }) {
  const showInfo = hasSectionInfo(sectionData);
  const useFlexCol = /\bflex-col\b/.test(className);

  return (
    <div className={`relative ${CARD} ${className}`}>
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

function HomeHeader({ home }) {
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
      <div className="relative max-w-2xl lg:max-w-3xl">
        <p className="text-sm font-medium text-gray-500 lg:text-[15px]">{home.greetings}</p>
        <h1 className="mt-1 font-serif text-3xl font-normal tracking-tight text-gray-900 md:text-[2.35rem] md:leading-tight lg:text-4xl lg:leading-[1.15] xl:text-[2.75rem]">
          {home.heading}
        </h1>
        {home.subheading ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600 md:text-[15px] lg:mt-3 lg:text-base lg:leading-relaxed">
            {home.subheading}
          </p>
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

function CheckinInfoCard({ data, onInfoOpen }) {
  if (!data?.title) return null;
  return (
    <SectionShell
      className="flex h-full flex-col justify-center bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/30 p-5 md:p-6 lg:p-8"
      sectionData={data}
      onInfoOpen={onInfoOpen}
    >
      <span className="text-2xl">{data.icon || '💛'}</span>
      <p className="mt-3 font-serif text-lg leading-snug text-gray-900 md:text-xl">{data.title}</p>
      {data.subtitle ? (
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{data.subtitle}</p>
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
      <div className={`flex items-start gap-4 ${showInfo ? 'pr-9 sm:pr-10' : ''}`}>
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

function GettingStartedCard({ data, onStepClick, onInfoOpen }) {
  if (!data?.steps?.length) return null;
  const percentage = Math.min(100, Math.max(0, Number(data.percentage) || 0));

  return (
    <SectionShell className="p-6 md:p-7 lg:p-8" sectionData={data} onInfoOpen={onInfoOpen}>
      <p className={`${HOME_SECTION_LABEL} text-gray-400`}>
        {data.label || 'Getting started'}
      </p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-gray-600">
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

function AutoTrackerCard({ data, onInfoOpen }) {
  if (!data?.metrics?.length) return null;
  const status = data.status || {};

  return (
    <SectionShell className="p-6 md:p-7 lg:p-8" sectionData={data} onInfoOpen={onInfoOpen}>
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

function FeatureSectionCard({ data, onInfoOpen }) {
  if (!data?.items?.length) return null;

  return (
    <SectionShell className="p-6 md:p-7 lg:p-8" sectionData={data} onInfoOpen={onInfoOpen}>
      <p className={`${HOME_SECTION_LABEL} text-gray-400`}>Unlock as you go</p>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3 lg:mt-6 lg:gap-5">
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
            {data.btn_text || 'Say hi'}
          </button>
        </div>
      </div>
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
      case 'checkin_info':
        return <CheckinInfoCard data={sectionData.checkin_info} onInfoOpen={openSectionInfo} />;
      case 'coach':
        return (
          <CoachCard
            data={sectionData.coach}
            onClick={() => goHomeCoachCircle(sectionData.coach)}
            onInfoOpen={openSectionInfo}
          />
        );
      case 'getting_started':
        return (
          <GettingStartedCard
            data={sectionData.getting_started}
            onStepClick={handleGettingStartedStep}
            onInfoOpen={openSectionInfo}
          />
        );
      case 'auto_tracker':
        return <AutoTrackerCard data={sectionData.auto_tracker} onInfoOpen={openSectionInfo} />;
      case 'feature':
        return <FeatureSectionCard data={sectionData.feature} onInfoOpen={openSectionInfo} />;
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

      <SectionInfoModal
        open={isSectionInfoOpen}
        data={infoModalData}
        onClose={closeSectionInfo}
      />
    </div>
  );
}
