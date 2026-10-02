'use client';
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdDeleteOutline, MdOutlineAdd, MdOutlineRemoveRedEye } from 'react-icons/md';
import useDelete from '@/hooks/useDelete';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import {
  getHomeCoachConfigsList,
  deleteHomeCoachConfig,
} from '@/services/private/lms/home-coach';
import queryKeys from '@/utils/query-keys';

const HomeCoachList = () => {
  const router = useRouter();

  const { handleDelete: handleDeleteHomeCoach } = useDelete({
    mutationFn: deleteHomeCoachConfig,
    invalidateQueryKey: [queryKeys.homeCoachConfigs],
    onSuccess: () => toast.success('Home coach configuration deleted successfully'),
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
      },
      {
        header: 'Experts',
        accessorKey: 'expert_names',
        cell: ({ row }) => {
          const names = row?.original?.expert_names || [];
          if (!names.length) return '—';
          return names.join(', ');
        },
      },
      {
        header: 'Count',
        accessorKey: 'expert_count',
      },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ row }) => (row?.original?.is_active ? 'Active' : 'Inactive'),
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/lms/expert/home-coach/${row.original.id}/details`),
      },
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/lms/expert/home-coach/${row.original.id}/edit`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteHomeCoach({ id: row.original.id }),
      },
    ],
    [handleDeleteHomeCoach, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add Home Coach Config',
        onClick: () => router.push('/portal/admin/lms/expert/home-coach/add'),
      },
    ],
    [router]
  );

  const { isLoading, columns, data: response } = useTable({
    columns: tableColumns,
    queryFn: () => getHomeCoachConfigsList(),
    queryKey: [queryKeys.homeCoachConfigs],
    rowActions,
  });

  const data = Array.isArray(response) ? response : response?.data || [];

  return (
    <div>
      <PageHeader title="Home Coach">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default HomeCoachList;
