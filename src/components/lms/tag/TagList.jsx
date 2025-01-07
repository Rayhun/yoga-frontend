'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport } from 'react-icons/bi';
import useDelete from '@/hooks/useDelete';
import useImport from '@/hooks/useImport';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getTagsList, deleteSingleTag, importTags } from '@/services/private/lms/tag';
import queryKeys from '@/utils/query-keys';

const TagsList = () => {
  const router = useRouter();
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

  const tableColumns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Categories',
        cell: ({ row }) => row?.original?.category?.map(i => i.name).join(', '),
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/lms/tag/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/lms/tag/${row.original.id}/details`),
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
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Tag',
        onClick: () => router.push('/portal/lms/tag/add'),
      },
    ],
    [handleImportTags, isImporting, router]
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

      <div className="h-[800px]" />
    </div>
  );
};

export default TagsList;
