'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport } from 'react-icons/bi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import useDelete from '@/hooks/useDelete';
import useImport from '@/hooks/useImport';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable, TableActions } from '@/components/common/table';
import {
  getExpertsList,
  getExpertsListRows,
  getExpertsListCount,
  deleteSingleExpert,
  importExperts,
  toggleExpertStatus,
  exportExpertsList,
} from '@/services/private/lms/expert';
import queryKeys from '@/utils/query-keys';
import Popup from '@/components/common/popup';
import ListFilters from './ListFilters';
import Button from '@/components/common/Button';
import { FiFilter, FiSearch } from 'react-icons/fi';
import useToggle from '@/hooks/useToggle';
import useConfirm from '@/hooks/useConfirm';
import { downloadBlobAsCsv, toastApiError, getDefaultPageSize } from '@/utils/helpers';
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';
import useHandleApiResponse from '@/hooks/useHandleApiResponse';

const SEARCH_DEBOUNCE_MS = 300;

const ExpertsList = () => {
  const router = useRouter();
  const [filters, setFilters] = useState({});
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: getDefaultPageSize(),
  });
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const { isOpen: isFilterModalOpen, toggle: toggleFilterModal } = useToggle();

  const offset = pagination.pageIndex * pagination.pageSize;

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

  const { isImporting, handleImport: handleImportExperts } = useImport({
    mutationFn: importExperts,
    invalidateQueryKey: [queryKeys.lmsExperts],
    onSuccess: () => toast.success('Experts imported successfully'),
  });
  const { handleDelete: handleDeleteExpert } = useDelete({
    mutationFn: deleteSingleExpert,
    invalidateQueryKey: [queryKeys.lmsExperts],
    onSuccess: () => toast.success('Expert deleted successfully'),
  });

  const { mutateAsync: toggleStatus } = useMutation({
    mutationFn: toggleExpertStatus,
  });

  const { mutateAsync: exportExperts } = useMutation({
    mutationFn: exportExpertsList,
  });

  const exportListParams = useMemo(() => {
    const q = debouncedSearch.trim();
    return {
      ...filters,
      ...(q ? { search: q } : {}),
    };
  }, [filters, debouncedSearch]);

  const handleExport = useCallback(
    async () => {
      try {
        await confirm({
          message: `Are you sure you want to export experts list?`,
        });

        const response = await exportExperts(exportListParams);
        downloadBlobAsCsv(response, 'expert_export.csv', 'Experts exported successfully');

        toast.success(`Experts exported successfully`);
      } catch (error) {
        if (error?.message !== 'cancel') {
          toastApiError(error);
        }
      }
    },
    [confirm, exportExperts, exportListParams]
  );

  const handleToggleStatus = useCallback(
    async selected => {
      const message = selected?.is_active
        ? 'Are you sure you want to deactive this expert?'
        : 'Are you sure you want to active this expert?';
      await confirm({
        message,
      })
        .then(async () => {
          await toggleStatus({ id: selected?.id });
          toast.success('Expert status updated successfully');

          await queryClient.invalidateQueries({ queryKey: [queryKeys.lmsExperts] });
        })
        .catch(error => {
          toastApiError(error);
        });
    },
    [confirm, toggleStatus, queryClient]
  );

  const tableColumns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'first_name',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'Active Status',
        accessorKey: 'is_active',
        cell: ({ row }) => (row?.original?.is_active ? 'Active' : 'Inactive'),
      },
      {
        header: 'Profile Completed',
        accessorKey: 'is_profile_completed',
        cell: ({ row }) => (row?.original?.is_profile_complete ? 'Yes' : 'No'),
      },
      {
        header: 'Coaching',
        accessorKey: 'is_profile_completed',
        cell: ({ row }) => (row?.original?.has_event_or_consult ? 'Yes' : 'No'),
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/lms/expert/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/lms/expert/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteExpert({ id: row.original.id }),
      },
      {
        id: 'active',
        Icon: BsToggleOff,
        render: row => !row?.original?.is_active,
        onClick: row => handleToggleStatus(row?.original),
      },
      {
        id: 'deactive',
        Icon: BsToggleOn,
        render: row => row?.original?.is_active,
        onClick: row => handleToggleStatus(row?.original),
      },
    ],
    [handleDeleteExpert, router, handleToggleStatus]
  );

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

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import',
        Icon: BiImport,
        label: 'Import',
        isLoading: isImporting,
        onClick: handleImportExperts,
      },
      { id: 'export', label: 'Export', onClick: handleExport },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Expert',
        onClick: () => router.push('/portal/admin/lms/expert/add'),
      },
    ],
    [handleImportExperts, isImporting, router, handleExport]
  );

  const listQueryParams = useMemo(() => {
    const q = debouncedSearch.trim();
    return {
      limit: pagination.pageSize,
      offset,
      ...filters,
      ...(q ? { search: q } : {}),
    };
  }, [pagination.pageSize, offset, filters, debouncedSearch]);

  const {
    data: expertsResponse,
    isLoading,
    failureReason,
  } = useQuery({
    queryFn: () => getExpertsList(listQueryParams),
    queryKey: [queryKeys.lmsExperts, listQueryParams],
  });

  useHandleApiResponse(failureReason);

  const data = getExpertsListRows(expertsResponse);
  const totalCount = getExpertsListCount(expertsResponse);
  const totalPages = Math.max(1, Math.ceil(totalCount / pagination.pageSize));

  const handleApplyFilter = values => {
    setFilters(values);
    setPagination(p => ({ ...p, pageIndex: 0 }));
    toggleFilterModal(false);
  };

  const handleReset = resetForm => {
    setFilters({});
    setPagination(p => ({ ...p, pageIndex: 0 }));
    resetForm();
    toggleFilterModal(false);
  };

  const hasActiveListFilters =
    Object.keys(filters).some(k => filters[k] !== '' && filters[k] !== null && filters[k] !== undefined) ||
    Boolean(debouncedSearch);

  const clearAllListFilters = () => {
    setFilters({});
    setSearchInput('');
    setDebouncedSearch('');
    setPagination(p => ({ ...p, pageIndex: 0 }));
  };

  const CustomFilters = (
    <div className="flex w-full min-w-0 flex-1 flex-wrap items-center gap-3">
      <div className="min-w-[200px] max-w-full flex-1">
        <TextField
          fullWidth
          size="small"
          placeholder="Search name, email, business, title…"
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
            my: 0,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            },
          }}
        />
      </div>
      <Button
        variant="outlined"
        onClick={toggleFilterModal}
        className="inline-flex h-10 shrink-0 items-center gap-2 px-4"
      >
        <FiFilter size={18} />
      </Button>
      {hasActiveListFilters && (
        <Button variant="outlined" onClick={clearAllListFilters} className="inline-flex h-10 shrink-0 px-4">
          Reset all
        </Button>
      )}
    </div>
  );

  return (
    <React.Fragment>
      <div>
        <PageHeader title="Experts">
          <PageHeaderQuickActions actions={headerQuickActions} />
        </PageHeader>

        <BasicTable
          isLoading={isLoading}
          columns={columns}
          data={data}
          CustomFilters={CustomFilters}
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
      <Popup heading="Experts List Filters" open={isFilterModalOpen} onClose={() => toggleFilterModal(false)}>
        <ListFilters
          filters={filters}
          onClose={() => toggleFilterModal(false)}
          onApplyFilter={handleApplyFilter}
          selected={filters}
          handleReset={handleReset}
        />
      </Popup>
    </React.Fragment>
  );
};

export default ExpertsList;
