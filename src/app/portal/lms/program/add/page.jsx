import { PageHeader } from '@/components/common/page';
import ProgramForm from '@/components/lms/program/ProgramForm';

export const metadata = {
  title: 'Add New Program',
};

const Page = () => {
  return (
    <div>
      <PageHeader title="Add New Program" />
      <ProgramForm />
    </div>
  );
};

export default Page;
