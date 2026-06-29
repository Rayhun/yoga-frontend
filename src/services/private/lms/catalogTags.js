import axios from '@/lib/axios';

export const getExpertCatalogTags = async ({ context, field, namespace, search, limit, offset } = {}) => {
  const params = {};
  if (context) params.context = context;
  if (field) params.field = field;
  if (namespace) params.namespace = namespace;
  if (search) params.search = search;
  if (limit != null) params.limit = limit;
  if (offset != null) params.offset = offset;
  return axios.get('/LMS/experts/catalog-tags/', { params });
};
