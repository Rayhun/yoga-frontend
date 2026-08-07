'use client';

import { useRouter } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';
import {
  getCtaClassName,
  getQuickDetailHref,
  getSavedItemCategory,
} from '@/utils/customer-v2-relief';
import { EmptyState, RELIEF_CARD_HOVER, SectionTitle } from './shared';
import { getReliefListGridClass } from './reliefDashboardUi';

export default function SavedTab({ data }) {
  const router = useRouter();
  const items = data?.items || [];

  const handleOpen = item => {
    const category = getSavedItemCategory(item);
    if (category) {
      router.push(getQuickDetailHref(category));
    }
  };

  if (!items.length) {
    return (
      <EmptyState
        icon="🔖"
        title="No saved tools yet"
        description="Bookmark relief protocols from Quick Tools to find them here anytime."
      />
    );
  }

  return (
    <section className="space-y-4 lg:space-y-5">
      <SectionTitle title={data?.title} />
      <div className={getReliefListGridClass(items.length)}>
        {items.map(item => (
          <article
            key={item.id || item.title}
            className={`${RELIEF_CARD_HOVER} group flex cursor-pointer items-center gap-4 p-4 md:p-5 lg:p-6`}
            onClick={() => handleOpen(item)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleOpen(item);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 text-2xl shadow-sm ring-1 ring-primary/10 transition group-hover:scale-105">
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 group-hover:text-primary">{item.title}</h3>
              <p className="mt-0.5 text-sm text-gray-500">{item.subtitle}</p>
            </div>
            <span className={getCtaClassName(item.cta?.style_variant)}>
              {item.cta?.label || 'Open'}
              <FiArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
