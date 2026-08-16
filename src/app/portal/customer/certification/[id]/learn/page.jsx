import { Suspense } from 'react';
import LessonPlayer from '@/components/certification/player/LessonPlayer';
import Spinner from '@/components/common/loader/Spinner';

export const metadata = {
  title: 'Learn — Certification',
};

const Page = ({ params }) => (
  <Suspense fallback={<div className="flex justify-center py-16"><Spinner /></div>}>
    <LessonPlayer programId={params.id} />
  </Suspense>
);

export default Page;
