import { getCatalogTagChipLabel, getCatalogTagNamespaceLabel } from '@/utils/catalogTag';

/** Map expert profile form field names to catalog-tags API ``field`` param. */

export const EXPERT_PROFILE_CATALOG_FIELDS = {
  practice_type: {
    field: 'practice_type',
    label: 'Practice Type',
    modalTitle: 'Select practice type',
    triggerPlaceholder: 'Select practice type',
  },
  coaching_style: {
    field: 'coaching_style',
    label: 'Coaching Style',
    modalTitle: 'Select coaching style',
    triggerPlaceholder: 'Select coaching style',
  },
  culture_experience: {
    field: 'culture_experience',
    label: 'Culture Experience',
    modalTitle: 'Select culture experience',
    triggerPlaceholder: 'Select culture experience',
  },
  categories: {
    field: 'categories',
    label: 'Categories',
    modalTitle: 'Select categories',
    triggerPlaceholder: 'Select categories',
  },
  tags: {
    field: 'tags',
    label: 'Focus & approach?',
    modalTitle: 'Select focus & approach',
    triggerPlaceholder: 'Select focus & approach',
  },
  coaching_areas: {
    field: 'coaching_areas',
    label: 'Coaching Areas',
    modalTitle: 'Select coaching areas',
    triggerPlaceholder: 'Select coaching areas',
  },
  languages: {
    field: 'languages',
    label: 'Languages',
    modalTitle: 'Select languages',
    triggerPlaceholder: 'Select languages',
  },
};

/** Normalize expert tag payload (M2M arrays or single FK object like ``practice_type``). */
export function normalizeExpertTagItems(items) {
  if (!items) return [];
  if (Array.isArray(items)) return items.filter(item => item != null);
  if (typeof items === 'object') return [items];
  return [];
}

/** Read catalog tag IDs from API expert payload. */
export function mapExpertTagIds(items) {
  return normalizeExpertTagItems(items)
    .map(item => (item && typeof item === 'object' ? item.id : item))
    .filter(Boolean);
}

/** Chip seed rows from saved expert tag objects (labels before modal/catalog fetch). */
export function seedExpertTagRows(items) {
  return normalizeExpertTagItems(items).map(item => ({
    id: item.id,
    label: getCatalogTagChipLabel(item),
    namespace: item?.namespace ?? item?.namespace_slug,
    namespaceLabel: getCatalogTagNamespaceLabel(item),
  }));
}
