/** Map guided experience (event) form field names to catalog-tags API ``field`` param. */

export const GUIDED_EXPERIENCE_CATALOG_FIELDS = {
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
  languages: {
    field: 'languages',
    label: 'Languages',
    modalTitle: 'Select languages',
    triggerPlaceholder: 'Select languages',
  },
};

/** Read catalog tag IDs from API event payload (M2M tag objects). */
export function mapGuidedExperienceTagIds(items) {
  if (!Array.isArray(items)) return [];
  return items.map(item => (item && typeof item === 'object' ? item.id : item)).filter(Boolean);
}
