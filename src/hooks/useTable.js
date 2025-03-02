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
                  actions={rowActions.map(action => ({
                    ...action,
                    onClick: () => action.onClick(row),
                  }))}
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
