'use client';

import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getReliefPage } from '@/services/private/customer/v2/relief';
import queryKeys from '@/utils/query-keys';
import ReliefTabNav from './ReliefTabNav';

export default function ReliefLayoutShell({ children }) {
  const pathname = usePathname();
  const isQuickDetail = pathname.includes('/portal/customer/relief/quick/');

  const { data: response, isLoading } = useQuery({
    queryKey: [queryKeys.customerV2ReliefPage],
    queryFn: getReliefPage,
    staleTime: 5 * 60 * 1000,
    enabled: !isQuickDetail,
  });

  const tabs = response?.data?.data || [];

  if (isQuickDetail) {
    return (
      <div className="-mx-4 min-h-full bg-gradient-to-b from-brownish/80 via-brownish/40 to-stone-50/50 px-4 py-6 md:-mx-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-3xl">{children}</div>
      </div>
    );
  }

  return (
    <div className="-mx-4 min-h-full bg-gradient-to-b from-brownish/80 via-brownish/40 to-stone-50/50 px-4 py-6 md:-mx-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="relative mb-8 overflow-hidden rounded-3xl border border-stone-200/60 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40 px-6 py-7 shadow-sm md:px-8 md:py-8">
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-8 left-1/4 h-32 w-32 rounded-full bg-teal-200/20 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/70">
              Your wellness toolkit
            </p>
            <h1 className="mt-1 font-serif text-3xl font-normal tracking-tight text-gray-900 md:text-[2.35rem] md:leading-tight">
              Relief
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600 md:text-[15px]">
              Quick tools, tracking, and answers to help you feel better throughout your cycle.
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="mb-8 flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-stone-200/80" />
            ))}
          </div>
        ) : (
          <div className="mb-8">
            <ReliefTabNav tabs={tabs} />
          </div>
        )}

        <div className="pb-4">{children}</div>
      </div>
    </div>
  );
}
