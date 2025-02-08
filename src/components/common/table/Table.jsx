'use client';
import { flexRender } from '@tanstack/react-table';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Spinner from '@/components/common/loader/Spinner';

const CustomTable = ({ isLoading = false, table, pagination = {}, showHeader = true, showFooter = true }) => {
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
        <div className="flex justify-between border-b border-stroke px-8 py-4 dark:border-strokedark">
          <div className="w-100">
            <input
              type="text"
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full rounded-md border border-stroke px-5 py-2.5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
              placeholder="Search..."
            />
          </div>

          <div className="flex items-center font-medium">
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className="bg-transparent pl-2"
            >
              {[5, 10, 20, 50].map(page => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
            <p className="pl-2 text-black dark:text-white">Entries Per Page</p>
          </div>
        </div>
      ) : null}

      <table className="datatable-table w-full table-auto !border-collapse overflow-hidden break-words px-4 md:table-fixed md:overflow-auto md:px-8 !h-[300px]">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr key={headerGroup.id} className="bg-[#F9FAFB] dark:bg-meta-4">
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  <div className="flex items-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}

                    {header.column.getCanSort() ? (
                      <div
                        className="ml-2 inline-flex flex-col space-y-[2px] cursor-pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className="inline-block">
                          <svg
                            className="fill-current"
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
                            className="fill-current"
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
              ))}
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
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
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

      {showFooter ? (
        <div className="flex justify-between border-t border-stroke px-8 py-5 dark:border-strokedark">
          <p className="font-medium">
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
