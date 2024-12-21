'use client';
import { AxiosError } from 'axios';
import { useEffect } from 'react';
import { toastApiError } from '@/utils/helpers';

/**
 * @argument {AxiosError} failureReason - react-query mutation "failureReason"
 * @argument {Boolean} isSuccess - react-query mutation "isSuccess"
 * @argument {{onSuccess:() => void}} isSuccess - success callback
 */
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
  }, [isSuccess, onSuccess, failureReason]);

  return null;
}

export default useHandleApiResponse;
