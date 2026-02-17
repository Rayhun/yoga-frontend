'use client';
import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdDeleteOutline, MdOutlineAdd } from 'react-icons/md';
import { BiImport, BiExport } from 'react-icons/bi';
import { useMutation } from '@tanstack/react-query';
import useTable from '@/hooks/useTable';
import useImport from '@/hooks/useImport';
import useDelete from '@/hooks/useDelete';
import useConfirm from '@/hooks/useConfirm';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import { deleteSingleQuiz, getQuizesList, importQuizes, exportQuizes } from '@/services/private/lms/quiz';
import queryKeys from '@/utils/query-keys';
import { downloadBlobAsCsv, toastApiError } from '@/utils/helpers';

const LMSQuizList = () => {
  const router = useRouter();
  const confirm = useConfirm();
  const { isImporting, handleImport: handleImportQuizes } = useImport({
    mutationFn: importQuizes,
    invalidateQueryKey: [queryKeys.lmsQuizes],
    onSuccess: () => toast.success('Quiz imported successfully'),
  });
  const { handleDelete: handleDeleteLMSQuiz } = useDelete({
    mutationFn: deleteSingleQuiz,
    invalidateQueryKey: [queryKeys.lmsQuizes],
    onSuccess: () => toast.success('Quiz deleted successfully'),
  });

  const { mutateAsync: exportQuizesFn, isPending: isExporting } = useMutation({ mutationFn: exportQuizes });
  const handleExport = useCallback(async () => {
    try {
      await confirm({ message: 'Export quizzes?' });
      const response = await exportQuizesFn();
      downloadBlobAsCsv(response, 'quizzes_export.csv');
      toast.success('Quizzes exported successfully');
    } catch (e) {
      if (e?.message !== 'cancel') toastApiError(e);
    }
  }, [confirm, exportQuizesFn]);

  const tableColumns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'Quiz Number',
        accessorKey: 'quiz_number',
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
        onClick: row => router.push(`/portal/admin/lms/quiz/${row.original.id}/edit`),
      },
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/lms/quiz/${row.original.id}/details`),
      },
      {
        id: 'delete',
        Icon: MdDeleteOutline,
        onClick: row => handleDeleteLMSQuiz({ id: row.original.id }),
      },
    ],
    [handleDeleteLMSQuiz, router]
  );

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'import',
        Icon: BiImport,
        label: 'Import',
        isLoading: isImporting,
        onClick: handleImportQuizes,
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
        label: 'Add New Quiz',
        onClick: () => router.push('/portal/admin/lms/quiz/add'),
      },
    ],
    [handleImportQuizes, handleExport, isImporting, isExporting, router]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getQuizesList,
    queryKey: [queryKeys.lmsQuizes],
    rowActions,
  });

  return (
    <div>
      <PageHeader title="LMS Quiz">
        <PageHeaderQuickActions actions={headerQuickActions} />
      </PageHeader>

      <BasicTable isLoading={isLoading} columns={columns} data={data} />
    </div>
  );
};

export default LMSQuizList;
