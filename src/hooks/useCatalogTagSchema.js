'use client';
import { useQuery } from '@tanstack/react-query';
import { getExpertCatalogTagSchema, getExpertCatalogTagSchemaNamespaces } from '@/services/private/lms/expert';
import queryKeys from '@/utils/query-keys';

/** ``CONTENT_TAG_SCHEMA`` rows for a form context (from backend registry). */
export default function useCatalogTagSchema(context = 'expert_profile') {
  const { data, ...rest } = useQuery({
    queryFn: () => getExpertCatalogTagSchema({ context }),
    queryKey: [queryKeys.catalogTagSchema, context],
    staleTime: 5 * 60 * 1000,
  });

  const namespaces = getExpertCatalogTagSchemaNamespaces(data);

  return {
    namespaces,
    ...rest,
  };
}
