'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';
import {
  extractQuickCategoryFromUrl,
  getActionCardIconBackground,
  getCtaClassName,
  getQuickDetailHref,
} from '@/utils/customer-v2-relief';
import {
  getReliefActionGridClass,
  getReliefListGridClass,
  RELIEF_ACTION_CARD_MIN,
  RELIEF_CARD_BTN_ROW,
  RELIEF_SECTION_STACK,
} from './reliefDashboardUi';
import { RELIEF_CARD_HOVER, SectionTitle } from './shared';
import GuidedSessionModal from './GuidedSessionModal';

function ActionCard({ item, index, onStart }) {
  const iconBg = getActionCardIconBackground(index);

  return (
    <article
      className={`${RELIEF_CARD_HOVER} ${RELIEF_ACTION_CARD_MIN} group flex h-full cursor-pointer flex-col p-5 md:p-6 lg:p-7`}
      onClick={() => onStart(item)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onStart(item);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <span
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm ring-1 ring-black/5 transition group-hover:scale-105 lg:mb-5 lg:h-14 lg:w-14 lg:text-[1.75rem] lg:group-hover:scale-110 ${iconBg}`}
      >
        {item.icon}
      </span>
      <h3 className="text-lg font-bold tracking-tight text-gray-900 lg:text-xl">{item.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500 lg:text-[15px]">
        {item.subtitle}
      </p>
      <div className={RELIEF_CARD_BTN_ROW}>
        <span className={`${getCtaClassName(item.cta?.style_variant)} group-hover:shadow-md`}>
          {item.cta?.label || 'Start'}
          <FiArrowRight className="ml-1 inline h-3.5 w-3.5" />
        </span>
      </div>
    </article>
  );
}

function SuggestionCard({ item, onStart, fullWidth = false }) {
  return (
    <article
      className={`group flex cursor-pointer items-center gap-4 rounded-2xl border border-orange-200/90 bg-gradient-to-r from-white via-orange-50/20 to-amber-50/30 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md md:p-5 lg:rounded-[1.35rem] lg:p-6 lg:shadow-[0_4px_20px_rgba(251,146,60,0.08)] lg:hover:-translate-y-1 lg:hover:shadow-[0_8px_28px_rgba(251,146,60,0.12)] ${
        fullWidth ? 'w-full lg:min-h-[5.5rem]' : ''
      }`}
      onClick={() => onStart(item)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onStart(item);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-orange-100 transition group-hover:scale-105 lg:h-16 lg:w-16">
        {item.icon}
      </span>
      <div className="min-w-0 flex-1">
        {item.badge?.label ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-500">
            {item.badge.label}
          </p>
        ) : null}
        <h3 className="mt-0.5 text-base font-bold text-gray-900 lg:text-lg">{item.title}</h3>
        <p className="mt-0.5 text-sm text-gray-500 lg:text-[15px]">{item.subtitle}</p>
      </div>
      <span className={`${getCtaClassName(item.cta?.style_variant)} shrink-0`}>
        {item.cta?.label || 'Try Now'}
      </span>
    </article>
  );
}

export default function QuickToolsTab({ sections = [] }) {
  const router = useRouter();
  const [activeSession, setActiveSession] = useState(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);

  const openSessionModal = item => {
    const { content_type: contentType, content_url: contentUrl } = item.cta || {};
    if (!contentType || !contentUrl) return;

    setActiveSession({
      content_type: contentType,
      link: contentUrl,
      title: item.title,
    });
    setSessionModalOpen(true);
  };

  const handleStart = item => {
    const { content_type: contentType, content_url: contentUrl } = item.cta || {};
    if (contentType && contentUrl) {
      openSessionModal(item);
      return;
    }

    const category = extractQuickCategoryFromUrl(item.cta?.url);
    if (category) {
      router.push(getQuickDetailHref(category));
    }
  };

  return (
    <div className={RELIEF_SECTION_STACK}>
      {sections.map(section => {
        if (section.layout === 'grid_2x2') {
          const items = section.items || [];
          return (
            <section key={section.section_id} className="space-y-4">
              <SectionTitle title={section.title} />
              <div className={getReliefActionGridClass(items.length)}>
                {items.map((item, index) => (
                  <ActionCard
                    key={item.id || item.title}
                    item={item}
                    index={index}
                    onStart={handleStart}
                  />
                ))}
              </div>
            </section>
          );
        }

        if (section.layout === 'vertical_list') {
          const items = section.items || [];
          const isSingle = items.length <= 1;
          return (
            <section key={section.section_id} className="space-y-4">
              <SectionTitle title={section.title} />
              <div className={getReliefListGridClass(items.length)}>
                {items.map(item => (
                  <SuggestionCard
                    key={item.id || item.title}
                    item={item}
                    onStart={handleStart}
                    fullWidth={isSingle}
                  />
                ))}
              </div>
            </section>
          );
        }

        return null;
      })}

      <GuidedSessionModal
        open={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        session={activeSession}
        title={activeSession?.title}
      />
    </div>
  );
}
