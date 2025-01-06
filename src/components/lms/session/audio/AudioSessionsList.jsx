'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport } from 'react-icons/bi';
import useImport from '@/hooks/useImport';
import useTable from '@/hooks/useTable';
import useDelete from '@/hooks/useDelete';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { deleteSingleSession, getSessionsList, importSessions } from '@/services/private/lms/session';
import { SESSION_TYPE } from '@/utils/enums';
import queryKeys from '@/utils/query-keys';

const AudioSessionsList = () => {
  const router = useRouter();
  const { isImporting, handleImport: handleImportAudioSessions } = useImport({
    mutationFn: importSessions,
    invalidateQueryKey: [queryKeys.lmsAudioSessions],
    onSuccess: () => toast.success('Audio Session imported successfully'),
  });
  const { handleDelete: handleDeleteAudioSession } = useDelete({
    mutationFn: deleteSingleSession,
    invalidateQueryKey: [queryKeys.lmsAudioSessions],
    onSuccess: () => toast.success('Audio Session deleted successfully'),
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
        onClick: row => router.push(`/portal/lms/session/audio/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/lms/session/audio/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteAudioSession({ id: row.original.id }),
      },
    ],
    [handleDeleteAudioSession, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import',
        Icon: BiImport,
        label: 'Import',
        isLoading: isImporting,
        onClick: () => handleImportAudioSessions({ type: SESSION_TYPE.audio }),
      },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Audio Session',
        onClick: () => router.push('/portal/lms/session/audio/add'),
      },
    ],
    [handleImportAudioSessions, isImporting, router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: () => getSessionsList({ type: SESSION_TYPE.audio }),
    queryKey: [queryKeys.lmsAudioSessions],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Audio Sessions">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default AudioSessionsList;
