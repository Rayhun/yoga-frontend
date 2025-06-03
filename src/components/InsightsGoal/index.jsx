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
import { adminGetInsightsGoals, deleteSingleInsight, importInsightsGoal } from '@/services/private/customer/goal';

const InsightsGoal = () => {
  const router = useRouter();
  const { isImporting: isImporting, handleImport: handleImportInsights } = useImport({
    mutationFn: importInsightsGoal,
    invalidateQueryKey: [queryKeys.adminGetInsightsGoals],
    onSuccess: () => toast.success('Insights Goal imported successfully'),
  });
  const { handleDelete: handleDeleteInsight } = useDelete({
    mutationFn: deleteSingleInsight,
    invalidateQueryKey: [queryKeys.adminGetInsightsGoals],
    onSuccess: () => toast.success('Insight Goal deleted successfully'),
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Tracker',
        accessorKey: 'tracker',
      },
      {
        header: 'Factor 1',
        accessorKey: 'factor_1',
      },
      {
        header: 'Message',
        accessorKey: 'f1_message',
      },
      {
        header: 'Factor 2',
        accessorKey: 'factor_2',
      },
      {
        header: 'Message',
        accessorKey: 'f2_message',
      },
      {
        header: 'Factor 3',
        accessorKey: 'factor_3',
      },
      {
        header: 'Message',
        accessorKey: 'f3_message',
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
    //   {
    //     id: 'edit',
    //     Icon: MdOutlineEdit,
    //     onClick: row => router.push(`#`),
    //   },
    //   {
    //     id: 'view',
    //     Icon: MdOutlineRemoveRedEye,
    //     onClick: row => router.push(`#`),
    //   },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteInsight({ id: row.original.id }),
      },
    ],
    [handleDeleteInsight]
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
    //   {
    //     id: 'import-program-content',
    //     Icon: BiImport,
    //     label: 'Import Program Content',
    //     isLoading: isImportingProgramContents,
    //     onClick: handleImportProgramContents,
    //   },
    //   {
    //     id: 'add',
    //     Icon: MdOutlineAdd,
    //     label: 'Add New Program',
    //     onClick: () => router.push('/portal/admin/lms/program/add'),
    //   },
    ],
    [
    // handleImportProgramContents,
    handleImportInsights,
    //   isImportingProgramContents,
    isImporting,
    //   router,
    ]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: adminGetInsightsGoals,
    queryKey: [queryKeys.adminGetInsightsGoals],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Insights Goal">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default InsightsGoal;
