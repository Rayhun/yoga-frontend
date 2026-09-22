'use client';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import queryKeys from '@/utils/query-keys';
import StripeCheckout from '@/components/subscription/checkout/StripeCheckout';
import LoadingWrapper from '@/components/common/loader/Wrapper';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { checkoutCertificationProgram } from '@/services/private/certification/enrollment';

const Page = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const programID = params.id;
  const clientSecretFromUrl = searchParams.get('client_secret');
  const sessionIdFromUrl = searchParams.get('session_id');

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => checkoutCertificationProgram({ id: programID }),
    queryKey: [queryKeys.certificationCatalog, 'checkout', programID],
    enabled: !clientSecretFromUrl && !sessionIdFromUrl,
  });

  useHandleApiResponse(failureReason);

  useEffect(() => {
    if (sessionIdFromUrl) {
      queryClient.invalidateQueries({ queryKey: [queryKeys.certificationEnrolledCertifications] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.certificationCatalog] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.certificationProgramCatalogDetail, programID] });
      const timer = setTimeout(() => {
        router.replace(`/portal/customer/certification`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [sessionIdFromUrl, queryClient, router, programID]);

  const clientSecret = clientSecretFromUrl || response?.data?.data?.checkout_session_client_secret;

  if (sessionIdFromUrl) {
    return (
      <div className="flex flex-col gap-5">
        <div className="text-center">
          <Alert className="mt-5" variant="filled" severity="success">
            Payment successful! Redirecting to your certifications...
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <Alert className="mt-5" variant="filled" severity="warning">
          Please wait for a while. We are creating a checkout session for you. DO NOT refresh the page
        </Alert>
      </div>
      <LoadingWrapper isLoading={isLoading}>
        {clientSecret ? (
          <StripeCheckout clientSecret={clientSecret} />
        ) : (
          <div className="text-center">Checkout session not created properly</div>
        )}
      </LoadingWrapper>
    </div>
  );
};

export default Page;
