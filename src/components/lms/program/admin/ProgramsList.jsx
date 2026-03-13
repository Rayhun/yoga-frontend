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
  deleteSingleProgram,
  getProgramsList,
  importProgramContents,
  importPrograms,
  exportProgramData,
  exportProgramContent,
} from '@/services/private/lms/program';
import queryKeys from '@/utils/query-keys';
import { toastApiError } from '@/utils/helpers';

const ProgramList = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const confirm = useConfirm();
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

  const { mutateAsync: exportPrograms, isPending: isExporting } = useMutation({
    mutationFn: exportProgramData,
  });

  const { mutateAsync: exportProgramContents, isPending: isExportingContent } = useMutation({
    mutationFn: exportProgramContent,
  });

  const downloadBlobAsCsv = useCallback((response, defaultFilename, successMessage) => {
    const { data: blobData, headers } = response;
    const contentType = headers['content-type'] || 'text/csv';
    const blob = new Blob([blobData], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    let filename = defaultFilename;
    const disposition = headers['content-disposition'] || '';
    const filenameMatch =
      disposition.match(/filename\*\s*=\s*([^;]+)/i) ||
      disposition.match(/filename\s*=\s*"([^"]+)"/i) ||
      disposition.match(/filename\s*=\s*([^;]+)/i);
    if (filenameMatch) {
      let rawName = filenameMatch[1].trim();
      if (rawName.includes("''")) {
        const parts = rawName.split("''");
        rawName = decodeURIComponent(parts[1]);
      }
      filename = rawName.replace(/(^"|"$)/g, '');
    }
    filename = filename.replace(/[_\s]+$/g, '');
    if (!filename.includes('.') && contentType) {
      const ext = contentType.split('/')[1]?.split(';')[0];
      if (ext) filename = `${filename}.${ext}`;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success(successMessage);
  }, []);

  const handleExport = useCallback(async () => {
    try {
      await confirm({
        message: 'Are you sure you want to export program data?',
      });

      const response = await exportPrograms();
      downloadBlobAsCsv(response, 'programs_export.csv', 'Program data exported successfully');
    } catch (error) {
      if (error?.message !== 'cancel') {
        toastApiError(error);
      }
    }
  }, [confirm, exportPrograms, downloadBlobAsCsv]);

  const handleExportProgramContent = useCallback(async () => {
    try {
      await confirm({
        message: 'Are you sure you want to export program content?',
      });

      const response = await exportProgramContents();
      downloadBlobAsCsv(response, 'program_content_export.csv', 'Program content exported successfully');
    } catch (error) {
      if (error?.message !== 'cancel') {
        toastApiError(error);
      }
    }
  }, [confirm, exportProgramContents, downloadBlobAsCsv]);

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
        id: 'export-program',
        Icon: BiExport,
        label: 'Export Program Data',
        isLoading: isExporting,
        onClick: handleExport,
      },
      {
        id: 'export-program-content',
        Icon: BiExport,
        label: 'Export Program Content',
        isLoading: isExportingContent,
        onClick: handleExportProgramContent,
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
      handleExport,
      handleExportProgramContent,
      isImportingProgramContents,
      isImportingPrograms,
      isExporting,
      isExportingContent,
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
