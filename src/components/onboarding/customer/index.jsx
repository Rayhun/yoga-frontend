'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import { extractApiErrorMessage, toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import {
  getOnboardingV2FirstQuestion,
  submitOnboardingV2Answer,
  getOnboardHomeCoach,
  saveOnboardHomeCoach,
} from '@/services/private/onboarding/quiz-v2';
import {
  getPublicOnboardingFirstQuestion,
  submitPublicOnboardingAnswer,
  getPublicOnboardHomeCoach,
  savePublicOnboardHomeCoach,
  completePublicOnboardingSignup,
} from '@/services/public/onboarding/quiz-v2';
import { getGuestSessionId, setGuestSessionId, clearGuestSessionId } from '@/utils/onboarding-guest-session';
import PublicOnboardingSignupForm from './PublicOnboardingSignupForm';
import Cookies from 'js-cookie';
import HomeCoachOnboardingStep from './HomeCoachOnboardingStep';
import OnboardingWelcomeSuccess from './OnboardingWelcomeSuccess';
import {
  isHomeCoachPending,
  markHomeCoachPending,
  resolveOnboardHomeCoachUrl,
} from '@/utils/onboarding-home-coach';
import { API_V2_WEB_CUSTOMER_BASE_URL } from '@/utils/config';
import useAuthContext from '@/hooks/useAuthContext';

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

