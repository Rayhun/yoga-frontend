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
import { getTagsList, deleteSingleTag, importTags, exportTags } from '@/services/private/lms/tag';
import queryKeys from '@/utils/query-keys';
import { downloadBlobAsCsv, toastApiError } from '@/utils/helpers';

const TagsList = () => {
  const router = useRouter();
  const confirm = useConfirm();
  const { isImporting, handleImport: handleImportTags } = useImport({
    mutationFn: importTags,
    invalidateQueryKey: [queryKeys.lmsTags],
    onSuccess: () => toast.success('Tags imported successfully'),
  });
  const { handleDelete: handleDeleteTag } = useDelete({
    mutationFn: deleteSingleTag,
    invalidateQueryKey: [queryKeys.lmsTags],
    onSuccess: () => toast.success('Tag deleted successfully'),
  });

  const { mutateAsync: exportTagsFn, isPending: isExporting } = useMutation({ mutationFn: exportTags });
  const handleExport = useCallback(async () => {
    try {
      await confirm({ message: 'Export tags?' });
      const response = await exportTagsFn();
      downloadBlobAsCsv(response, 'tags_export.csv');
      toast.success('Tags exported successfully');
    } catch (e) {
      if (e?.message !== 'cancel') toastApiError(e);
    }
  }, [confirm, exportTagsFn]);

  const tableColumns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Categories',
        cell: ({ row }) => row?.original?.category?.map(i => i.name).join(', ') || 'No categories',
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/lms/tag/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/lms/tag/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteTag({ id: row.original.id }),
      },
    ],
    [handleDeleteTag, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import',
        Icon: BiImport,
        label: 'Import',
        isLoading: isImporting,
        onClick: handleImportTags,
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
        label: 'Add New Tag',
        onClick: () => router.push('/portal/admin/lms/tag/add'),
      },
    ],
    [handleImportTags, handleExport, isImporting, isExporting, router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getTagsList,
    queryKey: [queryKeys.lmsTags],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Tags">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default TagsList;
