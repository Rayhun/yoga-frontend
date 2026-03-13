'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport } from 'react-icons/bi';
import useTable from '@/hooks/useTable';
import useImport from '@/hooks/useImport';
import useDelete from '@/hooks/useDelete';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import queryKeys from '@/utils/query-keys';
import { adminGetGoalsTracker, deleteSingleInsight, importInsightsGoal } from '@/services/private/customer/goal';

const Tracker = () => {
  const router = useRouter();
  const { isImporting: isImporting, handleImport: handleImportInsights } = useImport({
    mutationFn: importInsightsGoal,
    invalidateQueryKey: [queryKeys.adminGetGoalsTracker],
    onSuccess: () => toast.success('Goal Tracker imported successfully'),
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'Concern',
        accessorKey: 'concern',
      }
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/tracker/${row?.original?.id}`),
      },
    ],
    [router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import-insights-goal',
        Icon: BiImport,
        label: 'Import Insights Goal',
        isLoading: isImporting,
        onClick: handleImportInsights,
      },
    ],
    [
    handleImportInsights,
    isImporting,
    ]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: adminGetGoalsTracker,
    queryKey: [queryKeys.adminGetGoalsTracker],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Tracker">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data?.data} />
    </div>
  );
};

export default Tracker;
