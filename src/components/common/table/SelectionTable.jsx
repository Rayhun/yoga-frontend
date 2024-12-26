'use client';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

const SelectionTable = ({ isLoading = false, columns = [], data = [], rowSelection, setRowSelection }) => {
  const {
    getHeaderGroups,
    getRowModel,
    getPageCount,
    getPageOptions,
    getState,
    setGlobalFilter,
    previousPage,
    nextPage,
    canPreviousPage,
    canNextPage,
  } = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });

  const globalFilter = getState().globalFilter;

  return (
    <section className="data-table-common data-table-two rounded-sm border border-stroke bg-white py-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex justify-between border-b border-stroke px-8 pb-4 dark:border-strokedark">
        <div className="w-100">
          <input
            type="text"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-full rounded-md border border-stroke px-5 py-2.5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
            placeholder="Search..."
          />
        </div>
      </div>

      <table className="datatable-table w-full table-auto !border-collapse overflow-hidden break-words px-4 md:table-fixed md:overflow-auto md:px-8">
        <thead>
          {getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="bg-[#F9FAFB] dark:bg-meta-4">
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between border-t border-stroke px-8 pt-5 dark:border-strokedark">
        <p className="font-medium">
          Showing {0 + 1} 0f {getPageCount()} pages
        </p>
        <div className="flex">
          <button
            className="flex cursor-pointer items-center justify-center rounded-md p-1 px-2 hover:bg-primary hover:text-whiter"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.1777 16.1156C12.009 16.1156 11.8402 16.0593 11.7277 15.9187L5.37148 9.44995C5.11836 9.19683 5.11836 8.80308 5.37148 8.54995L11.7277 2.0812C11.9809 1.82808 12.3746 1.82808 12.6277 2.0812C12.8809 2.33433 12.8809 2.72808 12.6277 2.9812L6.72148 8.99995L12.6559 15.0187C12.909 15.2718 12.909 15.6656 12.6559 15.9187C12.4871 16.0312 12.3465 16.1156 12.1777 16.1156Z"
                fill=""
              />
            </svg>
          </button>

          {getPageOptions().map((_page, index) => (
            <button
              key={index}
              onClick={() => {
                gotoPage(index);
              }}
              className={`${
                1 === index && 'bg-primary text-white'
              } mx-1 flex cursor-pointer items-center justify-center rounded-md p-1 px-3 hover:bg-primary hover:text-white`}
            >
              {index + 1}
            </button>
          ))}

          <button
            className="flex cursor-pointer items-center justify-center rounded-md p-1 px-2 hover:bg-primary hover:text-white"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.82148 16.1156C5.65273 16.1156 5.51211 16.0593 5.37148 15.9468C5.11836 15.6937 5.11836 15.3 5.37148 15.0468L11.2777 8.99995L5.37148 2.9812C5.11836 2.72808 5.11836 2.33433 5.37148 2.0812C5.62461 1.82808 6.01836 1.82808 6.27148 2.0812L12.6277 8.54995C12.8809 8.80308 12.8809 9.19683 12.6277 9.44995L6.27148 15.9187C6.15898 16.0312 5.99023 16.1156 5.82148 16.1156Z"
                fill=""
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SelectionTable;
