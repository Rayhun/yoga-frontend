'use client';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Button from '@/components/common/Button';
import { extractApiErrorMessage, toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import {
  getOnboardingV2FirstQuestion,
  submitOnboardingV2Answer,
} from '@/services/private/onboarding/quiz-v2';

const DONUT_R = 52;
const DONUT_C = 2 * Math.PI * DONUT_R;

function cloneQuestion(question) {
  try {
    return structuredClone(question);
  } catch {
    return JSON.parse(JSON.stringify(question));
  }
}

/** Cycles: Typing. → Typing.. → Typing... → repeat (same rhythm as chat apps). */
function TypingIndicator() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep(s => (s + 1) % 3);
    }, 450);
    return () => clearInterval(id);
  }, []);

  const suffix = step === 0 ? '.' : step === 1 ? '..' : '...';

  return (
    <div className="flex justify-start py-1">
      <div className="typing-pill inline-flex min-w-[5.75rem] items-center rounded-full bg-gray-200 px-3.5 py-2 shadow-sm dark:bg-gray-600">
        <span
          key={step}
          className="typing-cycle-text text-sm font-medium tracking-tight text-gray-700 dark:text-gray-100"
        >
          Typing{suffix}
        </span>
      </div>
    </div>
  );
}

function OnboardingCompleteScreen({ progress }) {
  const pct = Math.min(100, Math.round(progress));
  const dash = (pct / 100) * DONUT_C;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-gradient-to-br from-[#f7f5f2] via-[#fbfaf8] to-[#eef6f2] px-4 py-10">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-2xl dark:border-stone-200 dark:bg-white">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-green-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-teal-400/15 blur-3xl" />

        <div className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <linearGradient id="onboardingSubmitDonut" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r={DONUT_R} fill="none" stroke="currentColor" strokeWidth="9" className="text-emerald-100 dark:text-emerald-100" />
            <circle
              cx="60"
              cy="60"
              r={DONUT_R}
              fill="none"
              stroke="url(#onboardingSubmitDonut)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${DONUT_C}`}
              className="transition-[stroke-dasharray] duration-75 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-gray-900">{pct}%</span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">
              {pct >= 100 ? 'Complete' : 'Submitting'}
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-900">{pct >= 100 ? "You're all set!" : 'Wrapping up'}</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-600">
          {pct >= 100
            ? 'Thanks for sharing. Redirecting to your home...'
            : 'Saving your onboarding answers and preparing your experience...'}
        </p>
      </div>
    </div>
  );
}

