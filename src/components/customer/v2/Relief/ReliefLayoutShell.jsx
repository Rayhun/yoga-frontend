'use client';

import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getReliefPage } from '@/services/private/customer/v2/relief';
import queryKeys from '@/utils/query-keys';
import ReliefTabNav from './ReliefTabNav';
import {
  RELIEF_DETAIL_CONTAINER,
  RELIEF_HEADER,
  RELIEF_HEADER_LABEL,
  RELIEF_PAGE_CONTAINER,
  RELIEF_PAGE_PADDING,
  RELIEF_PAGE_SHELL,
} from './reliefDashboardUi';

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
      <div
        className={`${RELIEF_PAGE_SHELL} ${RELIEF_PAGE_PADDING} bg-gradient-to-b from-brownish/80 via-brownish/40 to-stone-50/50 lg:bg-none`}
      >
        <div className={RELIEF_DETAIL_CONTAINER}>{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`${RELIEF_PAGE_SHELL} ${RELIEF_PAGE_PADDING} bg-gradient-to-b from-brownish/80 via-brownish/40 to-stone-50/50 lg:bg-none`}
    >
      <div className={RELIEF_PAGE_CONTAINER}>
        <header className={RELIEF_HEADER}>
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl lg:-right-24 lg:-top-24 lg:h-72 lg:w-72 lg:bg-emerald-400/15"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-8 left-1/4 h-32 w-32 rounded-full bg-teal-200/20 blur-3xl lg:h-56 lg:w-56"
            aria-hidden
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="max-w-2xl lg:max-w-3xl">
              <p className={RELIEF_HEADER_LABEL}>Your wellness toolkit</p>
              <h1 className="mt-1 font-serif text-3xl font-normal tracking-tight text-gray-900 md:text-[2.35rem] md:leading-tight lg:text-4xl lg:leading-[1.15] xl:text-[2.75rem]">
                Relief
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600 md:text-[15px] lg:mt-3 lg:text-base lg:leading-relaxed">
                Quick tools, tracking, and answers to help you feel better throughout your cycle.
              </p>
            </div>

            {!isLoading && tabs.length ? (
              <div className="shrink-0 lg:min-w-[min(100%,28rem)]">
                <ReliefTabNav tabs={tabs} variant="desktop-inline" />
              </div>
            ) : null}
          </div>
        </header>

        {isLoading ? (
          <div className="mb-8 flex gap-2 lg:hidden">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-stone-200/80" />
            ))}
          </div>
        ) : (
          <div className="mb-8 lg:hidden">
            <ReliefTabNav tabs={tabs} />
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}
