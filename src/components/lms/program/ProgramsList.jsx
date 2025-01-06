'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport } from 'react-icons/bi';
import useTable from '@/hooks/useTable';
import useDelete from '@/hooks/useDelete';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { deleteSingleProgram, getProgramsList } from '@/services/private/lms/program';
import queryKeys from '@/utils/query-keys';

const ProgramList = () => {
  const router = useRouter();
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

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/lms/program/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/lms/program/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteProgram({ id: row.original.id }),
      },
    ],
    [handleDeleteProgram, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import',
        Icon: BiImport,
        label: 'Import',
        onClick: () => null,
      },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Program',
        onClick: () => router.push('/portal/lms/program/add'),
      },
    ],
    [router]
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
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default ProgramList;
