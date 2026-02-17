'use client';
import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport, BiExport } from 'react-icons/bi';
import { useMutation } from '@tanstack/react-query';
import useDelete from '@/hooks/useDelete';
import useImport from '@/hooks/useImport';
import useTable from '@/hooks/useTable';
import useConfirm from '@/hooks/useConfirm';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getCategoriesList, deleteSingleCategory, importCategories, exportCategories } from '@/services/private/lms/category';
import queryKeys from '@/utils/query-keys';
import { downloadBlobAsCsv, toastApiError } from '@/utils/helpers';

const CategoriesList = () => {
  const router = useRouter();
  const confirm = useConfirm();
  const { isImporting, handleImport: handleImportCategories } = useImport({
    mutationFn: importCategories,
    invalidateQueryKey: [queryKeys.lmsCategories],
    onSuccess: () => toast.success('Categories imported successfully'),
  });
  const { handleDelete: handleDeleteCategory } = useDelete({
    mutationFn: deleteSingleCategory,
    invalidateQueryKey: [queryKeys.lmsCategories],
    onSuccess: () => toast.success('Category deleted successfully'),
  });

  const { mutateAsync: exportCategoriesFn, isPending: isExporting } = useMutation({
    mutationFn: exportCategories,
  });
  const handleExport = useCallback(async () => {
    try {
      await confirm({ message: 'Export categories?' });
      const response = await exportCategoriesFn();
      downloadBlobAsCsv(response, 'categories_export.csv');
      toast.success('Categories exported successfully');
    } catch (e) {
      if (e?.message !== 'cancel') toastApiError(e);
    }
  }, [confirm, exportCategoriesFn]);

  const tableColumns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Parent',
        accessorKey: 'parent.name',
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/lms/category/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/lms/category/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteCategory({ id: row.original.id }),
      },
    ],
    [handleDeleteCategory, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import',
        Icon: BiImport,
        label: 'Import',
        isLoading: isImporting,
        onClick: handleImportCategories,
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
        label: 'Add New Category',
        onClick: () => router.push('/portal/admin/lms/category/add'),
      },
    ],
    [handleImportCategories, handleExport, isImporting, isExporting, router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getCategoriesList,
    queryKey: [queryKeys.lmsCategories],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Categories">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default CategoriesList;
