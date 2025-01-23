'use client';
import { PageHeader } from '@/components/common/page';
import LMSQuizDetails from '@/components/lms/quiz/customer/LMSQuizDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Quiz Details" />
      <LMSQuizDetails />
    </div>
  );
};

export default Page;
