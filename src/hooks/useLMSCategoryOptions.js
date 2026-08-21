'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategoriesList } from '@/services/private/lms/category';
import { getExpertCatalogTags } from '@/services/private/lms/catalogTags';
import queryKeys from '@/utils/query-keys';

function useLMSCategoryOptions({ context, field } = {}) {
  const useCatalog = Boolean(context && field);

  const {
    isLoading: catalogLoading,
    isError: catalogError,
    data: catalogData,
  } = useQuery({
    queryFn: () => getExpertCatalogTags({ context, field }),
    queryKey: [queryKeys.lmsCategories, context, field],
    enabled: useCatalog,
  });

  const {
    isLoading: genericLoading,
    isError: genericError,
    data: categoriesResponse,
  } = useQuery({
    queryFn: getCategoriesList,
    queryKey: [queryKeys.lmsCategories],
    enabled: !useCatalog,
  });

  const options = useMemo(() => {
    if (useCatalog) {
      return catalogData?.data?.data?.results?.map(option => ({
        label: option.label,
        value: option.id,
      }));
    }
    return categoriesResponse?.data?.map(option => ({
      label: option.name,
      value: option.id,
    }));
  }, [useCatalog, catalogData, categoriesResponse]);

  return {
    isLoading: useCatalog ? catalogLoading : genericLoading,
    isError: useCatalog ? catalogError : genericError,
    options,
  };
}

export default useLMSCategoryOptions;
