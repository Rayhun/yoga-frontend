/**
 * Display helpers for catalog ``Tag`` objects (Expert, content, events).
 */

export function getCatalogTagRowLabel(row) {
  if (row == null) return '';
  if (typeof row === 'string') return row;
  return (
    (typeof row.label === 'string' && row.label.trim()) ||
    (typeof row.title === 'string' && row.title.trim()) ||
    row.tag_label ||
    row.tag?.label ||
    row.alias ||
    row.canonical_tag ||
    String(row.id ?? '')
  );
}

export function getCatalogTagNamespaceLabel(row) {
  if (row == null) return 'Other';
  return row.namespace_label || row.namespace || row.tag?.namespace?.label || 'Other';
}

/**
 * Group catalog tag rows by namespace for grouped multi-select UIs.
 * @param {Array<{ id: number, label?: string, namespace?: string, namespaceLabel?: string }>} rows
 * @param {{ namespaceOrder?: string[] }} [options]
 */
export function groupCatalogRowsByNamespace(rows, { namespaceOrder = null } = {}) {
  const groups = new Map();

  for (const row of rows) {
    const id = row?.id;
    if (id == null) continue;
    const nsKey = row.namespace || 'other';
    const nsLabel = row.namespaceLabel || getCatalogTagNamespaceLabel(row);
    const label = row.label ?? getCatalogTagRowLabel(row);

    if (!groups.has(nsKey)) {
      groups.set(nsKey, { namespace: nsKey, namespaceLabel: nsLabel, tags: [] });
    }
    groups.get(nsKey).tags.push({ id, label });
  }

  const orderIndex = slug => {
    if (!namespaceOrder?.length) return -1;
    const i = namespaceOrder.indexOf(slug);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };

  return Array.from(groups.values())
    .map(g => ({
      ...g,
      tags: g.tags.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })),
    }))
    .sort((a, b) => {
      const ai = orderIndex(a.namespace);
      const bi = orderIndex(b.namespace);
      if (ai !== bi) return ai - bi;
      return a.namespaceLabel.localeCompare(b.namespaceLabel, undefined, { sensitivity: 'base' });
    });
}

export function getCatalogTagChipLabel(item) {
  return getCatalogTagRowLabel(item);
}

/**
 * Resolve catalog tag IDs from label strings and/or tag objects using fetched catalog rows.
 */
export function resolveCatalogTagIdsByLabel(items, catalogRows = []) {
  if (!Array.isArray(items) || !items.length) return [];

  const labelToId = new Map();
  for (const row of catalogRows ?? []) {
    if (row?.id == null) continue;
    const label = getCatalogTagRowLabel(row);
    if (!label) continue;
    labelToId.set(label.trim().toLowerCase(), Number(row.id));
  }

  const ids = [];
  const seen = new Set();

  for (const item of items) {
    let id = null;

    if (item && typeof item === 'object' && item.id != null) {
      id = Number(item.id);
    } else if (typeof item === 'number') {
      id = item;
    } else if (typeof item === 'string') {
      const trimmed = item.trim();
      if (/^\d+$/.test(trimmed)) {
        id = Number(trimmed);
      } else {
        id = labelToId.get(trimmed.toLowerCase()) ?? null;
      }
    } else if (item && typeof item === 'object') {
      const label = (item.label ?? item.title ?? '').trim();
      if (label) id = labelToId.get(label.toLowerCase()) ?? null;
    }

    if (id != null && !Number.isNaN(id) && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }

  return ids;
}
