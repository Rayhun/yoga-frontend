'use client';
import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BsPersonCheck, BsPersonX } from 'react-icons/bs';

import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import queryKeys from '@/utils/query-keys';
import { MdOutlineRemoveRedEye } from 'react-icons/md';

import { approveAffiliateUser, getAffiliatesUsersList } from '@/services/private/affiliates/users';
import ApproveAffiliateForm from './ApproveAffiliateForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { toastApiError } from '@/utils/helpers';
import useConfirm from '@/hooks/useConfirm';

const AffiliateUsersList = () => {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const confirm = useConfirm();

  const queryClient = useQueryClient();

  const { mutateAsync: approveUser } = useMutation({
    mutationFn: approveAffiliateUser,
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'first_name',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Country',
        accessorKey: 'country',
      },
      {
        header: 'Status',
        accessorKey: 'status',
      },
    ],
    []
  );

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await approveUser({ payload: { ...values, id: selected } });
      toast.success('Affiliate user approved successfully');

      await queryClient.invalidateQueries([
        {
          queryKey: [queryKeys.affiliateUsers],
        },
      ]);
      handleCloseApproval();
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handDecline = useCallback(async (selectedId) => {
    await confirm({
      message:
        'Are you sure you want to decline this affiliate user?',
    })
      .then(async () => {
        await approveUser({ payload: { status: 'Declined', id: selectedId } });
        toast.success('Affiliate user declined');

        await queryClient.invalidateQueries([
          {
            queryKey: [queryKeys.affiliateUsers],
          },
        ]);
      })
      .catch(error => {
        toastApiError(error);
      });
  }, [confirm, approveUser, queryClient]);

  const rowActions = useMemo(
    () => [
      {
        id: 'approve',
        render: row => row?.original?.status === 'Pending',
        Icon: BsPersonCheck,
        onClick: row => setSelected(row?.original?.id),
      },
      {
        id: 'decline',
        render: row => row?.original?.status === 'Pending',
        Icon: BsPersonX,
        onClick: row => handDecline(row?.original?.id),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/affiliates/users/${row?.original?.id}/details`),
      },
    ],
    [setSelected, handDecline, router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getAffiliatesUsersList,
    queryKey: [queryKeys.affiliateUsers],
    rowActions,
  });


  const handleCloseApproval = () => setSelected(null);

  return (
    <React.Fragment>
      <div>
        <PageHeader title="Affiliates Users">
          <PageHeaderQuickActions />
        </PageHeader>

        <BasicTable isLoading={isLoading} columns={columns} data={data || []} />
      </div>
      <ApproveAffiliateForm show={!!selected} onClose={handleCloseApproval} handleSubmit={handleSubmit} />
    </React.Fragment>
  );
};

export default AffiliateUsersList;
