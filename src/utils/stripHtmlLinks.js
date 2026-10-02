/**
 * Removes anchor tags from HTML while preserving their inner text.
 */
export function stripHtmlLinks(html) {
  if (!html || typeof html !== 'string') return html || '';
  return html.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');
}
