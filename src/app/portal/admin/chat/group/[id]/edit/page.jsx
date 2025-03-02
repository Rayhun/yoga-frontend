'use client';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader } from '@/components/common/page';
import PageLoader from '@/components/common/loader/PageLoader';
import GroupForm from '@/components/chat/group/GroupForm';
import { getSingleGroup } from '@/services/private/chat/group';
import queryKeys from '@/utils/query-keys';

const Page = ({ params }) => {
  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getSingleGroup({ id: params.id }),
    queryKey: [queryKeys.chatGroups, params.id],
  });

  useHandleApiResponse(failureReason);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Edit Group" />
      <GroupForm selected={response?.data} />
    </div>
  );
};

export default Page;
