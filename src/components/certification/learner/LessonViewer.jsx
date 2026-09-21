'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaPlayCircle,
  FaFileAlt,
  FaFilePdf,
  FaLink,
  FaCheckCircle,
} from 'react-icons/fa';
import Spinner from '@/components/common/loader/Spinner';
import { toastApiError } from '@/utils/helpers';
import queryKeys from '@/utils/query-keys';
import {
  getLearnerProgramDetail,
  completeCertificationLesson,
} from '@/services/private/certification/catalog';

const LessonViewer = ({ programId, lessonId, moduleId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: response, isFetching } = useQuery({
    queryFn: () => getLearnerProgramDetail({ id: programId }),
    queryKey: [queryKeys.certificationLearnerDetail, programId],
    enabled: !!programId,
    retry: false,
  });

  const program = response?.data;

  const { mutateAsync: markComplete, isPending: isCompleting } = useMutation({
    mutationFn: ({ lId, watchPercent }) =>
      completeCertificationLesson({ programId, lessonId: lId, watchPercent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.certificationLearnerDetail, programId] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.certificationEnrolledCertifications] });
    },
  });

  if (isFetching) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="w-full h-[200px] flex justify-center items-center text-gray-500">
        Program not found.
      </div>
    );
  }

  // Find current lesson and navigate context
  let currentLesson = null;
  let currentModule = null;
  let allLessons = [];

  for (const mod of program.modules || []) {
    for (const lesson of mod.lessons || []) {
      allLessons.push({ lesson, module: mod });
      if (String(lesson.id) === String(lessonId)) {
        currentLesson = lesson;
        currentModule = mod;
      }
    }
  }

  const currentIndex = allLessons.findIndex(
    item => String(item.lesson.id) === String(lessonId)
  );
  const prevItem = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextItem = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (!currentLesson) {
    return (
      <div className="w-full h-[200px] flex justify-center items-center text-gray-500">
        Lesson not found.
      </div>
    );
  }

  const handleMarkComplete = async () => {
    try {
      await markComplete({ lId: currentLesson.id, watchPercent: 100 });
      toast.success('Lesson completed!');
    } catch (error) {
      toastApiError(error);
    }
  };

  const handleNavigate = (item) => {
    if (item) {
      router.push(
        `/portal/customer/certification/${programId}/lesson/${item.lesson.id}?module=${item.module.id}`
      );
    }
  };

  const renderContent = () => {
    switch (currentLesson.lesson_type) {
      case 'video':
        return (
          <div className="w-full">
            {currentLesson.content_url ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900">
                <iframe
                  src={currentLesson.content_url}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={currentLesson.title}
                />
              </div>
            ) : (
              <div className="w-full aspect-video rounded-xl bg-gray-100 flex items-center justify-center">
                <FaPlayCircle className="text-6xl text-gray-300" />
                <p className="ml-3 text-gray-400">Video content will be available soon.</p>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="prose prose-green max-w-none">
            <div className="text-gray-700 whitespace-pre-line leading-relaxed text-base">
              {currentLesson.text_content || 'Text content will be available soon.'}
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full">
            {currentLesson.content_url ? (
              <iframe
                src={currentLesson.content_url}
                className="w-full h-[600px] rounded-xl border border-gray-200"
                title={currentLesson.title}
              />
            ) : (
              <div className="w-full h-[200px] rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                <FaFilePdf className="text-4xl mr-2" /> PDF will be available soon.
              </div>
            )}
          </div>
        );

      case 'link':
        return (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <FaLink className="text-5xl text-gray-300" />
            <p className="text-gray-500">External link</p>
            {currentLesson.content_url && (
              <a
                href={currentLesson.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-6 rounded-xl font-semibold text-sm bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                Open Link
              </a>
            )}
          </div>
        );

      case 'quiz':
        return (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-2xl">?</span>
            </div>
            <p className="text-gray-600 font-medium">Quiz</p>
            <p className="text-gray-400 text-sm text-center max-w-md">
              Quiz content will be available soon. You&apos;ll be able to test your knowledge here.
            </p>
          </div>
        );

      case 'assignment':
        return (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <FaFileAlt className="text-2xl text-orange-500" />
            </div>
            <p className="text-gray-600 font-medium">Assignment</p>
            <p className="text-gray-400 text-sm text-center max-w-md">
              Complete this assignment to demonstrate your understanding.
            </p>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 py-12">
            Content type not supported yet.
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/portal/customer/certification/${programId}`)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FaArrowLeft size={16} />
          <span className="text-sm">Back to Program</span>
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span className="text-gray-600 font-medium">{program.title}</span>
        <span>/</span>
        <span className="text-gray-600">{currentModule?.title}</span>
        <span>/</span>
        <span className="text-green-600">{currentLesson.title}</span>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 capitalize">
              {currentLesson.lesson_type}
            </span>
            {currentLesson.duration && (
              <span className="text-xs text-gray-400">{currentLesson.duration}</span>
            )}
            {currentLesson.is_completed && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <FaCheckCircle size={12} /> Completed
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">{currentLesson.title}</h1>

          {renderContent()}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 p-4 flex items-center justify-between">
          <button
            onClick={() => handleNavigate(prevItem)}
            disabled={!prevItem}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-3">
            {!currentLesson.is_completed && (
              <button
                onClick={handleMarkComplete}
                disabled={isCompleting}
                className="py-2 px-6 rounded-xl font-semibold text-sm bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-60"
              >
                {isCompleting ? 'Saving...' : 'Mark as Complete'}
              </button>
            )}
            {currentLesson.is_completed && (
              <span className="flex items-center gap-2 text-green-600 font-medium text-sm">
                <FaCheckCircle /> Completed
              </span>
            )}
          </div>

          <button
            onClick={() => handleNavigate(nextItem)}
            disabled={!nextItem}
            className="px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {nextItem ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
