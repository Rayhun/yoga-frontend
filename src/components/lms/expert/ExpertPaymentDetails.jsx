'use client';
import React, { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DetailsLayoutWrapper, DetailsRecord } from '@/components/common/details';
import { updatePaymentStatus } from '@/services/private/lms/expert-payment';
import queryKeys from '@/utils/query-keys';
import useConfirm from '@/hooks/useConfirm';
import { toastApiError } from '@/utils/helpers';
import Button from '@/components/common/Button';
import { FaPaperPlane } from 'react-icons/fa';

const ExpertPaymentDetails = ({ data = {} }) => {
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const { mutateAsync: updateStatus, isPending } = useMutation({
    mutationFn: updatePaymentStatus,
  });

  const handleSendPayment = useCallback(
    async () => {
      await confirm({
        message: `Are you sure you want to mark payment #${data.id} as completed?`,
      })
        .then(async () => {
          await updateStatus({ id: data.id, payment_status: 'Completed' });
          toast.success('Payment status updated successfully');
          await queryClient.invalidateQueries([queryKeys.expertPayments]);
          await queryClient.invalidateQueries([queryKeys.expertPayments, data.id]);
        })
        .catch(error => {
          toastApiError(error);
        });
    },
    [confirm, updateStatus, queryClient, data.id]
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount, currency) => {
    if (!amount) return 'N/A';
    return `${currency || '$'} ${amount}`;
  };

  const customActions = data?.payment_status === 'Pending' ? (
    <Button
      variant="primary"
      onClick={handleSendPayment}
      disabled={isPending}
      Icon={FaPaperPlane}
    >
      {isPending ? 'Updating...' : 'Send Payment'}
    </Button>
  ) : null;

  return (
    <DetailsLayoutWrapper title="Expert Payment Details" customActions={customActions}>
      <div className="flex flex-col gap-5">
        <DetailsRecord label="Payment ID">#{data?.id || 'N/A'}</DetailsRecord>
        <DetailsRecord label="Amount">
          <span className="text-green-600 font-semibold">
            {formatCurrency(data?.amount, data?.currency)}
          </span>
        </DetailsRecord>
        <DetailsRecord label="Currency">{data?.currency || 'N/A'}</DetailsRecord>
        <DetailsRecord label="Payment Status">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              data?.payment_status === 'Completed' || data?.payment_status === 'Paid'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : data?.payment_status === 'Pending'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {data?.payment_status || 'N/A'}
          </span>
        </DetailsRecord>
        <DetailsRecord label="Payment Method">{data?.payment_method || 'N/A'}</DetailsRecord>
        <DetailsRecord label="Payment Section">{data?.payment_section || 'N/A'}</DetailsRecord>
        <DetailsRecord label="Created At">{formatDate(data?.created_at)}</DetailsRecord>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-3">Expert Information</h3>
          <DetailsRecord label="Expert Name">{data?.expert_name || 'N/A'}</DetailsRecord>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-3">User Information</h3>
          <DetailsRecord label="User Name">{data?.user_name || 'N/A'}</DetailsRecord>
          <DetailsRecord label="User Email">{data?.user_email || 'N/A'}</DetailsRecord>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-3">Content Information</h3>
          <DetailsRecord label="Content Title">{data?.content_object_title || 'N/A'}</DetailsRecord>
        </div>
      </div>
    </DetailsLayoutWrapper>
  );
};

export default ExpertPaymentDetails;
