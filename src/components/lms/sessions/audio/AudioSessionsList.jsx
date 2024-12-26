'use client';
import { useMemo, useState } from 'react';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import useSelectionTable from '@/hooks/useSelectionTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { SelectionTable } from '@/components/common/table';
import queryKeys from '@/utils/query-keys';

const AudioSessionsList = () => {
  const [rowSelection, setRowSelection] = useState({});

  const tableColumns = useMemo(
    () => [
      {
        header: 'First Name',
        accessorKey: 'firstName',
        cell: info => info.getValue(),
      },
      {
        header: 'Last Name',
        accessorKey: 'lastName',
        cell: info => info.getValue(),
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
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Audio Session',
        onClick: () => null,
      },
    ],
    []
  );

  const { columns, data } = useSelectionTable({
    columns: tableColumns,
    queryFn: () =>
      Promise.resolve({
        data: [
          {
            firstName: 'John',
            lastName: 'Doe',
            age: 35,
            visits: 10,
            progress: 90,
            status: 'single',
          },
          {
            firstName: 'Albert',
            lastName: 'Tim',
            age: 32,
            visits: 30,
            progress: 70,
            status: 'married',
          },
        ],
      }),
    queryKey: [queryKeys.quizes],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Audio Sessions">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <SelectionTable
        isLoading={false}
        columns={columns}
        data={data}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  );
};

export default AudioSessionsList;
