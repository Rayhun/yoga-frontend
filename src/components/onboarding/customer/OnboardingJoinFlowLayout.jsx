'use client';

export default function OnboardingJoinFlowLayout({
  step,
  stepLabel,
  children,
  showStepDots = true,
}) {
  const stepOneActive = step >= 1;
  const stepTwoActive = step >= 2;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-lg">
        {showStepDots ? (
          <div className="mb-4 flex items-center justify-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                stepOneActive ? 'bg-emerald-800' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            />
            <span
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                stepTwoActive ? 'bg-emerald-800' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            />
          </div>
        ) : null}
        {stepLabel ? (
          <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
            {stepLabel}
          </p>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-lime-400 to-amber-400" />
          <div className="p-6 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
