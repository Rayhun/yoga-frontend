'use client';
import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport, BiExport } from 'react-icons/bi';
import { useMutation } from '@tanstack/react-query';
import useTable from '@/hooks/useTable';
import useImport from '@/hooks/useImport';
import useDelete from '@/hooks/useDelete';
import useConfirm from '@/hooks/useConfirm';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import StaffPermissionGuard from '@/components/common/StaffPermissionGuard';
import useAuthContext from '@/hooks/useAuthContext';
import { deleteSingleSession, getSessionsList, importSessions, exportSessions } from '@/services/private/lms/session';
import { SESSION_TYPE } from '@/utils/enums';
import queryKeys from '@/utils/query-keys';
import { downloadBlobAsCsv, toastApiError } from '@/utils/helpers';

const ImageSessionsList = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const confirm = useConfirm();
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

  const { mutateAsync: exportSessionsFn, isPending: isExporting } = useMutation({
    mutationFn: exportSessions,
  });
  const handleExport = useCallback(async () => {
    try {
      await confirm({ message: 'Export image sessions?' });
      const response = await exportSessionsFn({ content_type: 'image' });
      downloadBlobAsCsv(response, 'image_sessions_export.csv');
      toast.success('Image sessions exported successfully');
    } catch (e) {
      if (e?.message !== 'cancel') toastApiError(e);
    }
  }, [confirm, exportSessionsFn]);

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

  const rowActions = useMemo(() => {
    const actions = [
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
    ];

    // Filter out edit and delete actions for staff users
    if (user?.isStaff) {
      return actions.filter(action => action.id === 'view');
    }

    return actions;
  }, [handleDeleteImageSession, router, user?.isStaff]);

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
        id: 'export',
        Icon: BiExport,
        label: 'Export',
        isLoading: isExporting,
        onClick: handleExport,
      },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Image Session',
        onClick: () => router.push('/portal/admin/lms/session/image/add'),
      },
    ],
    [handleImportImageSessions, handleExport, isImporting, isExporting, router]
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
        <StaffPermissionGuard>
          <PageHeaderQuickActions actions={headerQuickActions} />
        </StaffPermissionGuard>
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default ImageSessionsList;
