'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import useDelete from '@/hooks/useDelete';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getSubscriptionPagesList, deleteSingleSubscriptionPage } from '@/services/private/subscription/page';
import queryKeys from '@/utils/query-keys';
import ControllableRichText from '@/components/common/details/ControllableRichText';

const SubscriptionPagesList = () => {
  const router = useRouter();
  const { handleDelete: handleDeleteSubscriptionPage } = useDelete({
    mutationFn: deleteSingleSubscriptionPage,
    invalidateQueryKey: [queryKeys.subscriptionPages],
    onSuccess: () => toast.success('Subscription page deleted successfully'),
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'Description',
        accessorKey: 'description',
        cell: ({ getValue }) => {
          const description = getValue();
          return (
            <div className="max-w-xs">
              <ControllableRichText numberOfWords={10} className="text-sm">
                {description || 'No description provided'}
              </ControllableRichText>
            </div>
          );
        },
      },
      {
        header: 'URL',
        accessorKey: 'url',
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/subscription/page/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/subscription/page/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteSubscriptionPage({ id: row.original.id }),
      },
    ],
    [handleDeleteSubscriptionPage, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Subscription Page',
        onClick: () => router.push('/portal/admin/subscription/page/add'),
      },
    ],
    [router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getSubscriptionPagesList,
    queryKey: [queryKeys.subscriptionPages],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Subscription Pages">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default SubscriptionPagesList;
