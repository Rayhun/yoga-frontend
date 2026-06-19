'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';
import { Chip } from '@mui/material';
import queryKeys from '@/utils/query-keys';
import { approveAffiliateUser } from '@/services/private/affiliates/users';
import useConfirm from '@/hooks/useConfirm';
import { toastApiError } from '@/utils/helpers';
import ApproveAffiliateForm from './ApproveAffiliateForm';

const DURATION_OPTIONS = {
  1: '1-month',
  3: '3-month',
  6: '6-month',
  12: '12-month',
  0: 'Forever',
};

const ProfileChip = ({ label }) => <Chip label={label} className="bg-dark/10 text-dark" />;

const AffiliateUsersDetails = ({ data = {} }) => {
  const router = useRouter();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [showApproveForm, setShowApproveForm] = useState(false);

  const { mutateAsync: updateAffiliateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: approveAffiliateUser,
  });

  const invalidateAffiliateQueries = async () => {
    await queryClient.invalidateQueries([{ queryKey: [queryKeys.affiliateUsers] }]);
    await queryClient.invalidateQueries([{ queryKey: [queryKeys.affiliateUsers, String(data.id)] }]);
  };

  const handleDisapprove = async () => {
    try {
      await confirm({
        heading: 'Disapprove affiliate?',
        message:
          'Are you sure you want to disapprove this affiliate? They will lose access to the affiliate portal.',
      });
      await updateAffiliateStatus({ payload: { status: 'Declined', id: data.id } });
      toast.success('Affiliate disapproved successfully');
      await invalidateAffiliateQueries();
      router.push('/portal/admin/affiliates/users');
    } catch (error) {
      if (error?.message !== 'User cancelled') {
        toastApiError(error);
      }
    }
  };

  const handleApproveSubmit = async (values, { setSubmitting }) => {
    try {
      await updateAffiliateStatus({ payload: { ...values, id: data.id } });
      toast.success(
        data.status === 'Declined'
          ? 'Affiliate re-approved successfully'
          : 'Affiliate user approved successfully'
      );
      await invalidateAffiliateQueries();
      setShowApproveForm(false);
      router.push('/portal/admin/affiliates/users');
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DetailsLayoutWrapper
        title="Affiliate User Details"
        customActions={
          <>
            {(data?.status === 'Pending' || data?.status === 'Declined') && (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-1 text-sm text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
                onClick={() => setShowApproveForm(true)}
                disabled={isUpdatingStatus}
              >
                {data?.status === 'Declined' ? 'Re-approve' : 'Approve'}
              </button>
            )}
            {data?.status === 'Approved' && (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-red-500 px-4 py-1 text-sm text-center font-medium text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-60"
                onClick={handleDisapprove}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? 'Disapproving...' : 'Disapprove'}
              </button>
            )}
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <DetailsRecord label="Status">{data?.status || 'N/A'}</DetailsRecord>
          <DetailsRecord label="Name">{`${data?.first_name} ${data?.last_name}`}</DetailsRecord>
          <DetailsRecord label="Email">{data?.email}</DetailsRecord>
          <DetailsRecord label="Pay Email">{data?.paypal_email}</DetailsRecord>
          <DetailsRecord label="Business Model"><span className='capitalize'>{data?.business_model}</span></DetailsRecord>
          <DetailsRecord label="Payout Duration">{DURATION_OPTIONS[data?.payout_duration] || 'N/A'}</DetailsRecord>
          <DetailsRecord label="Commission Type">{data?.commission_type_name || 'N/A'}</DetailsRecord>
          <DetailsRecord label="Percentage">{data?.percentage ? `${data?.percentage}%` : 'N/A'}</DetailsRecord>
          <DetailsRecord label="Refferral Code">{data?.referral_code || 'N/A'}</DetailsRecord>
          <DetailsRecord label="Refferral Count">{data?.referral_count || 'N/A'}</DetailsRecord>
          <DetailsRecord label="Refferral Links">
            <span className="flex flex-wrap gap-2">
              {data?.referral_link?.map(link => (
                <ProfileChip key={link} label={link} />
              ))}
            </span>
          </DetailsRecord>
          <DetailsRecord label="Channels">
            <span className="flex flex-wrap gap-2">
              {data?.channels?.map(channel => (
                <ProfileChip key={channel} label={channel} />
              ))}
            </span>
          </DetailsRecord>
        </div>
      </DetailsLayoutWrapper>

      <ApproveAffiliateForm
        show={showApproveForm}
        selected={data}
        onClose={() => setShowApproveForm(false)}
        handleSubmit={handleApproveSubmit}
      />
    </>
  );
};

export default AffiliateUsersDetails;
