import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

/**
 * @argument {AxiosError} error - Axios error instance
 */
export const extractApiErrorMessage = error => {
  return error?.response?.data?.message || error?.message || 'Uncaught error!';
};

/**
 * @argument {AxiosError} error - Axios error instance
 */
export const toastApiError = error => {
  toast.error(extractApiErrorMessage(error));
};

export const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export const getFileFromURL = async url => {
  const response = await axios({
    url,
    responseType: 'blob',
  });

  const filename = url.substring(url.lastIndexOf('/') + 1);
  const fileType = response.data.type;

  return new File([response.data], filename, { type: fileType });
};
