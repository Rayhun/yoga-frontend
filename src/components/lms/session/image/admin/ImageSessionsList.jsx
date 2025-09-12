'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport } from 'react-icons/bi';
import useTable from '@/hooks/useTable';
import useImport from '@/hooks/useImport';
import useDelete from '@/hooks/useDelete';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { deleteSingleSession, getSessionsList, importSessions } from '@/services/private/lms/session';
import { SESSION_TYPE } from '@/utils/enums';
import queryKeys from '@/utils/query-keys';

const ImageSessionsList = () => {
  const router = useRouter();
  const { isImporting, handleImport: handleImportImageSessions } = useImport({
    mutationFn: importSessions,
    invalidateQueryKey: [queryKeys.lmsImageSessions],
    onSuccess: () => toast.success('Image Session imported successfully'),
  });
  const { handleDelete: handleDeleteImageSession } = useDelete({
    mutationFn: deleteSingleSession,
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
        onClick: row => router.push(`/portal/admin/lms/session/image/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/lms/session/image/${row.original.id}/details`),
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
        isLoading: isImporting,
        onClick: () => handleImportImageSessions({ type: SESSION_TYPE.image }),
      },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Image Session',
        onClick: () => router.push('/portal/admin/lms/session/image/add'),
      },
    ],
    [handleImportImageSessions, isImporting, router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: () => getSessionsList({ type: SESSION_TYPE.image }),
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
