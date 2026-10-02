'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { HiChevronDown } from 'react-icons/hi2';

const KIND_COPY = {
  tag: { one: 'tag', many: 'tags' },
  category: { one: 'category', many: 'categories' },
  language: { one: 'language', many: 'languages' },
  culture: { one: 'culture experience', many: 'culture experiences' },
  coaching_area: { one: 'coaching area', many: 'coaching areas' },
  certification: { one: 'certification', many: 'certifications' },
  selection: { one: 'item', many: 'items' },
};

/**
 * Scroll-capped chip list with overflow detection: fade + helper text so users
 * notice when there are more selected items than fit on screen.
 */
export default function SelectedChipsScrollRegion({ measureKey, selectedCount, kind = 'tag', children }) {
  const scrollRef = useRef(null);
  const [{ overflowY, atBottom }, setState] = useState({ overflowY: false, atBottom: true });

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const overflowY = el.scrollHeight > el.clientHeight + 1;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    setState(prev =>
      prev.overflowY === overflowY && prev.atBottom === atBottom ? prev : { overflowY, atBottom }
    );
  }, []);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener('scroll', update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, [measureKey, update]);

  const words = KIND_COPY[kind] ?? KIND_COPY.tag;
  const manyWord = selectedCount === 1 ? words.one : words.many;
  const showBottomFade = overflowY && !atBottom;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="relative">
        <div
          ref={scrollRef}
          title={showBottomFade ? 'Scroll to see more selected items' : undefined}
          className="max-h-[4.5rem] overflow-y-auto overflow-x-hidden pr-0.5 [scrollbar-width:thin]"
          aria-label={
            showBottomFade
              ? 'Scrollable list of selected items; more are hidden below.'
              : 'List of selected items'
          }
        >
          {children}
        </div>
        {showBottomFade ? (
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-9 rounded-b-lg bg-gradient-to-t from-white from-40% to-transparent dark:from-boxdark"
            aria-hidden
          />
        ) : null}
        {showBottomFade ? (
          <div
            className="pointer-events-none absolute bottom-0.5 left-1/2 flex -translate-x-1/2 items-center text-primary/90"
            aria-hidden
          >
            <HiChevronDown className="h-4 w-4" strokeWidth={2.5} />
          </div>
        ) : null}
      </div>

      {selectedCount > 0 && overflowY ? (
        <p className="m-0 text-xs leading-snug text-gray-600 dark:text-bodydark2">
          {atBottom ? (
            selectedCount === 1 ? (
              <>Your selection is listed in the chip area above.</>
            ) : (
              <>
                You&apos;ve reached the end — all{' '}
                <strong className="font-semibold text-gray-800 dark:text-white">{selectedCount}</strong> {manyWord}{' '}
                are listed in the chip area above.
              </>
            )
          ) : (
            <>
              <strong className="font-semibold text-gray-800 dark:text-white">{selectedCount}</strong> {manyWord}{' '}
              selected in total.{' '}
              <span className="font-medium text-primary">Scroll inside the chip area</span> above to see the rest.
            </>
          )}
        </p>
      ) : null}
    </div>
  );
}
