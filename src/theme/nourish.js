/**
 * NourishDoc tokens for JS (charts, inline styles).
 * Visual UI should use CSS variables / `nd-*` Tailwind / `.nd-*` classes.
 * Hex fallbacks must match `src/css/nourish-tokens.css`.
 */
const FALLBACKS = {
  '--nd-white': '#ffffff',
  '--nd-off-white': '#faf9f7',
  '--nd-bg': '#f4f3f1',
  '--nd-surface': '#f7f7f6',
  '--nd-divider': '#f0f0f0',
  '--nd-border': 'rgba(30, 77, 53, 0.09)',
  '--nd-text-dark': '#1a2920',
  '--nd-text-mid': '#55685f',
  '--nd-text-light': '#8a9e96',
  '--nd-text-faint': '#b8c8c0',
  '--nd-green-dark': '#1e4d35',
  '--nd-green-mid': '#2d6a4a',
  '--nd-green-soft': '#e6f0eb',
  '--nd-green-border': '#c2d9cc',
  '--nd-orange-dark': '#c4521a',
  '--nd-orange-mid': '#e0692b',
  '--nd-orange-soft': '#fdf0e8',
  '--nd-orange-border': '#f5c9a8',
  '--nd-gold': '#c9962e',
  '--nd-gold-soft': '#fbf3e1',
  '--nd-gold-border': '#efe0b0',
  '--nd-red': '#d3453c',
  '--nd-red-soft': '#fbeae9',
};

export function ndToken(cssVar) {
  if (typeof document !== 'undefined') {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(cssVar)
      .trim();
    if (value) return value;
  }
  return FALLBACKS[cssVar];
}

export const nd = {
  get white() {
    return ndToken('--nd-white');
  },
  get bg() {
    return ndToken('--nd-bg');
  },
  get textDark() {
    return ndToken('--nd-text-dark');
  },
  get textMid() {
    return ndToken('--nd-text-mid');
  },
  get greenDark() {
    return ndToken('--nd-green-dark');
  },
  get greenMid() {
    return ndToken('--nd-green-mid');
  },
  get greenSoft() {
    return ndToken('--nd-green-soft');
  },
  get orangeMid() {
    return ndToken('--nd-orange-mid');
  },
  get gold() {
    return ndToken('--nd-gold');
  },
  get red() {
    return ndToken('--nd-red');
  },
};
