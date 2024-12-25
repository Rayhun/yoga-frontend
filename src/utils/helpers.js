import axios from 'axios';
import { toast } from 'react-toastify';

export const extractApiErrorMessage = error => {
  return error?.response?.data?.message || error?.message || 'Uncaught error!';
};

export const toastApiError = error => {
  toast.error(extractApiErrorMessage(error));
};

export const extractFormFieldError = error => {
  return error?.response?.status === 400 ? error?.response?.data : {};
};

export const setFormFieldError = (error = {}, fieldNames = [], setFieldError = () => null) => {
  if (error?.response?.status === 400) {
    for (const fieldName of fieldNames) {
      const fieldError = error?.response?.data?.[fieldName];
      if (fieldError) setFieldError(fieldName, fieldError);
    }
  }
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
