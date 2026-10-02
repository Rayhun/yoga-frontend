'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import useDelete from '@/hooks/useDelete';
import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { getQuizPagesList, deleteSingleQuizPage } from '@/services/private/onboarding/quiz-page';
import queryKeys from '@/utils/query-keys';
import ControllableRichText from '@/components/common/details/ControllableRichText';

const fetchQuizPagesForTable = async () => {
  const response = await getQuizPagesList();
  return { data: response?.data?.data || [] };
};

const QuizPagesList = () => {
  const router = useRouter();
  const { handleDelete: handleDeleteQuizPage } = useDelete({
    mutationFn: deleteSingleQuizPage,
    invalidateQueryKey: [queryKeys.onboardingQuizPages],
    onSuccess: () => toast.success('Quiz page deleted successfully'),
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'Slug',
        accessorKey: 'slug',
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
        onClick: row => router.push(`/portal/admin/onboarding/quiz/pages/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/onboarding/quiz/pages/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteQuizPage({ id: row.original.id }),
      },
    ],
    [handleDeleteQuizPage, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Quiz Page',
        onClick: () => router.push('/portal/admin/onboarding/quiz/pages/add'),
      },
    ],
    [router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: fetchQuizPagesForTable,
    queryKey: [queryKeys.onboardingQuizPages],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Onboarding Quiz Pages">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default QuizPagesList;
