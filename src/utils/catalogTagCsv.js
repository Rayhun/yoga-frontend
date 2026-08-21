/**
 * Shared catalog-tag CSV helpers (mirrors backend Tag/validation.py).
 *
 * Cell format: ``namespace:canonical_tag`` tokens, comma-separated.
 * Example: ``challenge:hormonal_shifts, phase:menopause``
 *          ``modality:hormone_replacement_therapy_hrt,symptom:mood_swings``
 */

/** Split a CSV cell into tag tokens (comma / pipe / semicolon). */
export function splitCatalogTagCsvTokens(raw) {
  if (raw == null) return [];
  const text = String(raw).trim();
  if (!text) return [];
  return text
    .replace(/\|/g, ',')
    .replace(/;/g, ',')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

/**
 * Parse one token into ``{ namespace, token }``.
 * ``challenge:hormonal_shifts`` → ``{ namespace: 'challenge', token: 'hormonal_shifts' }``
 * Bare labels return ``{ namespace: null, token }``.
 */
export function parseCatalogTagToken(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;
  if (!text.includes(':')) {
    return { namespace: null, token: text };
  }
  const idx = text.indexOf(':');
  const namespace = text.slice(0, idx).trim().toLowerCase().replace(/-/g, '_');
  const token = text.slice(idx + 1).trim();
  if (!namespace || !token) return { namespace: null, token: text };
  return { namespace, token };
}

/** Parse a full CSV cell into ``{ namespace, token }[]``. */
export function parseCatalogTagCsvCell(raw) {
  return splitCatalogTagCsvTokens(raw)
    .map(parseCatalogTagToken)
    .filter(Boolean);
}

/**
 * Format tag objects for CSV export (compact ``namespace:canonical_tag``).
 * Accepts objects with ``namespace`` / ``namespace_slug`` and ``canonical_tag`` / ``slug``.
 */
export function formatCatalogTagsForCsv(tags = []) {
  if (!Array.isArray(tags) || !tags.length) return '';
  return tags
    .map(tag => {
      if (typeof tag === 'string') return tag.trim();
      const ns =
        tag?.namespace_slug ??
        (typeof tag?.namespace === 'string' ? tag.namespace : tag?.namespace?.slug) ??
        '';
      const canonical = tag?.canonical_tag ?? tag?.slug ?? '';
      if (ns && canonical) return `${ns}:${canonical}`;
      return (tag?.label ?? tag?.title ?? '').trim();
    })
    .filter(Boolean)
    .join(', ');
}

/** Field → namespace map shared by content CSV (aligned with expert/event export). */
export const CONTENT_CSV_TAG_FIELD_NAMESPACES = {
  categories: ['phase', 'challenge'],
  tags: ['modality', 'symptom'],
  focus_areas: ['modality', 'symptom'],
  culture_experience: ['cultural'],
  languages: ['language'],
};

/** Expert / guided-experience CSV field → namespaces. */
export const EXPERT_CSV_TAG_FIELD_NAMESPACES = {
  practice_type: ['expert_type'],
  coaching_style: ['coaching_style'],
  culture_experience: ['cultural'],
  categories: ['challenge', 'phase'],
  tags: ['modality', 'symptom'],
  coaching_areas: ['goal'],
  languages: ['language'],
};

export const EVENT_CSV_TAG_FIELD_NAMESPACES = {
  culture_experience: ['cultural'],
  categories: ['challenge', 'phase'],
  tags: ['modality', 'symptom'],
  languages: ['language'],
};
