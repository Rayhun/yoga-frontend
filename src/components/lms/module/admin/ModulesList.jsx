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
import {
  deleteSingleModule,
  getModulesList,
  importModules,
  importModuleContents,
  exportModules,
  exportModuleContent,
} from '@/services/private/lms/module';
import queryKeys from '@/utils/query-keys';
import { downloadBlobAsCsv, toastApiError } from '@/utils/helpers';

const ModuleList = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const confirm = useConfirm();
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

  const { mutateAsync: exportModulesFn, isPending: isExporting } = useMutation({ mutationFn: exportModules });
  const { mutateAsync: exportModuleContentFn, isPending: isExportingContent } = useMutation({
    mutationFn: exportModuleContent,
  });

  const handleExportModules = useCallback(async () => {
    try {
      await confirm({ message: 'Export module data?' });
      const response = await exportModulesFn();
      downloadBlobAsCsv(response, 'modules_export.csv', 'Modules exported successfully');
      toast.success('Modules exported successfully');
    } catch (e) {
      if (e?.message !== 'cancel') toastApiError(e);
    }
  }, [confirm, exportModulesFn]);

  const handleExportModuleContent = useCallback(async () => {
    try {
      await confirm({ message: 'Export module content?' });
      const response = await exportModuleContentFn();
      downloadBlobAsCsv(response, 'module_content_export.csv', 'Module content exported successfully');
      toast.success('Module content exported successfully');
    } catch (e) {
      if (e?.message !== 'cancel') toastApiError(e);
    }
  }, [confirm, exportModuleContentFn]);

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
    ];

    // Filter out edit and delete actions for staff users
    if (user?.isStaff) {
      return actions.filter(action => action.id === 'view');
    }

    return actions;
  }, [handleDeleteModule, router, user?.isStaff]);

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
        id: 'export-module',
        Icon: BiExport,
        label: 'Export Module',
        isLoading: isExporting,
        onClick: handleExportModules,
      },
      {
        id: 'export-module-content',
        Icon: BiExport,
        label: 'Export Module Content',
        isLoading: isExportingContent,
        onClick: handleExportModuleContent,
      },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Module',
        onClick: () => router.push('/portal/admin/lms/module/add'),
      },
    ],
    [
      handleImportModuleContents,
      handleImportModules,
      handleExportModules,
      handleExportModuleContent,
      isImportingModuleContents,
      isImportingModules,
      isExporting,
      isExportingContent,
      router,
    ]
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
        <StaffPermissionGuard>
          <PageHeaderQuickActions actions={headerQuickActions} />
        </StaffPermissionGuard>
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default ModuleList;
