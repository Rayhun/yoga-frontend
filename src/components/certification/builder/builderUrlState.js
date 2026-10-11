// Where the Program Builder is — step, Basics part and selected curriculum item — lives in the URL, so a reload,
// a shared link and the browser's back/forward buttons all land on the same screen:
//
//   …/builder/42?step=curriculum&lesson=17     …/builder/42?step=basics&fold=catalog
//
// Everything here is pure (no router, no React) so it can be tested with a fake router. Unknown or stale
// values never throw: they fall back to the resume point (an existing program) or the beginning (a new one).
import { getPublishBlockers } from '@/components/certification/builder/publish/readiness';

// URL `step` values. The builder's UI steps are 1 = Basics and 2 = Content & Publish; the four tabs of
// step 2 are addressed directly (`step=pricing`), so one param is enough.
export const BUILDER_STEPS = ['basics', 'curriculum', 'pricing', 'certificate', 'publish'];
export const CONTENT_STEPS = BUILDER_STEPS.slice(1);
// Same ids, same order, as BASICS_FOLDS in sections/basicsFolds.jsx (a test keeps them in step).
export const BASICS_FOLD_IDS = ['about', 'catalog', 'media', 'schedule', 'format'];

export const DEFAULT_POSITION = { step: 'basics', fold: 'about', item: null };

const ID_PATTERN = /^\d+$/;
const ITEM_PARAMS = ['lesson', 'module'];

const pick = (value, allowed) => (allowed.includes(value) ? value : null);

/**
 * Raw URL → what it validly says (`null` where it says nothing usable). Never throws.
 * `item` is { type: 'lesson' | 'module', id } — lesson wins if both are present.
 */
export const parseBuilderUrl = searchParams => {
  const get = key => {
    try {
      return searchParams?.get?.(key) ?? null;
    } catch {
      return null;
    }
  };
  const itemType = ITEM_PARAMS.find(type => ID_PATTERN.test(get(type) || ''));
  const item = itemType ? { type: itemType, id: Number(get(itemType)) } : null;
  const fold = pick(get('fold'), BASICS_FOLD_IDS);
  // A link that names an item but no step means the curriculum.
  const step = pick(get('step'), BUILDER_STEPS) || (item ? 'curriculum' : null);
  return { step, fold, item };
};

const emptyModuleItem = key => {
  const match = /^module-(\d+)$/.exec(key || '');
  return match ? { type: 'module', id: Number(match[1]) } : null;
};

// readiness check id → where it lives
const POSITION_OF_CHECK = {
  basics: () => ({ step: 'basics', fold: 'about', item: null }),
  delivery: () => ({ step: 'basics', fold: 'format', item: null }),
  curriculum: check => ({ step: 'curriculum', fold: null, item: emptyModuleItem(check.target?.key) }),
  pricing: () => ({ step: 'pricing', fold: null, item: null }),
  certificate_setup: () => ({ step: 'certificate', fold: null, item: null }),
};

/**
 * Where to open an existing program that has no (valid) step in its URL: the first publish-readiness check
 * that is not OK (the same checks Publish shows), or Publish when everything is ready.
 */
export const getResumePosition = program => {
  const failing = getPublishBlockers(program || {}).find(check => !check.ok);
  const position = failing ? POSITION_OF_CHECK[failing.id]?.(failing) : null;
  return position || { step: 'publish', fold: null, item: null };
};

/**
 * The position to show now. `parsed` = parseBuilderUrl(...); `hasProgram` = the draft exists (a brand-new
 * program has only Basics); `resume` = the frozen resume position for an existing program.
 */
export const resolvePosition = (parsed, { hasProgram, resume }) => {
  if (!hasProgram) return { ...DEFAULT_POSITION, fold: parsed.step === 'basics' && parsed.fold ? parsed.fold : 'about' };
  const base = parsed.step ? parsed : resume || DEFAULT_POSITION;
  const step = base.step;
  return {
    step,
    fold: step === 'basics' ? base.fold || 'about' : null,
    item: step === 'curriculum' ? base.item || null : null,
  };
};

export const positionToQuery = position => {
  const params = new URLSearchParams();
  params.set('step', position.step);
  if (position.step === 'basics' && position.fold) params.set('fold', position.fold);
  if (position.step === 'curriculum' && position.item) params.set(position.item.type, String(position.item.id));
  return params.toString();
};

/** `…/builder/new` or `…/builder/42` → `…/builder` (works for the teacher and the institution portal). */
export const getBuilderBasePath = pathname => (pathname || '').replace(/\/+$/, '').replace(/\/[^/]+$/, '');

/** Full URL for a position; `programId` null means the not-yet-created draft ('new'). */
export const builderUrl = ({ basePath, programId, position }) =>
  `${basePath}/${programId ?? 'new'}?${positionToQuery(position)}`;

/** `module-12` / `lesson-7` (curriculum keys of saved items) → { type, id }; anything else → null. */
export const itemFromKey = key => {
  const match = /^(module|lesson)-(\d+)$/.exec(key || '');
  return match ? { type: match[1], id: Number(match[2]) } : null;
};
export const itemToKey = item => (item ? `${item.type}-${item.id}` : null);

/**
 * The draft was just created: swap /new for the real id WITHOUT losing where the user is. Uses
 * router.replace so Back doesn't return to the dead /new URL.
 */
export const replaceUrlAfterCreate = ({ router, basePath, programId, position }) =>
  router.replace(builderUrl({ basePath, programId, position }));
