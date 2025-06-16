'use client';
import { useQuery } from '@tanstack/react-query';
import { adminGetGoalsTrackerDetails } from '@/services/private/customer/goal';
import queryKeys from '@/utils/query-keys';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import { useParams } from 'next/navigation';

const Section = ({ children }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div>{children}</div>
  </div>
);

const TrackerDetails = () => {
  const { id } = useParams();

  const { isFetching, data: tracker } = useQuery({
    queryFn: () => adminGetGoalsTrackerDetails(id),
    queryKey: [queryKeys.adminGetGoalsTrackerDetails, id],
  });

  const trackerData = tracker?.data

  if(!isFetching && !trackerData) return <div className='text-center'>No data available</div>

  return (
    <LoadingWrapper isLoading={isFetching}>
      <h1 className='text-2xl font-bold mb-4'>Goal Details</h1>
      <div className='space-y-4'>
        <Section>
          <h1 className='text-lg font-bold mb-2'>Title</h1>
          <div>{trackerData?.title}</div>
        </Section>
        <Section>
          <h1 className='text-lg font-bold mb-2'>Concern</h1>
          <div>{trackerData?.concern}</div>
        </Section>
        <Section>
          <h1 className='text-lg font-bold mb-2'>Tracker</h1>
          <div>{trackerData?.tracker?.title}</div>
        </Section>
      </div>
    </LoadingWrapper>
  );
};

export default TrackerDetails;
