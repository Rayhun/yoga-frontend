// Save state of one edit pane (a module, or a lesson with its separate quiz save). Several saves can
// run in one pane; the worst state wins, so a failure is never hidden behind another save's "Saved".
export const PANE_STATUS = {
  idle: 'idle',
  pending: 'pending',
  saving: 'saving',
  saved: 'saved',
  error: 'error',
};

const PRIORITY = [PANE_STATUS.error, PANE_STATUS.saving, PANE_STATUS.pending, PANE_STATUS.saved, PANE_STATUS.idle];

// parts: [{ status, message?, canRetry?, retry? }] (falsy entries are skipped)
// → { status, message, canRetry, retry } for the pane as a whole.
export const combinePaneStates = parts => {
  const present = parts.filter(Boolean);
  const status = PRIORITY.find(candidate => present.some(part => part.status === candidate)) || PANE_STATUS.idle;
  const failing = present.filter(part => part.status === PANE_STATUS.error);
  const retryable = failing.filter(part => part.canRetry && part.retry);
  return {
    status,
    // The reason belongs to the state that won ("Not saved: …" / "Unsaved changes: …").
    message: present.filter(part => part.status === status).map(part => part.message).find(Boolean) || null,
    canRetry: retryable.length > 0,
    retry: retryable.length ? () => Promise.all(retryable.map(part => part.retry())) : undefined,
  };
};

// Statuses that mean "the latest edit is not safely on the server yet" (used to warn before leaving).
export const isUnsafeStatus = status => [PANE_STATUS.pending, PANE_STATUS.saving, PANE_STATUS.error].includes(status);
