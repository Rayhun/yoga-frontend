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

/** Read catalog tag IDs from API expert payload (M2M tag objects). */
export function mapExpertTagIds(items) {
  if (!Array.isArray(items)) return [];
  return items.map(item => (item && typeof item === 'object' ? item.id : item)).filter(Boolean);
}
