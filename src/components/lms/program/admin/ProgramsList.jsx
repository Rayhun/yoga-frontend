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
import StaffPermissionGuard from '@/components/common/StaffPermissionGuard';
import useAuthContext from '@/hooks/useAuthContext';
import {
  deleteSingleProgram,
  getProgramsList,
  importProgramContents,
  importPrograms,
} from '@/services/private/lms/program';
import queryKeys from '@/utils/query-keys';

const ProgramList = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { isImporting: isImportingPrograms, handleImport: handleImportPrograms } = useImport({
    mutationFn: importPrograms,
    invalidateQueryKey: [queryKeys.lmsPrograms],
    onSuccess: () => toast.success('Program imported successfully'),
  });
  const { isImporting: isImportingProgramContents, handleImport: handleImportProgramContents } = useImport({
    mutationFn: importProgramContents,
    invalidateQueryKey: [queryKeys.lmsPrograms],
    onSuccess: () => toast.success('Program Content imported successfully'),
  });
  const { handleDelete: handleDeleteProgram } = useDelete({
    mutationFn: deleteSingleProgram,
    invalidateQueryKey: [queryKeys.lmsPrograms],
    onSuccess: () => toast.success('Program deleted successfully'),
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'Access Settings',
        accessorKey: 'access_setting',
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
        onClick: row => router.push(`/portal/admin/lms/program/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/lms/program/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteProgram({ id: row.original.id }),
      },
    ];

    // Filter out edit and delete actions for staff users
    if (user?.isStaff) {
      return actions.filter(action => action.id === 'view');
    }

    return actions;
  }, [handleDeleteProgram, router, user?.isStaff]);

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import-program',
        Icon: BiImport,
        label: 'Import Program',
        isLoading: isImportingPrograms,
        onClick: handleImportPrograms,
      },
      {
        id: 'import-program-content',
        Icon: BiImport,
        label: 'Import Program Content',
        isLoading: isImportingProgramContents,
        onClick: handleImportProgramContents,
      },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Program',
        onClick: () => router.push('/portal/admin/lms/program/add'),
      },
    ],
    [
      handleImportProgramContents,
      handleImportPrograms,
      isImportingProgramContents,
      isImportingPrograms,
      router,
    ]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getProgramsList,
    queryKey: [queryKeys.lmsPrograms],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Program">
        <StaffPermissionGuard>
          <PageHeaderQuickActions actions={headerQuickActions} />
        </StaffPermissionGuard>
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default ProgramList;
