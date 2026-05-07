'use client';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useConfirm from './useConfirm';
import { toastApiError } from '@/utils/helpers';

function useDelete({
  mutationFn,
  invalidateQueryKey = [],
  onSuccess = () => null,
  /** Optional `{ heading, message }` or `(payload) => ({ heading, message })` passed to useConfirm */
  getConfirmOptions,
}) {
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn,
  });

  const handleDelete = useCallback(
    async payload => {
      const confirmOpts =
        typeof getConfirmOptions === 'function'
          ? getConfirmOptions(payload)
          : getConfirmOptions && typeof getConfirmOptions === 'object'
            ? getConfirmOptions
            : {};

      confirm(confirmOpts)
        .then(async () => {
          try {
            await mutateAsync(payload);
            await queryClient.invalidateQueries([{ queryKey: invalidateQueryKey }]);
            onSuccess();
          } catch (error) {
            toastApiError(error);
          }
        })
        .catch(() => {});
    },
    [confirm, getConfirmOptions, invalidateQueryKey, mutateAsync, onSuccess, queryClient]
  );

  return { handleDelete };
}

export default useDelete;
