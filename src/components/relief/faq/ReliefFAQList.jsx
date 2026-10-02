'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiExport, BiImport } from 'react-icons/bi';
import useDelete from '@/hooks/useDelete';
import useImport from '@/hooks/useImport';
import useExport from '@/hooks/useExport';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import ControllableRichText from '@/components/common/details/ControllableRichText';
import queryKeys from '@/utils/query-keys';
import {
  deleteReliefFAQ,
  exportReliefFAQs,
  getReliefFAQsList,
  importReliefFAQs,
} from '@/services/private/relief/faq';

const ReliefFAQList = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { handleDelete } = useDelete({
    mutationFn: deleteReliefFAQ,
    invalidateQueryKey: [queryKeys.reliefFaqs],
    onSuccess: () => toast.success('Relief FAQ deleted successfully'),
  });

  const { isImporting, handleImport } = useImport({
    mutationFn: importReliefFAQs,
    invalidateQueryKey: [queryKeys.reliefFaqs],
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [queryKeys.reliefFaqCategories] });
      toast.success('Relief FAQs imported successfully');
    },
  });

  const { isExporting, handleExport } = useExport({
    mutationFn: exportReliefFAQs,
    filename: 'relief_faq_export.csv',
    confirmMessage: 'Export all Relief FAQs to CSV?',
    successMessage: 'Relief FAQs exported successfully',
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Category',
        accessorKey: 'category',
      },
      {
        header: 'Question',
        accessorKey: 'question',
      },
      {
        header: 'Answer',
        accessorKey: 'answer',
        cell: ({ getValue }) => {
          const answer = getValue();
          return (
            <div className="max-w-xs">
              <ControllableRichText numberOfWords={10} className="text-sm">
                {answer || 'No answer provided'}
              </ControllableRichText>
            </div>
          );
        },
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
        onClick: row => router.push(`/portal/admin/relief/faq/${row?.original?.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/relief/faq/${row?.original?.id}/details`),
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
        label: 'Add FAQ',
        onClick: () => router.push('/portal/admin/relief/faq/add'),
      },
    ],
    [handleExport, handleImport, isExporting, isImporting, router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getReliefFAQsList,
    queryKey: [queryKeys.reliefFaqs],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Relief FAQs">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data?.data || []} />
    </div>
  );
};

export default ReliefFAQList;
