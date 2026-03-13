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

const BasicTable = ({ isLoading = false, columns = [], data = [], ...restProps }) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: getDefaultPageSize(),
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return <CustomTable {...restProps} table={table} pagination={pagination} isLoading={isLoading} />;
};

export default BasicTable;
