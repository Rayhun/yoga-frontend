'use client';
import { use } from 'react';
import LessonViewer from '@/components/certification/learner/LessonViewer';

const LessonPage = ({ params, searchParams }) => {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);

  return (
    <LessonViewer
      programId={resolvedParams.id}
      lessonId={resolvedParams.lessonId}
      moduleId={resolvedSearchParams.module}
    />
  );
};

export default LessonPage;
