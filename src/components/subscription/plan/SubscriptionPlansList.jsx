'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import useDelete from '@/hooks/useDelete';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getSubscriptionPlansList, deleteSingleSubscriptionPlan } from '@/services/private/subscription/plan';
import queryKeys from '@/utils/query-keys';

const SubscriptionPlansList = () => {
  const router = useRouter();
  const { handleDelete: handleDeleteSubscriptionPlan } = useDelete({
    mutationFn: deleteSingleSubscriptionPlan,
    invalidateQueryKey: [queryKeys.subscriptionPlans],
    onSuccess: () => toast.success('Subscription plan deleted successfully'),
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'Tenure',
        accessorKey: 'subscription_tenure',
      },
      {
        header: 'Price',
        cell: ({ row }) => row?.original?.discounted_price || row?.original?.price,
      },
      {
        header: 'Status',
        accessorKey: 'status',
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/subscription/plan/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/subscription/plan/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteSubscriptionPlan({ id: row.original.id }),
      },
    ],
    [handleDeleteSubscriptionPlan, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Subscription Plan',
        onClick: () => router.push('/portal/admin/subscription/plan/add'),
      },
    ],
    [router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getSubscriptionPlansList,
    queryKey: [queryKeys.subscriptionPlans],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Subscription Plans">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default SubscriptionPlansList;
