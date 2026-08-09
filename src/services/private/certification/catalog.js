import axios from '@/lib/axios';
import { getSearchParamsFromObject } from '@/utils/helpers';

export const getCertificationCatalog = async params => {
  const searchParams = getSearchParamsFromObject(params);
  return axios.get(`/certification/programs/catalog/?${searchParams}`);
};

export const getProgramCatalogDetail = async ({ id }) => {
  return axios.get(`/certification/programs/${id}/catalog-detail/`);
};
