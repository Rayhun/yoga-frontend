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
import {
  deleteSingleModule,
  getModulesList,
  importModules,
  importModuleContents,
} from '@/services/private/lms/module';
import queryKeys from '@/utils/query-keys';

const ModuleList = () => {
  const router = useRouter();
  const { isImporting: isImportingModules, handleImport: handleImportModules } = useImport({
    mutationFn: importModules,
    invalidateQueryKey: [queryKeys.lmsModules],
    onSuccess: () => toast.success('Module imported successfully'),
  });
  const { isImporting: isImportingModuleContents, handleImport: handleImportModuleContents } = useImport({
    mutationFn: importModuleContents,
    invalidateQueryKey: [queryKeys.lmsModules],
    onSuccess: () => toast.success('Module Content imported successfully'),
  });
  const { handleDelete: handleDeleteModule } = useDelete({
    mutationFn: deleteSingleModule,
    invalidateQueryKey: [queryKeys.lmsModules],
    onSuccess: () => toast.success('Module deleted successfully'),
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

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/lms/module/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/lms/module/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteModule({ id: row.original.id }),
      },
    ],
    [handleDeleteModule, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import-module',
        Icon: BiImport,
        label: 'Import Module',
        isLoading: isImportingModules,
        onClick: handleImportModules,
      },
      {
        id: 'import-module-content',
        Icon: BiImport,
        label: 'Import Module Content',
        isLoading: isImportingModuleContents,
        onClick: handleImportModuleContents,
      },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Module',
        onClick: () => router.push('/portal/admin/lms/module/add'),
      },
    ],
    [handleImportModuleContents, handleImportModules, isImportingModuleContents, isImportingModules, router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getModulesList,
    queryKey: [queryKeys.lmsModules],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Module">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default ModuleList;
