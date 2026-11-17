// Disapprove Application modal — the rules, kept pure (no React) so the Node test runner can check them.
//
// The categories, their labels and the limits are NOT defined here: the backend serves them
// (GET /certification/admin/applications/rejection-reasons/ → Certification/rejection_reasons.py) so there is a
// single source of truth. `config` below is that response's `data`:
//   { categories: [{ key, label }], other_key: 'other', details_max_length: 1000 }
//
// The request body is { reason_category, reason_details? } and the backend stores "<Label>" or
// "<Label> — <details>" in the existing rejected_reason field, which every screen already prints as is.

export const INITIAL_VALUES = { reason_category: '', reason_details: '' };

const FALLBACK_OTHER_KEY = 'other';
const FALLBACK_DETAILS_MAX = 1000;

export const getOtherKey = config => config?.other_key || FALLBACK_OTHER_KEY;
export const getDetailsMax = config => config?.details_max_length || FALLBACK_DETAILS_MAX;
export const isOtherSelected = (values, config) => values.reason_category === getOtherKey(config);

/** "Details", or "Details (required for Other)" once Other is chosen. */
export const getDetailsLabel = (values, config) => (isOtherSelected(values, config) ? 'Details (required for Other)' : 'Details');

/** field -> message; an empty object means the form can be submitted. */
export const getRejectFormErrors = (values, config) => {
  const errors = {};
  const keys = (config?.categories || []).map(category => category.key);

  if (!values.reason_category) errors.reason_category = 'Select a reason';
  else if (!keys.includes(values.reason_category)) errors.reason_category = 'Select one of the listed reasons';

  const details = (values.reason_details || '').trim();
  const max = getDetailsMax(config);
  if (details.length > max) errors.reason_details = `Must be at most ${max} characters`;
  else if (isOtherSelected(values, config) && !details) errors.reason_details = 'Details are required for "Other / Reason Not Listed"';

  return errors;
};

export const isRejectFormValid = (values, config) => Boolean(config) && Object.keys(getRejectFormErrors(values, config)).length === 0;

/** The request body: details are trimmed and omitted when empty. */
export const buildRejectPayload = values => {
  const details = (values.reason_details || '').trim();
  return details ? { reason_category: values.reason_category, reason_details: details } : { reason_category: values.reason_category };
};
