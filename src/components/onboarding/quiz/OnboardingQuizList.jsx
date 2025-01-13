'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import useTable from '@/hooks/useTable';
import useDelete from '@/hooks/useDelete';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { deleteSingleQuiz, getQuizesList } from '@/services/private/onboarding/quiz';
import queryKeys from '@/utils/query-keys';

const OnboardingQuizList = () => {
  const router = useRouter();
  const { handleDelete: handleDeleteOnboardingQuiz } = useDelete({
    mutationFn: deleteSingleQuiz,
    invalidateQueryKey: [queryKeys.onboardingQuiz],
    onSuccess: () => toast.success('Quiz deleted successfully'),
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'Is Required?',
        cell: ({ row }) => (row.original.required ? 'Yes' : 'No'),
      },
    ],
    []
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/onboarding/quiz/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/onboarding/quiz/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteOnboardingQuiz({ id: row.original.id }),
      },
    ],
    [handleDeleteOnboardingQuiz, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New Quiz',
        onClick: () => router.push('/portal/admin/onboarding/quiz/add'),
      },
    ],
    [router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getQuizesList,
    queryKey: [queryKeys.onboardingQuiz],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="Onboarding Quiz">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default OnboardingQuizList;
