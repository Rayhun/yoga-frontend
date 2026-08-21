'use client';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport, BiExport } from 'react-icons/bi';
import { FiFilter, FiSearch, FiRefreshCw } from 'react-icons/fi';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { useMutation, useQuery } from '@tanstack/react-query';
import useDelete from '@/hooks/useDelete';
import useImport from '@/hooks/useImport';
import useConfirm from '@/hooks/useConfirm';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable, TableActions } from '@/components/common/table';
import {
  getTagsList,
  getTagFilterOptions,
  deleteSingleTag,
  importTags,
  exportTags,
} from '@/services/private/lms/tag';
import queryKeys from '@/utils/query-keys';
import { downloadBlobAsCsv, toastApiError } from '@/utils/helpers';
import { getDefaultPageSize } from '@/utils/helpers';

const SEARCH_DEBOUNCE_MS = 250;

const TagsList = () => {
  const router = useRouter();
  const confirm = useConfirm();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: getDefaultPageSize() });
  const [filters, setFilters] = useState({
    namespace: '',
    canonical_tag: '',
    status: '',
  });
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

  const offset = pagination.pageIndex * pagination.pageSize;

  const { isImporting, handleImport: handleImportTags } = useImport({
    mutationFn: importTags,
    invalidateQueryKey: [queryKeys.lmsTags],
    onSuccess: () => toast.success('Tags imported successfully'),
  });
  const { handleDelete: handleDeleteTag } = useDelete({
    mutationFn: deleteSingleTag,
    invalidateQueryKey: [queryKeys.lmsTags],
    onSuccess: () => toast.success('Tag deleted successfully'),
    getConfirmOptions: ({ label, namespace_label: nsLabel, namespace }) => {
      const ns = nsLabel || namespace || '—';
      return {
        heading: 'Delete tag?',
        message: `You are about to delete "${label ?? 'this tag'}" under namespace "${ns}". Associated aliases may be removed. This cannot be undone.`,
      };
    },
  });

  const { mutateAsync: exportTagsFn, isPending: isExporting } = useMutation({ mutationFn: exportTags });
  const handleExport = useCallback(async () => {
    try {
      await confirm({ message: 'Export tags?' });
      const response = await exportTagsFn();
      downloadBlobAsCsv(response, 'tags_export.csv');
      toast.success('Tags exported successfully');
    } catch (e) {
      if (e?.message !== 'cancel') toastApiError(e);
    }
  }, [confirm, exportTagsFn]);

  const tableColumns = useMemo(
    () => [
      {
        header: 'Namespace',
        accessorKey: 'namespace_label',
        cell: ({ row }) => row?.original?.namespace_label || row?.original?.namespace || '—',
      },
      {
        header: 'Canonical Tag',
        accessorKey: 'label',
        cell: ({ row }) => row?.original?.label || '—',
      },
      {
        header: 'Alias',
        accessorKey: 'alias',
      },
      {
        header: 'Status',
        cell: ({ row }) => (row?.original?.is_active ? 'Active' : 'Inactive'),
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/lms/tag/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/lms/tag/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row =>
          handleDeleteTag({
            id: row.original.id,
            label: row.original.label,
            namespace_label: row.original.namespace_label,
            namespace: row.original.namespace,
          }),
      },
    ],
    [handleDeleteTag, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import',
        Icon: BiImport,
        label: 'Import',
        isLoading: isImporting,
        onClick: handleImportTags,
      },
      {
        id: 'export',
        Icon: BiExport,
        label: 'Export',
        isLoading: isExporting,
        onClick: handleExport,
      },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Tag',
        onClick: () => router.push('/portal/admin/lms/tag/add'),
      },
    ],
    [handleImportTags, handleExport, isImporting, isExporting, router]
  );

  const {
    data: response,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () =>
      getTagsList({ limit: pagination.pageSize, offset, ...filters, search: debouncedSearch }),
    queryKey: [queryKeys.lmsTags, pagination.pageSize, offset, filters, debouncedSearch],
  });

  const { data: filterOptionsResponse } = useQuery({
    queryFn: () => getTagFilterOptions({ namespace: filters.namespace }),
    queryKey: [queryKeys.lmsTags, 'filter-options', filters.namespace],
    staleTime: 60_000,
  });

  useHandleApiResponse(failureReason);

  const data = response?.data?.data?.results || [];
  const totalCount = response?.data?.data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pagination.pageSize));

  const filterOptions = filterOptionsResponse?.data?.data || {};
  const namespaceFilterOptions = useMemo(
    () =>
      (filterOptions.namespaces || []).map(item => ({
        label: item.label || item.value,
        value: item.value,
      })),
    [filterOptions.namespaces]
  );

  const canonicalFilterOptions = useMemo(
    () =>
      (filterOptions.canonical_tags || []).map(item => ({
        label: item.label || item.value,
        value: item.value,
        namespace: item.namespace,
      })),
    [filterOptions.canonical_tags]
  );
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

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
      <PageHeader title="Tags">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <div className="mb-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 px-4 py-3 dark:border-strokedark dark:from-boxdark dark:via-boxdark dark:to-meta-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-white">
            <FiFilter className="text-emerald-600" />
            Smart Filters
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4"
            onClick={() => {
              setPagination(prev => ({ ...prev, pageIndex: 0 }));
              setFilters({
                namespace: '',
                canonical_tag: '',
                status: '',
              });
              setSearchInput('');
              setDebouncedSearch('');
            }}
          >
            <FiRefreshCw size={13} />
            Clear
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Search</p>
            <TextField
              fullWidth
              placeholder="Namespace, tag, label, alias"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch size={18} className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Namespace</p>
            <Autocomplete
              options={namespaceFilterOptions}
              getOptionLabel={option => option?.label ?? ''}
              isOptionEqualToValue={(option, value) => option?.value === value?.value}
              value={
                filters.namespace
                  ? namespaceFilterOptions.find(o => o.value === filters.namespace) || {
                      label: filters.namespace,
                      value: filters.namespace,
                    }
                  : null
              }
              onChange={(_, selected) => {
                setPagination(prev => ({ ...prev, pageIndex: 0 }));
                setFilters(prev => ({
                  ...prev,
                  namespace: selected?.value || '',
                  canonical_tag: '',
                }));
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  placeholder="All Namespaces"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
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

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Canonical Tag</p>
            <Autocomplete
              options={canonicalFilterOptions}
              getOptionLabel={option => option?.label ?? ''}
              isOptionEqualToValue={(option, value) => option?.value === value?.value}
              value={
                filters.canonical_tag
                  ? canonicalFilterOptions.find(o => o.value === filters.canonical_tag) || {
                      label: filters.canonical_tag,
                      value: filters.canonical_tag,
                    }
                  : null
              }
              onChange={(_, selected) => {
                setPagination(prev => ({ ...prev, pageIndex: 0 }));
                setFilters(prev => ({ ...prev, canonical_tag: selected?.value || '' }));
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  placeholder="All Canonical Tags"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
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

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p>
            <Autocomplete
              options={statusOptions}
              value={statusOptions.find(option => option.value === filters.status) || null}
              onChange={(_, selected) => {
                setPagination(prev => ({ ...prev, pageIndex: 0 }));
                setFilters(prev => ({ ...prev, status: selected?.value || '' }));
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  placeholder="All Status"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
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
          onPaginationChange: next => {
            setPagination(next);
          },
        }}
      />
    </div>
  );
};

export default TagsList;
