'use client';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useConfirm from './useConfirm';
import { toastApiError } from '@/utils/helpers';

function useDelete({ mutationFn, invalidateQueryKey = [], onSuccess = () => null }) {
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn,
  });

  const handleDelete = useCallback(
    async payload => {
      confirm().then(async () => {
        try {
          await mutateAsync(payload);
          await queryClient.invalidateQueries([{ queryKey: invalidateQueryKey }]);
          onSuccess();
        } catch (error) {
          toastApiError(error);
        }
      });
    },
    [confirm, invalidateQueryKey, mutateAsync, onSuccess, queryClient]
  );

  return { handleDelete };
}

export default useDelete;
