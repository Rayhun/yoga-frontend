'use client';
import { useMemo } from 'react';
import { IndeterminateCheckbox, TableActions } from '@/components/common/table';
import { useQuery } from '@tanstack/react-query';

function useSelectionTable({ columns = [], queryFn, queryKey, rowActions = [] }) {
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
      ...columns,
      {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <TableActions
            actions={rowActions.map(action => ({
              ...action,
              onClick: () => action.onClick(row),
            }))}
          />
        ),
      },
    ],
    [columns, rowActions]
  );

  const { data: response } = useQuery({
    queryFn,
    queryKey,
  });

  return { columns: modifiedColumns, data: response?.data || [] };
}

export default useSelectionTable;
