'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import CompleteContentButton from '@/components/lms/common/CompleteContentButton';
import ImageSessionDetails from '@/components/lms/session/image/customer/ImageSessionDetails';
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
    queryKey: [queryKeys.customerImageSessions, sessionID],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  const sessionDetails = response?.data?.data || {};

  return (
    <div>
      <PageHeader title="Image Session Details">
        {sessionDetails.completed ? null : (
          <CompleteContentButton
            payload={{
              content_type: SESSION_TYPE.image,
              content_id: sessionID,
            }}
            onSuccess={refetch}
          >
            Mark As Done
          </CompleteContentButton>
        )}
      </PageHeader>
      <ImageSessionDetails data={sessionDetails} />
    </div>
  );
};

export default Page;
