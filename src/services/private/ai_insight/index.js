import axios from '@/lib/axios';

export const getRecommendations = async (insight) => {
  const params = insight ? { category: insight } : {};
  return axios.get('/llm/guides/', { params });
};
