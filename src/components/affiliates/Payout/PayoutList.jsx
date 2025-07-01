'use client';
import React, { useMemo, useCallback, useState } from 'react';

import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import queryKeys from '@/utils/query-keys';

import { updatePayoutStatus } from '@/services/private/affiliates/payout';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { toastApiError } from '@/utils/helpers';
import useConfirm from '@/hooks/useConfirm';
import { exportPayoutList, getPayoutList } from '@/services/private/affiliates/payout';
import { FaRegCircleCheck, FaRegCircleXmark } from 'react-icons/fa6';
import ListFilter from './ListFilters';
import Popup from '@/components/common/popup';
import useToggle from '@/hooks/useToggle';
import Button from '@/components/common/Button';
import { FiFilter } from 'react-icons/fi';

const PayoutList = () => {
  const [filters, setFilters] = useState({});
  const confirm = useConfirm();
  const { isOpen: isFilterModalOpen, toggle: toggleFilterModal } = useToggle();

  const { mutateAsync: updateStatus } = useMutation({
    mutationFn: updatePayoutStatus,
  });

  const { mutateAsync: exportPayouts } = useMutation({
    mutationFn: exportPayoutList,
  });
  const queryClient = useQueryClient();

  const tableColumns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Email',
        accessorKey: 'affiliate',
      },
      {
        header: 'Total Earning',
        accessorKey: 'commission_amount',
      },
      {
        header: 'Status',
        accessorKey: 'status',
      },
    ],
    []
  );

  const handleUpdateStatus = useCallback(
    async (selectedId, status) => {
      await confirm({
        message: `Are you sure you want to ${status} this payout?`,
      })
        .then(async () => {
          await updateStatus({ payload: { status, commission_id: selectedId } });
          toast.success(`Payout ${status} successfully`);

          await queryClient.invalidateQueries([
            {
              queryKey: [queryKeys.payoutList],
            },
          ]);
        })
        .catch(error => {
          toastApiError(error);
        });
    },
    [confirm, queryClient, updateStatus]
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'approved',
        render: row => row?.original?.status === 'Pending',
        Icon: FaRegCircleCheck,
        onClick: row => handleUpdateStatus(row?.original?.id, 'Approved'),
      },
      {
        id: 'declined',
        render: row => row?.original?.status === 'Pending',
        Icon: FaRegCircleXmark,
        onClick: row => handleUpdateStatus(row?.original?.id, 'Declined'),
      },
    ],
    [handleUpdateStatus]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: () => getPayoutList(filters),
    queryKey: [queryKeys.payoutList, JSON.stringify(filters)],
    rowActions,
  });

  const handleExport = useCallback(
    async (selectedId, status) => {
      try {
        await confirm({
          message: `Are you sure you want to export payout list?`,
        });

        const response = await exportPayouts(
          { id: selectedId, status },
          {
            responseType: 'blob',
          }
        );

        const blob = new Blob([response.data], {
          type: response.headers['content-type'] || 'application/octet-stream',
        });
        const url = window.URL.createObjectURL(blob);

        const disposition = response.headers['content-disposition'];
        let filename = 'payouts';
        if (disposition) {
          const match = disposition.match(/filename="?(.+)"?/);
          if (match) filename = match[1];
        }
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success(`Payout exported successfully`);
      } catch (error) {
        if (error?.message !== 'cancel') {
          toastApiError(error);
        }
      }
    },
    [confirm, exportPayouts]
  );

  const headerQuickActions = useMemo(
    () => [
      { id: 'import', label: 'Import', onClick: () => console.log('Handle import list'), disabled: true },
      { id: 'export', label: 'Export', onClick: handleExport },
    ],
    [handleExport]
  );

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
        <PageHeader title="Payout List">
          <PageHeaderQuickActions actions={headerQuickActions} />
        </PageHeader>

        <BasicTable
          isLoading={isLoading}
          columns={columns}
          data={data?.data || []}
          CustomFilters={CustomFilters}
        />
      </div>
      <Popup heading="Payout List Filters" open={isFilterModalOpen} onClose={() => toggleFilterModal()}>
        <ListFilter filters={filters} onApplyFilter={handleApplyFilter} selected={filters} handleReset={handleReset} />
      </Popup>
    </React.Fragment>
  );
};

export default PayoutList;
