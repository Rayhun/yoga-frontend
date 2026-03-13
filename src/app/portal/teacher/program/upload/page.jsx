'use client';
import { PageHeader } from '@/components/common/page';
import UploadProgramsFile from '@/components/expert/uploadProgramForm';

const Page = () => {
  return (
    <div>
      <PageHeader title="Design a wellness journey they'll love!" />
      <UploadProgramsFile />
    </div>
  );
};

export default Page;
