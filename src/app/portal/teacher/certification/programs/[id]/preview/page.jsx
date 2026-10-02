import ProgramDetailsView from '@/components/certification/details/ProgramDetailsView';

export const metadata = {
  title: 'Preview — Certification Program',
};

const Page = ({ params }) => <ProgramDetailsView programId={params.id} mode="preview" />;

export default Page;
