import DOMPurify from 'dompurify';

// Keep `target` (DOMPurify drops it by default) so "open in new tab" links still work.
export const SANITIZE_OPTIONS = { ADD_ATTR: ['target'] };
export const SAFE_LINK_REL = 'noopener noreferrer';

// A link that opens a new tab must not hand that page `window.opener`: set rel on every anchor with a target.
export const ensureSafeLinkRel = node => {
  if (node && node.tagName && node.tagName.toLowerCase() === 'a' && node.hasAttribute('target')) {
    node.setAttribute('rel', SAFE_LINK_REL);
  }
};

let hookInstalled = false;

/**
 * The one place author-written HTML is sanitized for display (scripts, event handlers, `javascript:` URLs
 * are removed by DOMPurify). Needs a DOM: DOMPurify returns its input untouched without one, so callers
 * render it only after mount (see ControllableRichText).
 */
export const sanitizeRichHtml = html => {
  if (!hookInstalled) {
    DOMPurify.addHook('afterSanitizeAttributes', ensureSafeLinkRel);
    hookInstalled = true;
  }
  return DOMPurify.sanitize(html, SANITIZE_OPTIONS);
};
