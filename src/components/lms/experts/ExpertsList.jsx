'use client';
import { useMemo } from 'react';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport } from 'react-icons/bi';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getExpertsList } from '@/services/private/lms/experts';
import queryKeys from '@/utils/query-keys';

const ExpertsList = () => {
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
        onClick: () => null,
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: () => null,
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: () => null,
      },
    ],
    []
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
        onClick: () => null,
      },
    ],
    []
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getExpertsList,
    queryKey: [queryKeys.quizes],
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
