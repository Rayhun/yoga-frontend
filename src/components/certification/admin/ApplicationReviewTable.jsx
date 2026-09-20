'use client';
import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BsPersonCheck, BsToggleOff, BsToggleOn, BsTrash, BsXCircle } from 'react-icons/bs';
import { MdOutlineEdit, MdOutlineRemoveRedEye } from 'react-icons/md';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useTable from '@/hooks/useTable';
import { PageHeader } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import queryKeys from '@/utils/query-keys';
import useConfirm from '@/hooks/useConfirm';
import { toastApiError, formatSignupDate } from '@/utils/helpers';
import {
  approveApplication,
  deleteApplication,
  getApplicationsList,
  rejectApplication,
  toggleApplicationActive,
} from '@/services/private/certification/applications';
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [viewedApplication, setViewedApplication] = useState(null);
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const { mutateAsync: approveMutate } = useMutation({ mutationFn: approveApplication });
  const { mutateAsync: rejectMutate } = useMutation({ mutationFn: rejectApplication });
  const { mutateAsync: deleteMutate } = useMutation({ mutationFn: deleteApplication });
  const { mutateAsync: toggleActiveMutate } = useMutation({ mutationFn: toggleApplicationActive });

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
      toast.success('Application disapproved');
      await invalidateList();
      setRejectTarget(null);
    } catch (error) {
      toastApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(
    async row => {
      await confirm({
        heading: 'Delete application?',
        message: 'Are you sure? This cannot be undone.',
      })
        .then(async () => {
          await deleteMutate({ type: activeTab.actionType, id: row.id });
          toast.success('Application deleted');
          await invalidateList();
          setViewedApplication(null);
        })
        .catch(error => {
          if (error?.response) toastApiError(error);
        });
    },
    [confirm, deleteMutate, activeTab, invalidateList]
  );

  const isQTE = activeTab.key === 'qte';

  const handleToggleActive = useCallback(
    async row => {
      const message = row?.is_active
        ? 'Are you sure you want to deactivate this application?'
        : 'Are you sure you want to activate this application?';
      await confirm({ message })
        .then(async () => {
          await toggleActiveMutate({ type: activeTab.actionType, id: row.id });
          toast.success('Status updated successfully');
          await invalidateList();
        })
        .catch(error => {
          if (error?.response) toastApiError(error);
        });
    },
    [confirm, toggleActiveMutate, activeTab, invalidateList]
  );

  // "Profile Completed"/"Coaching" have no equivalent for Institution — Institution has no
  // profile-completeness or coaching concept in the backend, unlike Expert. See
  // AdminInstitutionApplicationSerializer for the corresponding backend note.
  const tableColumns = useMemo(
    () =>
      isQTE
        ? [
            { header: 'Name', accessorKey: 'first_name' },
            { header: 'Email', accessorKey: 'email' },
            {
              header: 'Active Status',
              accessorKey: 'is_active',
              cell: ({ row }) => (row?.original?.is_active ? 'Active' : 'Inactive'),
            },
            {
              header: 'Profile Completed',
              accessorKey: 'is_profile_complete',
              cell: ({ row }) => (row?.original?.is_profile_complete ? 'Yes' : 'No'),
            },
            {
              header: 'Coaching',
              accessorKey: 'has_event_or_consult',
              cell: ({ row }) => (row?.original?.has_event_or_consult ? 'Yes' : 'No'),
            },
            {
              header: 'Signed Up',
              accessorKey: 'signed_up_at',
              cell: ({ row }) => formatSignupDate(row?.original?.signed_up_at),
            },
            { header: 'Country', accessorKey: 'country' },
            { header: 'Status', accessorKey: 'application_status' },
          ]
        : [
            { header: 'Organization', accessorKey: 'legal_organization_name' },
            { header: 'Email', accessorKey: 'email' },
            {
              header: 'Active Status',
              accessorKey: 'is_active',
              cell: ({ row }) => (row?.original?.is_active ? 'Active' : 'Inactive'),
            },
            {
              header: 'Signed Up',
              accessorKey: 'signed_up_at',
              cell: ({ row }) => formatSignupDate(row?.original?.signed_up_at),
            },
            { header: 'Country', accessorKey: 'country' },
            { header: 'Status', accessorKey: 'application_status' },
          ],
    [isQTE]
  );

  // `group` clusters related icons with a divider between clusters (view | edit, toggle |
  // approve, reject | delete) so the row stays readable instead of one flat run of up to 6
  // icons — see TableActions in components/common/table. `variant: 'danger'` gives Reject a
  // red hover instead of the shared primary green, and BsXCircle (vs. Approve's
  // person-silhouette BsPersonCheck) keeps the two from being confused at a glance — both
  // were a real accidental-click risk found during QA.
  const rowActions = useMemo(
    () => [
      {
        id: 'view',
        group: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => setViewedApplication(row?.original),
      },
      {
        id: 'edit',
        group: 'edit',
        // Institution has no admin edit flow yet (unlike Expert's /portal/admin/lms/expert/[id]/edit) — QTE-only for now.
        render: () => isQTE,
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/lms/expert/${row.original.id}/edit`),
      },
      {
        id: 'active',
        group: 'edit',
        render: row => !row?.original?.is_active,
        Icon: BsToggleOff,
        onClick: row => handleToggleActive(row?.original),
      },
      {
        id: 'deactive',
        group: 'edit',
        render: row => row?.original?.is_active,
        Icon: BsToggleOn,
        onClick: row => handleToggleActive(row?.original),
      },
      {
        id: 'approve',
        group: 'decision',
        render: row => ['submitted', 'under_review'].includes(row?.original?.application_status),
        Icon: BsPersonCheck,
        onClick: row => handleApprove(row?.original),
      },
      {
        id: 'reject',
        group: 'decision',
        variant: 'danger',
        render: row => ['submitted', 'under_review'].includes(row?.original?.application_status),
        Icon: BsXCircle,
        onClick: row => handleOpenReject(row?.original),
      },
      {
        id: 'delete',
        group: 'delete',
        render: row => row?.original?.application_status !== 'approved',
        Icon: BsTrash,
        onClick: row => handleDelete(row?.original),
      },
    ],
    [isQTE, router, handleToggleActive, handleApprove, handleOpenReject, handleDelete]
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
        onDelete={handleDelete}
      />
    </React.Fragment>
  );
};

export default ApplicationReviewTable;
