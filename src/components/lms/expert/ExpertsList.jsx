'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport } from 'react-icons/bi';
import useDelete from '@/hooks/useDelete';
import useImport from '@/hooks/useImport';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getExpertsList, deleteSingleExpert, importExperts, toggleExpertStatus } from '@/services/private/lms/expert';
import queryKeys from '@/utils/query-keys';
import Popup from '@/components/common/popup';
import ListFilters from './ListFilters';
import Button from '@/components/common/Button';
import { FiFilter } from 'react-icons/fi';
import useToggle from '@/hooks/useToggle';
import useConfirm from '@/hooks/useConfirm';
import { toastApiError } from '@/utils/helpers';
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { useMutation, useQueryClient } from '@tanstack/react-query';


const ExpertsList = () => {
  const router = useRouter();
  const [filters, setFilters] = useState({});
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const { isOpen: isFilterModalOpen, toggle: toggleFilterModal } = useToggle();

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

  const handleExport = useCallback(
    async (selectedId, status) => {
      try {
        await confirm({
          message: `Are you sure you want to export experts list?`,
        });

        // const response = await exportPayouts(
        //   { id: selectedId, status },
        //   {
        //     responseType: 'blob',
        //   }
        // );

        // const blob = new Blob([response.data], {
        //   type: response.headers['content-type'] || 'application/octet-stream',
        // });
        // const url = window.URL.createObjectURL(blob);

        // const disposition = response.headers['content-disposition'];
        // let filename = 'payouts';
        // if (disposition) {
        //   const match = disposition.match(/filename="?(.+)"?/);
        //   if (match) filename = match[1];
        // }
        // const link = document.createElement('a');
        // link.href = url;
        // link.download = filename;
        // document.body.appendChild(link);
        // link.click();

        // link.remove();
        // window.URL.revokeObjectURL(url);

        // toast.success(`Payout exported successfully`);
      } catch (error) {
        if (error?.message !== 'cancel') {
          toastApiError(error);
        }
      }
    },
    [confirm]
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

          await queryClient.invalidateQueries([queryKeys.lmsExperts, JSON.stringify(filters)]);
        })
        .catch(error => {
          toastApiError(error);
        });
    },
    [confirm, toggleStatus, queryClient, filters]
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
        cell: ({row}) => row?.original?.is_active ? 'Active' : 'Inactive',
      },
      {
        header: 'Profile Completed',
        accessorKey: 'is_profile_completed',
        cell: ({row}) => row?.original?.is_profile_complete ? 'Yes' : 'No',
      },
      {
        header: 'Coaching/Consutation',
        accessorKey: 'is_profile_completed',
        cell: ({row}) => row?.original?.has_event_or_consult ? 'Yes' : 'No',
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

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import',
        Icon: BiImport,
        label: 'Import',
        isLoading: isImporting,
        onClick: handleImportExperts,
      },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Expert',
        onClick: () => router.push('/portal/admin/lms/expert/add'),
      },
      // { id: 'export', label: 'Export', onClick: handleExport },
    ],
    [handleImportExperts, isImporting, router, handleExport]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: () => getExpertsList(filters),
    queryKey: [queryKeys.lmsExperts, JSON.stringify(filters)],
    rowActions,
  });

  const handleApplyFilter = values => {
    setFilters(values);
    toggleFilterModal(false);
  };

  const handleReset = resetForm => {
    setFilters({})
    resetForm();
    toggleFilterModal()
  };
  

  const CustomFilters = (
    <React.Fragment>
      <Button variant="outlined" onClick={toggleFilterModal} className="flex items-center gap-2">
        <FiFilter size={18} />
      </Button>
      {Object.keys(filters).length > 0 && (
        <Button variant="outlined" onClick={() => setFilters({})} className="flex items-center gap-2">
          Reset
        </Button>
      )}
    </React.Fragment>
  );

  return (
    <React.Fragment>
    <div>
      <PageHeader title="Experts">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} CustomFilters={CustomFilters} />
    </div>
    <Popup heading="Experts List Filters" open={isFilterModalOpen} onClose={() => toggleFilterModal()}>
        <ListFilters filters={filters} onApplyFilter={handleApplyFilter} selected={filters} handleReset={handleReset} />
      </Popup>
    </React.Fragment>
  );
};

export default ExpertsList;
