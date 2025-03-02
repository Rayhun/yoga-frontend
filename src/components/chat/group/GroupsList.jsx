'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import useDelete from '@/hooks/useDelete';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getGroupsList, deleteSingleGroup } from '@/services/private/chat/group';
import queryKeys from '@/utils/query-keys';

const GroupsList = () => {
  const router = useRouter();
  const { handleDelete: handleDeleteGroup } = useDelete({
    mutationFn: deleteSingleGroup,
    invalidateQueryKey: [queryKeys.chatGroups],
    onSuccess: () => toast.success('Group deleted successfully'),
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'group_name',
      },
      {
        header: 'Members Count',
        cell: ({ row }) => row?.original?.members?.length || 0,
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/chat/group/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/chat/group/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteGroup({ id: row.original.id }),
      },
    ],
    [handleDeleteGroup, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Group',
        onClick: () => router.push('/portal/admin/chat/group/add'),
      },
    ],
    [router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getGroupsList,
    queryKey: [queryKeys.chatGroups],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Groups">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default GroupsList;
