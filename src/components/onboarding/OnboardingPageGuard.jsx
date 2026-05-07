'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthContext from '@/hooks/useAuthContext';
import PageLoader from '@/components/common/loader/PageLoader';
import Button from '@/components/common/Button';

const DONUT_R = 52;
const DONUT_C = 2 * Math.PI * DONUT_R;

function DonutProgress({ progress }) {
  const dash = (progress / 100) * DONUT_C;
  const pct = Math.min(100, Math.round(progress));
  const done = pct >= 100;

  return (
    <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center">
      <svg className="h-full w-full -rotate-90 drop-shadow-sm" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="onboardingGuardDonut" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={DONUT_R} fill="none" stroke="currentColor" strokeWidth="9" className="text-emerald-100 dark:text-gray-700" />
        <circle
          cx="60"
          cy="60"
          r={DONUT_R}
          fill="none"
          stroke="url(#onboardingGuardDonut)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${DONUT_C}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {done ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <>
            <span className="text-3xl font-bold tabular-nums tracking-tight text-stone-800 dark:text-white">{pct}%</span>
            <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Ready
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function OnboardingAlreadyCompleteView() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(0);
  const redirectRef = useRef(0);

  const goHome = () => {
    cancelAnimationFrame(rafRef.current);
    if (redirectRef.current) window.clearTimeout(redirectRef.current);
    redirectRef.current = 0;
    router.push('/portal');
  };

  useEffect(() => {
    const durationMs = 2200;
    const start = performance.now();
    let cancelled = false;
    const easeOutCubic = t => 1 - (1 - t) ** 3;

    const tick = now => {
      if (cancelled) return;
      const raw = Math.min(1, (now - start) / durationMs);
      setProgress(easeOutCubic(raw) * 100);
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        redirectRef.current = window.setTimeout(() => {
          router.push('/portal');
        }, 800);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      if (redirectRef.current) window.clearTimeout(redirectRef.current);
    };
  }, [router]);

  const pct = Math.min(100, Math.round(progress));

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center bg-[#f7f5f2] px-4 py-12 dark:from-gray-950 dark:to-gray-900 dark:bg-gradient-to-b">
      <div className="w-full max-w-md rounded-2xl border border-stone-200/80 bg-white p-10 text-center shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] dark:border-gray-700 dark:bg-gray-800">
        <DonutProgress progress={progress} />

        <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">Onboarding complete!</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-stone-600 dark:text-gray-300">
          You&apos;ve already finished the onboarding quiz. We&apos;re opening your home — hang tight for a moment.
        </p>

        <div className="mx-auto mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-stone-100 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-600 to-teal-600 transition-[width] duration-100 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-stone-500 dark:text-gray-400">
          {pct >= 100 ? 'Redirecting…' : 'Preparing your space…'}
        </p>

        <Button onClick={goHome} className="mt-8 w-full">
          Go to home now
        </Button>
      </div>
    </div>
  );
}

const OnboardingPageGuard = ({ children }) => {
  const router = useRouter();
  const { user } = useAuthContext();

  // If user is admin, redirect to portal
  if (user?.isAdmin) {
    router.push('/portal');
    return <PageLoader />;
  }

  // If user is customer and has completed onboarding, show completion + progress + redirect
  if (user?.isCustomer && user?.profile?.on_boarding_quiz === true) {
    return <OnboardingAlreadyCompleteView />;
  }

  // If user is customer and hasn't completed onboarding (false, null, or undefined), show the onboarding quiz
  if (user?.isCustomer && user?.profile?.on_boarding_quiz !== true) {
    return children;
  }

  // Default case - show loading
  return <PageLoader />;
};

export default OnboardingPageGuard;
