import ProgramBuilderModal from '@/components/certification/builder/ProgramBuilderModal';

export const metadata = {
  title: 'Program Builder — Certification',
};

const Page = ({ params }) => {
  return (
    // PageHeader (title + Back/Preview actions) is rendered by ProgramBuilderModal, which owns the
    // program data the Preview action needs.
    <ProgramBuilderModal programId={params.id} />
  );
};

export default Page;
