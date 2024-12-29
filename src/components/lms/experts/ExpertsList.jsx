'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport } from 'react-icons/bi';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getExpertsList, deleteSingleExpert } from '@/services/private/lms/experts';
import queryKeys from '@/utils/query-keys';
import useDelete from '@/hooks/useDelete';
import { toast } from 'react-toastify';

const ExpertsList = () => {
  const router = useRouter();
  const { handleDelete: handleDeleteExpert } = useDelete({
    mutationFn: deleteSingleExpert,
    invalidateQueryKey: [queryKeys.lmsExperts],
    onSuccess: () => toast.success('Expert deleted successfully'),
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Title',
        accessorKey: 'title',
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/lms/experts/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/lms/experts/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteExpert({ id: row.original.id }),
      },
    ],
    [handleDeleteExpert, router]
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
        label: 'Add New Expert',
        onClick: () => router.push('/portal/lms/experts/add'),
      },
    ],
    [router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getExpertsList,
    queryKey: [queryKeys.lmsExperts],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Experts">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />

      <div className="h-[800px]" />
    </div>
  );
};

export default ExpertsList;
