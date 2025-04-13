import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const createNewConsultation = async ({ payload: { categories, tags, ...payload } }) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value) formData.set(key, value);
    });
    formData.set('categories', categories.join(','));
    formData.set('tags', tags.join(','));
  
    return axios.post('/LMS/consultations/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getExpertConsultationsList = async params => {
    const searchParams = getSearchParamsFromObject(params);
    return axios.get(`/LMS/consultations?${searchParams}`);
  };
  