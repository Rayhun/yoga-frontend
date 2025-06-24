'use client';
import { useMemo } from 'react';
import { TableActions } from '@/components/common/table';
import { useQuery } from '@tanstack/react-query';
import useHandleApiResponse from './useHandleApiResponse';

function useTable({ columns = [], queryFn, queryKey, rowActions = [], removeActionColumn = false }) {
  const modifiedColumns = useMemo(
    () => [
      ...columns,
      ...(removeActionColumn
        ? []
        : [
            {
              id: 'action',
              header: 'Action',
              cell: ({ row }) => (
                <TableActions
                  row={row}
                  actions={rowActions}
                />
              ),
            },
          ]),
    ],
    [columns, removeActionColumn, rowActions]
  );

  const {
    isLoading,
    data: response,
    failureReason,
  } = useQuery({
    queryFn,
    queryKey,
  });

  useHandleApiResponse(failureReason);

  return { isLoading, columns: modifiedColumns, data: response?.data || [] };
}

export default useTable;
