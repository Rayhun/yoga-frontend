/**
 * Display helpers for catalog ``TagAlias`` objects (Expert, content, events).
 */

export function getCatalogTagChipLabel(item) {
  if (item == null) return '';
  if (typeof item === 'string') return item;
  return (
    item.alias ||
    item.tag?.label ||
    item.tag?.canonical_tag ||
    item.name ||
    ''
  );
}
