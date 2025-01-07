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
import { getCategoriesList, deleteSingleCategory, importCategories } from '@/services/private/lms/category';
import queryKeys from '@/utils/query-keys';

const CategoriesList = () => {
  const router = useRouter();
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

  const tableColumns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Parent',
        accessorKey: 'parent',
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/lms/category/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/lms/category/${row.original.id}/details`),
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
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Category',
        onClick: () => router.push('/portal/lms/category/add'),
      },
    ],
    [handleImportCategories, isImporting, router]
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

      <div className="h-[800px]" />
    </div>
  );
};

export default CategoriesList;
