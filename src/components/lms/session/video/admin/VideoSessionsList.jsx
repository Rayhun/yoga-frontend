'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport, BiExport } from 'react-icons/bi';
import useTable from '@/hooks/useTable';
import useImport from '@/hooks/useImport';
import useExport from '@/hooks/useExport';
import useDelete from '@/hooks/useDelete';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import StaffPermissionGuard from '@/components/common/StaffPermissionGuard';
import useAuthContext from '@/hooks/useAuthContext';
import { deleteSingleSession, getSessionsList, importSessions, exportSessions } from '@/services/private/lms/session';
import { SESSION_TYPE } from '@/utils/enums';
import queryKeys from '@/utils/query-keys';

const VideoSessionsList = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { isImporting, handleImport: handleImportVideoSessions } = useImport({
    mutationFn: importSessions,
    invalidateQueryKey: [queryKeys.lmsVideoSessions],
    onSuccess: () => toast.success('Video Session imported successfully'),
  });
  const { handleDelete: handleDeleteVideoSession } = useDelete({
    mutationFn: deleteSingleSession,
    invalidateQueryKey: [queryKeys.lmsVideoSessions],
    onSuccess: () => toast.success('Video Session deleted successfully'),
  });
  const { isExporting, handleExport } = useExport({
    mutationFn: () => exportSessions({ content_type: 'video' }),
    filename: 'video_sessions_export.csv',
    confirmMessage: 'Export video sessions?',
    successMessage: 'Video sessions exported successfully',
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

  const rowActions = useMemo(() => {
    const actions = [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/lms/session/video/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/lms/session/video/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteVideoSession({ id: row.original.id }),
      },
    ];

    if (user?.isStaff) {
      return actions.filter(action => action.id === 'view');
    }

    return actions;
  }, [handleDeleteVideoSession, router, user?.isStaff]);

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import',
        Icon: BiImport,
        label: 'Import',
        isLoading: isImporting,
        onClick: () => handleImportVideoSessions({ type: SESSION_TYPE.video }),
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
        label: 'Add New Video Session',
        onClick: () => router.push('/portal/admin/lms/session/video/add'),
      },
    ],
    [handleImportVideoSessions, handleExport, isImporting, isExporting, router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: () => getSessionsList({ type: SESSION_TYPE.video }),
    queryKey: [queryKeys.lmsVideoSessions],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Video Sessions">
        <StaffPermissionGuard>
          <PageHeaderQuickActions actions={headerQuickActions} />
        </StaffPermissionGuard>
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default VideoSessionsList;
