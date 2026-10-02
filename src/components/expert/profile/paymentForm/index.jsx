'use client';
import { useQuery } from '@tanstack/react-query';
import { getSingleExpert } from '@/services/private/lms/expert';
import useAuthContext from '@/hooks/useAuthContext';
import PageLoader from '@/components/common/loader/PageLoader';
import queryKeys from '@/utils/query-keys';
import ExpertPayPalForm from './ExpertPayPalForm';
import ExpertAmountForm from './ExpertAmountForm';

const ExpertPaymentForm = () => {
  const { user } = useAuthContext();

  const { data: expertResponse, isLoading: isLoadingExpert } = useQuery({
    queryFn: () => getSingleExpert({ id: user?.profile?.expert }),
    queryKey: [queryKeys.teacherProfile, user?.profile?.expert],
    enabled: !!user?.profile?.expert,
  });

  const expertData = expertResponse?.data?.data;

  if (isLoadingExpert) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col gap-6">
      <ExpertAmountForm expertData={expertData} />
      <ExpertPayPalForm expertData={expertData} />
    </div>
  );
};

export default ExpertPaymentForm;
export { ExpertAmountForm, ExpertPayPalForm };