const CustomerOnboarding = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [bootstrapHydrated, setBootstrapHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [messages, setMessages] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [revealPhase, setRevealPhase] = useState('content');
  const revealTimerRef = useRef(null);
  const questionKeyRef = useRef(null);
  const questionCacheRef = useRef(new Map());
  const chatScrollRef = useRef(null);
  const completionRafRef = useRef(0);
  const completionRedirectRef = useRef(0);

  const scrollChatToBottom = useCallback((behavior = 'smooth') => {
    const el = chatScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior });
    });
  }, []);

  const currentAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].type === 'assistant') return messages[i];
    }
    return null;
  }, [messages]);

  const currentQuestion = useMemo(() => {
    const q = currentAssistant?.question;
    if (!q?.question_key) return null;
    return questionCacheRef.current.get(q.question_key) || q;
  }, [currentAssistant]);

  useEffect(() => {
    scrollChatToBottom();
  }, [messages, revealPhase, isSubmitting, currentQuestion?.question_key, scrollChatToBottom]);

  const startRevealForQuestionKey = useCallback(questionKey => {
    if (!questionKey) {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
      questionKeyRef.current = null;
      setRevealPhase('content');
      return;
    }
    // Same key: keep existing timer/phase (prevents useEffect from wiping timer after Back).
    if (questionKeyRef.current === questionKey) {
      return;
    }
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    questionKeyRef.current = questionKey;
    setRevealPhase('typing');
    revealTimerRef.current = setTimeout(() => {
      setRevealPhase('content');
      revealTimerRef.current = null;
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const key = currentQuestion?.question_key;
    if (key) startRevealForQuestionKey(key);
  }, [currentQuestion?.question_key, startRevealForQuestionKey]);

  const hydrateMessagesFromCache = useCallback(msgs => {
    return msgs.map(m => {
      if (m.type !== 'assistant') return m;
      const key = m.question?.question_key;
      const cached = key ? questionCacheRef.current.get(key) : null;
      return {
        ...m,
        question: cached ? cloneQuestion(cached) : cloneQuestion(m.question),
      };
    });
  }, []);

  const {
    data: firstQuestionResponse,
    isPending: firstQuestionPending,
    isFetching: firstQuestionFetching,
    isError: firstQuestionError,
    error: firstQuestionErrorDetail,
    refetch: refetchFirstQuestion,
  } = useQuery({
    queryKey: [queryKeys.onboardingQuizV2, 'first-question'],
    queryFn: getOnboardingV2FirstQuestion,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 1,
  });

  useLayoutEffect(() => {
    if (showCompletion || bootstrapHydrated) return;
    if (!firstQuestionResponse) return;

    const data = firstQuestionResponse?.data?.data || {};
    const question = data.question;
    questionKeyRef.current = null;
    if (question) {
      const forCache = cloneQuestion(question);
      const forMessage = cloneQuestion(question);
      questionCacheRef.current.set(forCache.question_key, forCache);
      const totalQuestions = Number(data.total_questions) || 0;
      const questionIndex = Number(data.current_question_index) || 1;
      setMessages([
        {
          type: 'assistant',
          question: forMessage,
          isLast: Boolean(data.is_last),
          totalQuestions,
          questionIndex,
        },
      ]);
      setSelectedOptionId(null);
    } else {
      setMessages([]);
    }
    setBootstrapHydrated(true);
  }, [firstQuestionResponse, bootstrapHydrated, showCompletion]);

  const showBootstrapLoader =
    !showCompletion &&
    !bootstrapHydrated &&
    (!firstQuestionError || firstQuestionFetching) &&
    (firstQuestionPending || firstQuestionFetching || Boolean(firstQuestionResponse));

  const retryBootstrap = useCallback(async () => {
    setBootstrapHydrated(false);
    setMessages([]);
    questionCacheRef.current = new Map();
    questionKeyRef.current = null;
    await refetchFirstQuestion();
  }, [refetchFirstQuestion]);

  useEffect(() => {
    if (!showCompletion) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCompletion]);

  useEffect(() => {
    if (!showCompletion) return undefined;

    setCompletionProgress(0);
    const durationMs = 3200;
    const start = performance.now();
    let cancelled = false;
    const easeOutCubic = t => 1 - (1 - t) ** 3;

    const tick = now => {
      if (cancelled) return;
      const raw = Math.min(1, (now - start) / durationMs);
      setCompletionProgress(easeOutCubic(raw) * 100);
      if (raw < 1) {
        completionRafRef.current = requestAnimationFrame(tick);
      } else {
        setCompletionProgress(100);
        toast.success('🎉 Welcome! Your onboarding is complete');
        completionRedirectRef.current = window.setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: [queryKeys.loggedInUser] });
          router.push('/portal');
        }, 1100);
      }
    };

    completionRafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(completionRafRef.current);
      if (completionRedirectRef.current) {
        window.clearTimeout(completionRedirectRef.current);
        completionRedirectRef.current = 0;
      }
    };
  }, [showCompletion, queryClient, router]);

  const { mutateAsync: submitAnswer } = useMutation({
    mutationFn: submitOnboardingV2Answer,
  });

  const selectedOption = useMemo(
    () => currentQuestion?.variant?.options?.find(option => option.id === selectedOptionId) || null,
    [currentQuestion, selectedOptionId]
  );

  const progressPercent = useMemo(() => {
    const total = Number(currentAssistant?.totalQuestions) || 0;
    const idx = Number(currentAssistant?.questionIndex) || 0;
    if (total <= 0 || idx <= 0) return 0;
    return Math.min(100, (idx / total) * 100);
  }, [currentAssistant?.totalQuestions, currentAssistant?.questionIndex]);

  const handleContinue = async () => {
    if (!currentQuestion || !selectedOption) return;

    try {
      setIsSubmitting(true);
      const userBubble = {
        type: 'user',
        optionId: selectedOption.id,
        label: selectedOption.label,
        subText: selectedOption.sub_label || '',
      };

      const response = await submitAnswer({
        payload: {
          question_key: currentQuestion.question_key,
          option_id: selectedOption.id,
        },
      });

      const data = response?.data?.data || {};
      if (!data.question) {
        setMessages(prev => [...prev, userBubble]);
        setShowCompletion(true);
        return;
      }

      const forCache = cloneQuestion(data.question);
      const forMessage = cloneQuestion(data.question);
      questionCacheRef.current.set(forCache.question_key, forCache);

      const totalQuestions = Number(data.total_questions) || 0;
      const questionIndex = Number(data.current_question_index) || 1;
      const nextAssistant = {
        type: 'assistant',
        question: forMessage,
        isLast: Boolean(data.is_last),
        totalQuestions,
        questionIndex,
      };

      setMessages(prev => [...prev, userBubble, nextAssistant]);
      setSelectedOptionId(null);
    } catch (error) {
      toastApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (messages.length < 3) return;
    const last = messages[messages.length - 1];
    if (last.type !== 'assistant') return;

    const withoutCurrentAssistant = messages.slice(0, -1);
    const lastUser = withoutCurrentAssistant[withoutCurrentAssistant.length - 1];
    if (!lastUser || lastUser.type !== 'user') return;

    const priorMessages = withoutCurrentAssistant.slice(0, -1);
    const restored = hydrateMessagesFromCache(priorMessages);

    setMessages(restored);
    setSelectedOptionId(lastUser.optionId);
    questionKeyRef.current = null;
  };

  const canGoBack = messages.length >= 3 && messages[messages.length - 1]?.type === 'assistant';

  if (!showCompletion && firstQuestionError && !firstQuestionFetching && !bootstrapHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center dark:border-red-900/50 dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Could not load onboarding</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{extractApiErrorMessage(firstQuestionErrorDetail)}</p>
          <Button className="mt-6" onClick={() => retryBootstrap()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (showBootstrapLoader) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600 dark:border-gray-600 dark:border-t-green-400" />
      </div>
    );
  }

  if (!currentQuestion && !showCompletion) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">No onboarding questions found</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Please try again in a moment.</p>
          <Button className="mt-6" onClick={() => retryBootstrap()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (showCompletion) {
    return <OnboardingCompleteScreen progress={completionProgress} />;
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900 md:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-green-700 dark:bg-green-900/40 dark:text-green-300">
            <span>{currentQuestion.tag_emoji || '✨'}</span>
            <span>{currentQuestion.tag_text || 'About you'}</span>
          </div>
          {currentAssistant?.totalQuestions > 0 ? (
            <p className="shrink-0 text-sm font-medium tabular-nums text-gray-600 dark:text-gray-300">
              ({currentAssistant.questionIndex}/{currentAssistant.totalQuestions})
            </p>
          ) : null}
        </div>

        <div className="mb-5 h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="h-1 rounded-full bg-green-500 dark:bg-green-400" style={{ width: `${progressPercent}%` }} />
        </div>

        <div
          ref={chatScrollRef}
          className="max-h-[45vh] space-y-2 overflow-y-auto scroll-smooth pr-1"
        >
          {messages.map((item, index) => {
            const isLastMessage = index === messages.length - 1;
            const isCurrentAssistant = item.type === 'assistant' && isLastMessage;

            if (item.type === 'user') {
              return (
                <div key={`user-${index}-${item.optionId}`} className="fade-in-fast flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-green-600 px-4 py-3 text-white dark:bg-green-500">
                    <p className="text-base font-medium">{item.label}</p>
                    {item.subText ? <p className="mt-1 text-sm opacity-90">{item.subText}</p> : null}
                  </div>
                </div>
              );
            }

            if (isCurrentAssistant && revealPhase === 'typing') {
              return <TypingIndicator key={`typing-${item.question.question_key}`} />;
            }

            if (isCurrentAssistant && revealPhase === 'content') {
              const q =
                questionCacheRef.current.get(item.question.question_key) || item.question;
              return (
                <div key={`asst-${item.question.question_key}`} className="question-reveal flex justify-start">
                  <div className="max-w-[85%] rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                    <p className="text-base font-medium">{q.variant.question_text}</p>
                  </div>
                </div>
              );
            }

            const q = questionCacheRef.current.get(item.question.question_key) || item.question;
            return (
              <div key={`asst-${index}-${item.question.question_key}`} className="fade-in-fast flex justify-start">
                <div className="max-w-[85%] rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                  <p className="text-base font-medium">{q.variant.question_text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className={`mt-3 transition-opacity duration-500 ease-out ${
            revealPhase === 'typing' ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          {currentQuestion?.variant?.sub_text ? (
            <div className="fade-in-fast mb-3 flex justify-start">
              <div className="max-w-[85%] rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {currentQuestion.variant.sub_text}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {currentQuestion.variant.options?.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOptionId(option.id)}
                disabled={revealPhase === 'typing'}
                className={`fade-in-fast rounded-2xl border px-4 py-3 text-left transition-all ${
                  selectedOptionId === option.id
                    ? 'border-green-500 bg-green-50 text-gray-900 dark:border-green-400 dark:bg-green-900/20 dark:text-white'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-green-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg dark:bg-gray-800">
                    {option.emoji || '•'}
                  </div>
                  <div>
                    <p className="font-semibold">{option.label}</p>
                    {option.sub_label ? (
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-300">{option.sub_label}</p>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button type="button" variant="secondary" onClick={handleBack} disabled={!canGoBack || isSubmitting}>
            Back
          </Button>
          <Button onClick={handleContinue} disabled={!selectedOptionId || isSubmitting} isLoading={isSubmitting}>
            Continue
          </Button>
        </div>
      </div>

      <style jsx>{`
        .fade-in-fast {
          animation: quickFade 0.5s ease forwards;
        }
        .question-reveal {
          animation: quickFade 0.5s ease forwards;
        }
        @keyframes quickFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .typing-pill {
          will-change: opacity;
        }
        .typing-cycle-text {
          display: inline-block;
          animation: typingStepFade 0.22s ease-out both;
        }
        @keyframes typingStepFade {
          from {
            opacity: 0.35;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerOnboarding;
