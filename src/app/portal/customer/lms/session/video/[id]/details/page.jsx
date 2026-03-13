'use client';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/page';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import PageLoader from '@/components/common/loader/PageLoader';
import CompleteContentButton from '@/components/lms/common/CompleteContentButton';
import VideoSessionDetails from '@/components/lms/session/video/customer/VideoSessionDetails';
import { getSingleSession } from '@/services/private/customer/session';
import { SESSION_TYPE } from '@/utils/enums';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const sessionID = params.id;
  const {
    data: response,
    isLoading,
    failureReason,
    refetch,
  } = useQuery({
    queryFn: () => getSingleSession({ id: sessionID }),
    queryKey: [queryKeys.customerVideoSessions, sessionID],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  const sessionDetails = response?.data?.data || {};

  return (
    <div>
      <PageHeader title="Video Session Details">
        {sessionDetails.completed ? null : (
          <CompleteContentButton
            payload={{
              content_type: SESSION_TYPE.video,
              content_id: sessionID,
              duration: sessionDetails.duration,
            }}
            onSuccess={refetch}
          >
            Mark As Done
          </CompleteContentButton>
        )}
      </PageHeader>
      <VideoSessionDetails data={sessionDetails} />
    </div>
  );
};

export default Page;
