'use client';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import useDelete from '@/hooks/useDelete';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable, TableActions } from '@/components/common/table';
import {
  deleteOnboardingV2Question,
  getOnboardingV2QuestionsList,
} from '@/services/private/onboarding/quiz-v2';
import queryKeys from '@/utils/query-keys';
import { getDefaultPageSize } from '@/utils/helpers';

const SEARCH_DEBOUNCE_MS = 250;

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const OnboardingQuizList = () => {
  const router = useRouter();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: getDefaultPageSize() });
  const offset = pagination.pageIndex * pagination.pageSize;
  const [filters, setFilters] = useState({ status: '' });
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      setDebouncedSearch(prev => {
        if (prev !== next) {
          setPagination(p => ({ ...p, pageIndex: 0 }));
        }
        return next;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { handleDelete: handleDeleteQuestion } = useDelete({
    mutationFn: deleteOnboardingV2Question,
    invalidateQueryKey: [queryKeys.onboardingQuizV2],
    onSuccess: () => toast.success('Step deleted successfully'),
    getConfirmOptions: ({ key, tag_text: tagText }) => ({
      heading: 'Delete onboarding step?',
      message: `You are about to delete "${key ?? 'this step'}"${tagText ? ` (${tagText})` : ''}. All variants and options for this step will be removed. This cannot be undone.`,
    }),
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Key',
        accessorKey: 'key',
      },
      {
        header: 'Tag',
        accessorKey: 'tag_text',
      },
      {
        header: 'Sets key',
        accessorKey: 'sets_key',
      },
      {
        header: 'Order',
        accessorKey: 'order',
      },
      {
        header: 'Active',
        cell: ({ row }) => (row.original.is_active ? 'Yes' : 'No'),
      },
      {
        header: 'Variants',
        cell: ({ row }) => row.original.variants?.length ?? 0,
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/onboarding/quiz/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/onboarding/quiz/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row =>
          handleDeleteQuestion({
            id: row.original.id,
            key: row.original.key,
            tag_text: row.original.tag_text,
          }),
      },
    ],
    [handleDeleteQuestion, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add step',
        onClick: () => router.push('/portal/admin/onboarding/quiz/add'),
      },
    ],
    [router]
  );

  const {
    data: axiosResponse,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () =>
      getOnboardingV2QuestionsList({
        limit: pagination.pageSize,
        offset,
        search: debouncedSearch,
        status: filters.status,
      }),
    queryKey: [
      queryKeys.onboardingQuizV2,
      pagination.pageSize,
      offset,
      debouncedSearch,
      filters.status,
    ],
  });

  useHandleApiResponse(failureReason);

  const payload = axiosResponse?.data?.data;
  const data = payload?.results ?? [];
  const totalCount = payload?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pagination.pageSize));

  const columns = useMemo(
    () => [
      ...tableColumns,
      {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => <TableActions row={row} actions={rowActions} />,
      },
    ],
    [rowActions, tableColumns]
  );

  return (
    <div>
      <PageHeader title="Onboarding steps">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <div className="mb-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-teal-50 via-white to-emerald-50/80 px-4 py-3 dark:border-strokedark dark:from-meta-4 dark:via-boxdark dark:to-boxdark">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-white">
            <FiFilter className="text-teal-600" />
            Filters
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4"
            onClick={() => {
              setPagination(prev => ({ ...prev, pageIndex: 0 }));
              setFilters({ status: '' });
              setSearchInput('');
              setDebouncedSearch('');
            }}
          >
            <FiRefreshCw size={13} />
            Clear
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-bodydark2">
              Search
            </p>
            <TextField
              fullWidth
              placeholder="Key, tag, sets key, branch rule"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              InputProps={{
                sx: { borderRadius: '12px' },
              }}
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-bodydark2">
              Status
            </p>
            <Autocomplete
              options={STATUS_OPTIONS}
              value={STATUS_OPTIONS.find(o => o.value === filters.status) || null}
              onChange={(_, selected) => {
                setPagination(prev => ({ ...prev, pageIndex: 0 }));
                setFilters(prev => ({ ...prev, status: selected?.value || '' }));
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  placeholder="All steps"
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                  }}
                />
              )}
              slotProps={{
                paper: {
                  elevation: 4,
                  sx: {
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                    borderWidth: '2px',
                    borderColor: '#e2e8f0',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <BasicTable
        isLoading={isLoading}
        columns={columns}
        data={data}
        showSearch={false}
        serverPagination={{
          enabled: true,
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          pageCount: totalPages,
          onPaginationChange: next => setPagination(next),
        }}
      />
    </div>
  );
};

export default OnboardingQuizList;
