'use client';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/page';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import PageLoader from '@/components/common/loader/PageLoader';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { getLearnerLessonDetail, getLearnerProgramDetail } from '@/services/private/certification/catalog';
import queryKeys from '@/utils/query-keys';
import { getLessonMetaLabel } from './lessonTypes';
import LessonPager from './LessonPager';
import LockedLesson from './LockedLesson';
import ModuleOutlinePanel from './ModuleOutlinePanel';
import { CompletedBadge } from './MarkAsDoneButton';
import CertQuizLesson from './lessons/CertQuizLesson';
import ComingSoonLesson from './lessons/ComingSoonLesson';
import LinkLesson from './lessons/LinkLesson';
import PdfLesson from './lessons/PdfLesson';
import TextLesson from './lessons/TextLesson';
import VideoLesson from './lessons/VideoLesson';

const LESSON_BODIES = {
  video: VideoLesson,
  link: LinkLesson,
  pdf: PdfLesson,
  text: TextLesson,
  quiz: CertQuizLesson,
  assignment: ComingSoonLesson,
};

// Where the lesson sits in the program: its module plus previous/next lessons across modules.
const locateLesson = (program, lessonId) => {
  const ordered = (program?.modules || []).flatMap(module =>
    (module.lessons || []).map(lesson => ({ lesson, module }))
  );
  const index = ordered.findIndex(item => String(item.lesson.id) === String(lessonId));
  return {
    module: index >= 0 ? ordered[index].module : null,
    previous: index > 0 ? ordered[index - 1] : null,
    next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null,
  };
};

const isLockError = error => error?.response?.status === 403 && error?.response?.data?.data?.is_locked;

/**
 * One page for every certification lesson type — LMS session page look (header, details card),
 * plus breadcrumbs, the module outline side panel and previous/next navigation. The body is
 * swapped by lesson_type; a locked lesson (server 403 + reason) renders the lock state instead.
 */
const LessonSessionView = ({ lessonId, programId }) => {
  const programQuery = useQuery({
    queryFn: () => getLearnerProgramDetail({ id: programId }),
    queryKey: [queryKeys.certificationLearnerDetail, programId],
    enabled: !!programId,
    retry: false,
  });
  const lessonQuery = useQuery({
    queryFn: () => getLearnerLessonDetail({ programId, lessonId }),
    queryKey: [queryKeys.certificationLearnerLessonDetail, programId, lessonId],
    enabled: !!programId && !!lessonId,
    retry: false,
  });

  const lockError = isLockError(lessonQuery.error) ? lessonQuery.error : null;
  useHandleApiResponse(programQuery.failureReason);
  useHandleApiResponse(lockError ? null : lessonQuery.failureReason);

  if (programQuery.isLoading || lessonQuery.isLoading) return <PageLoader />;

  const program = programQuery.data?.data;
  const lesson = lessonQuery.data?.data;
  const { module, previous, next } = locateLesson(program, lessonId);
  const outlineLesson = module?.lessons?.find(item => String(item.id) === String(lessonId));
  const title = lesson?.title || outlineLesson?.title || 'Lesson';
  const programHref = `/portal/customer/certification/${programId}`;

  const breadcrumbs = [
    { label: 'Certifications', href: '/portal/customer/certification' },
    { label: program?.title || 'Program', href: programHref },
    ...(module ? [{ label: module.title, href: `/portal/customer/certification/module/${module.id}/details?program=${programId}` }] : []),
    { label: title },
  ];

  const renderBody = () => {
    if (lockError) return <LockedLesson reason={lockError.response.data.message} backHref={programHref} />;
    if (!lesson) {
      return <div className="w-full h-[200px] flex justify-center items-center text-gray-500">Lesson not found.</div>;
    }
    const LessonBody = LESSON_BODIES[lesson.lesson_type] || ComingSoonLesson;
    return <LessonBody key={lesson.id} lesson={lesson} programId={programId} />;
  };

  return (
    <div>
      <Breadcrumbs data={breadcrumbs} className="!mb-3" />
      <PageHeader title={title}>{lesson?.is_completed ? <CompletedBadge /> : null}</PageHeader>

      <div className="p-4 bg-white rounded-lg shadow-md text-gray-800 dark:bg-boxdark dark:text-gray-200 flex flex-col md:flex-row gap-6 md:gap-12">
        <div className="w-full md:w-3/4 flex flex-col gap-6">
          {lesson ? <p className="text-sm text-gray-500">{getLessonMetaLabel(lesson)}</p> : null}
          {renderBody()}
          <LessonPager previous={previous} next={next} programId={programId} />
        </div>
        {module ? <ModuleOutlinePanel module={module} programId={programId} currentLessonId={lessonId} /> : null}
      </div>
    </div>
  );
};

export default LessonSessionView;
