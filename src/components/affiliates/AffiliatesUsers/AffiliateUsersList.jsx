'use client';
import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BsPersonCheck, BsPersonX } from 'react-icons/bs';
import { BiImport } from 'react-icons/bi';
import { IoMdDownload } from 'react-icons/io';

import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import queryKeys from '@/utils/query-keys';
import { MdOutlineRemoveRedEye, MdOutlineEdit } from 'react-icons/md';

import {
  approveAffiliateUser,
  exportAffiliateUsers,
  getAffiliatesUsersList,
  importAffiliateUsers,
} from '@/services/private/affiliates/users';
import ApproveAffiliateForm from './ApproveAffiliateForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { downloadBlobAsCsv, toastApiError } from '@/utils/helpers';
import useConfirm from '@/hooks/useConfirm';
import useImport from '@/hooks/useImport';

const AffiliateUsersList = () => {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [selectedUser, setSelectedUser] = useState();
  const confirm = useConfirm();

  const queryClient = useQueryClient();

  const { mutateAsync: approveUser } = useMutation({
    mutationFn: approveAffiliateUser,
  });
  const { mutateAsync: exportAffiliates } = useMutation({
    mutationFn: exportAffiliateUsers,
  });
  const { isImporting, handleImport: handleImportAffiliates } = useImport({
    mutationFn: importAffiliateUsers,
    invalidateQueryKey: [queryKeys.affiliateUsers],
    onSuccess: () => toast.success('Affiliate users imported successfully'),
  });

  const handleExport = useCallback(async () => {
    try {
      await confirm({
        message: 'Are you sure you want to export affiliate users list?',
      });
      const response = await exportAffiliates();
      downloadBlobAsCsv(response, 'affiliateuser_export.csv', 'Affiliate users exported successfully');
      toast.success('Affiliate users exported successfully');
    } catch (error) {
      if (error?.message !== 'cancel') {
        toastApiError(error);
      }
    }
  }, [confirm, exportAffiliates]);

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
        header: 'Type',
        accessorKey: 'commission_type_name',
      },
      {
        header: 'Total Earning',
        accessorKey: 'total_earning',
      },
      {
        header: 'Country',
        accessorKey: 'country',
      },
      {
        header: 'Status',
        accessorKey: 'status',
      },
    ],
    []
  );

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const isReapproval = selectedUser?.status === 'Declined';
      await approveUser({ payload: { ...values, id: selected } });
      toast.success(
        isReapproval ? 'Affiliate re-approved successfully' : 'Affiliate user approved successfully'
      );

      await queryClient.invalidateQueries([
        {
          queryKey: [queryKeys.affiliateUsers],
        },
      ]);
      handleCloseApproval();
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = useCallback(
    async (selectedId, { isDisapproval = false } = {}) => {
      try {
        await confirm({
          heading: isDisapproval ? 'Disapprove affiliate?' : 'Decline affiliate?',
          message: isDisapproval
            ? 'Are you sure you want to disapprove this affiliate? They will lose access to the affiliate portal.'
            : 'Are you sure you want to decline this affiliate user?',
        });
        await approveUser({ payload: { status: 'Declined', id: selectedId } });
        toast.success(isDisapproval ? 'Affiliate disapproved successfully' : 'Affiliate user declined');

        await queryClient.invalidateQueries([
          {
            queryKey: [queryKeys.affiliateUsers],
          },
        ]);
      } catch (error) {
        if (error?.message !== 'User cancelled') {
          toastApiError(error);
        }
      }
    },
    [confirm, approveUser, queryClient]
  );

  const handleApprove = useCallback(user => {
    setSelectedUser(user);
    setSelected(user.id);
  }, []);

  const handleEdit = useCallback(user => {
    setSelectedUser(user);
    setSelected(user.id);
  }, []);

  const rowActions = useMemo(
    () => [
      {
        id: 'approve',
        render: row => ['Pending', 'Declined'].includes(row?.original?.status),
        Icon: BsPersonCheck,
        onClick: row => handleApprove(row?.original),
      },
      {
        id: 'decline',
        render: row => row?.original?.status === 'Pending',
        Icon: BsPersonX,
        onClick: row => handleDecline(row?.original?.id),
      },
      {
        id: 'disapprove',
        render: row => row?.original?.status === 'Approved',
        Icon: BsPersonX,
        onClick: row => handleDecline(row?.original?.id, { isDisapproval: true }),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/affiliates/users/${row?.original?.id}/details`),
      },
      {
        id: 'edit',
        render: row => row?.original?.status === 'Approved',
        Icon: MdOutlineEdit,
        onClick: row => handleEdit(row?.original),
      },
    ],
    [handleApprove, handleDecline, router, handleEdit]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getAffiliatesUsersList,
    queryKey: [queryKeys.affiliateUsers],
    rowActions,
  });

  const handleCloseApproval = () => {
    setSelected(null);
    setSelectedUser(undefined);
  };
  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import',
        Icon: BiImport,
        label: 'Import',
        isLoading: isImporting,
        onClick: handleImportAffiliates,
      },
      {
        id: 'export',
        Icon: IoMdDownload,
        label: 'Export',
        onClick: handleExport,
      },
    ],
    [handleExport, handleImportAffiliates, isImporting]
  );

  return (
    <React.Fragment>
      <div>
        <PageHeader title="Affiliates Users">
          <PageHeaderQuickActions actions={headerQuickActions} />
        </PageHeader>

        <BasicTable isLoading={isLoading} columns={columns} data={data || []} />
      </div>
      <ApproveAffiliateForm
        show={!!selected}
        selected={selectedUser}
        onClose={handleCloseApproval}
        handleSubmit={handleSubmit}
      />
    </React.Fragment>
  );
};

export default AffiliateUsersList;
