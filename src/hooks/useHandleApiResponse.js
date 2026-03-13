'use client';
import { useEffect } from 'react';
import { toastApiError } from '@/utils/helpers';

function useHandleApiResponse(failureReason, isSuccess, { onSuccess } = { onSuccess: () => {} }) {
  useEffect(() => {
    if (failureReason) {
      toastApiError(failureReason);
    }
  }, [failureReason]);

  useEffect(() => {
    if (isSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  return null;
}

export default useHandleApiResponse;
