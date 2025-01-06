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
import { deleteSingleModule, getModulesList, importModules } from '@/services/private/lms/module';
import queryKeys from '@/utils/query-keys';

const ModuleList = () => {
  const router = useRouter();
  const { isImporting, handleImport: handleImportModules } = useImport({
    mutationFn: importModules,
    invalidateQueryKey: [queryKeys.lmsModules],
    onSuccess: () => toast.success('Modules imported successfully'),
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
        onClick: row => router.push(`/portal/lms/module/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/lms/module/${row.original.id}/details`),
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
        id: 'import',
        Icon: BiImport,
        label: 'Import',
        isLoading: isImporting,
        onClick: handleImportModules,
      },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Module',
        onClick: () => router.push('/portal/lms/module/add'),
      },
    ],
    [handleImportModules, isImporting, router]
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
