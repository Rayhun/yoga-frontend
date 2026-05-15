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
  const [sorting, setSorting] = useState([]);
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
      sorting,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return <CustomTable table={table} pagination={pagination} isLoading={isLoading} />;
};

export default SelectionTable;
