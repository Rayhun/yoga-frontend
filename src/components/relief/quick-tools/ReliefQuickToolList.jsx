'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiExport, BiImport } from 'react-icons/bi';
import useDelete from '@/hooks/useDelete';
import useImport from '@/hooks/useImport';
import useExport from '@/hooks/useExport';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import queryKeys from '@/utils/query-keys';
import { getGuidedContentTypeLabel } from '@/utils/relief-quick-tools';
import {
  deleteReliefQuickTool,
  exportReliefQuickTools,
  getReliefQuickToolsList,
  importReliefQuickTools,
} from '@/services/private/relief/quick-tools';

const ReliefQuickToolList = () => {
  const router = useRouter();
  const { handleDelete } = useDelete({
    mutationFn: deleteReliefQuickTool,
    invalidateQueryKey: [queryKeys.reliefQuickTools],
    onSuccess: () => toast.success('Relief quick tool deleted successfully'),
  });

  const { isImporting, handleImport } = useImport({
    mutationFn: importReliefQuickTools,
    invalidateQueryKey: [queryKeys.reliefQuickTools],
    onSuccess: () => toast.success('Relief quick tools imported successfully'),
  });

  const { isExporting, handleExport } = useExport({
    mutationFn: exportReliefQuickTools,
    filename: 'relief_quick_tool_export.csv',
    confirmMessage: 'Export all Relief quick tools to CSV?',
    successMessage: 'Relief quick tools exported successfully',
  });

  const tableColumns = useMemo(
    () => [
      { header: 'Title', accessorKey: 'title' },
      { header: 'Slug', accessorKey: 'slug' },
      {
        header: 'Tags',
        accessorKey: 'tags',
        cell: ({ getValue }) => {
          const tags = getValue() || [];
          return tags.length ? tags.map(tag => tag.label).join(', ') : '—';
        },
      },
      {
        header: 'Source',
        accessorKey: 'guided_content_source',
        cell: ({ getValue }) => (getValue() === 'session' ? 'Session' : 'Custom'),
      },
      {
        header: 'Content Type',
        accessorKey: 'guided_content_type',
        cell: ({ getValue }) => getGuidedContentTypeLabel(getValue()),
      },
      {
        header: 'Active',
        accessorKey: 'is_active',
        cell: ({ getValue }) => (getValue() ? 'Yes' : 'No'),
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/relief/quick-tools/${row?.original?.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/relief/quick-tools/${row?.original?.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDelete({ id: row?.original?.id }),
      },
    ],
    [handleDelete, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import',
        Icon: BiImport,
        label: 'Import',
        isLoading: isImporting,
        onClick: handleImport,
      },
      {
        id: 'export',
        Icon: BiExport,
        label: 'Export',
        isLoading: isExporting,
        onClick: handleExport,
      },
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add Quick Tool',
        onClick: () => router.push('/portal/admin/relief/quick-tools/add'),
      },
    ],
    [handleExport, handleImport, isExporting, isImporting, router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getReliefQuickToolsList,
    queryKey: [queryKeys.reliefQuickTools],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Relief Quick Tools">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data?.data || []} />
    </div>
  );
};

export default ReliefQuickToolList;
