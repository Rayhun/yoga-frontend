import ProgramDetailsView from '@/components/certification/details/ProgramDetailsView';

export const metadata = {
  title: 'Program Details — Certification',
};

const Page = ({ params }) => <ProgramDetailsView programId={params.id} mode="learner" />;

export default Page;
