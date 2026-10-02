import { getCatalogTagChipLabel, getCatalogTagNamespaceLabel } from '@/utils/catalogTag';
import { CONTENT_CSV_TAG_FIELD_NAMESPACES } from '@/utils/catalogTagCsv';

/** Shared catalog tag field config for LMS content forms (session, program, module, quiz). */

export const CONTENT_CATALOG_FIELD_NAMESPACES = {
  categories: CONTENT_CSV_TAG_FIELD_NAMESPACES.categories,
  focus_areas: CONTENT_CSV_TAG_FIELD_NAMESPACES.focus_areas,
  culture_experience: CONTENT_CSV_TAG_FIELD_NAMESPACES.culture_experience,
  languages: CONTENT_CSV_TAG_FIELD_NAMESPACES.languages,
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

/** Catalog tag IDs from ``culture_experience`` M2M (fallback: ``tags`` by namespace). */
export function mapContentCultureExperienceIds(selected) {
  const fromField = selected?.culture_experience;
  if (Array.isArray(fromField) && fromField.length) {
    return fromField.map(item => (item && typeof item === 'object' ? item.id : item)).filter(Boolean);
  }
  return mapContentFieldTagIds(selected?.tags, CONTENT_CATALOG_FIELD_NAMESPACES.culture_experience);
}

/** Chip seed rows for culture experience (prefers dedicated M2M on the payload). */
export function seedCultureExperienceRows(selected) {
  const fromField = selected?.culture_experience;
  if (Array.isArray(fromField) && fromField.length) {
    return fromField.map(item => ({
      id: item.id,
      label: getCatalogTagChipLabel(item),
      namespace: item?.namespace ?? item?.namespace_slug ?? 'cultural',
      namespaceLabel: getCatalogTagNamespaceLabel(item),
    }));
  }
  return seedCatalogRowsFromTags(
    selected?.tags,
    CONTENT_CATALOG_FIELD_NAMESPACES.culture_experience
  );
}

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

/** Display rows for culture experience (dedicated M2M, with legacy ``tags`` fallback). */
export function getCultureExperienceDisplayData(data) {
  if (Array.isArray(data?.culture_experience) && data.culture_experience.length) {
    return data.culture_experience;
  }
  return filterContentTagsByNamespace(
    data?.tags,
    CONTENT_CATALOG_FIELD_NAMESPACES.culture_experience
  );
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
