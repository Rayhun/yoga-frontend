import ProgramBuilderModal from '@/components/certification/builder/ProgramBuilderModal';

export const metadata = {
  title: 'Program Builder — Certification',
};

const Page = ({ params }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Program Builder</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Each section saves automatically as you fill it in — close this page any time and resume later.
      </p>
      <ProgramBuilderModal programId={params.id} />
    </div>
  );
};

export default Page;
