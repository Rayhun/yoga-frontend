import { getCatalogTagChipLabel, getCatalogTagNamespaceLabel } from '@/utils/catalogTag';

/** Shared catalog tag field config for LMS content forms (session, program, module, quiz). */

export const CONTENT_CATALOG_FIELD_NAMESPACES = {
  categories: ['phase', 'challenge'],
  focus_areas: ['modality', 'symptom'],
  culture_experience: ['cultural'],
  languages: ['language'],
};

export const CONTENT_CATALOG_FIELDS = {
  categories: {
    field: 'categories',
    label: 'Categories',
    modalTitle: 'Select categories',
    triggerPlaceholder: 'Select categories',
  },
  focus_areas: {
    field: 'focus_areas',
    label: 'Focus & approach?',
    modalTitle: 'Select focus & approach',
    triggerPlaceholder: 'Select focus & approach',
  },
  culture_experience: {
    field: 'culture_experience',
    label: 'Culture Experience',
    modalTitle: 'Select culture experience',
    triggerPlaceholder: 'Select culture experience',
  },
  languages: {
    field: 'languages',
    label: 'Languages',
    modalTitle: 'Select languages',
    triggerPlaceholder: 'Select languages',
  },
};

/** Read catalog tag IDs from content ``tags`` payload grouped by namespace. */
export function mapContentFieldTagIds(tags, namespaces) {
  if (!Array.isArray(tags) || !namespaces?.length) return [];
  const allowed = new Set(namespaces);
  return tags
    .filter(item => {
      const ns = item?.namespace ?? item?.namespace_slug;
      return ns && allowed.has(ns);
    })
    .map(item => (item && typeof item === 'object' ? item.id : item))
    .filter(Boolean);
}

/** Tag rows for chip labels before / without a catalog-tags API response. */
export function seedCatalogRowsFromTags(tags, namespaces) {
  return filterContentTagsByNamespace(tags, namespaces).map(item => ({
    id: item.id,
    label: getCatalogTagChipLabel(item),
    namespace: item?.namespace ?? item?.namespace_slug,
    namespaceLabel: getCatalogTagNamespaceLabel(item),
  }));
}

/** Tags on a content payload filtered by namespace slug(s). */
export function filterContentTagsByNamespace(tags, namespaces) {
  if (!Array.isArray(tags) || !namespaces?.length) return [];
  const allowed = new Set(namespaces);
  return tags.filter(item => {
    const ns = item?.namespace ?? item?.namespace_slug;
    return ns && allowed.has(ns);
  });
}
