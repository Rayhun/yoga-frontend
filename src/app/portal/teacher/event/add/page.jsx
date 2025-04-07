'use client';
import { PageHeader } from '@/components/common/page';
import EventForm from '@/components/lms/event/EventFrom';
const Page = () => {

  return (
    <div>
      <PageHeader title="Add Event" />
      <EventForm />
    </div>
  );
};

export default Page;