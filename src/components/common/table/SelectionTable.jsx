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

const SelectionTable = ({
  isLoading = false,
  columns = [],
  data = [],
  rowSelection = {},
  setRowSelection = () => null,
}) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: getDefaultPageSize(),
  });
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return <CustomTable table={table} pagination={pagination} isLoading={isLoading} />;
};

export default SelectionTable;
