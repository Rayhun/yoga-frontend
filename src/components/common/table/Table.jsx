'use client';
import { flexRender } from '@tanstack/react-table';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Spinner from '@/components/common/loader/Spinner';
import { setDefaultPageSize } from '@/utils/helpers';

const CustomTable = ({
  isLoading = false,
  table,
  pagination = {},
  showHeader = true,
  showFooter = true,
  showSearch = true,
  CustomFilters = null,
  /** Called with the row’s original record when a body row is clicked */
  onRowClick,
}) => {
  const { getHeaderGroups, getRowModel, getPageCount, getState, setGlobalFilter, setPageSize, setPageIndex } =
    table;

  const headerGroups = getHeaderGroups();
  const { rows } = getRowModel();
  const globalFilter = getState().globalFilter;
  const pageIndex = pagination.pageIndex;
  const pageSize = pagination.pageSize;
  const pagesCount = getPageCount();

  return (
    <section className="data-table-common data-table-two rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {showHeader ? (
        <div className="flex flex-col gap-4 border-b border-stroke px-4 py-4 dark:border-strokedark sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:gap-4">
            {showSearch ? (
              <div className="w-full sm:max-w-xs md:max-w-sm lg:w-100">
                <input
                  type="text"
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
                  className="w-full rounded-md border border-stroke px-5 py-2.5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                  placeholder="Search..."
                />
              </div>
            ) : null}
            {CustomFilters}
          </div>
         
          <div className="flex shrink-0 items-center font-medium text-sm">
            <select
              value={pageSize}
              onChange={e => {
                const newPageSize = Number(e.target.value);
                setPageSize(newPageSize);
                setDefaultPageSize(newPageSize);
              }}
              className="bg-transparent pl-2"
            >
              {[5, 10, 20, 50, 100].map(page => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
            <p className="pl-2 text-black dark:text-white">Per Page</p>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
      <table className="datatable-table w-full min-w-[640px] table-auto !border-collapse overflow-hidden break-words px-2 md:table-fixed md:overflow-auto md:px-4 lg:px-8">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr key={headerGroup.id} className="bg-[#F9FAFB] dark:bg-meta-4">
              {headerGroup.headers.map(header => {
                const canSort = header.column.getCanSort();
                const sortDir = header.column.getIsSorted();
                const toggleSort = header.column.getToggleSortingHandler();
                return (
                  <th
                    key={header.id}
                    className={header.column.columnDef.meta?.tableCellClassName ?? ''}
                    aria-sort={
                      !canSort
                        ? undefined
                        : sortDir === 'asc'
                          ? 'ascending'
                          : sortDir === 'desc'
                            ? 'descending'
                            : 'none'
                    }
                  >
                    <div
                      className={`flex items-center ${canSort ? 'cursor-pointer select-none rounded-md py-0.5 hover:bg-gray-200/80 dark:hover:bg-meta-4/80' : ''}`}
                      onClick={canSort ? toggleSort : undefined}
                      onKeyDown={
                        canSort
                          ? e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleSort(e);
                              }
                            }
                          : undefined
                      }
                      role={canSort ? 'button' : undefined}
                      tabIndex={canSort ? 0 : undefined}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}

                      {canSort ? (
                        <div
                          className={`ml-2 inline-flex flex-col space-y-[2px] ${
                            sortDir ? 'text-primary' : 'text-gray-400 dark:text-bodydark2'
                          }`}
                          aria-hidden
                        >
                          <span className="inline-block">
                            <svg
                              className={sortDir === 'asc' ? 'fill-primary' : 'fill-current'}
                              width="10"
                              height="5"
                              viewBox="0 0 10 5"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M5 0L0 5H10L5 0Z" fill="" />
                            </svg>
                          </span>
                          <span className="inline-block">
                            <svg
                              className={sortDir === 'desc' ? 'fill-primary' : 'fill-current'}
                              width="10"
                              height="5"
                              viewBox="0 0 10 5"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M5 5L10 0L-4.37114e-07 8.74228e-07L5 5Z" fill="" />
                            </svg>
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {isLoading ? (
            <tr style={{ height: pageSize * 50 }}>
              <td colSpan={table.getAllColumns().length}>
                <div className="flex justify-center">
                  <Spinner size={40} />
                </div>
              </td>
            </tr>
          ) : (
            <>
              {rows.length > 0 ? (
                rows.map(row => (
                  <tr
                    key={row.id}
                    tabIndex={onRowClick ? 0 : undefined}
                    role={onRowClick ? 'button' : undefined}
                    className={
                      onRowClick
                        ? 'cursor-pointer outline-none transition-colors hover:bg-[#F3F4F6] focus-visible:ring-2 focus-visible:ring-primary/40 dark:hover:bg-meta-4/70'
                        : undefined
                    }
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    onKeyDown={
                      onRowClick
                        ? e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onRowClick(row.original);
                            }
                          }
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className={cell.column.columnDef.meta?.tableCellClassName ?? ''}
                        onClick={
                          cell.column.columnDef.meta?.stopRowClick ? e => e.stopPropagation() : undefined
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr style={{ height: pageSize * 50 }}>
                  <td colSpan={table.getAllColumns().length}>
                    <div className="flex justify-center">No Records Found</div>
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
      </div>

      {showFooter ? (
        <div className="flex flex-col gap-3 border-t border-stroke px-4 py-4 dark:border-strokedark sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8 md:py-5">
          <p className="text-sm font-medium sm:text-base">
            Showing {pageIndex + 1} 0f {pagesCount} pages
          </p>
          <Pagination
            count={pagesCount}
            page={pageIndex + 1}
            onChange={(_, page) => setPageIndex(page - 1)}
            renderItem={item => <PaginationItem {...item} color="primary" className="dark:text-white" />}
          />
        </div>
      ) : null}
    </section>
  );
};

export default CustomTable;
