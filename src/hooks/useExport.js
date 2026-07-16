'use client';
import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useConfirm from './useConfirm';
import { downloadBlobAsCsv, toastApiError } from '@/utils/helpers';

/**
 * Shared admin CSV export: confirm → fetch blob → download.
 *
 * @param {object} options
 * @param {Function} options.mutationFn - async (params) => axios blob response
 * @param {string|((params: object) => string)} options.filename - download filename
 * @param {string|((params: object) => string)} options.confirmMessage
 * @param {string|((params: object) => string)} [options.successMessage]
 */
const useExport = ({
  mutationFn,
  filename,
  confirmMessage,
  successMessage = 'Exported successfully',
}) => {
  const confirm = useConfirm();
  const { mutateAsync, isPending } = useMutation({ mutationFn });

  const handleExport = useCallback(
    async (params = {}) => {
      try {
        const message =
          typeof confirmMessage === 'function' ? confirmMessage(params) : confirmMessage;
        await confirm({ message });
        const response = await mutateAsync(params);
        const file =
          typeof filename === 'function' ? filename(params) : filename;
        const success =
          typeof successMessage === 'function' ? successMessage(params) : successMessage;
        downloadBlobAsCsv(response, file);
        toast.success(success);
      } catch (error) {
        if (error?.message !== 'cancel') toastApiError(error);
      }
    },
    [confirm, confirmMessage, filename, mutateAsync, successMessage]
  );

  return { isExporting: isPending, handleExport };
};

export default useExport;
