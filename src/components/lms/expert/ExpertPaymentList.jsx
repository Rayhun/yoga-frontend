'use client';
import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { FaPaperPlane } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useTable from '@/hooks/useTable';
import { PageHeader } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getExpertPaymentsList, updatePaymentStatus } from '@/services/private/lms/expert-payment';
import queryKeys from '@/utils/query-keys';
import useConfirm from '@/hooks/useConfirm';
import { toastApiError } from '@/utils/helpers';

const ExpertPaymentList = () => {
  const router = useRouter();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const { mutateAsync: updateStatus } = useMutation({
    mutationFn: updatePaymentStatus,
  });

  const handleSendPayment = useCallback(
    async (payment) => {
      await confirm({
        message: `Are you sure you want to mark payment #${payment.id} as completed?`,
      })
        .then(async () => {
          await updateStatus({ id: payment.id, payment_status: 'Completed' });
          toast.success('Payment status updated successfully');
          await queryClient.invalidateQueries([queryKeys.expertPayments]);
        })
        .catch(error => {
          toastApiError(error);
        });
    },
    [confirm, updateStatus, queryClient]
  );

  const tableColumns = useMemo(
    () => [
      {
        header: 'Expert',
        accessorKey: 'expert_name',
      },
      {
        header: 'User',
        accessorKey: 'user_name',
      },
      {
        header: 'User Email',
        accessorKey: 'user_email',
      },
      {
        header: 'Amount',
        accessorKey: 'amount',
        cell: ({ row }) => {
          const amount = row?.original?.amount;
          const currency = row?.original?.currency;
          return amount ? `${currency || '$'} ${amount}` : 'N/A';
        },
      },
      {
        header: 'Payment Section',
        accessorKey: 'payment_section',
      },
      {
        header: 'Payment Status',
        accessorKey: 'payment_status',
        cell: ({ row }) => {
          const status = row?.original?.payment_status;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                status === 'Completed' || status === 'Paid'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : status === 'Pending'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {status || 'N/A'}
            </span>
          );
        },
      },
      {
        header: 'Payment Method',
        accessorKey: 'payment_method',
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/lms/expert/payment/${row.original.id}/details`),
      },
      {
        id: 'send_payment',
        Icon: FaPaperPlane,
        label: 'Send Payment',
        render: row => row?.original?.payment_status === 'Pending',
        onClick: row => handleSendPayment(row.original),
      },
    ],
    [router, handleSendPayment]
  );

  const { isLoading, columns, data: response } = useTable({
    columns: tableColumns,
    queryFn: () => getExpertPaymentsList(),
    queryKey: [queryKeys.expertPayments],
    rowActions,
  });

  // Extract the actual data from the nested response structure
  const data = response?.data || [];

  return (
    <div>
      <PageHeader title="Expert Payments" />

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default ExpertPaymentList;
