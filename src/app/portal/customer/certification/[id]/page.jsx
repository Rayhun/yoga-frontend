import { Suspense } from 'react';
import ProgramDetailsView from '@/components/certification/details/ProgramDetailsView';
import Spinner from '@/components/common/loader/Spinner';

export const metadata = {
  title: 'Program Details — Certification',
};

const Page = ({ params }) => (
  <Suspense fallback={<div className="flex justify-center py-16"><Spinner /></div>}>
    <ProgramDetailsView programId={params.id} mode="learner" />
  </Suspense>
);

export default Page;
