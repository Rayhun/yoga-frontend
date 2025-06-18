'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import useDelete from '@/hooks/useDelete';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import queryKeys from '@/utils/query-keys';
import { deleteSingleQuestion, getFrequentlyAskedQuestionsList } from '@/services/private/faqs';

const FrequentlyAskedQuestions = () => {
  const router = useRouter();
  const { handleDelete: handleDeleteQuestion } = useDelete({
    mutationFn: deleteSingleQuestion,
    invalidateQueryKey: [queryKeys.frequentlyAskedQuestions],
    onSuccess: () => toast.success('Question deleted successfully'),
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Question',
        accessorKey: 'title',
      },
      {
        header: 'Answer',
        accessorKey: 'description',
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/faq/${row?.original?.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/faq/${row?.original?.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteQuestion({ id: row?.original?.id }),
      },
    ],
    [handleDeleteQuestion, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add Question',
        onClick: () => router.push('/portal/admin/faq/add'),
      },
    ],
    [router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getFrequentlyAskedQuestionsList,
    queryKey: [queryKeys.frequentlyAskedQuestions],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Frequently Asked Questions">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data?.data || []} />
    </div>
  );
};

export default FrequentlyAskedQuestions;
