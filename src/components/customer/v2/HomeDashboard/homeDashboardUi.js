/** Shared layout + surface styles. Mobile-first; `lg:` / `xl:` enhance desktop only. */

export const HOME_CARD =
  'rounded-2xl border border-stone-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.05)] lg:rounded-3xl lg:border-stone-200/80 lg:shadow-[0_2px_12px_rgba(15,23,42,0.05),0_20px_50px_rgba(15,23,42,0.07)]';

export const HOME_CARD_INTERACTIVE =
  `${HOME_CARD} transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] lg:hover:-translate-y-1 lg:hover:shadow-[0_8px_32px_rgba(15,23,42,0.1)]`;

export const HOME_BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 hover:shadow-md lg:px-6 lg:py-3 lg:text-[15px] lg:shadow-md lg:hover:shadow-lg';

export const HOME_BTN_OUTLINE =
  'inline-flex items-center justify-center rounded-full border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5 lg:px-5 lg:py-2.5';

export const HOME_PAGE_SHELL =
  'min-h-full w-full lg:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(115,95,162,0.08),transparent_50%)]';

export const HOME_PAGE_CONTAINER =
  'mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 xl:max-w-[88rem] xl:px-10 xl:py-12';

export const HOME_PAGE_STACK = 'flex flex-col gap-6 lg:gap-8 xl:gap-10';

export const HOME_SECTION_GRID =
  'grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:gap-8 xl:gap-10';

export const HOME_HEADER =
  'relative overflow-hidden rounded-3xl border border-stone-200/60 bg-gradient-to-br from-white via-brownish to-amber-50/40 px-6 py-7 shadow-sm md:px-8 md:py-8 lg:border-stone-200/50 lg:px-10 lg:py-10 lg:shadow-[0_4px_24px_rgba(15,23,42,0.06)] xl:px-12 xl:py-11';

export const HOME_SECTION_LABEL =
  'text-[11px] font-semibold uppercase tracking-[0.14em] lg:text-xs lg:tracking-[0.16em]';

/** Pin card CTAs to the bottom-right (use inside flex-col card shells). */
export const HOME_CARD_BTN_ROW = 'mt-auto flex justify-end pt-5 lg:pt-6';
