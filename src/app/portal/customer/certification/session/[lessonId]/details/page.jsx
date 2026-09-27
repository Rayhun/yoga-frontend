'use client';
import { useSearchParams } from 'next/navigation';
import LessonSessionView from '@/components/certification/session/LessonSessionView';

const Page = ({ params }) => {
  const searchParams = useSearchParams();
  return <LessonSessionView lessonId={params.lessonId} programId={searchParams.get('program')} />;
};

export default Page;
