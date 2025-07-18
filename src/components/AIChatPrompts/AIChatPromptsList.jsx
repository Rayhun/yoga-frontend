'use client';
import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import useTable from '@/hooks/useTable';
import { PageHeader, PageHeaderQuickActions } from '@/components/common/page';
import { BasicTable } from '@/components/common/table';
import queryKeys from '@/utils/query-keys';
import { MdOutlineRemoveRedEye, MdOutlineEdit, MdOutlineAdd } from 'react-icons/md';
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';

import { getAIPromptsList, toggleAIChatPromptStatus } from '@/services/private/ai-prompts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { toastApiError } from '@/utils/helpers';
import useConfirm from '@/hooks/useConfirm';

const AIChatPromptsList = () => {
  const router = useRouter();
  const confirm = useConfirm();

  const queryClient = useQueryClient();

  const { mutateAsync: toggleStatus } = useMutation({
    mutationFn: toggleAIChatPromptStatus,
  });

  const tableColumns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'Prompt',
        accessorKey: 'prompt',
      },
      {
        header: 'Chat Type',
        accessorKey: 'chat_type',
      },
      {
        header: 'GPT Model',
        accessorKey: 'gpt_model',
      },
    ],
    []
  );

  const handleToggleStatus = useCallback(
    async selected => {
      const message = selected?.is_active
        ? 'Are you sure you want to deactive this AI chat prompt?'
        : 'Are you sure you want to active this AI chat prompt?';
      await confirm({
        message,
      })
        .then(async () => {
          await toggleStatus({ id: selected?.id });
          toast.success('AI chat prompt status updated successfully');

          await queryClient.invalidateQueries([
            {
              queryKey: [queryKeys.aiPromptsList],
            },
          ]);
        })
        .catch(error => {
          toastApiError(error);
        });
    },
    [confirm, toggleStatus, queryClient]
  );

  const rowActions = useMemo(
    () => [
      {
        id: 'view',
        Icon: MdOutlineRemoveRedEye,
        onClick: row => router.push(`/portal/admin/ai-prompts/${row?.original?.id}/details`),
      },
      {
        id: 'edit',
        Icon: MdOutlineEdit,
        onClick: row => router.push(`/portal/admin/ai-prompts/${row?.original?.id}/edit`),
      },
      {
        id: 'active',
        Icon: BsToggleOff,
        render: row => !row?.original?.is_active,
        onClick: row => handleToggleStatus(row?.original),
      },
      {
        id: 'deactive',
        Icon: BsToggleOn,
        render: row => row?.original?.is_active,
        onClick: row => handleToggleStatus(row?.original),
      },
    ],
    [router, handleToggleStatus]
  );

  const { isLoading, columns, data } = useTable({
    columns: tableColumns,
    queryFn: getAIPromptsList,
    queryKey: [queryKeys.aiPromptsList],
    rowActions,
  });

  const headerQuickActions = useMemo(
    () => [
      {
        id: 'add',
        Icon: MdOutlineAdd,
        label: 'Add New AI Prompts',
        onClick: () => router.push('/portal/admin/ai-prompts/add'),
      },
    ],
    [router]
  );

  return (
    <React.Fragment>
      <div>
        <PageHeader title="AI Chat Prompts">
          <PageHeaderQuickActions actions={headerQuickActions} />
        </PageHeader>

        <BasicTable isLoading={isLoading} columns={columns} data={data || []} />
      </div>
    </React.Fragment>
  );
};

export default AIChatPromptsList;
