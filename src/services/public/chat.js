import axios from '@/lib/axios';

export const explorePublicChats = async (params = {}) => {
  // Supported query parameters
  const { search, page = 1, page_size = 10 } = params;
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  
  if (search && search.trim()) {
    queryParams.append('search', search.trim());
  }
  
  queryParams.append('page', page.toString());
  queryParams.append('page_size', page_size.toString());
  
  const url = `/chat/public/explore/?${queryParams.toString()}`;
  return axios.get(url);
};

export const joinPublicChat = async (chatId) => {
  return axios.post(`/chat/public/join/${chatId}/`);
};