const CustomerOnboarding = ({ pageSlug, isPublic = false } = {}) => {
  const { user } = useAuthContext();
  const [guestSessionId, setGuestSessionIdState] = useState(() =>
    isPublic && pageSlug ? getGuestSessionId(pageSlug) : null
  );
  const [bootstrapHydrated, setBootstrapHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flowPhase, setFlowPhase] = useState('quiz');
  const [isCompletingSignup, setIsCompletingSignup] = useState(false);
  const [homeCoachFetchUrl, setHomeCoachFetchUrl] = useState(null);
  const [homeCoachData, setHomeCoachData] = useState(null);
  const [welcomeData, setWelcomeData] = useState(null);
  const [homeCoachProgress, setHomeCoachProgress] = useState({ stepIndex: 0, totalSteps: 0 });
  const [homeCoachQuizSnapshot, setHomeCoachQuizSnapshot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [revealPhase, setRevealPhase] = useState('content');
  const revealTimerRef = useRef(null);
  const questionKeyRef = useRef(null);
  const questionCacheRef = useRef(new Map());
  const chatScrollRef = useRef(null);

  const resumeHomeCoachIfNeeded = useCallback(async () => {
    if (isPublic) return false;
    if (!user?.profile?.on_boarding_quiz) return false;
    if (!isHomeCoachPending()) return false;

    const coachUrl = resolveOnboardHomeCoachUrl(
      `${API_V2_WEB_CUSTOMER_BASE_URL}/onboard/home/coach/`
    );
    setHomeCoachFetchUrl(coachUrl);
    setFlowPhase('home-coach');
    return true;
  }, [user?.profile?.on_boarding_quiz, isPublic]);

  const persistGuestSessionId = useCallback(
    sessionId => {
      if (!isPublic || !pageSlug || !sessionId) return;
      setGuestSessionIdState(sessionId);
      setGuestSessionId(pageSlug, sessionId);
    },
    [isPublic, pageSlug]
  );

  useEffect(() => {
    if (isPublic || !user) return;
    resumeHomeCoachIfNeeded().then(resumed => {
      if (resumed) {
        setBootstrapHydrated(true);
      }
    });
  }, [user, resumeHomeCoachIfNeeded, isPublic]);

  const scrollChatToBottom = useCallback((behavior = 'smooth') => {
    const el = chatScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior });
      });
    });
  }, []);

  const lockOptionsDuringTransition = useCallback(() => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    setRevealPhase('typing');
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

  useLayoutEffect(() => {
    scrollChatToBottom(revealPhase === 'typing' ? 'auto' : 'smooth');
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
    queryKey: [
      queryKeys.onboardingQuizV2,
      'first-question',
      isPublic,
      pageSlug,
    ],
    queryFn: () =>
      isPublic
        ? getPublicOnboardingFirstQuestion({
            slug: pageSlug,
            guestSessionId: getGuestSessionId(pageSlug),
          })
        : getOnboardingV2FirstQuestion(),
    enabled: isPublic ? Boolean(pageSlug) : true,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 1,
  });

  useLayoutEffect(() => {
    if (flowPhase !== 'quiz' || bootstrapHydrated) return;
    if (!firstQuestionResponse) return;

    const data = firstQuestionResponse?.data?.data || {};
    if (data.guest_session_id) {
      persistGuestSessionId(data.guest_session_id);
    }
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
  }, [firstQuestionResponse, bootstrapHydrated, flowPhase, persistGuestSessionId]);

  const {
    data: homeCoachResponse,
    isLoading: isLoadingHomeCoach,
    isError: isHomeCoachError,
    refetch: refetchHomeCoach,
  } = useQuery({
    queryKey: [queryKeys.onboardingHomeCoach, homeCoachFetchUrl, isPublic],
    queryFn: () =>
      isPublic || homeCoachFetchUrl === 'public-home-coach'
        ? getPublicOnboardHomeCoach()
        : getOnboardHomeCoach(homeCoachFetchUrl),
    enabled: flowPhase === 'home-coach' && Boolean(homeCoachFetchUrl) && !homeCoachData,
    staleTime: 0,
  });

  useEffect(() => {
    const payload = homeCoachResponse?.data?.data;
    if (payload) setHomeCoachData(payload);
  }, [homeCoachResponse]);

  const showBootstrapLoader =
    flowPhase === 'quiz' &&
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

  const { mutateAsync: submitAnswer } = useMutation({
    mutationFn: isPublic ? submitPublicOnboardingAnswer : submitOnboardingV2Answer,
  });

  const { mutateAsync: saveHomeCoach, isPending: isSavingHomeCoach } = useMutation({
    mutationFn: ({ submitUrl, expertId, guestSession }) => {
      if (isPublic) {
        return savePublicOnboardHomeCoach({
          guest_session_id: guestSession,
          selected_expert_id: expertId,
        });
      }
      return saveOnboardHomeCoach(submitUrl, { selected_expert_id: expertId });
    },
  });

  const beginHomeCoachStep = useCallback((homeCoachUrl, progressMeta, quizSnapshot) => {
    if (!isPublic) {
      markHomeCoachPending();
    }
    setHomeCoachFetchUrl(
      isPublic ? 'public-home-coach' : resolveOnboardHomeCoachUrl(homeCoachUrl)
    );
    setHomeCoachData(null);
    setHomeCoachProgress({
      stepIndex: Number(progressMeta?.current_question_index) || 0,
      totalSteps: Number(progressMeta?.total_questions) || 0,
    });
    setHomeCoachQuizSnapshot(quizSnapshot || null);
    setFlowPhase('home-coach');
  }, [isPublic]);

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

    const submittedOption = selectedOption;
    const submittedQuestionKey = currentQuestion.question_key;

    try {
      setIsSubmitting(true);
      setSelectedOptionId(null);
      lockOptionsDuringTransition();

      const userBubble = {
        type: 'user',
        optionId: submittedOption.id,
        label: submittedOption.label,
        subText: submittedOption.sub_label || '',
      };

      const response = await submitAnswer({
        payload: {
          question_key: submittedQuestionKey,
          option_id: submittedOption.id,
          ...(isPublic
            ? {
                page_slug: pageSlug,
                guest_session_id: guestSessionId,
              }
            : pageSlug
              ? { page_slug: pageSlug }
              : {}),
        },
      });

      const data = response?.data?.data || {};
      if (data.guest_session_id) {
        persistGuestSessionId(data.guest_session_id);
      }
      if (data.is_home_coach) {
        const quizSnapshot = { messages: [...messages], selectedOptionId: submittedOption.id };
        setMessages(prev => [...prev, userBubble]);
        beginHomeCoachStep(
          isPublic ? 'public-home-coach' : data.home_coach_url,
          data,
          quizSnapshot
        );
        return;
      }

      if (!data.question) {
        const quizSnapshot = { messages: [...messages], selectedOptionId: submittedOption.id };
        setMessages(prev => [...prev, userBubble]);
        beginHomeCoachStep(
          isPublic
            ? 'public-home-coach'
            : `${API_V2_WEB_CUSTOMER_BASE_URL}/onboard/home/coach/`,
          data,
          quizSnapshot
        );
        return;
      }

      const forCache = cloneQuestion(data.question);
      const forMessage = cloneQuestion(data.question);
      questionCacheRef.current.set(forCache.question_key, forCache);
      questionKeyRef.current = null;

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
    } catch (error) {
      questionKeyRef.current = submittedQuestionKey;
      setRevealPhase('content');
      setSelectedOptionId(submittedOption.id);
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

  const canGoBack = flowPhase === 'quiz' && messages.length >= 3 && messages[messages.length - 1]?.type === 'assistant';

  const handleHomeCoachBack = () => {
    if (homeCoachQuizSnapshot) {
      setMessages(homeCoachQuizSnapshot.messages);
      setSelectedOptionId(homeCoachQuizSnapshot.selectedOptionId);
      questionKeyRef.current = null;
    }
    setFlowPhase('quiz');
  };

  const handleHomeCoachSubmit = async expertId => {
    const submitUrl = homeCoachData?.url;
    if (!submitUrl || !expertId) return;

    try {
      const response = await saveHomeCoach({
        submitUrl,
        expertId,
        guestSession: guestSessionId,
      });
      const payload = response?.data?.data;
      if (payload) {
        if (isPublic && payload.requires_signup) {
          setFlowPhase('signup');
          return;
        }
        setWelcomeData(payload);
        setFlowPhase('welcome');
      }
    } catch (error) {
      toastApiError(error);
    }
  };

  const handlePublicSignup = async values => {
    if (!guestSessionId) {
      toastApiError(new Error('Your onboarding session expired. Please refresh and try again.'));
      return;
    }

    try {
      setIsCompletingSignup(true);
      const response = await completePublicOnboardingSignup({
        payload: {
          guest_session_id: guestSessionId,
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
        },
      });

      const data = response?.data?.data || {};
      const token = data.token;
      if (token) {
        Cookies.set('token', token);
      }

      if (pageSlug) {
        clearGuestSessionId(pageSlug);
      }

      const welcomePayload = data.welcome_success_screen;
      if (welcomePayload) {
        setWelcomeData(welcomePayload);
        setFlowPhase('welcome');
      }
    } catch (error) {
      toastApiError(error);
    } finally {
      setIsCompletingSignup(false);
    }
  };

  if (flowPhase === 'signup' && isPublic) {
    return (
      <PublicOnboardingSignupForm onSubmit={handlePublicSignup} isSubmitting={isCompletingSignup} />
    );
  }

  if (flowPhase === 'welcome' && welcomeData) {
    return <OnboardingWelcomeSuccess data={welcomeData} isPublic={false} pageSlug={pageSlug} />;
  }

  if (flowPhase === 'home-coach') {
    if (isLoadingHomeCoach && !homeCoachData) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4 py-8">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600 dark:border-gray-600 dark:border-t-green-400" />
        </div>
      );
    }

    if (isHomeCoachError || !homeCoachData) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4 py-8">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">Could not load coaches</h2>
            <p className="mt-2 text-sm text-gray-600">Please try again to choose your home coach.</p>
            <Button className="mt-6" onClick={() => refetchHomeCoach()}>
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return (
      <HomeCoachOnboardingStep
        data={homeCoachData}
        stepIndex={homeCoachProgress.stepIndex}
        totalSteps={homeCoachProgress.totalSteps}
        canGoBack={Boolean(homeCoachQuizSnapshot)}
        onBack={handleHomeCoachBack}
        isSubmitting={isSavingHomeCoach}
        onSubmit={handleHomeCoachSubmit}
      />
    );
  }

  if (firstQuestionError && !firstQuestionFetching && !bootstrapHydrated) {
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

  if (!currentQuestion) {
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
          className="max-h-[26vh] space-y-1.5 overflow-y-auto scroll-smooth pr-1 sm:max-h-[28vh]"
        >
          {messages.map((item, index) => {
            const isLastMessage = index === messages.length - 1;
            const isCurrentAssistant = item.type === 'assistant' && isLastMessage;

            if (item.type === 'user') {
              return (
                <div key={`user-${index}-${item.optionId}`} className="fade-in-fast flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-green-600 px-3.5 py-2.5 text-white dark:bg-green-500">
                    <p className="text-sm font-medium sm:text-base">{item.label}</p>
                    {item.subText ? <p className="mt-0.5 text-xs opacity-90 sm:text-sm">{item.subText}</p> : null}
                  </div>
                </div>
              );
            }

            if (isCurrentAssistant && revealPhase === 'typing') {
              return (
                <div
                  key={`typing-${item.question.question_key}`}
                  className="flex min-h-[2.75rem] justify-start py-0.5"
                >
                  <TypingIndicator />
                </div>
              );
            }

            if (isCurrentAssistant && revealPhase === 'content') {
              const q =
                questionCacheRef.current.get(item.question.question_key) || item.question;
              return (
                <div key={`asst-${item.question.question_key}`} className="question-reveal flex justify-start">
                  <div className="max-w-[85%] rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                    <p className="text-sm font-medium sm:text-base">{q.variant.question_text}</p>
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
            revealPhase === 'typing' || isSubmitting
              ? 'pointer-events-none opacity-0'
              : 'opacity-100'
          }`}
        >
          {currentQuestion?.variant?.sub_text ? (
            <div className="fade-in-fast mb-3 flex justify-start">
              <div className="max-w-[85%] rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
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
                disabled={revealPhase === 'typing' || isSubmitting}
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

        <div className={`mt-6 flex items-center gap-3 ${canGoBack ? 'justify-between' : 'justify-end'}`}>
          {canGoBack ? (
            <Button type="button" variant="secondary" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          ) : null}
          <Button
            onClick={handleContinue}
            disabled={!selectedOptionId || isSubmitting || revealPhase === 'typing'}
            isLoading={isSubmitting}
          >
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
