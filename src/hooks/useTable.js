'use client';
import { useMemo } from 'react';
import { TableActions } from '@/components/common/table';
import { useQuery } from '@tanstack/react-query';

function useTable({ columns = [], queryFn, queryKey, rowActions = [] }) {
  const modifiedColumns = useMemo(
    () => [
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

  const { isLoading, data: response } = useQuery({
    queryFn,
    queryKey,
  });

  return { isLoading, columns: modifiedColumns, data: response?.data || [] };
}

export default useTable;
