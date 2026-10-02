'use client';

import Button from '@/components/common/Button';
import OnboardingJoinFlowLayout from './OnboardingJoinFlowLayout';

function formatEyebrow(template, firstName, fallbackName = 'there') {
  if (!template) return '';
  return template.replace('{first_name}', firstName || fallbackName);
}

export default function OnboardingJoinPaymentStep({
  content,
  firstName,
  onBack,
  onPay,
  isSubmitting = false,
  showStepDots = true,
}) {
  const page = content?.page_2 || {};
  const priceCard = page.price_card || {};
  const benefits = page.benefits || [];
  const trustRow = page.trust_row || [];

  return (
    <OnboardingJoinFlowLayout
      step={2}
      stepLabel={page.progress_label}
      showStepDots={showStepDots}
    >
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="mb-4 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 dark:text-gray-400 dark:hover:text-white"
        >
          ← {page.back_link}
        </button>
      ) : null}

      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-400">
        {formatEyebrow(page.eyebrow_template, firstName, page.eyebrow_fallback_name)}
      </p>
      <h1 className="mt-1.5 font-serif text-xl font-bold leading-tight text-gray-900 dark:text-white md:text-[1.4rem]">
        {page.headline}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {page.subhead}
      </p>

      <ul className="mt-4 space-y-3">
        {benefits.map(benefit => (
          <li key={benefit.title} className="flex gap-2.5">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base dark:bg-gray-800"
              aria-hidden
            >
              {benefit.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{benefit.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {benefit.description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
        <div>
          <p className="text-3xl font-bold leading-none text-emerald-900 dark:text-emerald-300">
            {priceCard.amount}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{priceCard.label}</p>
        </div>
        <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
          {priceCard.badge}
        </span>
      </div>

      <Button
        className="mt-4 w-full !rounded-xl px-5 py-3 text-sm font-semibold"
        size="3xl"
        onClick={onPay}
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? page.button_loading : page.button}
      </Button>

      {trustRow.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          {trustRow.map(item => <span key={item}>{item}</span>)}
        </div>
      ) : null}
    </OnboardingJoinFlowLayout>
  );
}
