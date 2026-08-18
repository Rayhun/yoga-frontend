'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LinearProgress from '@mui/material/LinearProgress';
import { FiLock, FiChevronLeft } from 'react-icons/fi';
import { BiCheckCircle } from 'react-icons/bi';
import { FaPlayCircle, FaFileAlt, FaFilePdf, FaQuestionCircle, FaClipboardList, FaLink } from 'react-icons/fa';
import Spinner from '@/components/common/loader/Spinner';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import { getProgramContent, completeLesson } from '@/services/private/certification/learning';
import PendingReviewBadge from './PendingReviewBadge';
import VideoLesson from './VideoLesson';
import TextPdfLinkLesson from './TextPdfLinkLesson';
import QuizLesson from './QuizLesson';
import AssignmentLesson from './AssignmentLesson';

const LESSON_ICON = {
  video: FaPlayCircle,
  text: FaFileAlt,
  pdf: FaFilePdf,
  quiz: FaQuestionCircle,
  assignment: FaClipboardList,
  link: FaLink,
};

const LESSON_COMPONENT = {
  video: VideoLesson,
  text: TextPdfLinkLesson,
  pdf: TextPdfLinkLesson,
  link: TextPdfLinkLesson,
  quiz: QuizLesson,
  assignment: AssignmentLesson,
};

const lessonStatusIcon = lesson => {
  if (lesson.is_locked) return <FiLock className="text-gray-300" />;
  if (lesson.progress?.completed_at) return <BiCheckCircle className="text-green-600" />;
  if (lesson.progress?.grading_status === 'pending_review') return <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />;
  return <span className="w-2.5 h-2.5 rounded-full border-2 border-gray-300" />;
};

const findFirstSelectableLesson = modules => {
  for (const mod of modules) {
    if (!mod.is_unlocked) continue;
    const incomplete = mod.lessons.find(l => !l.is_locked && !l.progress?.completed_at);
    if (incomplete) return incomplete.id;
    if (mod.lessons.length > 0) return mod.lessons[0].id;
  }
  return null;
};

const LessonPlayer = ({ programId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getProgramContent({ id: programId }),
    queryKey: [queryKeys.certificationProgramContent, programId],
    enabled: !!programId,
    retry: false,
  });

  useHandleApiResponse(failureReason);

  const data = response?.data?.data;
  const modules = useMemo(() => data?.modules || [], [data]);

  useEffect(() => {
    if (selectedLessonId === null && modules.length > 0) {
      setSelectedLessonId(findFirstSelectableLesson(modules));
    }
  }, [modules, selectedLessonId]);

  const { mutateAsync: submitCompletion, isPending: isSubmitting } = useMutation({
    mutationFn: completeLesson,
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.certificationProgramContent, programId]);
      queryClient.invalidateQueries([queryKeys.certificationDashboard]);
    },
  });

  // Stable across re-renders (only changes when the selected lesson actually changes) — this is
  // VideoLesson's onComplete prop, and an unstable reference here was invalidating its debounced
  // watch-percent reporter's useMemo on every render, tearing down and recreating the debounce
  // timer instead of letting it actually debounce.
  const handleComplete = useCallback(
    async payload => {
      try {
        await submitCompletion({ id: selectedLessonId, payload });
      } catch (error) {
        toastApiError(error);
      }
    },
    [selectedLessonId, submitCompletion]
  );

  // isLoading (not isFetching): a progress-report mutation invalidates this query on every
  // debounce tick, which triggers a background refetch — isFetching would go true then too,
  // unmounting the whole tree (including the playing video) every few seconds. isLoading only
  // fires once, before there's any cached data to show.
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!data) {
    const statusCode = failureReason?.response?.status;
    const isNotEnrolled = statusCode === 403;
    const isNotFound = statusCode === 404;

    return (
      <div className="w-full h-[240px] flex flex-col items-center justify-center gap-3 text-center px-5">
        <p className="font-medium text-gray-700">
          {isNotEnrolled
            ? "You're not enrolled in this program yet."
            : isNotFound
              ? "This program doesn't exist or isn't available."
              : "We couldn't load this program right now."}
        </p>
        {isNotEnrolled ? (
          <button
            onClick={() => router.push(`/portal/customer/certification/${programId}`)}
            className="py-2.5 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-colors"
          >
            View program details
          </button>
        ) : (
          <button
            onClick={() => router.push('/portal/customer/certification?tab=my-certifications')}
            className="text-sm font-medium text-green-700 hover:underline"
          >
            Back to My Certifications
          </button>
        )}
      </div>
    );
  }

  const selectedLesson = modules.flatMap(m => m.lessons).find(l => l.id === selectedLessonId);
  const LessonComponent = selectedLesson ? LESSON_COMPONENT[selectedLesson.lesson_type] : null;

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => router.push('/portal/customer/certification?tab=my-certifications')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 w-fit"
      >
        <FiChevronLeft /> Back to My Certifications
      </button>

      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-bold text-gray-900">{data.program.title}</h1>
        <div className="flex items-center gap-3 max-w-md">
          <LinearProgress
            variant="determinate"
            color="secondary"
            className="rounded-full !h-2 flex-1"
            value={Number(data.enrollment.progress_percent) || 0}
          />
          <span className="text-xs text-gray-500 flex-shrink-0">
            {Math.round(Number(data.enrollment.progress_percent) || 0)}% complete
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <aside className="rounded-2xl border border-gray-100 bg-white shadow-lg p-4 flex flex-col gap-4 h-fit">
          {modules.map(mod => (
            <div key={mod.id}>
              <div className="flex items-center gap-2 mb-2">
                {!mod.is_unlocked && <FiLock className="text-gray-300 text-sm" />}
                <h4 className={`text-sm font-semibold ${mod.is_unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                  {mod.title}
                </h4>
              </div>
              <ul className="flex flex-col gap-1">
                {mod.lessons.map(lesson => {
                  const Icon = LESSON_ICON[lesson.lesson_type] || FaFileAlt;
                  const isSelected = lesson.id === selectedLessonId;
                  const isDisabled = lesson.is_locked;
                  return (
                    <li key={lesson.id}>
                      <button
                        disabled={isDisabled}
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm transition-colors ${
                          isSelected ? 'bg-green-50 text-green-800 font-medium' : 'text-gray-600 hover:bg-gray-50'
                        } ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
                      >
                        {lessonStatusIcon(lesson)}
                        <Icon className="text-gray-400 flex-shrink-0" />
                        <span className="flex-1 line-clamp-1">{lesson.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        <section className="rounded-2xl border border-gray-100 bg-white shadow-lg p-6">
          {selectedLesson ? (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedLesson.title}</h2>
                {selectedLesson.duration ? <p className="text-sm text-gray-400 mt-0.5">{selectedLesson.duration}</p> : null}
              </div>
              {LessonComponent ? (
                <LessonComponent lesson={selectedLesson} onComplete={handleComplete} isSubmitting={isSubmitting} />
              ) : (
                <PendingReviewBadge />
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Select a lesson to get started.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LessonPlayer;
