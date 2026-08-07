'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getReliefTabHref, getReliefTabLabel, getReliefTabSlug } from '@/utils/customer-v2-relief';

export default function ReliefTabNav({ tabs = [], variant = 'default' }) {
  const pathname = usePathname();

  if (!tabs.length) return null;

  const activeSlug = (() => {
    const base = '/portal/customer/relief';
    if (pathname === base) return '';
    if (pathname.startsWith(`${base}/quick/`)) return '';
    if (pathname.startsWith(`${base}/`)) {
      const segment = pathname.slice(base.length + 1).split('/')[0];
      if (['track', 'faq', 'saved'].includes(segment)) return segment;
    }
    return '';
  })();

  const isInline = variant === 'desktop-inline';

  return (
    <nav
      className={`max-w-full gap-1 overflow-x-auto rounded-2xl border border-stone-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        isInline
          ? 'hidden lg:flex lg:w-full lg:justify-stretch lg:gap-1.5 lg:rounded-2xl lg:p-2'
          : 'inline-flex'
      }`}
      aria-label="Relief sections"
    >
      {tabs.map(tab => {
        const slug = getReliefTabSlug(tab.title);
        const href = getReliefTabHref(slug);
        const isActive = slug === activeSlug;

        return (
          <Link
            key={`${tab.title}-${slug}`}
            href={href}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              isInline ? 'lg:flex-1 lg:text-center lg:px-5 lg:py-3 lg:text-[15px]' : ''
            } ${
              isActive
                ? 'bg-primary text-white shadow-sm lg:shadow-md'
                : 'text-gray-600 hover:bg-stone-100 hover:text-gray-900'
            }`}
          >
            {getReliefTabLabel(tab.title)}
          </Link>
        );
      })}
    </nav>
  );
}
