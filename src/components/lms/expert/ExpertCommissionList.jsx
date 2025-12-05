'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdDeleteOutline, MdOutlineAdd, MdOutlineRemoveRedEye } from 'react-icons/md';
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';
import useDelete from '@/hooks/useDelete';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { 
  getExpertCommissionsList, 
  deleteExpertCommission, 
  toggleExpertCommissionStatus 
} from '@/services/private/lms/expert-commission';
import queryKeys from '@/utils/query-keys';
import Button from '@/components/common/Button';
import useConfirm from '@/hooks/useConfirm';
import { toastApiError } from '@/utils/helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ExpertCommissionList = () => {
  const router = useRouter();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const { handleDelete: handleDeleteCommission } = useDelete({
    mutationFn: deleteExpertCommission,
    invalidateQueryKey: [queryKeys.expertCommissions],
    onSuccess: () => toast.success('Commission deleted successfully'),
  });

  const { mutateAsync: toggleStatus } = useMutation({
    mutationFn: toggleExpertCommissionStatus,
  });

  const handleToggleStatus = useCallback(
    async selected => {
      const message = selected?.is_active
        ? 'Are you sure you want to deactivate this commission?'
        : 'Are you sure you want to activate this commission?';
      await confirm({
        message,
      })
        .then(async () => {
          await toggleStatus({ id: selected?.id });
          toast.success('Commission status updated successfully');

          await queryClient.invalidateQueries([queryKeys.expertCommissions]);
        })
        .catch(error => {
          toastApiError(error);
        });
    },
    [confirm, toggleStatus, queryClient]
  );

  const tableColumns = useMemo(
    () => [
      {
        header: 'Commission Type',
        accessorKey: 'commission_type',
      },
      {
        header: 'Value Type',
        accessorKey: 'commission_value_type',
        cell: ({ row }) => {
          const valueType = row?.original?.commission_value_type;
          return valueType === 'percent' ? 'Percentage' : 'Fixed Amount';
        },
      },
      {
        header: 'Commission Value',
        accessorKey: 'commission_value',
        cell: ({ row }) => {
          const value = row?.original?.commission_value;
          const valueType = row?.original?.commission_value_type;
          return valueType === 'percent' ? `${value}%` : `$${value}`;
        },
      },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ row }) => row?.original?.is_active ? 'Active' : 'Inactive',
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/lms/expert/commission/${row.original.id}/details`),
      },
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/lms/expert/commission/${row.original.id}/edit`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteCommission({ id: row.original.id }),
      },
      {
        id: 'active',
        Icon: BsToggleOff,
        render: row => !row?.original?.is_active,
        onClick: row => handleToggleStatus(row?.original),
      },
      {
        id: 'deactive',
        Icon: BsToggleOn,
        render: row => row?.original?.is_active,
        onClick: row => handleToggleStatus(row?.original),
      },
    ],
    [handleDeleteCommission, router, handleToggleStatus]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Commission',
        onClick: () => router.push('/portal/admin/lms/expert/commission/add'),
      },
    ],
    [router]
  );

  const { isLoading, columns, data: response } = useTable({
    columns: tableColumns,
    queryFn: () => getExpertCommissionsList(),
    queryKey: [queryKeys.expertCommissions],
    rowActions,
  });

  // Extract the actual data from the nested response structure
  const data = response?.data || [];

  return (
    <div>
      <PageHeader title="Expert Commissions">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default ExpertCommissionList;
