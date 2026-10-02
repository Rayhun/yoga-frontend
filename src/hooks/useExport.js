'use client';
import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useConfirm from './useConfirm';
import { downloadBlobAsCsv, toastApiError } from '@/utils/helpers';

const isPlainParams = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  if (value.nativeEvent || typeof value.preventDefault === 'function') {
    return false;
  }
  return true;
};

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
      const safeParams = isPlainParams(params) ? params : {};
      try {
        const message =
          typeof confirmMessage === 'function' ? confirmMessage(safeParams) : confirmMessage;
        await confirm({ message });
        const response = await mutateAsync(safeParams);
        const file =
          typeof filename === 'function' ? filename(safeParams) : filename;
        const success =
          typeof successMessage === 'function' ? successMessage(safeParams) : successMessage;
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
