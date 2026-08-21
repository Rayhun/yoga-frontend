/** Relief page layout tokens — mobile base; `lg:` / `xl:` enhance laptop/desktop only. */

export const RELIEF_PAGE_SHELL =
  'min-h-full lg:bg-[#f4f1ec] lg:bg-[radial-gradient(ellipse_90%_60%_at_0%_0%,rgba(16,185,129,0.12),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(115,95,162,0.1),transparent_50%),radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(16,185,129,0.05),transparent_60%)]';

export const RELIEF_PAGE_CONTAINER =
  'mx-auto w-full max-w-5xl lg:max-w-[90rem] lg:px-10 xl:px-12';

export const RELIEF_PAGE_PADDING =
  '-mx-4 px-4 py-6 md:-mx-6 md:px-6 md:py-8 lg:mx-0 lg:px-0 lg:py-10 xl:py-12';

/** Content flows on the page — no frosted box that leaves dead space below short content. */
export const RELIEF_CONTENT_PANEL = '';

export const RELIEF_HEADER =
  'relative mb-8 overflow-hidden rounded-3xl border border-stone-200/60 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40 px-6 py-7 shadow-sm md:px-8 md:py-8 lg:mb-8 lg:border-white/70 lg:bg-gradient-to-br lg:from-white lg:via-[#faf8f5] lg:to-emerald-50/40 lg:px-12 lg:py-12 lg:shadow-[0_8px_40px_rgba(16,185,129,0.1)] xl:px-14 xl:py-14';

export const RELIEF_HEADER_LABEL =
  'text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/70 lg:text-xs lg:font-bold lg:tracking-[0.2em]';

export const RELIEF_SECTION_STACK = 'space-y-8 lg:space-y-10';

/** `grid_2x2` sections — always 2 columns on tablet+ (never 3-col orphan row). */
export function getReliefActionGridClass(itemCount = 0) {
  if (itemCount <= 1) {
    return 'grid grid-cols-1 gap-4 lg:gap-6';
  }
  return 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:gap-7';
}

/** List sections — single item spans full width; multiple items use 2 columns on lg+. */
export function getReliefListGridClass(itemCount = 0) {
  if (itemCount <= 1) {
    return 'grid grid-cols-1 gap-3 lg:gap-4';
  }
  return 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4 xl:gap-5';
}

export const RELIEF_ACTION_CARD_MIN =
  'min-h-[11.5rem] sm:min-h-[12.5rem] lg:min-h-[14rem]';

export const RELIEF_CARD =
  'rounded-2xl border border-stone-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.05)] lg:rounded-[1.35rem] lg:border-white/80 lg:bg-white/90 lg:shadow-[0_4px_6px_rgba(15,23,42,0.02),0_24px_60px_rgba(16,185,129,0.08)] lg:backdrop-blur-sm';

export const RELIEF_CARD_HOVER =
  `${RELIEF_CARD} transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] lg:hover:-translate-y-1 lg:hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)]`;

export const RELIEF_SECTION_LABEL =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 lg:text-xs lg:font-bold lg:tracking-[0.18em]';

export const RELIEF_CARD_BTN_ROW = 'mt-auto flex justify-end pt-5 lg:pt-6';

export const RELIEF_DETAIL_CONTAINER = 'mx-auto max-w-3xl lg:max-w-4xl xl:max-w-5xl';
