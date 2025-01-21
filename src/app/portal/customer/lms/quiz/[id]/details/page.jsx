'use client';
import { PageHeader } from '@/components/common/page';
import CustomerLMSQuizDetails from '@/components/lms/quiz/CustomerLMSQuizDetails';

const Page = () => {
  return (
    <div>
      <PageHeader title="Quiz Details" />
      <CustomerLMSQuizDetails />
    </div>
  );
};

export default Page;
