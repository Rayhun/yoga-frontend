'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiChevronRight, FiSearch } from 'react-icons/fi';
import Spinner from '@/components/common/loader/Spinner';
import { getReliefFaq } from '@/services/private/customer/v2/relief';
import queryKeys from '@/utils/query-keys';
import { EmptyState, RELIEF_CARD, RELIEF_SECTION_LABEL } from './shared';

function FaqQuestionCard({ question, categoryLabel, onToggle, isOpen }) {
  if (isOpen && question.answer_data) {
    return (
      <article className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-emerald-800 to-teal-900 shadow-lg ring-1 ring-primary/20">
        <div className="p-5 md:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
            {question.answer_data.title_label || 'ANSWER'}
          </p>
          <div
            className="prose prose-invert prose-sm mt-4 max-w-none text-sm leading-relaxed text-white/95 [&_strong]:font-bold [&_strong]:text-white"
            dangerouslySetInnerHTML={{ __html: question.answer_data.body_html }}
          />
          {question.answer_data.tags?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {question.answer_data.tags.map(tag => (
                <span
                  key={tag}
                  className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => onToggle(null)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
          >
            {question.answer_data.footer_button?.label || '↩ Back to question'}
          </button>
        </div>
      </article>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onToggle(question.id)}
      className={`${RELIEF_CARD} group w-full p-4 text-left transition hover:border-primary/20 hover:shadow-md md:p-5`}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 text-lg ring-1 ring-orange-100">
          {question.icon || '❓'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-orange-500">
            {categoryLabel}
          </p>
          <p className="mt-1 font-semibold leading-snug text-gray-900 group-hover:text-primary">
            {question.question_text}
          </p>
          {question.action_text ? (
            <p className="mt-2 text-sm text-gray-400">{question.action_text}</p>
          ) : null}
        </div>
        <FiChevronRight className="mt-1 h-5 w-5 shrink-0 text-gray-300 transition group-hover:text-primary" />
      </div>
    </button>
  );
}

export default function FAQTab() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [openQuestionId, setOpenQuestionId] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: [queryKeys.customerV2ReliefFaq, debouncedSearch, activeFilter],
    queryFn: () =>
      getReliefFaq({
        search: debouncedSearch || undefined,
        filter: activeFilter,
      }),
  });

  const payload = response?.data?.data;
  const filterTabs = payload?.filter_tabs?.tabs || [];
  const categories = payload?.data || [];
  const serverActiveTab = payload?.filter_tabs?.active_tab_id || 'all';

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon="❓"
        title="Couldn't load FAQs"
        description="Please refresh the page and try again."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${RELIEF_CARD} relative overflow-hidden`}>
        <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder={payload?.search_bar?.placeholder || 'Search questions...'}
          className="w-full bg-transparent py-4 pl-12 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filterTabs.map(tab => {
          const isActive = (activeFilter || serverActiveTab) === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveFilter(tab.id);
                setOpenQuestionId(null);
              }}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-stone-200 bg-white text-gray-600 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-8">
        {categories.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No questions found"
            description="Try a different search term or filter."
          />
        ) : (
          categories.map(category => (
            <section key={category.category_id} className="space-y-3">
              <h2
                className={`flex items-center gap-2 ${RELIEF_SECTION_LABEL}`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-sm">
                  {category.icon}
                </span>
                {category.title}
              </h2>
              <div className="space-y-3">
                {(category.questions || []).map(question => (
                  <FaqQuestionCard
                    key={question.id}
                    question={question}
                    categoryLabel={question.category_label || category.title}
                    isOpen={openQuestionId === question.id}
                    onToggle={setOpenQuestionId}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
