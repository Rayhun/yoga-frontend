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

export const getSearchParamsFromObject = obj => {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;

    if (Array.isArray(value)) {
      const filteredValues = value.filter(v => v !== null && v !== undefined);
      if (filteredValues.length > 0) {
        params.append(key, filteredValues.join(','));
      }
    } else {
      params.append(key, value);
    }
  });

  return params.toString();
};

export const downloadCSV = (data, filename = 'experts-list.csv') => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid data for CSV export');
    return;
  }

  // Extract CSV headers
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row =>
      headers
        .map(field => {
          const value = row[field];
          // Escape quotes and commas
          return `"${String(value ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
