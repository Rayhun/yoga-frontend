import { LANGUAGES } from '@/utils/constants';
import { SESSION_FOCUS_AREA_OPTIONS, SESSION_EQUIPMENT_OPTIONS } from '@/utils/options';

function coerceToOptionRows(raw, options) {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw
    .map(item => {
      const s = String(item ?? '').trim();
      if (!s) return null;
      const exact = options.find(o => String(o.value) === s || String(o.label) === s);
      if (exact) return exact.value;
      const lc = s.toLowerCase();
      const byLabel = options.find(
        o => String(o.label).toLowerCase() === lc || String(o.value).toLowerCase() === lc
      );
      return byLabel ? byLabel.value : s;
    })
    .filter(Boolean);
}

export function normalizeLanguagesForForm(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw
    .map(item => {
      const s = String(item ?? '').trim();
      if (!s) return null;
      const byCode = LANGUAGES.find(l => l.value === s);
      if (byCode) return byCode.value;
      const lc = s.toLowerCase();
      const byLabel = LANGUAGES.find(l => l.label.toLowerCase() === lc);
      return byLabel ? byLabel.value : s;
    })
    .filter(Boolean);
}

export function normalizeFocusAreasForForm(raw) {
  return coerceToOptionRows(raw, SESSION_FOCUS_AREA_OPTIONS);
}

export function normalizeEquipmentsForForm(raw) {
  return coerceToOptionRows(raw, SESSION_EQUIPMENT_OPTIONS);
}
