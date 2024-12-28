import axios from '@/lib/axios';

export const getLMSCategories = async () => {
  return axios.get('/LMS/category/list/');
};

export const getLMSTags = async () => {
  return axios.get('/LMS/tag/list/');
};
