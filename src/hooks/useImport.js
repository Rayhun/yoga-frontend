'use client';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useModal from './useModal';
import FileSelectorForm from '@/components/common/form/FileSelectorForm';
import { toastApiError } from '@/utils/helpers';

const useImport = ({ mutationFn, invalidateQueryKey = [], onSuccess = () => null }) => {
  const modal = useModal();
  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
    mutationFn,
  });

  const handleImport = useCallback(
    async (payload = {}) => {
      try {
        const selectedFile = await new Promise(async resolve => {
          await modal({
            heading: 'Import Data',
            content: (
              <FileSelectorForm
                accept={{
                  'text/csv': ['.csv'],
                }}
                validationError="Only csv files are accepted"
                validate={value => value && value.type.includes('csv')}
                onSubmit={resolve}
              />
            ),
          });
        });
        await mutateAsync({ ...payload, file: selectedFile });
        await queryClient.invalidateQueries([{ queryKey: invalidateQueryKey }]);
        onSuccess();
      } catch (error) {
        toastApiError(error);
      }
    },
    [invalidateQueryKey, modal, mutateAsync, onSuccess, queryClient]
  );

  return { isImporting: isPending, handleImport };
};

export default useImport;
