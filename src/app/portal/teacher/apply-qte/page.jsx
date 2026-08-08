import QTEApplyForm from '@/components/certification/apply/QTEApplyForm';

export const metadata = {
  title: 'Apply for QTE — Teacher Portal',
};

const Page = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
        Apply to become a Qualified Teaching Expert
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        QTEs unlock certification-program building and issuance tools.
      </p>
      <QTEApplyForm />
    </div>
  );
};

export default Page;
