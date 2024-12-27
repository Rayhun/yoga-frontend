'use client';
import { useMemo } from 'react';
import { IndeterminateCheckbox } from '@/components/common/table';
import useTable from './useTable';

function useSelectionTable({ columns = [], queryFn, queryKey, rowActions = [] }) {
  const { columns: tableColumns, data: tableData } = useTable({ columns, queryFn, queryKey, rowActions });

  const modifiedColumns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
          />
        ),
      },
      ...tableColumns,
    ],
    [tableColumns]
  );

  return { columns: modifiedColumns, data: tableData };
}

export default useSelectionTable;
