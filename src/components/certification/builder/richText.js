// Helpers for the builder's Quill-backed rich text fields (lesson text, assignment instructions,
// module description, program full description). Quill 1.x (react-quill's own copy) represents an
// empty editor as `<p><br></p>`, and older content was typed into plain textareas, so both
// directions need a small adapter.

// Trimmed toolbar for Certification: nothing that Quill 1.x encodes as a `class` (align/indent),
// since the backend nh3 allowlist strips `class` and those formats would silently vanish on save.
export const CERTIFICATION_RICH_TEXT_TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
  ['clean'],
];

export const CERTIFICATION_RICH_TEXT_FORMATS = ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link'];

const TAG_PATTERN = /<[a-z][^>]*>/i;
const MEDIA_TAG_PATTERN = /<(img|iframe|video)\b/i;
// `&` that doesn't already start an entity — so sanitized text ("A &amp; B") isn't escaped twice.
const BARE_AMPERSAND_PATTERN = /&(?!(#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);)/gi;

// True when the HTML has no visible content (e.g. Quill's `<p><br></p>`, whitespace, `&nbsp;`).
export const isBlankHtml = html => {
  if (!html) return true;
  if (MEDIA_TAG_PATTERN.test(html)) return false;
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .trim();
  return text.length === 0;
};

// Blank rich text is sent as null, matching what the plain textareas sent for an empty field.
export const richTextOrNull = html => (isBlankHtml(html) ? null : html);

const escapeText = text => text.replace(BARE_AMPERSAND_PATTERN, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Legacy plain text → one paragraph per line (blank lines kept as Quill's empty paragraph), so
// line breaks survive being loaded into the editor. Values that already contain markup pass through.
export const plainTextToHtml = value => {
  if (!value) return '';
  if (TAG_PATTERN.test(value)) return value;
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/\n+$/, '')
    .split('\n')
    .map(line => (line.trim() ? `<p>${escapeText(line)}</p>` : '<p><br></p>'))
    .join('');
};
