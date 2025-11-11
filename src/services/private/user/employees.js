import axios from '@/lib/axios';

// Employee Management API calls for business owners

export const getEmployeesList = async () => {
  return axios.get('/auth/employees/');
};

export const getEmployee = async ({ id }) => {
  return axios.get(`/auth/employees/${id}/`);
};

export const createEmployee = async (data) => {
  return axios.post('/auth/employees/', data);
};

export const updateEmployee = async ({ id, data }) => {
  return axios.put(`/auth/employees/${id}/`, data);
};

export const deleteEmployee = async ({ id }) => {
  return axios.delete(`/auth/employees/${id}/`);
};

export const uploadEmployeesCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post('/auth/employees/upload-csv/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
