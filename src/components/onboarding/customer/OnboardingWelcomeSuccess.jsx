'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import queryKeys from '@/utils/query-keys';
import { clearHomeCoachPending, extractConversationIdFromApiUrl } from '@/utils/onboarding-home-coach';

function renderFooterText(text) {
  if (!text) return null;
  const match = text.match(/^(\d+\s+women)(.*)$/i);
  if (!match) return text;
  return (
    <>
      <span className="font-semibold text-gray-900 dark:text-white">{match[1]}</span>
      <span className="text-gray-600 dark:text-gray-300">{match[2]}</span>
    </>
  );
}

export default function OnboardingWelcomeSuccess({ data, isPublic = false, pageSlug }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const joinedCard =
    data?.sections?.find(section => section.section_id === 'joined_circle_card') ||
    data?.sections?.[0];
  const primaryAction = data?.footer_actions?.primary_button;
  const secondaryAction = data?.footer_actions?.secondary_button;
  const avatars = joinedCard?.member_avatars || {};
  const visibleInitials = avatars.visible_initials || [];
  const overflowCount = avatars.overflow_count || 0;
  const hasMembers = visibleInitials.length > 0 || overflowCount > 0;

  const finishAndNavigate = path => {
    clearHomeCoachPending();
    queryClient.invalidateQueries({ queryKey: [queryKeys.loggedInUser] });
    queryClient.invalidateQueries({ queryKey: [queryKeys.customerV2HomePage] });
    router.push(path);
  };

  const handlePrimary = () => {
    if (isPublic) {
      const signupPath = pageSlug
        ? `/auth/signup?next=${encodeURIComponent(`/onboarding/${pageSlug}`)}`
        : '/auth/signup';
      router.push(signupPath);
      return;
    }
    const conversationId = extractConversationIdFromApiUrl(primaryAction?.url);
    if (conversationId) {
      finishAndNavigate(`/portal/inbox?conversation=${conversationId}`);
      return;
    }
    finishAndNavigate('/portal/inbox');
  };

  const handleSecondary = () => {
    if (isPublic) {
      const loginPath = pageSlug
        ? `/auth/login?next=${encodeURIComponent(`/onboarding/${pageSlug}`)}`
        : '/auth/login';
      router.push(loginPath);
      return;
    }
    finishAndNavigate('/portal');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50/80 via-[#faf9f7] to-white px-4 py-10 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-16 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-24 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl dark:bg-amber-900/10"
      />

      <div className="relative mx-auto w-full max-w-lg">
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900 md:p-10">
          <div className="text-center">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30"
              />
              <span
                aria-hidden
                className="absolute inset-1 rounded-full border border-emerald-200/80 dark:border-emerald-700/50"
              />
              <span className="relative text-4xl leading-none" role="img" aria-label="Celebration">
                {data?.celebration_icon || '🎉'}
              </span>
            </div>

            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
              You&apos;re all set
            </p>
            <h1 className="mt-2 font-serif text-[1.75rem] font-semibold leading-tight text-gray-900 dark:text-white md:text-3xl">
              {data?.header?.title || 'Welcome!'}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Your circle is ready. Step in when you want support, or explore on your own first.
            </p>
          </div>

          {joinedCard ? (
            <div className="mt-8 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 to-white shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-gray-900">
              <div className="border-b border-emerald-100/80 px-5 py-4 dark:border-emerald-900/30">
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                  {joinedCard.eyebrow || "You've joined"}
                </p>
                <h2 className="mt-2 text-center text-lg font-semibold leading-snug text-gray-900 dark:text-white md:text-xl">
                  {joinedCard.title}
                </h2>
              </div>

              <div className="px-5 py-5">
                {hasMembers ? (
                  <div className="flex items-center justify-center">
                    {visibleInitials.map((initials, index) => (
                      <span
                        key={`${initials}-${index}`}
                        className="-ml-2.5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-emerald-700 text-xs font-semibold text-white shadow-sm first:ml-0 dark:border-gray-900"
                      >
                        {initials}
                      </span>
                    ))}
                    {overflowCount > 0 ? (
                      <span className="-ml-2.5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-xs font-semibold text-white shadow-sm dark:border-gray-900">
                        +{overflowCount}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-inner ring-1 ring-emerald-100 dark:bg-gray-800 dark:ring-emerald-900/50">
                    ✨
                  </div>
                )}

                {joinedCard.footer_text ? (
                  <p className="mt-4 text-center text-sm leading-relaxed">
                    {renderFooterText(joinedCard.footer_text)}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-8 space-y-3">
            <Button type="button" fullWidth onClick={handlePrimary} className="!rounded-full !py-3.5">
              {primaryAction?.label || 'Go to community →'}
            </Button>
            {secondaryAction ? (
              <button
                type="button"
                onClick={handleSecondary}
                className="w-full rounded-full px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                {secondaryAction.label || 'Explore the app first'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
