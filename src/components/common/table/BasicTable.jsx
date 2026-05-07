'use client';
import { useState } from 'react';
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import CustomTable from './Table';
import { getDefaultPageSize } from '@/utils/helpers';

const BasicTable = ({ isLoading = false, columns = [], data = [], serverPagination = null, ...restProps }) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: getDefaultPageSize(),
  });

  const isServerPagination = Boolean(serverPagination?.enabled);
  const tablePagination = isServerPagination
    ? {
        pageIndex: serverPagination.pageIndex ?? 0,
        pageSize: serverPagination.pageSize ?? getDefaultPageSize(),
      }
    : pagination;

  const handlePaginationChange = updater => {
    if (!isServerPagination) {
      setPagination(updater);
      return;
    }

    const nextPagination =
      typeof updater === 'function' ? updater(tablePagination) : updater;
    serverPagination.onPaginationChange?.(nextPagination);
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: tablePagination,
    },
    onPaginationChange: handlePaginationChange,
    manualPagination: isServerPagination,
    pageCount: isServerPagination ? serverPagination.pageCount ?? -1 : undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return <CustomTable {...restProps} table={table} pagination={tablePagination} isLoading={isLoading} />;
};

export default BasicTable;
