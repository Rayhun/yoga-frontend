'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport } from 'react-icons/bi';
import useTable from '@/hooks/useTable';
import useDelete from '@/hooks/useDelete';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { deleteSingleImageSession, getImageSessionsList } from '@/services/private/lms/session/image';
import queryKeys from '@/utils/query-keys';

const ImageSessionsList = () => {
  const router = useRouter();
  const { handleDelete: handleDeleteImageSession } = useDelete({
    mutationFn: deleteSingleImageSession,
    invalidateQueryKey: [queryKeys.lmsImageSessions],
    onSuccess: () => toast.success('Image Session deleted successfully'),
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'Duration',
        accessorKey: 'duration',
      },
      {
        header: 'Status',
        accessorKey: 'status',
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/lms/session/image/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/lms/session/image/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteImageSession({ id: row.original.id }),
      },
    ],
    [handleDeleteImageSession, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import',
        Icon: BiImport,
        label: 'Import',
        onClick: () => null,
      },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Image Session',
        onClick: () => router.push('/portal/lms/session/image/add'),
      },
    ],
    [router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getImageSessionsList,
    queryKey: [queryKeys.lmsImageSessions],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Image Sessions">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default ImageSessionsList;
