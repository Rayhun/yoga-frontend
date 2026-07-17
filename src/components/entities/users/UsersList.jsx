'use client';
import { useMemo } from 'react';
import { BiExport } from 'react-icons/bi';
import useTable from '@/hooks/useTable';
import useExport from '@/hooks/useExport';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getUsersList, exportUsers } from '@/services/private/user';
import queryKeys from '@/utils/query-keys';

const UsersList = () => {
  const { isExporting, handleExport } = useExport({
    mutationFn: exportUsers,
    filename: 'customers_export.csv',
    confirmMessage: 'Export customers?',
    successMessage: 'Customers exported successfully',
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'First Name',
        accessorKey: 'profile.first_name',
      },
      {
        header: 'Last Name',
        accessorKey: 'profile.last_name',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Role',
        accessorKey: 'profile.role',
      },
    ],
    []
  );

  const rowActions = useMemo(() => [], []);

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'export',
        Icon: BiExport,
        label: 'Export',
        isLoading: isExporting,
        onClick: handleExport,
      },
    ],
    [handleExport, isExporting]
  );

  const {
    isLoading,
    columns,
    data: response,
  } = useTable({
    columns: tableColumns,
    queryFn: getUsersList,
    queryKey: [queryKeys.users],
    rowActions,
    removeActionColumn: true,
  });

  return (
    <div>
      <PageHeader title="Users">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={response?.data} />
    </div>
  );
};

export default UsersList;
