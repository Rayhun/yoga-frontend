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
import { RELIEF_CARD_HOVER, SectionTitle } from './shared';
import GuidedSessionModal from './GuidedSessionModal';

function ActionCard({ item, index, onStart }) {
  const iconBg = getActionCardIconBackground(index);

  return (
    <article
      className={`${RELIEF_CARD_HOVER} group flex h-full cursor-pointer flex-col p-5 md:p-6`}
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
        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm ring-1 ring-black/5 transition group-hover:scale-105 ${iconBg}`}
      >
        {item.icon}
      </span>
      <h3 className="text-lg font-bold tracking-tight text-gray-900">{item.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">{item.subtitle}</p>
      <span
        className={`${getCtaClassName(item.cta?.style_variant)} mt-5 self-start group-hover:shadow-md`}
      >
        {item.cta?.label || 'Start'}
        <FiArrowRight className="ml-1 inline h-3.5 w-3.5" />
      </span>
    </article>
  );
}

function SuggestionCard({ item, onStart }) {
  return (
    <article
      className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-orange-200/90 bg-gradient-to-r from-white via-orange-50/20 to-amber-50/30 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md md:p-5"
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
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-orange-100 transition group-hover:scale-105">
        {item.icon}
      </span>
      <div className="min-w-0 flex-1">
        {item.badge?.label ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-500">
            {item.badge.label}
          </p>
        ) : null}
        <h3 className="mt-0.5 text-base font-bold text-gray-900">{item.title}</h3>
        <p className="mt-0.5 text-sm text-gray-500">{item.subtitle}</p>
      </div>
      <span className={getCtaClassName(item.cta?.style_variant)}>
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
    <div className="space-y-10">
      {sections.map(section => {
        if (section.layout === 'grid_2x2') {
          return (
            <section key={section.section_id} className="space-y-4">
              <SectionTitle title={section.title} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
                {(section.items || []).map((item, index) => (
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
          return (
            <section key={section.section_id} className="space-y-4">
              <SectionTitle title={section.title} />
              <div className="space-y-3">
                {(section.items || []).map(item => (
                  <SuggestionCard key={item.id || item.title} item={item} onStart={handleStart} />
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
