'use client';
import React, { useMemo, useState, useCallback } from 'react';
import { BsPersonCheck, BsPersonX } from 'react-icons/bs';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useTable from '@/hooks/useTable';
import { PageHeader } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import queryKeys from '@/utils/query-keys';
import useConfirm from '@/hooks/useConfirm';
import { toastApiError } from '@/utils/helpers';
import { approveApplication, getApplicationsList, rejectApplication } from '@/services/private/certification/applications';
import RejectApplicationModal from './RejectApplicationModal';
import ApplicationReviewDrawer from './ApplicationReviewDrawer';

// List endpoint filters by 'qte'/'institution'; approve/reject URLs use 'expert'/'institution'
// as the type segment (Expert model backs QTE applications) — mapped here at the call sites.
const TABS = [
  { key: 'qte', label: 'Qualified Teaching Experts (QTE)', actionType: 'expert' },
  { key: 'institution', label: 'Institutions', actionType: 'institution' },
];

const STATUS_FILTERS = ['submitted', 'under_review', 'approved', 'rejected'];

const ApplicationReviewTable = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [viewedApplication, setViewedApplication] = useState(null);
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const { mutateAsync: approveMutate } = useMutation({ mutationFn: approveApplication });
  const { mutateAsync: rejectMutate } = useMutation({ mutationFn: rejectApplication });

  const invalidateList = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [queryKeys.certificationApplicationsList] }),
    [queryClient]
  );

  const handleApprove = useCallback(
    async row => {
      await confirm({ message: 'Approve this application?' })
        .then(async () => {
          await approveMutate({ type: activeTab.actionType, id: row.id });
          toast.success('Application approved');
          await invalidateList();
          setViewedApplication(null);
        })
        .catch(error => {
          if (error?.response) toastApiError(error);
        });
    },
    [confirm, approveMutate, activeTab, invalidateList]
  );

  const handleOpenReject = useCallback(row => {
    setViewedApplication(null);
    setRejectTarget(row);
  }, []);

  const handleRejectSubmit = async (values, { setSubmitting }) => {
    try {
      await rejectMutate({ type: activeTab.actionType, id: rejectTarget.id, payload: values });
      toast.success('Application rejected');
      await invalidateList();
      setRejectTarget(null);
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const isQTE = activeTab.key === 'qte';

  const tableColumns = useMemo(
    () =>
      isQTE
        ? [
            { header: 'Name', accessorKey: 'first_name' },
            { header: 'Email', accessorKey: 'email' },
            { header: 'Country', accessorKey: 'country' },
            { header: 'Status', accessorKey: 'application_status' },
          ]
        : [
            { header: 'Organization', accessorKey: 'legal_organization_name' },
            { header: 'Email', accessorKey: 'email' },
            { header: 'Country', accessorKey: 'country' },
            { header: 'Status', accessorKey: 'application_status' },
          ],
    [isQTE]
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => setViewedApplication(row?.original),
      },
      {
        id: 'approve',
        render: row => ['submitted', 'under_review'].includes(row?.original?.application_status),
        Icon: BsPersonCheck,
        onClick: row => handleApprove(row?.original),
      },
      {
        id: 'reject',
        render: row => ['submitted', 'under_review'].includes(row?.original?.application_status),
        Icon: BsPersonX,
        onClick: row => handleOpenReject(row?.original),
      },
    ],
    [handleApprove, handleOpenReject]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: () => getApplicationsList({ type: activeTab.key, status: statusFilter }),
    queryKey: [queryKeys.certificationApplicationsList, activeTab.key, statusFilter],
    rowActions,
  });

  return (
    <React.Fragment>
      <div>
        <PageHeader title="Certification Applications" />

        <div className="flex gap-2 mb-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab.key === tab.key ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize ${
                statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <BasicTable isLoading={isLoading} columns={columns} data={data || []} />
      </div>

      <RejectApplicationModal
        show={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onSubmit={handleRejectSubmit}
      />

      <ApplicationReviewDrawer
        application={viewedApplication}
        applicationType={activeTab.key}
        onClose={() => setViewedApplication(null)}
        onApprove={handleApprove}
        onReject={handleOpenReject}
      />
    </React.Fragment>
  );
};

export default ApplicationReviewTable;
