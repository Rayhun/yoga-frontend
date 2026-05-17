/**
 * Display helpers for catalog ``Tag`` objects (Expert, content, events).
 */

export function getCatalogTagRowLabel(row) {
  if (row == null) return '';
  if (typeof row === 'string') return row;
  return (
    (typeof row.label === 'string' && row.label.trim()) ||
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
